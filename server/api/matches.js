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
      .json({ error: "You must be logged in to view recommendations." });
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
    const results = await recommender.getTopKRecommendations(50);

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

    if (userPreferences.length < 2) {
      return res.status(200).json({
        message: "Not enough users with roommate profiles to form groups",
        userPreferences,
      });
    }

    const multipleGroupOptions = await getMultipleGroupOptions(
      userPreferences,
      50,
      req.session.userId,
    );
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

    if (userGroupOptions.length === 0) {
      return res.status(200).json({
        message: "No groups containing the current user were found",
        userCount: userPreferences.length,
        optionsCount: formattedOptions.length,
      });
    }

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
      .json({ error: "You must be logged in to view friend requests." });
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
            friend_request_count: true,
          },
        },
        recommended_user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
            friend_request_count: true,
          },
        },
      },
    });

    // group requests by potential_group_id
    const groupedRequests = {};

    for (const request of friendRequests) {
      const sender =
        request.friend_request_sent_by === request.user.id
          ? request.user
          : request.recommended_user;

      const groupKey = request.potential_group_id || `individual-${sender.id}`;

      if (!groupedRequests[groupKey]) {
        groupedRequests[groupKey] = {
          sender: sender,
          sentAt: request.friend_request_sent_at,
          isGroupRequest: !!request.potential_group_id,
          members: [],
          matches: [],
        };
      }

      groupedRequests[groupKey].matches.push({
        matchId: request.id,
        similarityScore: request.similarity_score,
      });
    }

    // get all other members within a potential group
    // used to display to user which other members apart from the sender are in the group
    // users need to accept the request to officially join the group
    for (const groupKey in groupedRequests) {
      if (groupKey.startsWith("potential-")) {
        const otherMembers = await prisma.matches.findMany({
          where: {
            potential_group_id: groupKey,
            OR: [
              { user_id: { not: req.session.userId } },
              { recommended_id: { not: req.session.userId } },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_picture: true,
                friend_request_count: true,
              },
            },
            recommended_user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_picture: true,
                friend_request_count: true,
              },
            },
          },
        });

        // add unique members to the group except those who have rejected the request/recommendation
        for (const match of otherMembers) {
          if (
            match.status === "REJECTED_BY_RECIPIENT" ||
            match.status === "REJECTED_RECOMMENDATION"
          ) {
            continue;
          }

          const user1 = match.user;
          const user2 = match.recommended_user;

          if (
            user1.id !== req.session.userId &&
            user1.id !== groupedRequests[groupKey].sender.id &&
            !groupedRequests[groupKey].members.some((m) => m.id === user1.id)
          ) {
            groupedRequests[groupKey].members.push(user1);
          }

          if (
            user2.id !== req.session.userId &&
            user2.id !== groupedRequests[groupKey].sender.id &&
            !groupedRequests[groupKey].members.some((m) => m.id === user2.id)
          ) {
            groupedRequests[groupKey].members.push(user2);
          }
        }
      }
    }

    res.status(200).json(Object.values(groupedRequests));
  } catch (err) {
    res.status(500).json({ error: "Error fetching friend requests" });
  }
});

// [GET] /matches/accepted - gets all accepted matches for the current user signed in, including group information
router.get("/accepted", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view accepted matches." });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: { group: true },
    });

    if (!currentUser.group_id) {
      return res.status(200).json({
        message: "User is not in any group",
        group: null,
        members: [],
        matches: [],
      });
    }

    const groupMembers = await prisma.user.findMany({
      where: { group_id: currentUser.group_id },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        instagram_handle: true,
        profile_picture: true,
        company: true,
        university: true,
        office_address: true,
        roommate_profile: true,
        friend_request_count: true,
      },
    });

    // get all accepted matches between group members
    const memberIds = groupMembers.map((member) => member.id);
    const groupMatches = await prisma.matches.findMany({
      where: {
        status: "ACCEPTED",
        user_id: { in: memberIds },
        recommended_id: { in: memberIds },
      },
    });

    res.status(200).json({
      message: "Group found successfully",
      group: currentUser.group,
      members: groupMembers,
      matches: groupMatches,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching accepted matches" });
  }
});

// [PUT] /matches - updates the match status with a specific other user for the current user signed in & updates weights accordingly
router.put("/", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to update match status." });
  }

  const { recommended_id, status, similarity_score } = req.body;

  if (!recommended_id || !status) {
    return res
      .status(400)
      .json({ error: "Invalid recommended_id or status parameters." });
  }

  try {
    const match = await prisma.matches.findFirst({
      where: {
        OR: [
          { user_id: req.session.userId, recommended_id: recommended_id },
          { user_id: recommended_id, recommended_id: req.session.userId },
        ],
      },
    });

    let potentialGroupId = match?.potential_group_id;

    if (status === "FRIEND_REQUEST_SENT" && !potentialGroupId) {
      potentialGroupId = `potential-${Date.now()}`;
    }

    if (match) {
      // update existing match
      await prisma.matches.update({
        where: { id: match.id },
        data: {
          status: status,
          responded_at: new Date(),
          friend_request_sent_by:
            status === "FRIEND_REQUEST_SENT"
              ? req.session.userId
              : match.friend_request_sent_by,
          friend_request_sent_at:
            status === "FRIEND_REQUEST_SENT"
              ? new Date()
              : match.friend_request_sent_at,
          potential_group_id: potentialGroupId,
        },
      });
    } else {
      // create new match if it doesn't exist
      if (
        [
          "FRIEND_REQUEST_SENT",
          "REJECTED_RECOMMENDATION",
          "REJECTED_BY_RECIPIENT",
        ].includes(status)
      ) {
        await prisma.matches.create({
          data: {
            user_id: req.session.userId,
            recommended_id: recommended_id,
            status: status,
            friend_request_sent_by:
              status === "FRIEND_REQUEST_SENT" ? req.session.userId : null,
            friend_request_sent_at:
              status === "FRIEND_REQUEST_SENT" ? new Date() : null,
            responded_at: new Date(),
            potential_group_id: potentialGroupId,
            similarity_score: similarity_score,
          },
        });

        // increment friend request count only for friend requests
        if (status === "FRIEND_REQUEST_SENT") {
          await prisma.user.update({
            where: { id: recommended_id },
            data: {
              friend_request_count: {
                increment: 1,
              },
            },
          });
        }
      } else {
        return res.status(404).json({ error: "Match not found" });
      }
    }

    if (status === "ACCEPTED" && potentialGroupId) {
      let groupId;

      // check if the current user is already in a group
      const currentUser = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: { group_id: true },
      });

      // check if the sender already has a group
      const sender = await prisma.user.findUnique({
        where: { id: match.friend_request_sent_by },
        select: { group_id: true },
      });

      if (currentUser.group_id) {
        // if current user already has a group add the sender to the current user's group
        groupId = currentUser.group_id;

        // add sender to current user's group
        await prisma.user.update({
          where: { id: match.friend_request_sent_by },
          data: { group_id: groupId },
        });
      } else if (sender.group_id) {
        // if sender has a group but current user doesn't, use sender's group
        groupId = sender.group_id;

        // add current user to sender's group
        await prisma.user.update({
          where: { id: req.session.userId },
          data: { group_id: groupId },
        });
      } else {
        // create a new group when neither has a group
        const newGroup = await prisma.group.create({ data: {} });
        groupId = newGroup.id;

        await prisma.user.update({
          where: { id: match.friend_request_sent_by },
          data: { group_id: groupId },
        });

        await prisma.user.update({
          where: { id: req.session.userId },
          data: { group_id: groupId },
        });
      }
    }

    res.status(200).json({
      message: "Match status updated successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating match" });
  }
});

// [PUT] /matches/groups - updates the match status with a specific group for the current user signed in
router.put("/groups", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  const { status, similarity_score, member_ids } = req.body;

  if (
    ![
      "FRIEND_REQUEST_SENT",
      "REJECTED_RECOMMENDATION",
      "REJECTED_BY_RECIPIENT",
    ].includes(status) ||
    !member_ids ||
    !similarity_score
  ) {
    return res.status(400).json({
      error: "Invalid request parameters for updating match status of a group.",
    });
  }

  try {
    // creates a time based potential group identifier
    const potentialGroupId = `potential-${Date.now()}`;

    const matchUpdates = [];

    if (status === "FRIEND_REQUEST_SENT") {
      // send friend requests to all members in the group
      for (const memberId of member_ids) {
        const existingMatch = await prisma.matches.findFirst({
          where: {
            OR: [
              { user_id: req.session.userId, recommended_id: memberId },
              { user_id: memberId, recommended_id: req.session.userId },
            ],
          },
        });

        if (existingMatch) {
          matchUpdates.push(
            prisma.matches.update({
              where: { id: existingMatch.id },
              data: {
                status: "FRIEND_REQUEST_SENT",
                friend_request_sent_by: req.session.userId,
                friend_request_sent_at: new Date(),
                potential_group_id: potentialGroupId,
                similarity_score: similarity_score,
              },
            }),
          );
        } else {
          matchUpdates.push(
            prisma.matches.create({
              data: {
                user_id: req.session.userId,
                recommended_id: memberId,
                status: "FRIEND_REQUEST_SENT",
                friend_request_sent_by: req.session.userId,
                friend_request_sent_at: new Date(),
                potential_group_id: potentialGroupId,
                similarity_score: similarity_score,
              },
            }),
          );
          // increment friend request count for all users in the group
          matchUpdates.push(
            prisma.user.update({
              where: { id: memberId },
              data: {
                friend_request_count: {
                  increment: 1,
                },
              },
            }),
          );
        }
      }

      const results = await Promise.all(matchUpdates);

      res.status(200).json({
        message: "Group friend requests sent successfully",
        potential_group_id: potentialGroupId,
        matches: results,
      });
    } else if (status === "REJECTED_RECOMMENDATION") {
      for (const memberId of member_ids) {
        const existingMatch = await prisma.matches.findFirst({
          where: {
            OR: [
              { user_id: req.session.userId, recommended_id: memberId },
              { user_id: memberId, recommended_id: req.session.userId },
            ],
          },
        });

        if (existingMatch) {
          matchUpdates.push(
            prisma.matches.update({
              where: { id: existingMatch.id },
              data: {
                status: "REJECTED_RECOMMENDATION",
                responded_at: new Date(),
                potential_group_id: potentialGroupId,
                similarity_score: similarity_score,
              },
            }),
          );
        } else {
          matchUpdates.push(
            prisma.matches.create({
              data: {
                user_id: req.session.userId,
                recommended_id: memberId,
                status: "REJECTED_RECOMMENDATION",
                responded_at: new Date(),
                potential_group_id: potentialGroupId,
                similarity_score: similarity_score,
              },
            }),
          );
        }
      }

      const results = await Promise.all(matchUpdates);

      res.status(200).json({
        message: "Group recommendation rejected successfully",
        potential_group_id: potentialGroupId,
        matches: results,
      });
    } else if (status === "REJECTED_BY_RECIPIENT") {
      for (const memberId of member_ids) {
        const existingMatch = await prisma.matches.findFirst({
          where: {
            OR: [
              { user_id: req.session.userId, recommended_id: memberId },
              { user_id: memberId, recommended_id: req.session.userId },
            ],
            status: "FRIEND_REQUEST_SENT",
          },
        });

        if (existingMatch) {
          matchUpdates.push(
            prisma.matches.update({
              where: { id: existingMatch.id },
              data: {
                status: "REJECTED_BY_RECIPIENT",
                responded_at: new Date(),
              },
            }),
          );
        }
      }

      const results = await Promise.all(matchUpdates);

      res.status(200).json({
        message: "Group friend request rejected successfully",
        matches: results,
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Error sending group requests" });
  }
});

// [DELETE] /matches/groups/leave - allows a user to leave their current group
// necessary because users can only be in one group at a time
router.delete("/groups/leave", async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in to leave a group" });
  }

  try {
    // check if current user is in a group
    const currentUser = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { group_id: true },
    });

    if (!currentUser.group_id) {
      return res
        .status(400)
        .json({ error: "You are not currently in any group" });
    }

    const groupId = currentUser.group_id;

    // remove user from the group
    await prisma.user.update({
      where: { id: req.session.userId },
      data: { group_id: null },
    });

    // delete group if there are less than 2 members remaining
    const remainingMembers = await prisma.user.count({
      where: {
        group_id: groupId,
      },
    });

    if (remainingMembers < 2) {
      await prisma.user.updateMany({
        where: { group_id: groupId },
        data: { group_id: null },
      });

      return res.status(200).json({
        message:
          "You have left the group. The group has been dissolved as there are fewer than 2 members remaining.",
      });
    }

    res.status(200).json({ message: "You have successfully left the group" });
  } catch (err) {
    res.status(500).json({ error: "Error leaving group" });
  }
});

module.exports = router;
