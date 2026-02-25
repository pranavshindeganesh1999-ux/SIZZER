import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000/api";

/* ================= REUSABLE TABLE CONTROLS ================= */

function TableControls({ search, onSearch, placeholder, children }) {
  return (
    <div className="table-controls">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          className="table-search"
          type="text"
          placeholder={placeholder || "Search..."}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => onSearch("")}>✕</button>
        )}
      </div>
      <div className="filter-row">{children}</div>
    </div>
  );
}

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <th className={`sortable ${active ? "sort-active" : ""}`} onClick={() => onSort(field)}>
      {label}
      <span className="sort-icon">
        {active ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅"}
      </span>
    </th>
  );
}

function Pagination({ currentPage, totalPages, totalItems, rowsPerPage, onPageChange, onRowsChange }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}–
        {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} records
      </div>
      <div className="pagination-controls">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} title="First">«</button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Previous">‹</button>
        {pages.map(p => (
          <button key={p} className={p === currentPage ? "page-active" : ""} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} title="Next">›</button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} title="Last">»</button>
      </div>
      <div className="rows-per-page">
        <label>Rows:</label>
        <select value={rowsPerPage} onChange={(e) => onRowsChange(Number(e.target.value))}>
          {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

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
        <div className="login-logo">
          <img src="/images/logo-icon.png" alt="SIZZER" className="login-logo-img" />
          <div className="login-logo-text">
            <span className="login-logo-main">SIZZER</span>
            <span className="login-logo-sub">ADMIN PANEL</span>
          </div>
        </div>
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">Login →</button>
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

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) { console.error(err); }
  };

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "users",     icon: "👥", label: "Users" },
    { id: "salons",    icon: "✂️", label: "Salons" },
    { id: "appointments", icon: "📅", label: "Appointments" },
  ];

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className="navbar-brand">
            <img src="/images/logo-icon.png" alt="SIZZER" className="navbar-logo-img" />
            <div className="navbar-logo-text">
              <span className="navbar-logo-main">SIZZER</span>
              <span className="navbar-logo-sub">ADMIN</span>
            </div>
          </span>
        </div>
        <div className="navbar-right">
          <span className="nav-user">👤 {user.firstName}</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div className="sidebar-header">MENU</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-btn ${activePage === item.id ? "sidebar-active" : ""}`}
            onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="content">
        {activePage === "dashboard"    && <DashboardContent stats={stats} />}
        {activePage === "users"        && <UsersModule />}
        {activePage === "salons"       && <SalonsModule />}
        {activePage === "appointments" && <AppointmentsModule />}
      </div>
    </div>
  );
}

/* ================= DASHBOARD CONTENT ================= */

function DashboardContent({ stats }) {
  if (!stats) return <div className="loading-state">Loading stats...</div>;

  const cards = [
    { label: "Total Users",        value: stats.totalUsers,        icon: "👥", color: "#3b82f6" },
    { label: "Total Owners",       value: stats.totalOwners,       icon: "🏢", color: "#8b5cf6" },
    { label: "Total Salons",       value: stats.totalSalons,       icon: "✂️", color: "#06b6d4" },
    { label: "Total Appointments", value: stats.totalAppointments, icon: "📅", color: "#f59e0b" },
    { label: "Total Revenue",      value: `₹${Number(stats.totalBookingValue || 0).toFixed(2)}`, icon: "💰", color: "#10b981" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your salon platform</p>
      </div>
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="stat-card" key={i} style={{ "--accent": c.color }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
            <div className="stat-bar" style={{ background: c.color }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= USERS MODULE ================= */

function UsersModule() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("first_name");
  const [sortDir, setSortDir]     = useState("asc");
  const [page, setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") data = data.filter(u => u.role === roleFilter);
    if (statusFilter !== "all") data = data.filter(u => String(u.is_active) === statusFilter);
    data.sort((a, b) => {
      let av = a[sortField] ?? ""; let bv = b[sortField] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [users, search, roleFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  if (loading) return <div className="loading-state">⏳ Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Users Management</h1>
        <p>{filtered.length} users found</p>
      </div>

      <TableControls search={search} onSearch={handleSearch} placeholder="Search by name, email or phone...">
        <div className="filter-group">
          <label>Role</label>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {(search || roleFilter !== "all" || statusFilter !== "all") && (
          <button className="btn-clear-all" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); setPage(1); }}>
            ✕ Clear All
          </button>
        )}
      </TableControls>

      <div className="table-wrapper">
        {paginated.length === 0 ? (
          <div className="empty-state">🔍 No users match your search criteria</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <SortHeader label="Name"   field="first_name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Email"  field="email"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Role"   field="role"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th>Phone</th>
                <SortHeader label="Status" field="is_active"  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.first_name} {user.last_name}</strong></td>
                  <td>{user.email}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td>{user.phone || "—"}</td>
                  <td>
                    {user.is_active
                      ? <span className="badge badge-active">Active</span>
                      : <span className="badge badge-inactive">Inactive</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={(r) => { setRowsPerPage(r); setPage(1); }}
      />
    </div>
  );
}

/* ================= SALONS MODULE ================= */

function SalonsModule() {
  const [salons, setSalons]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter]     = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir]     = useState("asc");
  const [page, setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { fetchSalons(); }, []);

  const fetchSalons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/salons`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSalons(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteSalon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salon?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/salons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchSalons();
    } catch (err) { console.error(err); }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  };

  // unique cities for filter dropdown
  const cities = useMemo(() => ["all", ...new Set(salons.map(s => s.city).filter(Boolean).sort())], [salons]);

  const filtered = useMemo(() => {
    let data = [...salons];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.owner_name?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter(s => String(s.is_active) === statusFilter);
    if (cityFilter !== "all")   data = data.filter(s => s.city === cityFilter);
    data.sort((a, b) => {
      let av = a[sortField] ?? ""; let bv = b[sortField] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [salons, search, statusFilter, cityFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  if (loading) return <div className="loading-state">⏳ Loading salons...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Salons Management</h1>
        <p>{filtered.length} salons found</p>
      </div>

      <TableControls search={search} onSearch={handleSearch} placeholder="Search by name, owner, city or phone...">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="filter-group">
          <label>City</label>
          <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}>
            {cities.map(c => <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>)}
          </select>
        </div>
        {(search || statusFilter !== "all" || cityFilter !== "all") && (
          <button className="btn-clear-all" onClick={() => { setSearch(""); setStatusFilter("all"); setCityFilter("all"); setPage(1); }}>
            ✕ Clear All
          </button>
        )}
      </TableControls>

      <div className="table-wrapper">
        {paginated.length === 0 ? (
          <div className="empty-state">🔍 No salons match your search criteria</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <SortHeader label="Name"    field="name"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Owner"   field="owner_name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="City"    field="city"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th>Phone</th>
                <SortHeader label="Status"  field="is_active"  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Created" field="created_at" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((salon) => (
                <tr key={salon.id}>
                  <td><strong>{salon.name}</strong></td>
                  <td>{salon.owner_name || "—"}</td>
                  <td>{salon.city}</td>
                  <td>{salon.phone}</td>
                  <td>
                    {salon.is_active
                      ? <span className="badge badge-active">Active</span>
                      : <span className="badge badge-inactive">Inactive</span>}
                  </td>
                  <td>{salon.created_at ? new Date(salon.created_at).toLocaleDateString() : "—"}</td>
                  <td>
                    <button className="btn-danger" onClick={() => deleteSalon(salon.id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={(r) => { setRowsPerPage(r); setPage(1); }}
      />
    </div>
  );
}

/* ================= APPOINTMENTS MODULE ================= */

function AppointmentsModule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [sortField, setSortField] = useState("appointment_date");
  const [sortDir, setSortDir]     = useState("desc");
  const [page, setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/appointments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAppointments(data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (t) => t ? t.slice(0, 5) : "—";

  const filtered = useMemo(() => {
    let data = [...appointments];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(a =>
        a.customer_name?.toLowerCase().includes(q) ||
        a.salon_name?.toLowerCase().includes(q) ||
        a.staff_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter(a => a.status === statusFilter);
    if (dateFrom) data = data.filter(a => a.appointment_date && a.appointment_date >= dateFrom);
    if (dateTo)   data = data.filter(a => a.appointment_date && a.appointment_date <= dateTo);

    data.sort((a, b) => {
      let av = a[sortField] ?? ""; let bv = b[sortField] ?? "";
      if (sortField === "total_price") { av = Number(av); bv = Number(bv); }
      else if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [appointments, search, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  const totalRevenue = filtered.reduce((sum, a) => sum + Number(a.total_price || 0), 0);

  if (loading) return <div className="loading-state">⏳ Loading appointments...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Appointments Management</h1>
        <p>{filtered.length} appointments · Total: ₹{totalRevenue.toFixed(2)}</p>
      </div>

      <TableControls search={search} onSearch={handleSearch} placeholder="Search by customer, salon or staff...">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>From</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-group">
          <label>To</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
        </div>
        {(search || statusFilter !== "all" || dateFrom || dateTo) && (
          <button className="btn-clear-all" onClick={() => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); setPage(1); }}>
            ✕ Clear All
          </button>
        )}
      </TableControls>

      <div className="table-wrapper">
        {paginated.length === 0 ? (
          <div className="empty-state">🔍 No appointments match your search criteria</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <SortHeader label="Date"     field="appointment_date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th>Time</th>
                <SortHeader label="Customer" field="customer_name"    sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Salon"    field="salon_name"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th>Staff</th>
                <SortHeader label="Price"    field="total_price"      sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Status"   field="status"           sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {paginated.map((appt) => (
                <tr key={appt.id}>
                  <td>{formatDate(appt.appointment_date)}</td>
                  <td>{formatTime(appt.start_time)} – {formatTime(appt.end_time)}</td>
                  <td><strong>{appt.customer_name || "—"}</strong></td>
                  <td>{appt.salon_name || "—"}</td>
                  <td>{appt.staff_name || <span style={{color:"#9ca3af"}}>Not Assigned</span>}</td>
                  <td>₹{Number(appt.total_price || 0).toFixed(2)}</td>
                  <td><span className={`status-badge status-${appt.status}`}>{appt.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={(r) => { setRowsPerPage(r); setPage(1); }}
      />
    </div>
  );
}

/* ================= APP ================= */

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin  = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login"     element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user && user.role === "admin" ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/"          element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;