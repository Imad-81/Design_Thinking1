import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiClock,
  FiUser,
  FiHelpCircle,
  FiMenu,
  FiTarget,
} from "react-icons/fi";
import { signup, login, logout, getCurrentUser, isAuthenticated, updateUserBio } from "./services/mockAuthService";

// ----- MOCK DATA -----
// Initial tasks with mock user IDs (negative to avoid conflicts with real user IDs)
const initialTasks = [
  {
    id: 1,
    title: "Debug Python assignment",
    description: "My code keeps throwing an error in a for loop. Need someone to help me fix it and explain.",
    category: "Coding / Assignments",
    price: 150,
    deadline: "Today, 11:00 PM",
    createdBy: "-1", // mock user ID
    createdByName: "Alex Kumar",
    acceptedBy: null,
    status: "open",
  },
  {
    id: 2,
    title: "Share last week's class notes",
    description: "Missed 2 classes of Engineering Chemistry. Need clear handwritten notes or scanned PDF.",
    category: "Notes / Study Material",
    price: 80,
    deadline: "Tomorrow, 9:00 AM",
    createdBy: "-2",
    createdByName: "Priya Sharma",
    acceptedBy: null,
    status: "open",
  },
  {
    id: 3,
    title: "Explain linked list concepts",
    description: "Quick explanation of linked list basics before quiz. 20–30 min call.",
    category: "Concept Explanation",
    price: 120,
    deadline: "Tonight, 10:30 PM",
    createdBy: "-3",
    createdByName: "Rahul Singh",
    acceptedBy: null,
    status: "open",
  },
  {
    id: 4,
    title: "Complete lab record formatting",
    description: "Need help formatting my Physics lab record according to college guidelines.",
    category: "Lab Work",
    price: 100,
    deadline: "Yesterday, 5:00 PM",
    createdBy: "-4",
    createdByName: "Sam Wilson",
    acceptedBy: "-1",
    acceptedByName: "Alex Kumar",
    status: "completed",
  },
  {
    id: 5,
    title: "Help with calculus problem set",
    description: "Stuck on 3 problems from chapter 5. Need step-by-step solutions.",
    category: "Coding / Assignments",
    price: 200,
    deadline: "Last week",
    createdBy: "-5",
    createdByName: "Maya Patel",
    acceptedBy: "-2",
    acceptedByName: "Priya Sharma",
    status: "completed",
  },
  {
    id: 6,
    title: "Type up handwritten notes",
    description: "I have handwritten notes that need to be typed into a Word document.",
    category: "Random / Other",
    price: 90,
    deadline: "Tomorrow, 2:00 PM",
    createdBy: "-6",
    createdByName: "Neha Verma",
    acceptedBy: null,
    status: "open",
  },
  {
    id: 7,
    title: "Review my essay draft",
    description: "Need someone to review my English essay and suggest improvements.",
    category: "Random / Other",
    price: 110,
    deadline: "Today, 8:00 PM",
    createdBy: "-6",
    createdByName: "Neha Verma",
    acceptedBy: null,
    status: "open",
  },
];

// ----- MAIN APP -----
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("campusTasks_tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  useEffect(() => {
    // Load current user from localStorage on mount
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem("campusTasks_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      acceptedBy: null,
      status: "open",
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAcceptTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Prevent users from accepting their own tasks
    if (task.createdBy === currentUser.id) {
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              acceptedBy: currentUser.id,
              acceptedByName: currentUser.name,
              status: "accepted",
            }
          : t
      )
    );
  };

  const handleCompleteTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t))
    );
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const categories = [
    "All",
    "Coding / Assignments",
    "Notes / Study Material",
    "Concept Explanation",
    "Lab Work",
    "Random / Other",
  ];

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              onLogin={(user) => {
                setCurrentUser(user);
              }}
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage
              onSignup={(user) => {
                setCurrentUser(user);
              }}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <MainApp
              currentUser={currentUser}
              tasks={tasks}
              categories={categories}
              onCreateTask={handleCreateTask}
              onAcceptTask={handleAcceptTask}
              onCompleteTask={handleCompleteTask}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <MainApp
              currentUser={currentUser}
              tasks={tasks}
              categories={categories}
              onCreateTask={handleCreateTask}
              onAcceptTask={handleAcceptTask}
              onCompleteTask={handleCompleteTask}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

// ----- PROTECTED ROUTE -----
function ProtectedRoute({ children, currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ----- MAIN APP LAYOUT -----
function MainApp({
  currentUser,
  tasks,
  categories,
  onCreateTask,
  onAcceptTask,
  onCompleteTask,
  onLogout,
}) {
  const [view, setView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle query params coming from dashboard shortcuts or direct links.
  // We treat query params as route-scoped filters and never mutate the master task list.
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "posted") {
      // Dashboard shortcut: show tasks posted by current user (one-time scoped filter)
      setView("marketplace");
      setFilterCategory("All");
      setFilterPrice("All");
      // keep searchParams as-is (contains view=posted) so filtered view is derivable from URL
    } else if (searchParams.get("completed") === "true") {
      setView("history");
    } else if (viewParam === "open" || searchParams.get("status") === "open") {
      setView("marketplace");
      setFilterCategory("All");
      setFilterPrice("All");
    }
    // No other action: if there are no relevant params, we don't mutate tasks or persist filters.
  }, [searchParams]);

  // Derived filtering for Browse Tasks. Do not mutate `tasks`.
  const filteredTasks = tasks.filter((t) => {
    const viewParam = searchParams.get("view");

    if (viewParam === "posted") {
      // One-time scoped filter: only tasks created by current user
      if (t.createdBy !== currentUser.id) return false;
    } else {
      // Default marketplace behaviour: show only open tasks
      if (t.status !== "open") return false;
    }

    const catOk = filterCategory === "All" || t.category === filterCategory;

    let priceOk = true;
    if (filterPrice === "<100") priceOk = t.price < 100;
    if (filterPrice === "100-150") priceOk = t.price >= 100 && t.price <= 150;
    if (filterPrice === ">150") priceOk = t.price > 150;

    return catOk && priceOk;
  });

  return (
    <div className="app">
      <Sidebar
        currentView={view}
        onChangeView={(v) => {
          setView(v);
          // If user navigates to Browse Tasks from the sidebar, clear any route-scoped filters
          if (v === "marketplace") {
            setSearchParams({});
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="main-content">
        {view === "dashboard" && (
          <Dashboard
            tasks={tasks}
            currentUser={currentUser}
            onCompleteTask={onCompleteTask}
            onNavigate={(viewName, params) => {
              setView(viewName);
              if (params) {
                const newParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                  newParams.set(key, value);
                });
                setSearchParams(newParams);
              }
            }}
          />
        )}

        {view === "marketplace" && (
          <TaskMarketplace
            tasks={filteredTasks}
            allCategories={categories}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterPrice={filterPrice}
            setFilterPrice={setFilterPrice}
            onAcceptTask={onAcceptTask}
            onOpenTask={setSelectedTask}
            currentUser={currentUser}
            onNavigateToMyTasks={() => setView("my-tasks")}
            searchParams={searchParams}
            onClearFilters={() => setSearchParams({})}
          />
        )}

        {view === "post" && (
          <PostTaskForm onCreateTask={onCreateTask} categories={categories} />
        )}

        {view === "my-tasks" && (
          <MyAcceptedTasks
            tasks={tasks}
            currentUser={currentUser}
            onCompleteTask={onCompleteTask}
            onOpenTask={setSelectedTask}
          />
        )}

        {view === "history" && (
          <History tasks={tasks} currentUser={currentUser} searchParams={searchParams} />
        )}

        {view === "profile" && (
          <Profile
            currentUser={currentUser}
            onLogout={onLogout}
            tasks={tasks}
          />
        )}
      </main>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onAcceptTask={onAcceptTask}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// ----- LOGIN PAGE -----
function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = login({ email, password });

    if (result.success) {
      onLogin(result.user);
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <span className="logo-icon-wrapper">
            <FiTarget className="logo-icon" />
          </span>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to your CampusTasks account
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label className="form-label">
            Email
            <input
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </label>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-link-text">
            Don't have an account?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ----- SIGNUP PAGE -----
function SignupPage({ onSignup }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateName = (value) => {
    if (!value.trim()) {
      return "Name is required";
    }
    if (!/^[A-Za-z ]+$/.test(value.trim())) {
      return "Name must contain only letters and spaces";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
    if (errors.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? "Passwords do not match" : "",
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== password ? "Passwords do not match" : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const nameError = validateName(name);
    const passwordError = validatePassword(password);
    const confirmPasswordError =
      password !== confirmPassword ? "Passwords do not match" : "";

    if (nameError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setLoading(true);

    const result = signup({ name, email, password });

    if (result.success) {
      onSignup(result.user);
      navigate("/dashboard", { replace: true });
    } else {
      setErrors({ submit: result.error });
    }

    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <span className="logo-icon-wrapper">
            <FiTarget className="logo-icon" />
          </span>
          <h1>Create an account</h1>
          <p className="auth-subtitle">
            Join CampusTasks and start connecting with students
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {errors.submit && <div className="form-error">{errors.submit}</div>}

          <label className="form-label">
            Full Name
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={handleNameChange}
              required
              disabled={loading}
              pattern="[A-Za-z ]+"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="form-label">
            Email
            <input
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={loading}
              minLength={6}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </label>

          <label className="form-label">
            Confirm Password
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              disabled={loading}
              minLength={6}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </label>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-link-text">
            Already have an account?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ----- SIDEBAR -----
function Sidebar({ currentView, onChangeView, collapsed, onToggleCollapse }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiHome },
    { id: "marketplace", label: "Browse Tasks", icon: FiList },
    { id: "post", label: "Post a Task", icon: FiPlusCircle },
    { id: "history", label: "History", icon: FiClock },
    { id: "profile", label: "Profile / Settings", icon: FiUser },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <span className="logo-icon-wrapper">
              <FiTarget className="logo-icon" />
            </span>
            <span className="sidebar-logo-text">CampusTasks</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? "active" : ""}`}
              onClick={() => onChangeView(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="sidebar-icon" />
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <button
            className="sidebar-item sidebar-help"
            onClick={() => onChangeView("help")}
          >
            <FiHelpCircle className="sidebar-icon" />
            <span className="sidebar-label">What is CampusTasks?</span>
          </button>
        </div>
      )}
    </aside>
  );
}

// ----- DASHBOARD -----
function Dashboard({ tasks, currentUser, onCompleteTask, onNavigate }) {
  const postedByUser = tasks.filter((t) => t.createdBy === currentUser.id);
  const acceptedByUser = tasks.filter((t) => t.acceptedBy === currentUser.id);
  const totalPosted = postedByUser.length;
  const totalAccepted = acceptedByUser.length;
  const totalCompleted = tasks.filter(
    (t) =>
      t.status === "completed" &&
      (t.acceptedBy === currentUser.id || t.createdBy === currentUser.id)
  ).length;
  const pendingOutgoing = postedByUser.filter((t) => t.status === "open").length;
  const pendingIncoming = acceptedByUser.filter(
    (t) => t.status === "accepted"
  ).length;
  const pendingTotal = pendingOutgoing + pendingIncoming;

  const workingOn = acceptedByUser.filter((t) => t.status !== "completed");

  return (
    <section className="section">
      <h1>Dashboard</h1>

      <div className="stats-row">
        <button
          className="stat-card clickable"
          onClick={() => onNavigate("marketplace", { view: "posted" })}
        >
          <div className="stat-label">Tasks posted</div>
          <div className="stat-value">{totalPosted}</div>
        </button>
        <button
          className="stat-card clickable"
          onClick={() => onNavigate("my-tasks")}
        >
          <div className="stat-label">Tasks accepted by you</div>
          <div className="stat-value">{totalAccepted}</div>
        </button>
        <button
          className="stat-card clickable"
          onClick={() => onNavigate("history", { completed: "true" })}
        >
          <div className="stat-label">Tasks completed</div>
          <div className="stat-value">{totalCompleted}</div>
        </button>
        <button
          className="stat-card clickable"
          onClick={() => onNavigate("marketplace", { view: "open" })}
        >
          <div className="stat-label">Pending right now</div>
          <div className="stat-value">{pendingTotal}</div>
          {pendingTotal > 0 && (
            <div className="stat-sublabel">
              {pendingOutgoing} outgoing, {pendingIncoming} incoming
            </div>
          )}
        </button>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-column">
          <h2>Tasks I'm working on</h2>
          {workingOn.length === 0 ? (
            <p className="muted">You're not working on any tasks right now.</p>
          ) : (
            <div className="task-list">
              {workingOn.map((task) => (
                <div key={task.id} className="dashboard-task-card">
                  <div className="dashboard-task-header">
                    <h3>{task.title}</h3>
                    <span className={`status-pill status-${task.status}`}>
                      {task.status === "accepted" ? "Accepted" : "Completed"}
                    </span>
                  </div>
                  <p className="dashboard-task-description">
                    {task.description.slice(0, 100)}
                    {task.description.length > 100 ? "…" : ""}
                  </p>
                  <div className="dashboard-task-meta">
                    <span className="pill pill-price">₹{task.price}</span>
                    <span className="deadline">Deadline: {task.deadline}</span>
                  </div>
                  {task.status === "accepted" && (
                    <button
                      className="primary-btn small"
                      onClick={() => onCompleteTask(task.id)}
                    >
                      Mark as completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-column">
          <h2>Tasks I posted</h2>
          {postedByUser.length === 0 ? (
            <p className="muted">You haven't posted any tasks yet.</p>
          ) : (
            <div className="task-list">
              {postedByUser.map((task) => (
                <div key={task.id} className="dashboard-task-card">
                  <div className="dashboard-task-header">
                    <h3>{task.title}</h3>
                    <span className={`status-pill status-${task.status}`}>
                      {task.status === "open"
                        ? "Open"
                        : task.status === "accepted"
                        ? "Accepted"
                        : "Completed"}
                    </span>
                  </div>
                  <div className="dashboard-task-meta">
                    <span className="pill pill-price">₹{task.price}</span>
                    <span className="deadline">Deadline: {task.deadline}</span>
                  </div>
                  {task.acceptedByName && (
                    <p className="muted" style={{ fontSize: "0.8rem" }}>
                      Accepted by: {task.acceptedByName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ----- POST TASK FORM -----
function PostTaskForm({ onCreateTask, categories }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Coding / Assignments");
  const [price, setPrice] = useState(100);
  const [deadline, setDeadline] = useState("");

  const pricePresets = [50, 100, 200, 500];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !deadline) return;

    onCreateTask({
      title,
      description,
      category,
      price: Number(price),
      deadline,
    });

    setTitle("");
    setDescription("");
    setPrice(100);
    setDeadline("");
    // Task created, user can see it in marketplace or dashboard
  };

  return (
    <section className="section">
      <div className="card">
        <h2>Post a new task</h2>
        <p className="muted">
          Describe what you need, how much you&apos;re willing to pay, and when
          you need it.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label">
            Task title
            <input
              type="text"
              placeholder="e.g., Help with C++ lab record"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="form-label">
            Description
            <textarea
              rows={4}
              placeholder="Explain what exactly you need, what format, and any important details."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="form-row">
            <label className="form-label">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </label>

            <label className="form-label">
              Price (₹)
              <div className="price-selector">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="price-slider"
                />
                <div className="price-display">
                  <span className="price-currency">₹</span>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    step="10"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
              <div className="price-presets">
                {pricePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`price-preset-btn ${price == preset ? "active" : ""}`}
                    onClick={() => setPrice(preset)}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <label className="form-label">
            Deadline / timing
            <input
              type="text"
              placeholder="e.g., Today by 11 PM, or DD/MM, time"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>

          <button type="submit" className="primary-btn">
            Post task
          </button>
        </form>
      </div>
    </section>
  );
}

// ----- MY ACCEPTED TASKS -----
function MyAcceptedTasks({ tasks, currentUser, onCompleteTask, onOpenTask }) {
  const acceptedTasks = tasks.filter(
    (t) => t.acceptedBy === currentUser.id && t.status === "accepted"
  );

  return (
    <section className="section">
      <h1>My Accepted Tasks</h1>
      <p className="muted">
        Tasks you've accepted and are currently working on. Mark them as completed when done.
      </p>

      {acceptedTasks.length === 0 ? (
        <div className="card">
          <p className="muted">You haven't accepted any tasks yet.</p>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Go to Browse Tasks to find opportunities to earn.
          </p>
        </div>
      ) : (
        <div className="task-grid">
          {acceptedTasks.map((task) => (
            <article key={task.id} className="task-card">
              <div className="task-card-header">
                <h3
                  className="task-title"
                  onClick={() => onOpenTask(task)}
                >
                  {task.title}
                </h3>
                <span className="status-pill status-accepted">Accepted</span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <span className="pill">{task.category}</span>
                <span className="pill pill-price">₹{task.price}</span>
              </div>
              <div className="task-footer">
                <span className="deadline">Deadline: {task.deadline}</span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  Posted by {task.createdByName || task.createdBy}
                </span>
              </div>
              <button
                className="primary-btn small"
                onClick={() => onCompleteTask(task.id)}
                style={{ marginTop: "0.75rem" }}
              >
                Mark as completed
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ----- TASK MARKETPLACE -----
function TaskMarketplace({
  tasks,
  allCategories,
  filterCategory,
  setFilterCategory,
  filterPrice,
  setFilterPrice,
  onAcceptTask,
  onOpenTask,
  currentUser,
  onNavigateToMyTasks,
  searchParams,
  onClearFilters,
}) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2>Available tasks</h2>
          <p className="muted">
            Browse tasks from students in your college. Pick something quick and
            start earning.
          </p>
        </div>

        <div className="filters">
            {searchParams?.get("view") && (
              <button
                className="secondary-btn small"
                onClick={() => onClearFilters && onClearFilters()}
                style={{ marginRight: "0.6rem" }}
              >
                Clear filter
              </button>
            )}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {allCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
          >
            <option value="All">Any price</option>
            <option value="<100">&lt; ₹100</option>
            <option value="100-150">₹100–₹150</option>
            <option value=">150">&gt; ₹150</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="muted">No tasks match these filters right now.</p>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => {
            const isOwnTask = task.createdBy === currentUser.id;
            const isAccepted = task.acceptedBy !== null;
            const isAcceptedByMe = task.acceptedBy === currentUser.id;

            return (
              <article key={task.id} className="task-card">
                <div className="task-card-header">
                  <h3
                    className="task-title"
                    onClick={() => {
                      if (isAcceptedByMe && onNavigateToMyTasks) {
                        onNavigateToMyTasks();
                      } else {
                        onOpenTask(task);
                      }
                    }}
                  >
                    {task.title}
                  </h3>
                  <div className="task-badges">
                    {isOwnTask && (
                      <span className="task-badge posted-by-you">Posted by you</span>
                    )}
                    {isAccepted && !isOwnTask && !isAcceptedByMe && (
                      <span className="task-badge taken">Taken</span>
                    )}
                    {isAcceptedByMe && (
                      <span className="task-badge accepted-by-me">Accepted</span>
                    )}
                  </div>
                </div>
                <p className="task-description">
                  {task.description.slice(0, 120)}
                  {task.description.length > 120 ? "…" : ""}
                </p>
                <div className="task-meta">
                  <span className="pill">{task.category}</span>
                  <span className="pill pill-price">₹{task.price}</span>
                </div>
                <div className="task-footer">
                  <span className="deadline">Deadline: {task.deadline}</span>
                  {isOwnTask ? (
                    <span className="your-task-label">Your Task</span>
                  ) : isAcceptedByMe ? (
                    <button
                      className="secondary-btn small"
                      onClick={() => onNavigateToMyTasks && onNavigateToMyTasks()}
                    >
                      View in My Tasks
                    </button>
                  ) : (
                    <button
                      className="primary-btn small"
                      onClick={() => onAcceptTask(task.id)}
                      disabled={isAccepted}
                    >
                      {isAccepted ? "Already accepted" : "Accept task"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ----- HISTORY -----
function History({ tasks, currentUser, searchParams }) {
  // Filter to show only completed tasks if filter is set
  const showCompletedOnly = searchParams?.get("completed") === "true";
  
  const completedAccepted = tasks.filter(
    (t) => t.status === "completed" && t.acceptedBy === currentUser.id
  );
  const completedPosted = tasks.filter(
    (t) => t.status === "completed" && t.createdBy === currentUser.id
  );
  const allCompleted = [...completedAccepted, ...completedPosted].sort(
    (a, b) => b.id - a.id
  );

  return (
    <section className="section">
      <h2>History</h2>
      <p className="muted">
        {showCompletedOnly
          ? "Completed tasks you accepted and posted."
          : "All completed tasks you accepted and posted."}
      </p>

      {allCompleted.length === 0 ? (
        <p className="muted">No completed tasks yet.</p>
      ) : (
        <div className="task-grid">
          {allCompleted.map((task) => (
            <article key={task.id} className="task-card">
              <div className="dashboard-task-header">
                <h3>{task.title}</h3>
                <span className="status-pill status-completed">Completed</span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <span className="pill">{task.category}</span>
                <span className="pill pill-price">₹{task.price}</span>
              </div>
              <div className="task-footer">
                <span className="deadline">Deadline: {task.deadline}</span>
                <span className="muted">
                  {task.acceptedBy === currentUser.id
                    ? `Posted by ${task.createdByName}`
                    : `Accepted by ${task.acceptedByName}`}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ----- PROFILE -----
function Profile({ currentUser, onLogout, tasks }) {
  const navigate = useNavigate();
  const [bio, setBio] = useState(currentUser.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioError, setBioError] = useState("");

  const posted = tasks.filter((t) => t.createdBy === currentUser.id);
  const accepted = tasks.filter((t) => t.acceptedBy === currentUser.id);

  const handleSaveBio = () => {
    if (bio.length > 300) {
      setBioError("Bio must be 300 characters or less");
      return;
    }
    
    // Update bio in localStorage via mockAuthService
    updateUserBio(currentUser.id, bio);
    setIsEditingBio(false);
    setBioError("");
    
    // Update current user object
    currentUser.bio = bio;
  };

  const handleCancelBio = () => {
    setBio(currentUser.bio || "");
    setIsEditingBio(false);
    setBioError("");
  };

  return (
    <section className="section">
      <div className="card">
        <h2>Profile / Settings</h2>

        <div className="profile-info">
          <div className="profile-field">
            <label className="form-label">Name</label>
            <div className="profile-value">{currentUser.name}</div>
          </div>

          <div className="profile-field">
            <label className="form-label">Email</label>
            <div className="profile-value">{currentUser.email}</div>
          </div>

          <div className="profile-field">
            <div className="profile-bio-header">
              <label className="form-label">Bio</label>
              {!isEditingBio && (
                <button
                  className="link-btn"
                  onClick={() => setIsEditingBio(true)}
                  style={{ fontSize: "0.85rem" }}
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div>
                <textarea
                  className="bio-textarea"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    if (bioError) setBioError("");
                  }}
                  placeholder="Tell others about yourself, your skills, and what you're good at..."
                  maxLength={300}
                  rows={4}
                />
                <div className="bio-char-count">
                  {bio.length}/300 characters
                </div>
                {bioError && <span className="field-error">{bioError}</span>}
                <div className="bio-actions">
                  <button
                    className="secondary-btn small"
                    onClick={handleCancelBio}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-btn small"
                    onClick={handleSaveBio}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-value profile-bio">
                {bio || (
                  <span className="muted" style={{ fontStyle: "italic" }}>
                    No bio added yet. Click Edit to add one.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-label">Tasks posted</div>
            <div className="stat-value">{posted.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tasks accepted</div>
            <div className="stat-value">{accepted.length}</div>
          </div>
        </div>

        <button
          className="secondary-btn"
          onClick={() => {
            onLogout();
            navigate("/login", { replace: true });
          }}
        >
          Log out
        </button>
      </div>
    </section>
  );
}

// ----- TASK DETAILS MODAL -----
function TaskDetailsModal({ task, onClose, onAcceptTask, currentUser }) {
  const isOwnTask = task.createdBy === currentUser.id;
  const isAccepted = task.acceptedBy !== null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{task.title}</h2>
        <p className="muted">
          Posted by <strong>{task.createdByName || task.createdBy}</strong>
        </p>

        <p className="modal-description">{task.description}</p>

        <div className="modal-meta">
          <span className="pill">{task.category}</span>
          <span className="pill pill-price">₹{task.price}</span>
          <span className="deadline">Deadline: {task.deadline}</span>
        </div>

        <p className="hint">
          In a real version, this page would show contact options (WhatsApp,
          campus email, etc.). For now, just imagine you contact the student
          directly after accepting.
        </p>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Close
          </button>
          {isOwnTask ? (
            <span className="your-task-label-large">Your Task</span>
          ) : (
            <button
              className="primary-btn"
              disabled={isAccepted}
              onClick={() => {
                onAcceptTask(task.id);
                onClose();
              }}
            >
              {isAccepted ? "Already accepted" : "Accept this task"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
