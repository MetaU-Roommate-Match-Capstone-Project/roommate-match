const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const helmet = require('helmet');
const cors = require('cors');
router.use(helmet());
router.use(express.json());
router.use(cors());

// [POST] - create a new roommate profile
router.post('/', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "You must be logged in to create a roommate profile." });
        }

        const { city, state, cleanliness, smokes, pets, genderPreference, roomType, numRoommates, leaseDuration, moveInDate, sleepSchedule, noiseTolerance, socialness, hobbies, favoriteMusic, bio } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.session.userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingProfile = await prisma.roommateProfile.findUnique({
            where: { user_id: req.session.userId }
        });

        if (existingProfile) {
            return res.status(400).json({ error: "User already has a roommate profile" });
        }

        // input validation for enums
        if (cleanliness !== "VERY_DIRTY" && cleanliness !== "DIRTY" && cleanliness !== "MEDIUM" && cleanliness !== "CLEAN" && cleanliness !== "VERY_CLEAN") {
            return res.status(400).json({ error: "Invalid cleanliness" });
        }

        if (pets !== "NO_PETS" && pets !== "CATS_ONLY" && pets !== "DOGS_ONLY" && pets !== "CATS_AND_DOGS" && pets !== "OKAY_WITH_ANY_PET") {
            return res.status(400).json({ error: "Invalid pets" });
        }

        if (genderPreference !== "NO_PREFERENCE" && genderPreference !== "MALE" && genderPreference !== "FEMALE" && genderPreference !== "NONBINARY") {
            return res.status(400).json({ error: "Invalid gender preference" });
        }

        if (roomType !== "PRIVATE_ROOM_IN_APARTMENT" && roomType !== "PRIVATE_ROOM_IN_HOUSE" && roomType !== "SHARED_ROOM") {
            return res.status(400).json({ error: "Invalid room type" });
        }

        if (sleepSchedule !== "NO_PREFERENCE" && sleepSchedule !== "EARLY_RISER" && sleepSchedule !== "LATE_SLEEPER") {
            return res.status(400).json({ error: "Invalid sleep schedule" });
        }

        if (noiseTolerance !== "QUIET" && noiseTolerance !== "SOMEWHAT_QUIET" && noiseTolerance !== "SOMEWHAT_NOISY" && noiseTolerance !== "NOISY") {
            return res.status(400).json({ error: "Invalid noise tolerance" });
        }

        if (socialness !== "LONER" && socialness !== "SOMEWHAT_SOCIAL" && socialness !== "SOCIAL" && socialness !== "VERY_SOCIAL") {
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
                bio
            }
        })

        res.status(201).json(newRoommateProfile);

    } catch (err) {
        console.error(err);
        res.status(500).json("Error creating roommate profile" );
    }
});

// [GET] - get profile of the user that is signed in
router.get('/me', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "You must be logged in to view your profile." });
        }

        const roommateProfile = await prisma.roommateProfile.findUnique({
            where: { user_id: req.session.userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        dob: true,
                        gender: true,
                        intern_or_new_grad: true,
                        budget_min: true,
                        budget_max: true,
                        university: true,
                        company: true
                    }
                }
            }
        });

        if (!roommateProfile) {
            return res.status(404).json({ error: "Roommate profile not found" });
        }

        res.status(200).json(roommateProfile);
    } catch (err) {
        console.error(err);
        res.status(500).json("Error fetching roommate profile");
    }
})

// [GET] - get all roommate profiles
router.get('/', async (req, res) => {
    try {
        const roommateProfiles = await prisma.roommateProfile.findMany({
            include: {
                user: true
            }
        });
        res.status(200).json(roommateProfiles);
    } catch (err) {
        console.error(err);
        res.status(500).json("Error fetching all roommate profiles");
    }
});

module.exports = router;
