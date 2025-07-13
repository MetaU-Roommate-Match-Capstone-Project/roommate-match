const RecommendationEngine = require("../utils/RecommendationEngine");
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view recommendations" });
  }

  const currentProfile = await prisma.roommateProfile.findUnique({
    where: { user_id: req.session.userId },
  });
  const currentUser = await prisma.user.findUnique({
    where: { id: req.session.userId },
  });
  const others = await prisma.roommateProfile.findMany({
    where: {
      user_id: {
        not: req.session.userId,
      },
    },
  });
  const otherUsers = await prisma.user.findMany();

  const recommender = new RecommendationEngine(
    currentProfile,
    currentUser,
    others,
    otherUsers,
  );
  const results = recommender.getTopKRecommendations(20);

  res.json(results);
});

module.exports = router;
