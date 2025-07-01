const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const helmet = require("helmet");
const cors = require("cors");
router.use(helmet());
router.use(express.json());
router.use(cors());

// [POST] - create a new post when user signed in
router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to make a post." });
    }

    const { city, state, content } = req.body;

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
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json("Error getting user's posts");
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
    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    res.json(deletedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error deleting user's post");
  }
});

module.exports = router;
