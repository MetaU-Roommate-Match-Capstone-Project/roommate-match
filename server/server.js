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

// Helper function to recursively read directory contents
const readDirRecursive = async (basePath, relativePath = '') => {
  const fullPath = path.join(basePath, relativePath);
  const dirents = await fs.promises.readdir(fullPath, { withFileTypes: true });

  let results = [];

  for (const dirent of dirents) {
    const relPath = path.join(relativePath, dirent.name);

    const item = {
      name: dirent.name,
      isDirectory: dirent.isDirectory(),
      path: relPath
    };

    results.push(item);

    if (dirent.isDirectory()) {
      item.children = await readDirRecursive(basePath, relPath);
    }
  }

  return results;
};

// temporary route for debugging assets and subfolders
app.get('/debug/assets/:path(*)?', async (req, res) => {
  try {
    const subfolder = req.params.path || '';
    const recursive = req.query.recursive === 'true';
    const assetsBasePath = path.join(__dirname, 'assets');
    const folderPath = path.join(assetsBasePath, subfolder);

    console.log(`Reading folder at: ${folderPath}, recursive: ${recursive}`);

    if (recursive) {
      // Recursive mode - get full directory tree
      const contents = await readDirRecursive(assetsBasePath, subfolder);
      res.json({
        currentPath: subfolder || 'assets',
        recursive: true,
        contents: contents
      });
    } else {
      // Non-recursive mode - get only current directory
      const dirents = await fs.promises.readdir(folderPath, { withFileTypes: true });
      const contents = dirents.map(dirent => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        path: subfolder
          ? path.join(subfolder, dirent.name)
          : dirent.name
      }));

      res.json({
        currentPath: subfolder || 'assets',
        recursive: false,
        contents: contents
      });
    }
  } catch (err) {
    console.error(`Failed to read folder: ${err.message}`);
    return res.status(500).send('Error reading folder: ' + err.message);
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
