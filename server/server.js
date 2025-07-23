const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// trust the first proxy when in production
app.set("trust proxy", 1);

app.use(express.json());

const corsConfig = cors({
  origin: ["https://roomify-metau.onrender.com", "http://localhost:5173"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
});

app.use(corsConfig);

// temporary debug endpoint to get all files in assets folder
function getFilesRecursive(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getFilesRecursive(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}
app.get('/debug/assets-all', (req, res) => {
  const assetsPath = path.join(__dirname, 'assets');
  try {
    const allFiles = getFilesRecursive(assetsPath);
    res.json(allFiles);
  } catch (err) {
    console.error('Error reading assets folder recursively:', err);
    res.status(500).send('Error reading assets folder recursively: ' + err.message);
  }
});

// serve static files from assets folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === "production";

app.use(
  expressSession({
    cookie: {
      // secure cookies only used in prod (https), dev uses http
      secure: isProduction,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60, // 1 hour session
      // 'lax' for localhost dev, 'none' for prod cross-origin
      sameSite: isProduction ? "none" : "lax",
    },
    secret: "roommate-match",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
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
