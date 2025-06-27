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
        const { user_id, city, state, cleanliness, smokes, pets, gender_preference, room_type, num_roommates, lease_duration, move_in_date, sleep_schedule, noise_tolerance, socialness, hobbies, favorite_music, bio } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            res.status(404).json("User not found");
            return;
        }

        const newRoommateProfile = await prisma.roommateProfile.create({
            data: {
                user_id,
                city,
                state,
                cleanliness,
                smokes,
                pets,
                gender_preference,
                room_type,
                num_roommates,
                lease_duration,
                move_in_date: new Date(move_in_date),
                sleep_schedule,
                noise_tolerance,
                socialness,
                hobbies,
                favorite_music,
                bio
            }
        })
        res.status(201).json(newRoommateProfile);

    } catch (err) {
        console.error(err);
        res.status(500).json("Error creating roommate profile");
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
