const RecommendationEngine = require("../utils/RecommendationEngine");
const {
  buildPreferenceSimilarityMatrix,
  getMultipleGroupOptions,
  formatMultipleGroupOptions,
} = require("../utils/matchingGroups");
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// [GET] /matches - gets all recs for the current user signed in using KNN
router.get("/", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view recommendations" });
  }

  try {
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

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Error fetching recommendations" });
  }
});

// [GET] /matches/groups - gets ranked group options using Gale-Shapley algorithm
router.get("/groups", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view stable groups" });
  }

  try {
    const userPreferences = await buildPreferenceSimilarityMatrix();
    const multipleGroupOptions = getMultipleGroupOptions(userPreferences, 50);
    const formattedOptions = formatMultipleGroupOptions(multipleGroupOptions);

    // filter each option to only return groups that contain the current user
    const userGroupOptions = formattedOptions
      .map((option) => ({
        ...option,
        groups: option.groups.filter((group) =>
          group.members.some((member) => member.userId === req.session.userId),
        ),
      }))
      .filter((option) => option.groups.length > 0);

    res.status(200).json(userGroupOptions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching stable groups" });
  }
});

// [GET] /matches/friend-requests - gets all friend requests for the current user signed in
router.get("/friend-requests", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view friend requests" });
  }

  try {
    const friendRequests = await prisma.matches.findMany({
      where: {
        status: "FRIEND_REQUEST_SENT",
        OR: [
          {
            user_id: req.session.userId,
            friend_request_sent_by: { not: req.session.userId },
          },
          {
            recommended_id: req.session.userId,
            friend_request_sent_by: { not: req.session.userId },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        recommended_user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        friend_request_sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
      },
    });

    // get the sender information for each friend request
    const friendRequestsWithSenders = friendRequests.map((match) => {
      const senderId = match.friend_request_sent_by;
      let sender;

      if (match.user.id === senderId) {
        sender = match.user;
      } else if (match.recommended_user.id === senderId) {
        sender = match.recommended_user;
      } else {
        sender = match.friend_request_sender;
      }

      return {
        matchId: match.id,
        sender: sender,
        sentAt: match.friend_request_sent_at,
        similarityScore: match.similarity_score,
      };
    });

    res.status(200).json(friendRequestsWithSenders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching friend requests" });
  }
});

// [GET] /matches/accepted - gets all accepted matches for the current user signed in
router.get("/accepted", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view accepted matches" });
  }

  try {
    const acceptedMatches = await prisma.matches.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { user_id: req.session.userId },
          { recommended_id: req.session.userId },
        ],
      },
    });
    res.status(200).json(acceptedMatches);
  } catch (err) {
    res.status(500).json({ error: "Error fetching accepted matches" });
  }
});

// [PUT] /matches - updates the match status with a specific other user for the current user signed in & updates weights accordingly
router.put("/", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to update match status" });
  }

  const { recommended_id, status, similarity_score } = req.body;

  if (!recommended_id || !status) {
    return res.status(400).json({
      error: "ID of user recommended and current match status required",
    });
  }

  // input validation to check that match status is valid
  const validStatuses = [
    "PENDING",
    "FRIEND_REQUEST_SENT",
    "ACCEPTED",
    "REJECTED_BY_RECIPIENT",
    "REJECTED_RECOMMENDATION",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    let match = await prisma.matches.findFirst({
      where: {
        OR: [
          { user_id: req.session.userId, recommended_id: recommended_id },
          { user_id: recommended_id, recommended_id: req.session.userId },
        ],
      },
    });

    const updateData = {
      status: status,
      updated_at: new Date(),
    };

    if (status === "FRIEND_REQUEST_SENT") {
      updateData.friend_request_sent_by = req.session.userId;
      updateData.friend_request_sent_at = new Date();
    } else if (status === "ACCEPTED" || status === "REJECTED_BY_RECIPIENT") {
      updateData.responded_at = new Date();
    }

    if (match) {
      match = await prisma.matches.update({
        where: { id: match.id },
        data: updateData,
      });
    } else {
      if (!similarity_score) {
        return res.status(400).json({
          error: "Similarity score is required when creating a new match",
        });
      }

      match = await prisma.matches.create({
        data: {
          user_id: req.session.userId,
          recommended_id: recommended_id,
          similarity_score: similarity_score,
          ...updateData,
        },
      });
    }

    if (
      status === "ACCEPTED" ||
      status === "REJECTED_BY_RECIPIENT" ||
      status === "REJECTED_RECOMMENDATION"
    ) {
      // get the similarity scores that were calculated when showing the recommendation
      const currentProfile = await prisma.roommateProfile.findUnique({
        where: { user_id: req.session.userId },
      });
      const currentUser = await prisma.user.findUnique({
        where: { id: req.session.userId },
      });
      const otherProfile = await prisma.roommateProfile.findUnique({
        where: { user_id: recommended_id },
      });
      const otherUser = await prisma.user.findUnique({
        where: { id: recommended_id },
      });

      const recommender = new RecommendationEngine(
        currentProfile,
        currentUser,
        otherProfile,
        otherUser,
      );
      const similarity = recommender.computeSimilarity(otherProfile, otherUser);
      const updatedWeights = recommender.changeWeightsOnFeedback(
        similarity,
        status,
      );

      // map weight keys to match database field names before updating the weights in database
      const weightMapping = {
        cleanliness: "cleanliness_weight",
        smokes: "smokes_weight",
        pets: "pets_weight",
        genderPreference: "gender_preference_weight",
        roomType: "room_type_weight",
        numRoommates: "num_roommates_weight",
        sleepSchedule: "sleep_schedule_weight",
        noiseTolerance: "noise_tolerance_weight",
        socialness: "socialness_weight",
        hobbies: "hobbies_weight",
        favoriteMusic: "favorite_music_weight",
      };

      const dbWeights = {};
      for (const key in weightMapping) {
        dbWeights[weightMapping[key]] = updatedWeights[key];
      }

      await prisma.roommateProfile.update({
        where: { user_id: req.session.userId },
        data: dbWeights,
      });
    }

    res.status(200).json({
      message: "Match status updated successfully",
      match: match,
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating match status" });
  }
});

module.exports = router;
