const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const cors = require("cors");

// trust the first proxy when in production
app.set('trust proxy', 1);

app.use(express.json());

const corsConfig = cors({
    // origin: [/*"http://localhost:5173",*/"https://roomify-metau.onrender.com"],
    origin: "https://roomify-metau.onrender.com",
    methods: ["GET","HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  });

app.use(corsConfig);

app.use(
  expressSession({
    cookie: {
      secure: process.env.NODE_ENV === "production", // use secure in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60, // 1 hour session
      sameSite: 'none', // allow cross-site cookies
    },
    secret: "roommate-match",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

const userAuthRoutes = require("./api/userAuth.js");
app.use("/api/users", userAuthRoutes);

const roommateProfileRoutes = require("./api/roommateProfile.js");
app.use("/api/roommate-profile", roommateProfileRoutes);

const postRoutes = require("./api/posts.js");
app.use("/api/post", postRoutes);

const matchRoutes = require("./api/matches.js");
app.use("/api/matches", matchRoutes);

app.listen(PORT);
