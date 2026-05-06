const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 SECRET KEY (simple for now)
const JWT_SECRET = "mysecretkey";

// 🔥 MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

/* =========================
   USER SCHEMA
========================= */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

/* =========================
   TASK SCHEMA (UPDATED)
========================= */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"]
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const Task = mongoose.model("Task", taskSchema);

/* =========================
   AUTH MIDDLEWARE
========================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* =========================
   ROUTES
========================= */

// Root
app.get("/", (req, res) => {
  res.send("Server is running");
});

/* ===== AUTH ===== */

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed
    });

    await user.save();

    res.json({ message: "User created" });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({ token });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===== TASKS (PRIVATE) ===== */

// GET tasks (user based)
app.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ADD task
app.post("/tasks", auth, async (req, res) => {
  try {
    const newTask = new Task({
      title: req.body.title,
      userId: req.userId
    });

    await newTask.save();
    res.json(newTask);
  } catch {
    res.status(400).json({ error: "Failed to add task" });
  }
});

// DELETE task
app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

// UPDATE task
app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch {
    res.status(400).json({ error: "Update failed" });
  }
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});