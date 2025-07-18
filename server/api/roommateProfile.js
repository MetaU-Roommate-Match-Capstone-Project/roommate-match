const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const helmet = require("helmet");
router.use(helmet());
router.use(express.json());
const multer = require("multer");
const multerStorage = multer.memoryStorage();
const upload = multer(multerStorage);

// [POST] - create a new roommate profile
router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to create a roommate profile." });
    }

    const {
      city,
      state,
      cleanliness,
      smokes,
      pets,
      genderPreference,
      roomType,
      numRoommates,
      leaseDuration,
      moveInDate,
      sleepSchedule,
      noiseTolerance,
      socialness,
      hobbies,
      favoriteMusic,
      bio,
      cleanlinessWeight,
      smokesWeight,
      petsWeight,
      genderPreferenceWeight,
      roomTypeWeight,
      numRoommatesWeight,
      sleepScheduleWeight,
      noiseToleranceWeight,
      socialnessWeight,
      hobbiesWeight,
      favoriteMusicWeight,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingProfile = await prisma.roommateProfile.findUnique({
      where: { user_id: req.session.userId },
    });

    if (existingProfile) {
      return res
        .status(400)
        .json({ error: "User already has a roommate profile" });
    }

    // input validation for enums
    if (
      cleanliness !== "VERY_DIRTY" &&
      cleanliness !== "DIRTY" &&
      cleanliness !== "MEDIUM" &&
      cleanliness !== "CLEAN" &&
      cleanliness !== "VERY_CLEAN"
    ) {
      return res.status(400).json({ error: "Invalid cleanliness" });
    }

    if (
      pets !== "NO_PETS" &&
      pets !== "CATS_ONLY" &&
      pets !== "DOGS_ONLY" &&
      pets !== "CATS_AND_DOGS" &&
      pets !== "OKAY_WITH_ANY_PET"
    ) {
      return res.status(400).json({ error: "Invalid pets" });
    }

    if (
      genderPreference !== "NO_PREFERENCE" &&
      genderPreference !== "MALE" &&
      genderPreference !== "FEMALE" &&
      genderPreference !== "NONBINARY"
    ) {
      return res.status(400).json({ error: "Invalid gender preference" });
    }

    if (
      roomType !== "PRIVATE_ROOM_IN_APARTMENT" &&
      roomType !== "PRIVATE_ROOM_IN_HOUSE" &&
      roomType !== "SHARED_ROOM"
    ) {
      return res.status(400).json({ error: "Invalid room type" });
    }

    if (
      sleepSchedule !== "NO_PREFERENCE" &&
      sleepSchedule !== "EARLY_RISER" &&
      sleepSchedule !== "LATE_SLEEPER"
    ) {
      return res.status(400).json({ error: "Invalid sleep schedule" });
    }

    if (
      noiseTolerance !== "QUIET" &&
      noiseTolerance !== "SOMEWHAT_QUIET" &&
      noiseTolerance !== "SOMEWHAT_NOISY" &&
      noiseTolerance !== "NOISY"
    ) {
      return res.status(400).json({ error: "Invalid noise tolerance" });
    }

    if (
      socialness !== "LONER" &&
      socialness !== "SOMEWHAT_SOCIAL" &&
      socialness !== "SOCIAL" &&
      socialness !== "VERY_SOCIAL"
    ) {
      return res.status(400).json({ error: "Invalid socialness" });
    }

    const newRoommateProfile = await prisma.roommateProfile.create({
      data: {
        user_id: req.session.userId,
        city,
        state,
        cleanliness,
        smokes,
        pets,
        gender_preference: genderPreference,
        room_type: roomType,
        num_roommates: numRoommates,
        lease_duration: leaseDuration,
        move_in_date: moveInDate,
        sleep_schedule: sleepSchedule,
        noise_tolerance: noiseTolerance,
        socialness,
        hobbies,
        favorite_music: favoriteMusic,
        bio,
        cleanliness_weight: cleanlinessWeight,
        smokes_weight: smokesWeight,
        pets_weight: petsWeight,
        gender_preference_weight: genderPreferenceWeight,
        room_type_weight: roomTypeWeight,
        num_roommates_weight: numRoommatesWeight,
        sleep_schedule_weight: sleepScheduleWeight,
        noise_tolerance_weight: noiseToleranceWeight,
        socialness_weight: socialnessWeight,
        hobbies_weight: hobbiesWeight,
        favorite_music_weight: favoriteMusicWeight,
      },
    });

    res.status(201).json(newRoommateProfile);
  } catch (err) {
    res.status(500).json("Error creating roommate profile");
  }
});

// [GET] - get profile of the user that is signed in
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to view your profile." });
    }

    const roommateProfile = await prisma.roommateProfile.findUnique({
      where: { user_id: req.session.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            instagram_handle: true,
            dob: true,
            gender: true,
            intern_or_new_grad: true,
            budget_min: true,
            budget_max: true,
            university: true,
            company: true,
          },
        },
      },
    });

    if (!roommateProfile) {
      return res.status(404).json({ error: "Roommate profile not found" });
    }

    res.status(200).json(roommateProfile);
  } catch (err) {
    res.status(500).json("Error fetching roommate profile");
  }
});

// [GET] - get all roommate profiles
router.get("/", async (req, res) => {
  try {
    const roommateProfiles = await prisma.roommateProfile.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(roommateProfiles);
  } catch (err) {
    res.status(500).json("Error fetching all roommate profiles");
  }
});

// [GET] - get a roommate profile by id
router.get("/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: "You must be logged in to view another user's profile.",
      });
    }
    const otherUserId = parseInt(req.params.id);
    const otherUserProfile = await prisma.roommateProfile.findUnique({
      where: {
        user_id: otherUserId,
      },
      include: {
        user: true,
      },
    });

    if (!otherUserProfile) {
      return res.status(404).json({ error: "Roommate profile not found" });
    }

    res.status(200).json(otherUserProfile);
  } catch (err) {
    res.status(500).json("Error fetching roommate profile");
  }
});

// [GET] - get profile picture by user id
router.get("/profile-picture/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to see your profile picture" });
    }

    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile_picture: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.profile_picture) {
      return res.status(404).json({ error: "No profile picture found" });
    }

    res.set("Content-Type", "image/*");
    res.send(user.profile_picture);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile picture" });
  }
});

// [PUT] - upload a different profile picture
router.put(
  "/profile-picture/:id",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          error: "You must be logged in to upload a profile picture ",
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const buffer = req.file.buffer;
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedProfilePicture = await prisma.user.update({
        where: { id: user.id },
        data: {
          profile_picture: buffer,
        },
      });
      res.status(200).json(updatedProfilePicture);
    } catch (error) {
      res.status(500).json({ error: "Error uploading profile picture" });
    }
  },
);

module.exports = router;
