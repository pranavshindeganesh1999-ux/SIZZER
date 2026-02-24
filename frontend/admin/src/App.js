import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000/api";

/* ================= LOGIN ================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        onLogin(data.data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // 👈 NEW

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  return (
    <div className="dashboard">
      {/* Top Navbar */}
      <nav className="navbar">
        {/* Collapse Button (Desktop Only) */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          ⬅
        </button>

        {/* Mobile Menu */}
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        <h2>Salon Admin Panel</h2>

        <div>
          <span>Welcome, {user.firstName}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`sidebar 
          ${sidebarOpen ? "active" : ""} 
          ${collapsed ? "collapsed" : ""}`}
      >
        <button onClick={() => setActivePage("dashboard")}>Dashboard</button>
        <button onClick={() => setActivePage("users")}>Users</button>
        <button onClick={() => setActivePage("salons")}>Salons</button>
        <button onClick={() => setActivePage("appointments")}>
          Appointments
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activePage === "dashboard" && <DashboardContent stats={stats} />}
        {activePage === "users" && <UsersModule />}
        {activePage === "salons" && <SalonsModule />}
        {activePage === "appointments" && <AppointmentsModule />}
      </div>
    </div>
  );
}

/* ================= DASHBOARD CONTENT ================= */

function DashboardContent({ stats }) {
  if (!stats) return <p>Loading stats...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Total Owners</h3>
          <p>{stats.totalOwners}</p>
        </div>

        <div className="stat-card">
          <h3>Total Salons</h3>
          <p>{stats.totalSalons}</p>
        </div>

        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p>{stats.totalAppointments}</p>
        </div>

        <div className="stat-card">
          <h3>Total Booking Value</h3>
          <p>₹{Number(stats.totalBookingValue || 0).toFixed(2)}</p>

        </div>

      </div>
    </div>
  );
}

/* ================= MODULES ================= */

function UsersModule() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Users fetch error:", err);
    }

    setLoading(false);
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h1>Users Management</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.phone || "N/A"}</td>
                  <td>
                    {user.is_active ? (
                      <span className="badge active">Active</span>
                    ) : (
                      <span className="badge inactive">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SalonsModule() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/admin/salons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSalons(data.data);
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
    }

    setLoading(false);
  };

  const deleteSalon = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this salon?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/salons/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchSalons();
    } catch (error) {
      console.error("Error deleting salon:", error);
    }
  };

  if (loading) return <p>Loading salons...</p>;

  return (
    <div>
      <h1>Salons Management</h1>

      {salons.length === 0 ? (
        <p>No salons found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>City</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {salons.map((salon) => (
                <tr key={salon.id}>
                  <td>{salon.name}</td>
                  <td>{salon.owner_name || "N/A"}</td>
                  <td>{salon.city}</td>
                  <td>{salon.phone}</td>
                  <td>
                    <span
                      className={
                        salon.is_active
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {salon.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {salon.created_at
                      ? new Date(salon.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => deleteSalon(salon.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppointmentsModule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error("Appointments error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ date formatter (fixes wrong date issue)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ time formatter
  const formatTime = (time) => {
    if (!time) return "-";
    return time.slice(0, 5); // HH:mm
  };

  // ✅ pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentAppointments = appointments.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(appointments.length / rowsPerPage);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
      <h1>Appointments Management</h1>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Salon</th>
              <th>Staff</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {currentAppointments.length === 0 ? (
              <tr>
                <td colSpan="7">No appointments found</td>
              </tr>
            ) : (
              currentAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{formatDate(appt.appointment_date)}</td>
                  <td>
                    {formatTime(appt.start_time)} -{" "}
                    {formatTime(appt.end_time)}
                  </td>
                  <td>{appt.customer_name || "-"}</td>
                  <td>{appt.salon_name || "-"}</td>
                  <td>{appt.staff_name || "Not Assigned"}</td>
                  <td>₹{Number(appt.total_price || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status ${appt.status}`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination UI */}
      {appointments.length > 0 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅ Prev
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}


/* ================= APP ================= */

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/dashboard"
          element={
            user && user.role === "admin" ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
