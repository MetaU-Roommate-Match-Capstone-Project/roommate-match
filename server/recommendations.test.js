const {
  buildPreferenceSimilarityMatrix,
  galeShapleyGroupMatching,
  getMultipleGroupOptions,
} = require("./utils/matchingGroups");
const {
  distanceBetweenEnumValues,
  distanceBetweenBooleanValues,
  distanceBetweenNumericalValues,
  distanceBetweenStringValues,
  distanceBetweenCoordinates,
} = require("./utils/similarityCalculations.js");
const RecommendationEngine = require("./utils/RecommendationEngine");

// mock PrismaClient
jest.mock("./generated/prisma", () => {
  const mockPrismaClient = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    roommateProfile: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    matches: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    group: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  };
});

describe("distanceBetweenEnumValues", () => {
  test("should return the correct distance between two enum values in the same category", () => {
    const distance = distanceBetweenEnumValues(
      "cleanliness",
      "VERY_CLEAN",
      "DIRTY",
    );

    // VERY_CLEAN is 4 && DIRTY is 1 => distance = 4 - 1 = 3
    expect(distance).toBe(3);
  });

  test("should return 0 when comparing the same enum value", () => {
    const distance = distanceBetweenEnumValues(
      "pets",
      "CATS_ONLY",
      "CATS_ONLY",
    );
    expect(distance).toBe(0);
  });
});

describe("distanceBetweenBooleanValues", () => {
  test("should return 0 when both values are the same", () => {
    expect(distanceBetweenBooleanValues(true, true)).toBe(0);
    expect(distanceBetweenBooleanValues(false, false)).toBe(0);
  });

  test("should return 1 when values are different", () => {
    expect(distanceBetweenBooleanValues(true, false)).toBe(1);
    expect(distanceBetweenBooleanValues(false, true)).toBe(1);
  });
});

describe("distanceBetweenNumericalValues", () => {
  test("should return the absolute difference between two positive numbers", () => {
    expect(distanceBetweenNumericalValues(10, 5)).toBe(5);
    expect(distanceBetweenNumericalValues(5, 10)).toBe(5);
  });

  test("should handle negative numbers correctly", () => {
    expect(distanceBetweenNumericalValues(-5, 5)).toBe(10);
    expect(distanceBetweenNumericalValues(5, -5)).toBe(10);
    expect(distanceBetweenNumericalValues(-5, -10)).toBe(5);
  });
});

describe("distanceBetweenStringValues", () => {
  test("should return 0 for identical strings", () => {
    const result = distanceBetweenStringValues(
      "reading books",
      "reading books",
    );
    expect(result).toBe(0);
  });

  test("should return a value between 0 and 1 for similar strings", () => {
    const result = distanceBetweenStringValues(
      "reading books",
      "reading novels",
    );
    expect(result).toBeGreaterThan(0.45);
    expect(result).toBeLessThan(0.65);
  });
});

describe("distanceBetweenCoordinates", () => {
  test("should return 0 for identical coordinates", () => {
    const distance = distanceBetweenCoordinates(
      37.7749,
      -122.4194,
      37.7749,
      -122.4194,
    );
    expect(distance).toBeCloseTo(0, 5);
  });

  test("should calculate the correct distance between San Francisco and Los Angeles", () => {
    // San Francisco: 37.7749° N, 122.4194° W
    // Los Angeles: 34.0522° N, 118.2437° W
    // approximate distance: ~560 km
    const distance = distanceBetweenCoordinates(
      37.7749,
      -122.4194,
      34.0522,
      -118.2437,
    );
    expect(distance).toBeGreaterThan(500);
    expect(distance).toBeLessThan(600);
  });
});

describe("buildPreferenceSimilarityMatrix", () => {
  test("should return an empty array when no users have profiles", async () => {
    const result = await buildPreferenceSimilarityMatrix();
    expect(result).toEqual([]);
  });

  test("should build a preference matrix with correct structure", async () => {
    const mockUsers = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];

    const mockProfiles = [
      { user_id: 1, num_roommates: 2 },
      { user_id: 2, num_roommates: 1 },
    ];

    // mock PrismaClient instance for this test
    const mockPrismaClient = require("./generated/prisma").PrismaClient();

    // mock implementation for user and roommateProfile queries
    mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);
    mockPrismaClient.roommateProfile.findMany.mockResolvedValue(mockProfiles);

    const result = await buildPreferenceSimilarityMatrix();

    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe("User 1");
    expect(result[0].capacity).toBe(2); // num_roommates from mockProfiles[0]
    expect(result[0].preferences).toBeDefined();
    expect(result[0].currentGroup).toBeNull();
  });
});

describe("RecommendationEngine.computeSimilarity", () => {
  test("should calculate higher similarity for profiles with similar attributes", () => {
    // similar roommate profiles to test higher similarity
    const currentProfile = {
      cleanliness: "CLEAN",
      smokes: false,
      pets: "NO_PETS",
      gender_preference: "NO_PREFERENCE",
      room_type: "PRIVATE_ROOM_IN_APARTMENT",
      num_roommates: 2,
      sleep_schedule: "EARLY_RISER",
      noise_tolerance: "QUIET",
      socialness: "SOMEWHAT_SOCIAL",
      hobbies: "reading hiking cooking",
      favorite_music: "pop rock indie",
      move_in_date: new Date("2023-09-01"),
    };

    const similarProfile = {
      cleanliness: "CLEAN",
      smokes: false,
      pets: "NO_PETS",
      gender_preference: "NO_PREFERENCE",
      room_type: "PRIVATE_ROOM_IN_APARTMENT",
      num_roommates: 2,
      sleep_schedule: "EARLY_RISER",
      noise_tolerance: "SOMEWHAT_QUIET",
      socialness: "SOCIAL",
      hobbies: "reading hiking photography",
      favorite_music: "pop rock alternative",
      move_in_date: new Date("2025-09-15"),
    };

    const currentUser = {
      id: 1,
      name: "Test User 1",
      dob: new Date("2005-05-15"),
      university: "Stanford University",
      office_latitude: 37.7749,
      office_longitude: -122.4194,
    };

    const similarUser = {
      id: 2,
      name: "Test User 2",
      dob: new Date("2005-06-20"),
      university: "Stanford University",
      office_latitude: 37.7749,
      office_longitude: -122.4194,
    };

    const engine = new RecommendationEngine(
      currentProfile,
      currentUser,
      [similarProfile],
      [similarUser],
    );

    const similarity = engine.computeSimilarity(similarProfile, similarUser);

    // expect high similarity
    expect(similarity).toBeGreaterThan(0.7);
  });

  test("should calculate lower similarity for profiles with different attributes", () => {
    // roommate profiles with different attributes to test lower similarity
    const currentProfile = {
      cleanliness: "VERY_CLEAN",
      smokes: false,
      pets: "NO_PETS",
      gender_preference: "FEMALE",
      room_type: "PRIVATE_ROOM_IN_APARTMENT",
      num_roommates: 1,
      sleep_schedule: "EARLY_RISER",
      noise_tolerance: "QUIET",
      socialness: "SOMEWHAT_SOCIAL",
      hobbies: "reading yoga meditation",
      favorite_music: "classical jazz",
      move_in_date: new Date("2025-09-01"),
    };

    const differentProfile = {
      cleanliness: "DIRTY",
      smokes: true,
      pets: "CATS_AND_DOGS",
      gender_preference: "MALE",
      room_type: "SHARED_ROOM",
      num_roommates: 4,
      sleep_schedule: "LATE_SLEEPER",
      noise_tolerance: "NOISY",
      socialness: "VERY_SOCIAL",
      hobbies: "partying gaming sports",
      favorite_music: "rap metal edm",
      move_in_date: new Date("2025-12-15"),
    };

    const currentUser = {
      id: 1,
      name: "Test User 1",
      dob: new Date("2007-05-15"),
      university: "Stanford University",
      office_latitude: 37.7749,
      office_longitude: -122.4194,
    };

    const differentUser = {
      id: 2,
      name: "Test User 2",
      dob: new Date("1997-06-20"),
      university: "MIT",
      office_latitude: 34.0522,
      office_longitude: -118.2437,
    };

    const engine = new RecommendationEngine(
      currentProfile,
      currentUser,
      [differentProfile],
      [differentUser],
    );

    const similarity = engine.computeSimilarity(
      differentProfile,
      differentUser,
    );

    // expect low similarity
    expect(similarity).toBeLessThan(0.5);
  });
});

// Tests for galeShapleyGroupMatching
describe("galeShapleyGroupMatching", () => {
  test("should produce stable groups with optimal matching", () => {
    const mockUsers = [
      {
        id: 1,
        name: "User 1",
        preferences: [
          { id: 2, similarity: 0.9 },
          { id: 3, similarity: 0.7 },
          { id: 4, similarity: 0.5 },
        ],
        capacity: 2,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: {
          id: 1,
          name: "User 1",
          office_latitude: 37.7749,
          office_longitude: -122.4194,
        },
        originalProfile: {
          user_id: 1,
          num_roommates: 2,
        },
      },
      {
        id: 2,
        name: "User 2",
        preferences: [
          { id: 1, similarity: 0.9 },
          { id: 3, similarity: 0.6 },
          { id: 4, similarity: 0.4 },
        ],
        capacity: 2,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: {
          id: 2,
          name: "User 2",
          office_latitude: 37.7749,
          office_longitude: -122.4194,
        },
        originalProfile: {
          user_id: 2,
          num_roommates: 2,
        },
      },
      {
        id: 3,
        name: "User 3",
        preferences: [
          { id: 4, similarity: 0.95 },
          { id: 1, similarity: 0.7 },
          { id: 2, similarity: 0.6 },
        ],
        capacity: 2,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: {
          id: 3,
          name: "User 3",
          office_latitude: 34.0522,
          office_longitude: -118.2437,
        },
        originalProfile: {
          user_id: 3,
          num_roommates: 2,
        },
      },
      {
        id: 4,
        name: "User 4",
        preferences: [
          { id: 3, similarity: 0.95 },
          { id: 1, similarity: 0.5 },
          { id: 2, similarity: 0.4 },
        ],
        capacity: 2,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: {
          id: 4,
          name: "User 4",
          office_latitude: 34.0522,
          office_longitude: -118.2437,
        },
        originalProfile: {
          user_id: 4,
          num_roommates: 2,
        },
      },
    ];

    const groups = galeShapleyGroupMatching(mockUsers);

    // checks that groups were formed
    expect(groups.length).toBeGreaterThan(0);

    // checks that each group has at least 2 members
    groups.forEach((group) => {
      expect(group.members.length).toBeGreaterThanOrEqual(2);
    });

    // check that users with high mutual similarity are grouped together
    const user1Group = groups.find((g) => g.members.some((m) => m.id === 1));
    const user2Group = groups.find((g) => g.members.some((m) => m.id === 2));
    const user3Group = groups.find((g) => g.members.some((m) => m.id === 3));
    const user4Group = groups.find((g) => g.members.some((m) => m.id === 4));

    // checks that users with high similarity are in the same group
    if (user1Group && user2Group) {
      expect(user1Group).toBe(user2Group);
    }

    if (user3Group && user4Group) {
      expect(user3Group).toBe(user4Group);
    }

    // checks that all users are assigned to a group
    const allUsersAssigned = mockUsers.every((user) =>
      groups.some((group) =>
        group.members.some((member) => member.id === user.id),
      ),
    );

    expect(allUsersAssigned).toBe(true);
  });
});

describe("getMultipleGroupOptions", () => {
  test("should return an empty array when no valid groups can be formed", async () => {
    // empty users array => no valid groups can be formed
    const users = [];
    const numGroupOptions = 3;
    const currentUserId = 1;

    const result = await getMultipleGroupOptions(
      users,
      numGroupOptions,
      currentUserId,
    );

    expect(result).toEqual([]);
  });

  test("should filter out rejected matches and closed groups", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "Current User",
        preferences: [{ id: 2, similarity: 0.8 }],
        capacity: 2,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: {
          id: 1,
          name: "Current User",
          office_latitude: 37.7749,
          office_longitude: -122.4194,
        },
        originalProfile: {
          user_id: 1,
          num_roommates: 2,
        },
      },
      {
        id: 2,
        name: "Other User",
        preferences: [{ id: 1, similarity: 0.8 }],
        capacity: 2,
        currentGroup: null,
        proposalHistory: new Set(),
        originalUser: {
          id: 2,
          name: "Other User",
          office_latitude: 37.7749,
          office_longitude: -122.4194,
        },
        originalProfile: {
          user_id: 2,
          num_roommates: 1,
        },
      },
    ];

    const mockRejectedMatches = [
      { user_id: 1, recommended_id: 2, status: "REJECTED_RECOMMENDATION" },
    ];

    const mockPrismaClient = require("./generated/prisma").PrismaClient();

    // update mockPrismaClient instance with the rejected matches
    mockPrismaClient.matches.findMany.mockResolvedValue(mockRejectedMatches);

    const result = await getMultipleGroupOptions(mockUsers, 3, 1);

    // should return empty array since only valid option got rejected
    expect(result).toEqual([]);
  });
});
