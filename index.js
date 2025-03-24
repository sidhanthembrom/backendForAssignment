const express = require("express");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET_KEY = "my_secret_key";

app.use(cors());
app.use(express.json());

// Read JSON file
const readData = () => JSON.parse(fs.readFileSync("data.json", "utf8"));

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    const token = jwt.sign({ username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "User not logged in" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Dashboard API
app.get("/api/dashboard", authenticate, (req, res) => {
  const data = readData();
  res.json(data.dashboard);
});

// Map API
app.get("/api/map", authenticate, (req, res) => {
  const data = readData();
  res.json(data.map);
});

// Vercel Handler ✅
const server = require("serverless-http")(app);
module.exports = server;
