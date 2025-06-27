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
