const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
router.use(express.json());
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  distanceBetweenCoordinates,
} = require("../utils/similarityCalculations");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../assets/post-images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // unique filenames created using timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${timestamp}-${randomString}${fileExtension}`);
  },
});

// images only supported in jpeg or png format
const fileFilter = (req, file, cb) => {
  const validMimeTypes = ["image/jpeg", "image/png"];
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG and PNG images are allowed."),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// [POST] - create a new post with optional multiple pictures
router.post("/", upload.array("pictures"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to make a post." });
    }

    const { content } = req.body;
    const files = req.files;

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roommateProfile = await prisma.roommateProfile.findUnique({
      where: { user_id: req.session.userId },
      select: { city: true, state: true },
    });

    if (!roommateProfile) {
      return res.status(400).json({
        error: "You must create a roommate profile before making a post.",
      });
    }

    const newPost = await prisma.post.create({
      data: {
        user_id: req.session.userId,
        city: roommateProfile.city,
        state: roommateProfile.state,
        content,
      },
      include: {
        user: true,
      },
    });

    if (files && files.length > 0) {
      const pictureData = files.map((file) => {
        // store relative path of image
        const relativePath = path.relative(
          path.join(__dirname, ".."),
          file.path,
        );

        return {
          post_id: newPost.id,
          image_path: relativePath,
          mime_type: file.mimetype,
        };
      });

      await prisma.picture.createMany({
        data: pictureData,
      });
    }

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json("Error creating post");
  }
});

// [GET] - get all posts
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to view other user's posts." });
    }

    const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;

    // check if user has office coordinates
    const userWithOffice = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { office_latitude: true, office_longitude: true },
    });

    // check if user has a roommate profile
    const currentUserProfile = await prisma.roommateProfile.findUnique({
      where: { user_id: req.session.userId },
      select: { city: true, state: true },
    });

    let posts;

    // if user has coordinates, fetch posts within 64 km (~40 miles) of user's office
    if (
      userWithOffice &&
      userWithOffice.office_latitude &&
      userWithOffice.office_longitude
    ) {
      const allPosts = await prisma.post.findMany({
        where: {
          user_id: { not: req.session.userId },
        },
        include: {
          user: true,
          pictures: true,
        },
        orderBy: [
          {
            id: "desc",
          },
        ],
      });

      // filter posts to be within 64 km of user's office
      const nearbyPosts = allPosts.filter((post) => {
        if (
          post.user &&
          post.user.office_latitude &&
          post.user.office_longitude
        ) {
          const distance = distanceBetweenCoordinates(
            userWithOffice.office_latitude,
            userWithOffice.office_longitude,
            post.user.office_latitude,
            post.user.office_longitude,
          );
          return distance <= 64;
        }
        return false;
      });

      // pagination
      const startIndex = cursor
        ? nearbyPosts.findIndex((post) => post.id === cursor) + 1
        : 0;
      posts = nearbyPosts.slice(startIndex, startIndex + 21);
    }
    // else if user has a roommate profile, fetch posts in the same city and state
    else if (currentUserProfile) {
      // use mode: "insensitive" to match locations without case sensitivity
      posts = await prisma.post.findMany({
        where: {
          city: {
            equals: currentUserProfile.city,
            mode: "insensitive",
          },
          state: {
            equals: currentUserProfile.state,
            mode: "insensitive",
          },
          user_id: { not: req.session.userId },
        },
        include: {
          user: true,
          pictures: true,
        },
        orderBy: [
          {
            id: "desc",
          },
        ],
        take: 21,
        ...(cursor && {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }),
      });
    }
    // else fetch all posts
    else {
      posts = await prisma.post.findMany({
        where: {
          user_id: { not: req.session.userId },
        },
        include: {
          user: true,
          pictures: true,
        },
        orderBy: [
          {
            id: "desc",
          },
        ],
        take: 21,
        ...(cursor && {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }),
      });
    }

    const hasNextPage = posts.length > 20;
    if (hasNextPage) {
      posts.pop();
    }

    const nextCursor = hasNextPage ? posts[posts.length - 1].id : null;

    res.status(200).json({
      posts,
      nextCursor,
      hasNextPage,
    });
  } catch (err) {
    res.status(500).json("Error getting posts");
  }
});

// [GET] - get all posts by user
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to view your posts." });
    }

    const userPosts = await prisma.post.findMany({
      where: {
        user_id: req.session.userId,
      },
      include: {
        user: true,
        pictures: true,
      },
      orderBy: [
        {
          id: "desc",
        },
      ],
    });

    if (!userPosts) {
      return res
        .status(404)
        .json({ error: "User does not have any posts yet." });
    }

    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json("Error getting user's posts");
  }
});

// [GET] - get posts by specific user ID
router.get("/user/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to view other users' posts." });
    }

    const userId = parseInt(req.params.id);

    const userPosts = await prisma.post.findMany({
      where: {
        user_id: userId,
      },
      include: {
        user: true,
        pictures: true,
      },
      orderBy: [
        {
          id: "desc",
        },
      ],
    });

    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json("Error getting user's posts");
  }
});

// [GET] - get picture by ID
router.get("/picture/:id", async (req, res) => {
  try {
    const pictureId = parseInt(req.params.id);

    const picture = await prisma.picture.findUnique({
      where: { id: pictureId },
    });

    if (!picture) {
      return res.status(404).json({ error: "Picture not found" });
    }

    if (!picture.image_path) {
      return res.status(404).json({ error: "Image path not found" });
    }

    const imagePath = path.join(__dirname, "..", picture.image_path);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image file not found" });
    }

    let contentType = picture.mime_type;

    // set content type based on mime type and send file
    res.set("Content-Type", contentType);
    res.sendFile(imagePath);
  } catch (err) {
    res.status(500).json("Error retrieving picture");
  }
});

// [DELETE] - delete a post if user is signed in
router.delete("/me/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to delete a post." });
    }

    const postId = parseInt(req.params.id);

    // get pictures associated with the post
    const pictures = await prisma.picture.findMany({
      where: { post_id: postId },
    });

    // delete images from server
    for (const picture of pictures) {
      if (picture.image_path) {
        const imagePath = path.join(__dirname, "..", picture.image_path);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // delete all pictures associated with the post due to foreign key constraint
    await prisma.picture.deleteMany({
      where: { post_id: postId },
    });

    // delete post after deleting pictures on post
    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    res.json(deletedPost);
  } catch (err) {
    res.status(500).json("Error deleting user's post");
  }
});

module.exports = router;
