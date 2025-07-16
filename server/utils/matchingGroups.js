const RecommendationEngine = require("./RecommendationEngine");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function buildPreferenceSimilarityMatrix() {
  try {
    // get all users and their roommate profiles
    const users = await prisma.user.findMany();
    const profiles = await prisma.roommateProfile.findMany();

    // make a profile map for easy lookup of profiles with user id as key
    const profileMap = new Map();
    profiles.forEach((profile) => {
      profileMap.set(profile.user_id, profile);
    });

    // similarity matrix is a list of user objects with preferences and capacity (num_roommates)
    const userPreferences = [];

    for (const user of users) {
      const userProfile = profileMap.get(user.id);
      if (!userProfile) {
        continue; // skip users without profiles
      }

      // list that stores calculated similarities with all other users
      const similarities = [];

      for (const otherUser of users) {
        if (otherUser.id === user.id) {
          continue; // skip current user signed in
        }

        const otherProfile = profileMap.get(otherUser.id);
        if (!otherProfile) {
          continue; // skip users without profiles
        }

        // make an instance of the recommendation engine to calculate similarity
        const recommender = new RecommendationEngine(
          userProfile,
          user,
          [otherProfile],
          [otherUser],
        );

        // calculate similarity between current user and other user
        const similarity = recommender.computeSimilarity(
          otherProfile,
          otherUser,
        );

        // add calculated similarity to list
        similarities.push({
          id: otherUser.id,
          similarity: similarity,
          profile: otherProfile,
          user: otherUser,
        });
      }

      // create preference list
      const preferences = similarities.map((item) => ({
        id: item.id,
        similarity: item.similarity,
      }));

      // add user object for group-based Gale-Shapley algorithm to similarity matrix
      userPreferences.push({
        id: user.id,
        name: user.name,
        preferences: preferences,
        capacity: userProfile.num_roommates,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: user,
        originalProfile: userProfile,
      });
    }

    return userPreferences;
  } catch (error) {
    throw error;
  }
}

function galeShapleyGroupMatching(users) {
  // initalize list of groups and map of users
  const groups = [];
  const userMap = new Map();
  users.forEach((user) => userMap.set(user.id, user));

  // initialize queue of users not in any group
  const freeUsers = [...users];

  // while there are still users in the queue
  while (freeUsers.length > 0) {
    // get the next user from the queue
    const proposer = freeUsers.shift();

    // if the user is already in a group, skip them
    if (
      proposer.currentGroup &&
      proposer.currentGroup.members.length >= proposer.capacity + 1
    ) {
      continue;
    }

    // find the next valid proposal for the user
    const proposal = findNextProposal(proposer, groups, userMap);

    if (!proposal) {
      continue;
    }

    // if the proposal is to form a new group with an individual
    if (proposal.type === "individual") {
      // form the group without requiring all pairs to be stable
      const targetUser = proposal.target;
      const newGroup = createGroup([proposer, targetUser]);
      groups.push(newGroup);

      // remove proposer and target from free users if their groups are now full
      if (newGroup.members.length >= proposer.capacity + 1) {
        removeFromFreeUsers(freeUsers, proposer);
      }
      if (newGroup.members.length >= targetUser.capacity + 1) {
        removeFromFreeUsers(freeUsers, targetUser);
      }
    } else if (proposal.type === "group") {
      // if the proposal is to join an existing group
      // check if the group can accept the new member
      const targetGroup = proposal.target;

      if (canAcceptNewMember(targetGroup, proposer, userMap)) {
        // check if there's a member to reject
        const rejectedMember = findMemberToReject(
          targetGroup,
          proposer,
          userMap,
        );

        if (rejectedMember) {
          // remove rejected member and add them back to free users
          removeFromGroup(targetGroup, rejectedMember);
          freeUsers.push(rejectedMember);
        }

        // add proposer to the group
        addToGroup(targetGroup, proposer);

        // remove proposer from free users if their group is now full
        if (targetGroup.members.length >= proposer.capacity + 1) {
          removeFromFreeUsers(freeUsers, proposer);
        }
      } else {
        // proposal to join a group is rejected, add proposer back to queue
        freeUsers.push(proposer);
      }
    }
  }

  // filter out groups with only one member
  return groups.filter((group) => group.members.length > 1);
}

function findNextProposal(proposer, groups, userMap) {
  // check if there are any valid proposals left
  for (const pref of proposer.preferences) {
    const proposalKey = `${pref.id}`;

    if (proposer.proposalHistory.has(proposalKey)) {
      continue; // skip if already proposed to this user/group
    }

    // add proposal to history
    proposer.proposalHistory.add(proposalKey);

    const targetUser = userMap.get(pref.id);
    if (!targetUser) {
      continue;
    }

    // check if the target user is free or in a group that can accept a new member
    if (!targetUser.currentGroup) {
      return { type: "individual", target: targetUser };
    } else if (
      targetUser.currentGroup.members.length <
      getMaxGroupSize(targetUser.currentGroup)
    ) {
      return { type: "group", target: targetUser.currentGroup };
    }
  }

  return null;
}

function isStablePair(user1, user2, userMap) {
  // get user1's preference for user2
  const user1PrefForUser2 = user1.preferences.find((p) => p.id === user2.id);
  const user2PrefForUser1 = user2.preferences.find((p) => p.id === user1.id);

  if (!user1PrefForUser2 || !user2PrefForUser1) {
    return false; // one doesn't have the other in preferences
  }

  // check for a blocking pair
  // case 1: two users are not currently matched to each other
  // case 2: both prefer each other over their current matches

  for (const otherUser of userMap.values()) {
    if (otherUser.id === user1.id || otherUser.id === user2.id) {
      continue; // skip self
    }

    // check if user1 and otherUser would form a blocking pair
    const user1PrefForOther = user1.preferences.find(
      (p) => p.id === otherUser.id,
    );
    const otherPrefForUser1 = otherUser.preferences.find(
      (p) => p.id === user1.id,
    );

    if (user1PrefForOther && otherPrefForUser1) {
      // check if both prefer each other over their current situation
      const user1PrefersOther =
        user1PrefForOther.similarity > user1PrefForUser2.similarity;
      const otherPrefersUser1 =
        otherPrefForUser1.similarity >
        (otherUser.currentGroup
          ? getAverageGroupSimilarity(
              otherUser,
              otherUser.currentGroup,
              userMap,
            )
          : 0);

      if (user1PrefersOther && otherPrefersUser1) {
        return false; // blocking pair found
      }
    }

    // check if user2 and otherUser would form a blocking pair
    const user2PrefForOther = user2.preferences.find(
      (p) => p.id === otherUser.id,
    );
    const otherPrefForUser2 = otherUser.preferences.find(
      (p) => p.id === user2.id,
    );

    if (user2PrefForOther && otherPrefForUser2) {
      const user2PrefersOther =
        user2PrefForOther.similarity > user2PrefForUser1.similarity;
      const otherPrefersUser2 =
        otherPrefForUser2.similarity >
        (otherUser.currentGroup
          ? getAverageGroupSimilarity(
              otherUser,
              otherUser.currentGroup,
              userMap,
            )
          : 0);

      if (user2PrefersOther && otherPrefersUser2) {
        return false; // blocking pair found
      }
    }
  }

  return true; // return true if no blocking pair found and the pair is stable
}

function canAcceptNewMember(group, proposer, userMap) {
  // check if the group has space for the new member by checking max capacity of all members
  const maxCapacity = Math.max(...group.members.map((m) => m.capacity));
  if (group.members.length >= maxCapacity + 1) {
    return false;
  }

  // check if the new member is more similar to the group than the worst member
  const currentWorstMember = findWorstMember(group, userMap);
  if (!currentWorstMember) {
    return true;
  }

  const proposerAvgSimilarity = getAverageGroupSimilarity(
    proposer,
    group,
    userMap,
  );
  const worstMemberAvgSimilarity = getAverageGroupSimilarity(
    currentWorstMember,
    group,
    userMap,
  );

  // return true if the new member is more similar to the group than the worst member
  return proposerAvgSimilarity > worstMemberAvgSimilarity;
}

function findWorstMember(group, userMap) {
  // find the member with the lowest average similarity to the group
  let worstMember = null;
  let lowestAvgSimilarity = Infinity;

  // iterate through all members in the group
  for (const member of group.members) {
    const avgSimilarity = getAverageGroupSimilarity(member, group, userMap);
    // if the current member has a lower average similarity than the previous worst member, update the worst member
    if (avgSimilarity < lowestAvgSimilarity) {
      lowestAvgSimilarity = avgSimilarity;
      worstMember = member;
    }
  }

  return worstMember;
}

function findMemberToReject(group, proposer, userMap) {
  // if group is full, find the worst member to reject.
  // otherwise, return null because no member needs to be rejected
  if (group.members.length < getMaxGroupSize(group)) {
    return null;
  }

  return findWorstMember(group, userMap);
}

function getAverageGroupSimilarity(user, group, userMap) {
  if (group.members.length === 0) {
    return 0;
  }

  let totalSimilarity = 0;
  let count = 0;

  // iterate through all members in the group
  for (const member of group.members) {
    if (member.id === user.id) {
      continue; // skip self
    }

    // get the similarity between the user and the member
    const pref = user.preferences.find((p) => p.id === member.id);
    // add the similarity to the total
    if (pref) {
      totalSimilarity += pref.similarity;
      count++;
    }
  }

  // return the average similarity
  return count > 0 ? totalSimilarity / count : 0;
}

function getMaxGroupSize(group) {
  // return the max capacity of all members in the group
  return Math.max(...group.members.map((m) => m.capacity)) + 1;
}

function createGroup(members) {
  // create a new group with the given members
  const group = {
    id: Math.floor(Math.random() * 1000),
    members: [...members],
  };

  // set the current group for each member
  members.forEach((member) => {
    member.currentGroup = group;
  });

  return group;
}

function addToGroup(group, user) {
  group.members.push(user);
  user.currentGroup = group;
}

function removeFromGroup(group, user) {
  group.members = group.members.filter((m) => m.id !== user.id);
  user.currentGroup = null;
}

function removeFromFreeUsers(freeUsers, user) {
  const index = freeUsers.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    freeUsers.splice(index, 1);
  }
}

function countStablePairs(groups, userMap) {
  let stablePairCount = 0;

  for (const group of groups) {
    const members = group.members;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        if (isStablePair(members[i], members[j], userMap)) {
          stablePairCount++;
        }
      }
    }
  }

  return stablePairCount;
}

// used to shuffle preferences before running gale-shapley algorithm
// introduces randomness and to get different multiple group options
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

// make multiple group options ranked by number of stable pairs within that group
function getMultipleGroupOptions(users, numGroupOptions) {
  const groupOptions = [];

  for (let i = 0; i < numGroupOptions; i++) {
    const usersCopy = users.map((user) => ({
      ...user,
      currentGroup: null,
      proposalHistory: new Set(),
      preferences: shuffleArray([...user.preferences]),
    }));

    // run gale-shapley algorithm and map users to groups
    const groups = galeShapleyGroupMatching(usersCopy);
    const userMap = new Map();
    usersCopy.forEach((user) => userMap.set(user.id, user));

    // add group option to list
    if (groups.length > 0) {
      const stablePairs = countStablePairs(groups, userMap);
      groupOptions.push({
        groups: groups,
        stablePairs: stablePairs,
        users: usersCopy,
      });
    }
  }

  // sort by stable pairs count (most stable to least stable - descending order)
  groupOptions.sort((a, b) => b.stablePairs - a.stablePairs);

  return groupOptions;
}

function formatIndividualGroupsOutput(groups) {
  return groups.map((group, index) => ({
    groupId: group.id,
    members: group.members.map((member) => ({
      userId: member.id,
      name: member.name,
      capacity: member.capacity,
      averageGroupSimilarity: getAverageGroupSimilarity(
        member,
        group,
        new Map(),
      ),
    })),
  }));
}

function formatMultipleGroupOptions(groupOptions) {
  return groupOptions.map((option, index) => ({
    rank: index + 1,
    stablePairs: option.stablePairs,
    groups: formatIndividualGroupsOutput(option.groups),
  }));
}

module.exports = {
  buildPreferenceSimilarityMatrix,
  galeShapleyGroupMatching,
  getMultipleGroupOptions,
  formatMultipleGroupOptions,
};
