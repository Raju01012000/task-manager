const express = require("express");

const mongoose = require("mongoose");

const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/task-manager")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

//UPDATED SCHEMA (validation added)
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"]
  },
  completed: {
    type: Boolean,
    default: false
  }
});

// Model
const Task = mongoose.model("Task", taskSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

// GET all tasks
app.get("/tasks", async (req, res) => {
  try {
    const allTasks = await Task.find();
    res.json(allTasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST new task
app.post("/tasks", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.send("Task saved to DB");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Task.findByIdAndDelete(id);
    res.send("Task deleted");
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// UPDATE task
app.put("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Server start
app.listen(5000, () => {
  console.log("Server started on port 5000");
});