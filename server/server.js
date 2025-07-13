const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const session = require("express-session");
const cors = require("cors");

app.use(express.json());

app.use(
  session({
    secret: "roommate-match",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 60 }, // 1 hour session
  }),
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
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
