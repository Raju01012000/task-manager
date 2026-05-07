import { useEffect, useState } from "react";
import "./App.css";

const API = "https://task-manager-r7h0.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  /* ======================
     SIGNUP
  ====================== */

  const signup = async () => {
    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.com",
          password: "123456",
        }),
      });

      const data = await res.json();

      alert(JSON.stringify(data));
    } catch {
      setError("Signup failed");
    }
  };

  /* ======================
     LOGIN
  ====================== */

  const login = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.com",
          password: "123456",
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        setError("Login failed");
      }
    } catch {
      setError("Login error");
    }
  };

  /* ======================
     FETCH TASKS
  ====================== */

  const fetchTasks = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/tasks`, {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
        setError("⚠️ Server problem");
      }
    } catch {
      setError("⚠️ Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     ADD TASK
  ====================== */

  const addTask = async () => {
    if (!text) return;

    try {
      await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title: text,
        }),
      });

      setText("");
      fetchTasks();
    } catch {
      setError("⚠️ Failed to add");
    }
  };

  /* ======================
     TOGGLE TASK
  ====================== */

  const toggleTask = async (task) => {
    try {
      await fetch(`${API}/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      fetchTasks();
    } catch {
      setError("⚠️ Update failed");
    }
  };

  /* ======================
     DELETE TASK
  ====================== */

  const deleteTask = async (id) => {
    if (!window.confirm("Delete task?"))
      return;

    try {
      await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      fetchTasks();
    } catch {
      setError("⚠️ Delete failed");
    }
  };

  /* ======================
     EDIT TASK
  ====================== */

  const startEdit = (task) => {
    setEditId(task._id);
    setEditText(task.title);
  };

  const updateTask = async () => {
    try {
      await fetch(`${API}/tasks/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title: editText,
        }),
      });

      setEditId(null);
      setEditText("");

      fetchTasks();
    } catch {
      setError("⚠️ Edit failed");
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }

    // eslint-disable-next-line
  }, [token]);

  /* ======================
     LOGIN PAGE
  ====================== */

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="login-title">
            🔐 Login Required
          </h2>

          <button
            className="auth-btn signup-btn"
            onClick={signup}
          >
            Signup
          </button>

          <button
            className="auth-btn login-btn"
            onClick={login}
          >
            Login
          </button>

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ======================
     MAIN UI
  ====================== */

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">
          🚀 Task Manager
        </h1>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            setToken("");
          }}
        >
          Logout
        </button>

        <div className="input-box">
          <input
            type="text"
            placeholder="Enter task..."
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
          />

          <button
            className="add-btn"
            onClick={addTask}
          >
            Add
          </button>
        </div>

        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {loading && <p>Loading... ⏳</p>}

        {!loading && tasks.length === 0 && (
          <p>No tasks yet 😴</p>
        )}

        {!loading &&
          tasks.map((task) => (
            <div
              className="task"
              key={task._id}
            >
              {editId === task._id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) =>
                      setEditText(
                        e.target.value
                      )
                    }
                  />

                  <button
                    className="save-btn"
                    onClick={updateTask}
                  >
                    SAVE
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={
                      task.completed
                        ? "completed-task"
                        : ""
                    }
                    onClick={() =>
                      toggleTask(task)
                    }
                  >
                    {task.title}
                  </span>

                  <div className="task-buttons">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        startEdit(task)
                      }
                    >
                      EDIT
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTask(task._id)
                      }
                    >
                      DELETE
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