import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/tasks");
      const data = await res.json();

      setTasks(data);
    } catch (err) {
      setError("⚠️ Server error. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!text) return;

    try {
      await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: text }),
      });

      setText("");
      fetchTasks();
    } catch {
      setError("⚠️ Failed to add task");
    }
  };

  const toggleTask = async (task) => {
    try {
      await fetch(`http://localhost:5000/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      fetchTasks();
    } catch {
      setError("⚠️ Update failed");
    }
  };

  const deleteTask = async (id) => {
    const confirmDelete = window.confirm("Delete this task?");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "DELETE",
      });

      fetchTasks();
    } catch {
      setError("⚠️ Delete failed");
    }
  };

  const startEdit = (task) => {
    setEditId(task._id);
    setEditText(task.title);
  };

  const updateTask = async () => {
    try {
      await fetch(`http://localhost:5000/tasks/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editText }),
      });

      setEditId(null);
      setEditText("");
      fetchTasks();
    } catch {
      setError("⚠️ Edit failed");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">🚀 Task Manager</h1>

        <div className="input-box">
          <input
            type="text"
            placeholder="Enter task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="add-btn" onClick={addTask}>
            Add
          </button>
        </div>

        {/* ERROR */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* LOADING */}
        {loading && <p>Loading... ⏳</p>}

        {/* EMPTY */}
        {!loading && tasks.length === 0 && (
          <p style={{ opacity: 0.7 }}>No tasks yet 😴</p>
        )}

        {/* TASK LIST */}
        {!loading &&
          tasks.map((task) => (
            <div className="task" key={task._id}>
              {editId === task._id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button className="add-btn" onClick={updateTask}>
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span
                    onClick={() => toggleTask(task)}
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                      opacity: task.completed ? 0.6 : 1,
                    }}
                  >
                    {task.title}
                  </span>

                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      className="edit-btn"
                      onClick={() => startEdit(task)}
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;