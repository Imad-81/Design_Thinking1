import React, { useState } from "react";
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

// ----- MOCK DATA -----
const initialTasks = [
  {
    id: 1,
    title: "Debug Python assignment",
    description: "My code keeps throwing an error in a for loop. Need someone to help me fix it and explain.",
    category: "Coding / Assignments",
    price: 150,
    deadline: "Today, 11:00 PM",
    createdBy: "Alex Kumar",
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
    createdBy: "Priya Sharma",
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
    createdBy: "Rahul Singh",
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
    createdBy: "Sam Wilson",
    acceptedBy: "Alex Kumar",
    status: "completed",
  },
  {
    id: 5,
    title: "Help with calculus problem set",
    description: "Stuck on 3 problems from chapter 5. Need step-by-step solutions.",
    category: "Coding / Assignments",
    price: 200,
    deadline: "Last week",
    createdBy: "Maya Patel",
    acceptedBy: "Priya Sharma",
    status: "completed",
  },
  {
    id: 6,
    title: "Type up handwritten notes",
    description: "I have handwritten notes that need to be typed into a Word document.",
    category: "Random / Other",
    price: 90,
    deadline: "Tomorrow, 2:00 PM",
    createdBy: "Neha Verma",
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
    createdBy: "Neha Verma",
    acceptedBy: null,
    status: "open",
  },
];

// ----- MAIN APP -----
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdBy: currentUser.name,
      acceptedBy: null,
      status: "open",
    };
    setTasks((prev) => [newTask, ...prev]);
    setView("marketplace");
  };

  const handleAcceptTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, acceptedBy: currentUser.name, status: "accepted" }
          : t
      )
    );
  };

  const handleCompleteTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "completed" } : t
      )
    );
  };

  const categories = [
    "All",
    "Coding / Assignments",
    "Notes / Study Material",
    "Concept Explanation",
    "Lab Work",
    "Random / Other",
  ];

  const filteredTasks = tasks.filter((t) => {
    if (t.status !== "open" && t.acceptedBy !== currentUser?.name) return false;

    const catOk = filterCategory === "All" || t.category === filterCategory;

    let priceOk = true;
    if (filterPrice === "<100") priceOk = t.price < 100;
    if (filterPrice === "100-150") priceOk = t.price >= 100 && t.price <= 150;
    if (filterPrice === ">150") priceOk = t.price > 150;

    return catOk && priceOk;
  });

  // Show auth screen if not logged in
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={(user) => {
          setCurrentUser(user);
          setView("dashboard");
        }}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        currentView={view}
        onChangeView={setView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="main-content">
        {view === "dashboard" && (
          <Dashboard
            tasks={tasks}
            currentUser={currentUser}
            onCompleteTask={handleCompleteTask}
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
            onAcceptTask={handleAcceptTask}
            onOpenTask={setSelectedTask}
          />
        )}

        {view === "post" && (
          <PostTaskForm
            onCreateTask={handleCreateTask}
            categories={categories}
          />
        )}

        {view === "history" && (
          <History tasks={tasks} currentUser={currentUser} />
        )}

        {view === "profile" && (
          <Profile
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            tasks={tasks}
          />
        )}
      </main>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onAcceptTask={handleAcceptTask}
        />
      )}
    </div>
  );
}

// ----- AUTH SCREEN -----
function AuthScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("Woxsen University");
  const [role, setRole] = useState("earn");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onLogin({
      name: name.trim(),
      campus: campus.trim() || "Woxsen University",
      role: role,
    });
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <span className="logo-icon-wrapper">
            <FiTarget className="logo-icon" />
          </span>
          <h1>Welcome to CampusTasks</h1>
          <p className="auth-subtitle">
            A student-to-student micro-task marketplace for your university.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label">
            Name
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Campus / University
            <input
              type="text"
              placeholder="Your university name"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
            />
          </label>

          <label className="form-label">
            Role
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="earn"
                  checked={role === "earn"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>I want to earn by doing tasks</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="post"
                  checked={role === "post"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>I mostly want to post tasks</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="both"
                  checked={role === "both"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>I want to do both</span>
              </label>
            </div>
          </label>

          <button type="submit" className="primary-btn">
            Continue to dashboard
          </button>
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
function Dashboard({ tasks, currentUser, onCompleteTask }) {
  const postedByUser = tasks.filter((t) => t.createdBy === currentUser.name);
  const acceptedByUser = tasks.filter((t) => t.acceptedBy === currentUser.name);
  const totalPosted = postedByUser.length;
  const totalAccepted = acceptedByUser.length;
  const totalCompleted = tasks.filter(
    (t) =>
      t.status === "completed" &&
      (t.acceptedBy === currentUser.name || t.createdBy === currentUser.name)
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
        <div className="stat-card">
          <div className="stat-label">Tasks posted</div>
          <div className="stat-value">{totalPosted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasks accepted by you</div>
          <div className="stat-value">{totalAccepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasks completed</div>
          <div className="stat-value">{totalCompleted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending right now</div>
          <div className="stat-value">{pendingTotal}</div>
          {pendingTotal > 0 && (
            <div className="stat-sublabel">
              {pendingOutgoing} outgoing, {pendingIncoming} incoming
            </div>
          )}
        </div>
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
                  {task.acceptedBy && (
                    <p className="muted" style={{ fontSize: "0.8rem" }}>
                      Accepted by: {task.acceptedBy}
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Coding / Assignments");
  const [price, setPrice] = useState(100);
  const [deadline, setDeadline] = useState("");

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
              <input
                type="number"
                min={10}
                step={10}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
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
          {tasks.map((task) => (
            <article key={task.id} className="task-card">
              <h3
                className="task-title"
                onClick={() => onOpenTask(task)}
              >
                {task.title}
              </h3>
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
                <button
                  className="primary-btn small"
                  onClick={() => onAcceptTask(task.id)}
                  disabled={task.acceptedBy}
                >
                  {task.acceptedBy ? "Already accepted" : "Accept task"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ----- HISTORY -----
function History({ tasks, currentUser }) {
  const completedAccepted = tasks.filter(
    (t) => t.status === "completed" && t.acceptedBy === currentUser.name
  );
  const completedPosted = tasks.filter(
    (t) => t.status === "completed" && t.createdBy === currentUser.name
  );
  const allCompleted = [...completedAccepted, ...completedPosted].sort(
    (a, b) => b.id - a.id
  );

  return (
    <section className="section">
      <h2>History</h2>
      <p className="muted">Completed tasks you accepted and posted.</p>

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
                  {task.acceptedBy === currentUser.name
                    ? `Posted by ${task.createdBy}`
                    : `Accepted by ${task.acceptedBy}`}
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
  const posted = tasks.filter((t) => t.createdBy === currentUser.name);
  const accepted = tasks.filter((t) => t.acceptedBy === currentUser.name);

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
            <label className="form-label">Campus</label>
            <div className="profile-value">{currentUser.campus}</div>
          </div>

          <div className="profile-field">
            <label className="form-label">Role</label>
            <div className="profile-value">
              {currentUser.role === "earn"
                ? "I want to earn by doing tasks"
                : currentUser.role === "post"
                ? "I mostly want to post tasks"
                : "I want to do both"}
            </div>
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

        <button className="secondary-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </section>
  );
}

// ----- TASK DETAILS MODAL -----
function TaskDetailsModal({ task, onClose, onAcceptTask }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{task.title}</h2>
        <p className="muted">
          Posted by <strong>{task.createdBy}</strong>
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
          <button
            className="primary-btn"
            disabled={task.acceptedBy}
            onClick={() => {
              onAcceptTask(task.id);
              onClose();
            }}
          >
            {task.acceptedBy ? "Already accepted" : "Accept this task"}
          </button>
        </div>
      </div>
    </div>
  );
}
