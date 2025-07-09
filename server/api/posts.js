const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const helmet = require("helmet");
const cors = require("cors");
router.use(helmet());
router.use(express.json());
router.use(cors());
const multer = require("multer");
const multerStorage = multer.memoryStorage();
const upload = multer(multerStorage);

// [POST] - create a new post with optional multiple pictures
router.post("/", upload.array("pictures"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to make a post." });
    }

    const { city, state, content } = req.body;
    const files = req.files;

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newPost = await prisma.post.create({
      data: {
        user_id: req.session.userId,
        city,
        state,
        content,
      },
      include: {
        user: true,
      },
    });

    if (files && files.length > 0) {
      const pictureData = files.map((file) => ({
        post_id: newPost.id,
        image: file.buffer,
      }));

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

    const currentUserProfile = await prisma.roommateProfile.findUnique({
      where: { user_id: req.session.userId },
      select: { city: true, state: true },
    });

    let posts;

    if (!currentUserProfile) {
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
      });
    } else {
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
      });
    }

    res.status(200).json(posts);
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

    res.set({
      "Content-Type": "image/*",
      "Content-Length": picture.image.length,
    });

    res.send(picture.image);
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
