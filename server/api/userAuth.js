const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const helmet = require("helmet");
const cors = require("cors");
const { fetchOfficeCoordinates } = require("./fetchCoordinates");
router.use(helmet());
router.use(express.json());
router.use(cors());

// [POST] - Create Account Route
router.post("/create-account", async (req, res) => {
  const {
    name,
    email,
    phone_number,
    instagram_handle,
    password,
    dob,
    gender,
    intern_or_new_grad,
    budget_min,
    budget_max,
    university,
    company,
    office_address,
  } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // check that email contains @ and ends in .edu (app tailored for students)
    if (!email.includes("@") || !email.endsWith(".edu")) {
      return res
        .status(400)
        .json({ error: "Must be valid student email address." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    if (gender !== "male" && gender !== "female" && gender !== "non-binary") {
      return res
        .status(400)
        .json({ error: "Gender must be male, female, or non-binary." });
    }

    if (intern_or_new_grad !== "intern" && intern_or_new_grad !== "new grad") {
      return res
        .status(400)
        .json({ error: "Status must be intern or new grad." });
    }

    // check if user email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // bcrypt automatically salts the password
    // 10 rounds of hashing done
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        instagram_handle,
        dob,
        gender,
        intern_or_new_grad,
        budget_min,
        budget_max,
        university,
        company,
        office_address,
      },
    });
    res.status(201).json({ newUser });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong during account creation." });
  }
});

// [POST] - Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    req.session.userId = user.id;
    req.session.username = user.email;

    res.json({ id: user.id, username: user.email });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong during login." });
  }
});

// [POST] - Logout route
router.post("/logout/:id", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out." });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful." });
  });
});

// [GET] - get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();

    const usersWithCoordinates = await Promise.all(
      users.map(async (user) => {
        if (user.office_address) {
          // check if user already has coordinates in database and return stored coordinates
          if (user.office_latitude && user.office_longitude) {
            return {
              ...user,
              officeCoordinates: {
                latitude: user.office_latitude,
                longitude: user.office_longitude,
              },
            };
          } else {
            // otherwise fetch coordinates from Google Maps Geocoding API and store them
            const coordinates = await fetchOfficeCoordinates(
              user.office_address,
            );

            if (coordinates) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  office_latitude: coordinates.latitude,
                  office_longitude: coordinates.longitude,
                },
              });
            }

            return {
              ...user,
              officeCoordinates: coordinates,
            };
          }
        } else {
          return {
            ...user,
            officeCoordinates: null,
          };
        }
      }),
    );

    res.status(200).json(usersWithCoordinates);
  } catch (err) {
    next(err);
  }
});

// [GET] - Check if user is logged in
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { email: true },
    });
    res.json({ id: req.session.userId, username: user.email });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user session data." });
  }
});

// Delete user account
router.delete("/delete-account/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    res.json({ deletedUser });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong during account deletion." });
  }
});

module.exports = router;
