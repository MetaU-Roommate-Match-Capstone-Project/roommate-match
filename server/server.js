const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const cors = require("cors");

app.use(express.json());

const corsConfig = cors({
    origin: ["http://localhost:5173", "https://roomify-metau.onrender.com/"],
    methods: ["GET","HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  });

// app.options('*', cors());
app.use(corsConfig);

app.use(
  expressSession({
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60, // 1 hour session
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

app.listen(PORT);
