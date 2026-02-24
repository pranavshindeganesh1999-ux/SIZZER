import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = 'http://localhost:5000/api';

// ─── Validation Helpers ───────────────────────────────────────────────────────
const validateName = (value, fieldName) => {
  if (!value.trim()) return `${fieldName} is required`;
  if (/\d/.test(value)) return `${fieldName} must not contain numbers`;
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return `${fieldName} contains invalid characters`;
  return '';
};

const validatePhone = (value) => {
  if (!value.trim()) return 'Phone number is required';
  if (!/^\d+$/.test(value)) return 'Phone number must contain digits only';
  if (value.length !== 10) return 'Phone number must be exactly 10 digits';
  return '';
};

const validateEmail = (value) => {
  if (!value.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
  return '';
};

const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least 1 uppercase letter';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value))
    return 'Password must contain at least 1 special character';
  return '';
};

const validateZipCode = (value) => {
  if (!value.trim()) return ''; // optional
  if (!/^\d{4,10}$/.test(value)) return 'Zip code must be 4–10 digits';
  return '';
};

const validateSalonName = (value) => {
  if (!value.trim()) return 'Salon name is required';
  if (value.trim().length < 2) return 'Salon name must be at least 2 characters';
  if (value.trim().length > 100) return 'Salon name must be under 100 characters';
  return '';
};

const validateCity = (value) => {
  if (!value.trim()) return 'City is required';
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'City contains invalid characters';
  return '';
};

const validateState = (value) => {
  if (!value.trim()) return ''; // optional
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'State contains invalid characters';
  return '';
};

const validateAddress = (value) => {
  if (!value.trim()) return 'Address is required';
  if (value.trim().length < 5) return 'Please enter a valid address';
  return '';
};
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/salons" element={<MySalons user={user} />} />
                <Route path="/add-salon" element={<AddSalon user={user} />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/services" element={<Services />} />
                <Route path="/staff" element={<Staff user={user} />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile user={user} />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

// ─── Login / Register ─────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateRegisterForm = () => {
    const errors = {};
    errors.firstName = validateName(firstName, 'First name');
    errors.lastName = validateName(lastName, 'Last name');
    errors.phone = validatePhone(phone);
    errors.email = validateEmail(email);
    errors.password = validatePassword(password);
    Object.keys(errors).forEach(k => { if (!errors[k]) delete errors[k]; });
    return errors;
  };

  const validateLoginForm = () => {
    const errors = {};
    errors.email = validateEmail(email);
    errors.password = validatePassword(password);
    Object.keys(errors).forEach(k => { if (!errors[k]) delete errors[k]; });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = isRegister ? validateRegisterForm() : validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister
      ? { email, password, firstName, lastName, phone, role: 'owner' }
      : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (data.success) {
        if (data.data.user.role !== 'owner') {
          setError('Access denied. Owner accounts only.');
          return;
        }
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        onLogin(data.data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
  };

  const fe = fieldErrors;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-section">
            <img src="/images/logo-icon.png" alt="SIZZER" className="login-logo" />
            <h1>SIZZER</h1>
            <p>OWNER PORTAL</p>
          </div>
        </div>

        <div className="login-box">
          <h2>{isRegister ? 'CREATE OWNER ACCOUNT' : 'OWNER LOGIN'}</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <>
                <div className="form-row">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {fe.firstName && <span className="field-error">{fe.firstName}</span>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {fe.lastName && <span className="field-error">{fe.lastName}</span>}
                  </div>
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                  />
                  {fe.phone && <span className="field-error">{fe.phone}</span>}
                </div>
              </>
            )}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fe.email && <span className="field-error">{fe.email}</span>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password (min 6 chars, 1 uppercase, 1 special)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fe.password && <span className="field-error">{fe.password}</span>}
            </div>

            <button type="submit" className="btn-primary-full">
              {isRegister ? 'CREATE ACCOUNT' : 'LOGIN'}
            </button>
          </form>

          <div className="toggle-text">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button className="toggle-btn" onClick={() => { setIsRegister(!isRegister); setFieldErrors({}); setError(''); }}>
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/images/logo-icon.png" alt="SIZZER" className="sidebar-logo" />
        <div className="sidebar-brand">
          <h2>SIZZER</h2>
          <p>Owner Portal</p>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user.firstName[0]}{user.lastName[0]}</div>
        <div className="user-info">
          <strong>{user.firstName} {user.lastName}</strong>
          <span>{user.email}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className="nav-item"><span className="icon">📊</span>Dashboard</Link>
        <Link to="/salons" className="nav-item"><span className="icon">✂️</span>My Salons</Link>
        <Link to="/appointments" className="nav-item"><span className="icon">📅</span>Appointments</Link>
        <Link to="/services" className="nav-item"><span className="icon">💇</span>Services</Link>
        <Link to="/staff" className="nav-item"><span className="icon">👥</span>Staff</Link>
        <Link to="/analytics" className="nav-item"><span className="icon">📈</span>Analytics</Link>
        <Link to="/profile" className="nav-item"><span className="icon">⚙️</span>Settings</Link>
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        <span className="icon">🚪</span>Logout
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [stats, setStats] = useState({ totalSalons: 0, totalAppointments: 0, totalRevenue: 0, activeStaff: 0 });

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const salonRes = await fetch(`${API_URL}/salons/owner`, { headers: { Authorization: `Bearer ${token}` } });
      const salonData = await salonRes.json();
      const salons = salonData.success ? salonData.data : [];

      const apptRes = await fetch(`${API_URL}/appointments/owner`, { headers: { Authorization: `Bearer ${token}` } });
      const apptData = await apptRes.json();
      const appointments = apptData.success ? apptData.data : [];

      const totalRevenue = appointments.reduce((sum, a) => sum + Number(a.total_price || 0), 0);

      let totalStaff = 0;
      for (let salon of salons) {
        const staffRes = await fetch(`${API_URL}/staff/salon/${salon.id}`, { headers: { Authorization: `Bearer ${token}` } });
        const staffData = await staffRes.json();
        if (staffData.success) totalStaff += staffData.data.length;
      }

      setStats({ totalSalons: salons.length, totalAppointments: appointments.length, totalRevenue, activeStaff: totalStaff });
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.firstName}!</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">✂️</div><div className="stat-info"><h3>My Salons</h3><p className="stat-number">{stats.totalSalons}</p></div></div>
        <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-info"><h3>Appointments</h3><p className="stat-number">{stats.totalAppointments}</p></div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>Revenue</h3><p className="stat-number">₹{stats.totalRevenue}</p></div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-info"><h3>Active Staff</h3><p className="stat-number">{stats.activeStaff}</p></div></div>
      </div>
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/add-salon" className="action-card"><span className="action-icon">➕</span><h3>Add New Salon</h3><p>Register a new salon location</p></Link>
          <Link to="/appointments" className="action-card"><span className="action-icon">📅</span><h3>View Appointments</h3><p>Manage bookings and schedule</p></Link>
          <Link to="/services" className="action-card"><span className="action-icon">💇</span><h3>Manage Services</h3><p>Add or edit your services</p></Link>
          <Link to="/staff" className="action-card"><span className="action-icon">👥</span><h3>Manage Staff</h3><p>Add or edit staff members</p></Link>
        </div>
      </div>
    </div>
  );
}

// ─── My Salons ────────────────────────────────────────────────────────────────
function MySalons() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── modal state ──────────────────────────────────────────────────────────
  const [viewSalon, setViewSalon] = useState(null);   // salon object for "View Details"
  const [editSalon, setEditSalon] = useState(null);   // salon object for "Edit"
  const [editForm, setEditForm] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSalons(); }, []);

  const fetchSalons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/salons/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSalons(data.data);
    } catch (err) {
      console.error('Error fetching salons:', err);
    }
    setLoading(false);
  };

  // ── View Details ──────────────────────────────────────────────────────────
  const openView = (salon) => setViewSalon(salon);
  const closeView = () => setViewSalon(null);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (salon) => {
    setEditSalon(salon);
    setEditForm({
      name:        salon.name        || '',
      description: salon.description || '',
      address:     salon.address     || '',
      city:        salon.city        || '',
      state:       salon.state       || '',
      zipCode:     salon.zip_code    || salon.zipCode || '',
      phone:       salon.phone       || '',
      email:       salon.email       || '',
      openingTime: salon.opening_time || salon.openingTime || '09:00',
      closingTime: salon.closing_time || salon.closingTime || '18:00',
    });
    setFieldErrors({});
    setEditError('');
    setEditSuccess('');
  };
  const closeEdit = () => { setEditSalon(null); setEditForm({}); };

  const handleEditChange = (e) =>
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateEditForm = () => {
    const errors = {};
    const nameErr = validateSalonName(editForm.name);
    if (nameErr) errors.name = nameErr;
    const addrErr = validateAddress(editForm.address);
    if (addrErr) errors.address = addrErr;
    const cityErr = validateCity(editForm.city);
    if (cityErr) errors.city = cityErr;
    const stateErr = validateState(editForm.state);
    if (stateErr) errors.state = stateErr;
    const zipErr = validateZipCode(editForm.zipCode);
    if (zipErr) errors.zipCode = zipErr;
    const phoneErr = validatePhone(editForm.phone);
    if (phoneErr) errors.phone = phoneErr;
    if (editForm.email.trim()) {
      const emailErr = validateEmail(editForm.email);
      if (emailErr) errors.email = emailErr;
    }
    if (!editForm.openingTime) errors.openingTime = 'Opening time is required';
    if (!editForm.closingTime) errors.closingTime = 'Closing time is required';
    if (editForm.openingTime && editForm.closingTime && editForm.openingTime >= editForm.closingTime)
      errors.closingTime = 'Closing time must be after opening time';
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/salons/${editSalon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        setEditSuccess('Salon updated successfully!');
        fetchSalons();
        setTimeout(() => closeEdit(), 1500);
      } else {
        setEditError(data.message || 'Failed to update salon');
      }
    } catch {
      setEditError('Connection error. Please try again.');
    }
    setSaving(false);
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [h, m] = time.split(':');
    const d = new Date(); d.setHours(+h, +m);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="loading">Loading your salons...</div>;

  const fe = fieldErrors;

  return (
    <div className="salons-page">
      <div className="page-header">
        <div><h1>My Salons</h1><p>Manage your salon locations</p></div>
        <Link to="/add-salon" className="btn-primary"><span>➕</span> Add New Salon</Link>
      </div>

      {salons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✂️</div>
          <h3>No Salons Yet</h3>
          <p>Get started by adding your first salon</p>
          <Link to="/add-salon" className="btn-primary">Add Salon</Link>
        </div>
      ) : (
        <div className="salons-grid">
          {salons.map(salon => (
            <div key={salon.id} className="salon-card">
              <div className="salon-header">
                <h3>{salon.name}</h3>
                <span className="salon-status active">Active</span>
              </div>
              <div className="salon-details">
                <p><span className="icon">📍</span> {salon.address}, {salon.city}</p>
                <p><span className="icon">📞</span> {salon.phone}</p>
                <p><span className="icon">⭐</span> Rating: {salon.rating || 'New'}</p>
              </div>
              <div className="salon-actions">
                <button className="btn-edit"   onClick={() => openEdit(salon)}>Edit</button>
                <button className="btn-view"   onClick={() => openView(salon)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Details Modal ─────────────────────────────────────────────── */}
      {viewSalon && (
        <div className="modal-overlay" onClick={closeView}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✂️ {viewSalon.name}</h2>
              <button className="modal-close" onClick={closeView}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>📍 Location</h4>
                <p>{viewSalon.address}</p>
                <p>{viewSalon.city}{viewSalon.state ? `, ${viewSalon.state}` : ''}{viewSalon.zip_code || viewSalon.zipCode ? ` - ${viewSalon.zip_code || viewSalon.zipCode}` : ''}</p>
              </div>
              <div className="detail-section">
                <h4>📞 Contact</h4>
                <p><strong>Phone:</strong> {viewSalon.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {viewSalon.email || 'N/A'}</p>
              </div>
              <div className="detail-section">
                <h4>🕐 Business Hours</h4>
                <p><strong>Opens:</strong> {formatTime(viewSalon.opening_time || viewSalon.openingTime)}</p>
                <p><strong>Closes:</strong> {formatTime(viewSalon.closing_time || viewSalon.closingTime)}</p>
              </div>
              {viewSalon.description && (
                <div className="detail-section">
                  <h4>📝 Description</h4>
                  <p>{viewSalon.description}</p>
                </div>
              )}
              <div className="detail-section">
                <h4>⭐ Rating</h4>
                <p>{viewSalon.rating ? `${viewSalon.rating} / 5` : 'No ratings yet'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeView}>Close</button>
              <button className="btn-primary" onClick={() => { closeView(); openEdit(viewSalon); }}>Edit Salon</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editSalon && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit — {editSalon.name}</h2>
              <button className="modal-close" onClick={closeEdit}>✕</button>
            </div>
            <div className="modal-body">
              {editError   && <div className="error-message">{editError}</div>}
              {editSuccess && <div className="success-message">✓ {editSuccess}</div>}

              <form onSubmit={handleEditSubmit} noValidate>
                {/* Basic Info */}
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-group">
                    <label>Salon Name *</label>
                    <input type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                    {fe.name && <span className="field-error">{fe.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" />
                  </div>
                </div>

                {/* Location */}
                <div className="form-section">
                  <h4>Location</h4>
                  <div className="form-group">
                    <label>Address *</label>
                    <input type="text" name="address" value={editForm.address} onChange={handleEditChange} />
                    {fe.address && <span className="field-error">{fe.address}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input type="text" name="city" value={editForm.city} onChange={handleEditChange} />
                      {fe.city && <span className="field-error">{fe.city}</span>}
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" name="state" value={editForm.state} onChange={handleEditChange} />
                      {fe.state && <span className="field-error">{fe.state}</span>}
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input type="text" name="zipCode" value={editForm.zipCode} onChange={handleEditChange} maxLength={10} />
                      {fe.zipCode && <span className="field-error">{fe.zipCode}</span>}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="form-section">
                  <h4>Contact</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone * (10 digits)</label>
                      <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} maxLength={10} />
                      {fe.phone && <span className="field-error">{fe.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" value={editForm.email} onChange={handleEditChange} />
                      {fe.email && <span className="field-error">{fe.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="form-section">
                  <h4>Business Hours</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Opening Time *</label>
                      <input type="time" name="openingTime" value={editForm.openingTime} onChange={handleEditChange} />
                      {fe.openingTime && <span className="field-error">{fe.openingTime}</span>}
                    </div>
                    <div className="form-group">
                      <label>Closing Time *</label>
                      <input type="time" name="closingTime" value={editForm.closingTime} onChange={handleEditChange} />
                      {fe.closingTime && <span className="field-error">{fe.closingTime}</span>}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={closeEdit}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Add Salon ────────────────────────────────────────────────────────────────
function AddSalon() {
  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: '', state: '',
    zipCode: '', phone: '', email: '', openingTime: '09:00', closingTime: '18:00'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateSalonForm = () => {
    const errors = {};
    const nameErr = validateSalonName(formData.name);
    if (nameErr) errors.name = nameErr;
    const addressErr = validateAddress(formData.address);
    if (addressErr) errors.address = addressErr;
    const cityErr = validateCity(formData.city);
    if (cityErr) errors.city = cityErr;
    const stateErr = validateState(formData.state);
    if (stateErr) errors.state = stateErr;
    const zipErr = validateZipCode(formData.zipCode);
    if (zipErr) errors.zipCode = zipErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errors.phone = phoneErr;
    if (formData.email.trim()) {
      const emailErr = validateEmail(formData.email);
      if (emailErr) errors.email = emailErr;
    }
    if (!formData.openingTime) errors.openingTime = 'Opening time is required';
    if (!formData.closingTime) errors.closingTime = 'Closing time is required';
    if (formData.openingTime && formData.closingTime && formData.openingTime >= formData.closingTime)
      errors.closingTime = 'Closing time must be after opening time';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validateSalonForm();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/salons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) { setSuccess(true); setTimeout(() => navigate('/salons'), 2000); }
      else setError(data.message || 'Failed to create salon');
    } catch {
      setError('Connection error. Please try again.');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const fe = fieldErrors;

  return (
    <div className="add-salon-page">
      <div className="page-header"><h1>Add New Salon</h1><p>Register a new salon location</p></div>
      {success && <div className="success-message">✓ Salon created successfully! Redirecting...</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="salon-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Salon Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Glamour Studio" />
            {fe.name && <span className="field-error">{fe.name}</span>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Brief description of your salon (optional)" />
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label>Address *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
            {fe.address && <span className="field-error">{fe.address}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
              {fe.city && <span className="field-error">{fe.city}</span>}
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State (optional)" />
              {fe.state && <span className="field-error">{fe.state}</span>}
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Zip code (optional)" maxLength={10} />
              {fe.zipCode && <span className="field-error">{fe.zipCode}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Phone * (10 digits)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} placeholder="10-digit phone number" />
              {fe.phone && <span className="field-error">{fe.phone}</span>}
            </div>
            <div className="form-group">
              <label>Email (optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="salon@example.com" />
              {fe.email && <span className="field-error">{fe.email}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Business Hours</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Opening Time *</label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} />
              {fe.openingTime && <span className="field-error">{fe.openingTime}</span>}
            </div>
            <div className="form-group">
              <label>Closing Time *</label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} />
              {fe.closingTime && <span className="field-error">{fe.closingTime}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/salons')}>Cancel</button>
          <button type="submit" className="btn-primary">Create Salon</button>
        </div>
      </form>
    </div>
  );
}

// ─── Appointments ─────────────────────────────────────────────────────────────
function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => { fetchAppointments(); }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const d = new Date(); d.setHours(h, m);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/appointments/owner`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
        data.data.forEach(appt => { if (!staffMap[appt.salon_id]) fetchStaffBySalon(appt.salon_id); });
      }
    } catch (error) { console.error('Error fetching appointments:', error); }
    finally { setLoading(false); }
  };

  const fetchStaffBySalon = async (salonId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/staff/salon/${salonId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setStaffMap(prev => ({ ...prev, [salonId]: data.data }));
    } catch (err) { console.error('Error loading staff:', err); }
  };

  const assignStaff = async (appointmentId, staffId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/appointments/${appointmentId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staff_id: staffId })
      });
      fetchAppointments();
    } catch (error) { console.error('Error assigning staff:', error); }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchAppointments();
    } catch (error) { console.error('Error updating status:', error); }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/appointments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchAppointments();
    } catch (error) { console.error('Error deleting appointment:', error); }
  };

  const filteredAppointments = statusFilter === 'all' ? appointments : appointments.filter(a => a.status === statusFilter);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalRevenue = filteredAppointments.reduce((sum, a) => sum + Number(a.total_price || 0), 0);

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Appointments</h1><p>Manage your bookings</p></div>
      <div className="appointments-summary">
        <div>Total: {filteredAppointments.length}</div>
        <div>Revenue: ₹{totalRevenue}</div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {filteredAppointments.length === 0 ? (
        <div className="empty-state"><h3>No Appointments Found</h3></div>
      ) : (
        <>
          <div className="appointments-table">
            <table>
              <thead>
                <tr><th>Date</th><th>Customer</th><th>Salon</th><th>Staff</th><th>Service</th><th>Time</th><th>Price</th><th>Status</th><th>Delete</th></tr>
              </thead>
              <tbody>
                {paginatedAppointments.map(appt => (
                  <tr key={appt.id}>
                    <td>{formatDate(appt.appointment_date)}</td>
                    <td>{appt.customer_name}</td>
                    <td>{appt.salon_name}</td>
                    <td>
                      {appt.staff_id ? (appt.staff_name || 'Assigned') : (
                        <select onChange={(e) => assignStaff(appt.id, e.target.value)} defaultValue="">
                          <option value="" disabled>Assign Staff</option>
                          {staffMap[appt.salon_id]?.map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.first_name} {staff.last_name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{appt.service_name}</td>
                    <td>{formatTime(appt.start_time)} - {formatTime(appt.end_time)}</td>
                    <td>₹{appt.total_price}</td>
                    <td>
                      <select value={appt.status} onChange={(e) => updateStatus(appt.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td><button className="btn-danger" onClick={() => deleteAppointment(appt.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>◀ Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next ▶</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  return (
    <div className="page-container">
      <div className="page-header"><h1>Services</h1><p>Manage your salon services</p></div>
      <div className="coming-soon"><h3>🚧 Coming Soon</h3><p>Service management features will be available here</p></div>
    </div>
  );
}

// ─── Staff ────────────────────────────────────────────────────────────────────
function Staff() {
  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editStaff, setEditStaff] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [editErrors, setEditErrors] = useState({});
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSalons(); }, []);

  const fetchSalons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/salons/owner`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setSalons(data.data);
        if (data.data.length > 0) { setSelectedSalon(data.data[0].id); fetchStaff(data.data[0].id); }
      }
    } catch (error) { console.error('Error fetching salons:', error); }
    setLoading(false);
  };

  const fetchStaff = async (salonId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/staff/salon/${salonId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setStaff(data.data);
    } catch (error) { console.error('Error fetching staff:', error); }
  };

  const handleSalonChange = (e) => { setSelectedSalon(e.target.value); fetchStaff(e.target.value); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStaffForm = (data) => {
    const errors = {};
    const fnErr = validateName(data.first_name, 'First name');
    const lnErr = validateName(data.last_name, 'Last name');
    const phErr = validatePhone(data.phone);
    if (fnErr) errors.first_name = fnErr;
    if (lnErr) errors.last_name = lnErr;
    if (phErr) errors.phone = phErr;
    return errors;
  };

  // ── Add Staff ──────────────────────────────────────────────────────────────
  const handleAddStaff = async (e) => {
    e.preventDefault();
    const errors = validateStaffForm(formData);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, salon_id: selectedSalon })
      });
      const data = await response.json();
      if (data.success) {
        setFormData({ first_name: '', last_name: '', phone: '' });
        setShowForm(false);
        fetchStaff(selectedSalon);
      }
    } catch (error) { console.error('Error adding staff:', error); }
  };

  // ── Delete Staff ───────────────────────────────────────────────────────────
  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/staff/${staffId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) fetchStaff(selectedSalon);
    } catch (error) { console.error('Delete error:', error); }
  };

  // ── Edit Staff ─────────────────────────────────────────────────────────────
  const openEdit = (member) => {
    setEditStaff(member);
    setEditForm({ first_name: member.first_name, last_name: member.last_name, phone: member.phone || '' });
    setEditErrors({});
    setEditError('');
    setEditSuccess('');
  };
  const closeEdit = () => { setEditStaff(null); setEditForm({ first_name: '', last_name: '', phone: '' }); };
  const handleEditChange = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    const errors = validateStaffForm(editForm);
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }
    setEditErrors({});
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/staff/${editStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (data.success) {
        setEditSuccess('Staff updated successfully!');
        fetchStaff(selectedSalon);
        setTimeout(() => closeEdit(), 1500);
      } else {
        setEditError(data.message || 'Failed to update staff');
      }
    } catch {
      setEditError('Connection error. Please try again.');
    }
    setSaving(false);
  };

  const fe = fieldErrors;
  const ee = editErrors;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Staff</h1><p>Manage your staff members</p></div>

      {/* Salon Selector */}
      {salons.length > 0 && (
        <select value={selectedSalon} onChange={handleSalonChange} className="salon-select">
          {salons.map(salon => <option key={salon.id} value={salon.id}>{salon.name}</option>)}
        </select>
      )}

      {/* Add Staff Toggle */}
      <div style={{ margin: '20px 0' }}>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFieldErrors({}); }}>
          {showForm ? 'Cancel' : '➕ Add Staff'}
        </button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <form onSubmit={handleAddStaff} className="staff-form" noValidate>
          <div>
            <input type="text" name="first_name" placeholder="First Name (letters only)"
              value={formData.first_name} onChange={handleChange} />
            {fe.first_name && <span className="field-error">{fe.first_name}</span>}
          </div>
          <div>
            <input type="text" name="last_name" placeholder="Last Name (letters only)"
              value={formData.last_name} onChange={handleChange} />
            {fe.last_name && <span className="field-error">{fe.last_name}</span>}
          </div>
          <div>
            <input type="tel" name="phone" placeholder="Phone Number (10 digits)"
              value={formData.phone} onChange={handleChange} maxLength={10} />
            {fe.phone && <span className="field-error">{fe.phone}</span>}
          </div>
          <button type="submit" className="btn-success">Save Staff</button>
        </form>
      )}

      {/* Staff List */}
      {loading ? (
        <div className="loading">Loading staff...</div>
      ) : staff.length === 0 ? (
        <div className="empty-state"><h3>No Staff Found</h3><p>Add staff members to this salon</p></div>
      ) : (
        <div className="salons-grid">
          {staff.map(member => (
            <div key={member.id} className="salon-card">
              <div className="salon-header">
                <h3>{member.first_name} {member.last_name}</h3>
                <span className="salon-status active">Active</span>
              </div>
              <div className="salon-details">
                <p><span className="icon">📞</span> <strong>Phone:</strong> {member.phone || 'N/A'}</p>
              </div>
              <div className="staff-actions">
                <button className="btn-edit" onClick={() => openEdit(member)}>✏️ Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(member.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Staff Modal ─────────────────────────────────────────────────── */}
      {editStaff && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Staff</h2>
              <button className="modal-close" onClick={closeEdit}>✕</button>
            </div>
            <div className="modal-body">
              {editError   && <div className="error-message">{editError}</div>}
              {editSuccess && <div className="success-message">✓ {editSuccess}</div>}

              <form onSubmit={handleEditSubmit} noValidate>
                <div className="form-section">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="first_name" value={editForm.first_name}
                      onChange={handleEditChange} placeholder="First Name (letters only)" />
                    {ee.first_name && <span className="field-error">{ee.first_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="last_name" value={editForm.last_name}
                      onChange={handleEditChange} placeholder="Last Name (letters only)" />
                    {ee.last_name && <span className="field-error">{ee.last_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone * (10 digits)</label>
                    <input type="tel" name="phone" value={editForm.phone}
                      onChange={handleEditChange} placeholder="10-digit phone number" maxLength={10} />
                    {ee.phone && <span className="field-error">{ee.phone}</span>}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={closeEdit}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics() {
  return (
    <div className="page-container">
      <div className="page-header"><h1>Analytics</h1><p>View your business insights</p></div>
      <div className="coming-soon"><h3>🚧 Coming Soon</h3><p>Analytics and reporting features will be available here</p></div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('info');
  const [copied, setCopied] = useState(false);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [saving, setSaving] = useState(false);

  const userId = user.id || 'usr_' + (user.email || '').replace(/[^a-z0-9]/gi, '').slice(0, 12);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(userId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPwdStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)) score++;
    return score;
  };

  const strength = getPwdStrength(newPwd);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#e74c3c', '#e67e22', '#f1c40f', '#27ae60'];

  const validatePwdForm = () => {
    const errors = {};
    if (!currentPwd) errors.currentPwd = 'Current password is required';
    const newPwdErr = validatePassword(newPwd);
    if (newPwdErr) errors.newPwd = newPwdErr;
    if (!confirmPwd) errors.confirmPwd = 'Please confirm your new password';
    else if (newPwd !== confirmPwd) errors.confirmPwd = 'Passwords do not match';
    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    const errors = validatePwdForm();
    if (Object.keys(errors).length > 0) { setPwdErrors(errors); return; }
    setPwdErrors({});
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
      const data = await response.json();
      if (data.success) {
        setPwdSuccess('Password updated successfully!');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        setTimeout(() => setPwdSuccess(''), 4000);
      } else {
        setPwdError(data.message || 'Failed to update password');
      }
    } catch {
      setPwdError('Connection error. Please try again.');
    }
    setSaving(false);
  };

  const handleCancelPwd = () => {
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setPwdErrors({}); setPwdError(''); setPwdSuccess('');
  };

  const pe = pwdErrors;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and security</p>
      </div>

      {/* ── Owner Info Banner ─────────────────────────────────────────────── */}
      <div className="profile-banner">
        <div className="profile-banner-avatar">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div className="profile-banner-info">
          <h2>{user.firstName} {user.lastName}</h2>
          <p>{user.email}</p>
        </div>
        <span className="profile-owner-badge">⭐ Owner</span>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Account Info
        </button>
        <button
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`profile-tab ${activeTab === 'userid' ? 'active' : ''}`}
          onClick={() => setActiveTab('userid')}
        >
          User ID
        </button>
      </div>

      {/* ── Tab: Account Info ─────────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <label>First Name</label>
              <div className="profile-info-value">{user.firstName}</div>
            </div>
            <div className="profile-info-item">
              <label>Last Name</label>
              <div className="profile-info-value">{user.lastName}</div>
            </div>
            <div className="profile-info-item profile-info-full">
              <label>Email Address</label>
              <div className="profile-info-value">{user.email}</div>
            </div>
            <div className="profile-info-item">
              <label>Role</label>
              <div className="profile-info-value">
                <span className="profile-role-badge">{user.role}</span>
              </div>
            </div>
            {user.phone && (
              <div className="profile-info-item">
                <label>Phone</label>
                <div className="profile-info-value">{user.phone}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Change Password ──────────────────────────────────────────── */}
      {activeTab === 'password' && (
        <div className="profile-card">
          <h3>Change Password</h3>
          <p className="profile-card-subtitle">
            Password must be at least 6 characters, include 1 uppercase letter and 1 special character.
          </p>

          {pwdError   && <div className="error-message">{pwdError}</div>}
          {pwdSuccess && <div className="success-message">✓ {pwdSuccess}</div>}

          <form onSubmit={handlePasswordSubmit} noValidate className="profile-pwd-form">
            {/* Current Password */}
            <div className="form-group">
              <label>Current Password *</label>
              <div className="profile-input-wrap">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
                <button
                  type="button"
                  className="profile-eye-btn"
                  onClick={() => setShowCurrentPwd(v => !v)}
                  title={showCurrentPwd ? 'Hide' : 'Show'}
                >
                  {showCurrentPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {pe.currentPwd && <span className="field-error">{pe.currentPwd}</span>}
            </div>

            <div className="form-row">
              {/* New Password */}
              <div className="form-group">
                <label>New Password *</label>
                <div className="profile-input-wrap">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    placeholder="Min. 6 chars, 1 uppercase, 1 special"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowNewPwd(v => !v)}
                    title={showNewPwd ? 'Hide' : 'Show'}
                  >
                    {showNewPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {pe.newPwd && <span className="field-error">{pe.newPwd}</span>}
                {newPwd && (
                  <div className="profile-strength-wrap">
                    <div className="profile-strength-bars">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className="profile-strength-bar"
                          style={{ background: i <= strength ? strengthColors[strength] : '#e0e0e0' }}
                        />
                      ))}
                    </div>
                    <span className="profile-strength-label" style={{ color: strengthColors[strength] }}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label>Confirm New Password *</label>
                <div className="profile-input-wrap">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    style={confirmPwd && newPwd !== confirmPwd ? { borderColor: '#e74c3c' } : {}}
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowConfirmPwd(v => !v)}
                    title={showConfirmPwd ? 'Hide' : 'Show'}
                  >
                    {showConfirmPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {pe.confirmPwd && <span className="field-error">{pe.confirmPwd}</span>}
                {confirmPwd && !pe.confirmPwd && newPwd === confirmPwd && (
                  <span className="profile-match-ok">✓ Passwords match</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleCancelPwd}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: User ID ─────────────────────────────────────────────────── */}
      {activeTab === 'userid' && (
        <div className="profile-card">
          <h3>User ID</h3>
          <p className="profile-card-subtitle">
            Your unique identifier used across the SIZZER platform.
          </p>
          <div className="profile-userid-box">
            <div className="profile-userid-label">Unique User ID</div>
            <div className="profile-userid-value">{userId}</div>
            <button
              className={`profile-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyId}
            >
              {copied ? '✓ Copied!' : '📋 Copy ID'}
            </button>
          </div>
          <div className="profile-userid-note">
            ⚠️ This ID is read-only and cannot be changed. Use it when contacting support.
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
