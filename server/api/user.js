const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const helmet = require('helmet');
const cors = require('cors');
router.use(helmet());
router.use(express.json());
router.use(cors());

// [GET] - get all users
router.get("/", async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
})

// [POST] - create new user route
router.post("/", async(req, res, next) => {
    try {
        const {name, email, password, dob, gender, intern_or_new_grad, budget_min, budget_max, university, company, group_id} = req.body;

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
                dob,
                gender,
                intern_or_new_grad,
                budget_min,
                budget_max,
                university,
                company,
                group_id
            }
        })
        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
})

// CATCH-ALL
router.use((next) => {
    next({ status: 404, message: "Not found" })
});

// Error handling middleware
router.use((err, req, res, next) => {
    const { message, status = 500 } = err;
    res.status(status).json({ message });
});

module.exports = router;
