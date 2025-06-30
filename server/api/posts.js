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

    const {
        city,
        state,
        content
    } = req.body;

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
            content
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
        const posts = await prisma.post.findMany({
            include: {
                user: true,
            }
        })
        res.status(201).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json("Error getting posts");
    }
})

// [GET] - get all posts by user


module.exports = router;
