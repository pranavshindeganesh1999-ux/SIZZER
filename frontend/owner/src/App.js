import React, { useState, useEffect, useMemo } from 'react';
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
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) return 'Password must contain at least 1 special character';
  return '';
};
const validateZipCode = (value) => { if (!value.trim()) return ''; if (!/^\d{4,10}$/.test(value)) return 'Zip code must be 4–10 digits'; return ''; };
const validateSalonName = (value) => { if (!value.trim()) return 'Salon name is required'; if (value.trim().length < 2) return 'Salon name must be at least 2 characters'; if (value.trim().length > 100) return 'Salon name must be under 100 characters'; return ''; };
const validateCity = (value) => { if (!value.trim()) return 'City is required'; if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'City contains invalid characters'; return ''; };
const validateState = (value) => { if (!value.trim()) return ''; if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'State contains invalid characters'; return ''; };
const validateAddress = (value) => { if (!value.trim()) return 'Address is required'; if (value.trim().length < 5) return 'Please enter a valid address'; return ''; };

// ─── Service Constants ────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = ['Hair Styling','Hair Coloring','Beard & Shaving','Nail Care','Skin Care','Spa & Massage','Makeup','Waxing','Other'];
const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120];
const EMPTY_SERVICE_FORM = { name: '', description: '', price: '', duration_minutes: '30', category: 'Hair Styling', is_active: true };
const categoryIcon = (cat) => ({ 'Hair Styling':'💇','Hair Coloring':'🎨','Beard & Shaving':'🧔','Nail Care':'💅','Skin Care':'✨','Spa & Massage':'💆','Makeup':'💄','Waxing':'🌿','Other':'🌟' }[cat] || '🌟');
const fmtDuration = (d) => { d = Number(d); if (d < 60) return `${d} min`; return `${Math.floor(d/60)}h${d%60?` ${d%60}m`:''}`; };

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  useEffect(() => { const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)); }, []);
  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };

  return (
    <Router>
      <div className="app">
        {!user ? <Login onLogin={handleLogin} /> : (
          <>
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/salons" element={<MySalons user={user} />} />
                <Route path="/add-salon" element={<AddSalon user={user} />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/services" element={<Services user={user} />} />
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

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false); const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState(''); const [phone, setPhone] = useState(''); const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const e = {};
    if (isRegister) { e.firstName = validateName(firstName,'First name'); e.lastName = validateName(lastName,'Last name'); e.phone = validatePhone(phone); }
    e.email = validateEmail(email); e.password = validatePassword(password);
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k]; }); return e;
  };

  // DEF: first name / last name must not accept digits — enforce on keypress
  const handleNameKeyDown = (e) => {
    if (/\d/.test(e.key)) e.preventDefault();
  };

  // DEF: phone must be digits only and max 10 — enforce on change
  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault(); setError('');
    const errs = validate(); if (Object.keys(errs).length) { setFieldErrors(errs); return; } setFieldErrors({});
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister ? { email, password, firstName, lastName, phone, role: 'owner' } : { email, password };
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { if (data.data.user.role !== 'owner') { setError('Access denied. Owner accounts only.'); return; } localStorage.setItem('token', data.data.token); localStorage.setItem('user', JSON.stringify(data.data.user)); onLogin(data.data.user); }
      else setError(data.message || 'Login failed');
    } catch { setError('Connection error. Please try again.'); }
  };

  const fe = fieldErrors;
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header"><div className="logo-section"><img src="/images/logo-icon.png" alt="SIZZER" className="login-logo" /><h1>SIZZER</h1><p>OWNER PORTAL</p></div></div>
        <div className="login-box">
          <h2>{isRegister ? 'CREATE OWNER ACCOUNT' : 'OWNER LOGIN'}</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <>
                <div className="form-row">
                  <div>
                    {/* DEF: block digit key presses in name fields */}
                    <input type="text" placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} onKeyDown={handleNameKeyDown} />
                    {fe.firstName && <span className="field-error">{fe.firstName}</span>}
                  </div>
                  <div>
                    <input type="text" placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} onKeyDown={handleNameKeyDown} />
                    {fe.lastName && <span className="field-error">{fe.lastName}</span>}
                  </div>
                </div>
                <div>
                  {/* DEF: digits only, max 10 */}
                  <input
                    type="tel"
                    placeholder="Phone Number (10 digits)"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d*"
                  />
                  {fe.phone && <span className="field-error">{fe.phone}</span>}
                </div>
              </>
            )}
            <div><input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} />{fe.email && <span className="field-error">{fe.email}</span>}</div>
            <div><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />{fe.password && <span className="field-error">{fe.password}</span>}</div>
            <button type="submit" className="btn-primary-full">{isRegister ? 'CREATE ACCOUNT' : 'LOGIN'}</button>
          </form>
          <div className="toggle-text">{isRegister ? 'Already have an account?' : "Don't have an account?"}<button className="toggle-btn" onClick={()=>{setIsRegister(!isRegister);setFieldErrors({});setError('');}}>{isRegister?'Login':'Register'}</button></div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// DEF_005: user name and email truncated properly inside the box
// DEF_004: sidebar spacing fixed so logout button doesn't shift on Add Salon page
function Sidebar({ user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header"><img src="/images/logo-icon.png" alt="SIZZER" className="sidebar-logo" /><div className="sidebar-brand"><h2>SIZZER</h2><p>Owner Portal</p></div></div>
      {/* DEF_005: added overflow:hidden + min-width:0 on user-info via inline style */}
      <div className="sidebar-user">
        <div className="user-avatar">{user.firstName[0]}{user.lastName[0]}</div>
        <div className="user-info" style={{minWidth:0,overflow:'hidden'}}>
          <strong style={{display:'block',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.firstName} {user.lastName}</strong>
          <span style={{display:'block',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontSize:'0.78rem'}}>{user.email}</span>
        </div>
      </div>
      {/* DEF_004: sidebar-nav flex:1 keeps logout pinned at bottom regardless of content */}
      <nav className="sidebar-nav">
        <Link to="/" className="nav-item"><span className="icon">📊</span>Dashboard</Link>
        <Link to="/salons" className="nav-item"><span className="icon">✂️</span>My Salons</Link>
        <Link to="/appointments" className="nav-item"><span className="icon">📅</span>Appointments</Link>
        <Link to="/services" className="nav-item"><span className="icon">💇</span>Services</Link>
        <Link to="/staff" className="nav-item"><span className="icon">👥</span>Staff</Link>
        <Link to="/analytics" className="nav-item"><span className="icon">📈</span>Analytics</Link>
        <Link to="/profile" className="nav-item"><span className="icon">⚙️</span>Settings</Link>
      </nav>
      <button className="logout-btn" onClick={onLogout}><span className="icon">🚪</span>Logout</button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [stats, setStats] = useState({ totalSalons:0, totalAppointments:0, totalRevenue:0, activeStaff:0 });
  useEffect(() => { loadDashboardData(); }, []);
  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const salonRes = await fetch(`${API_URL}/salons/owner`,{headers:{Authorization:`Bearer ${token}`}});
      const salonData = await salonRes.json(); const salons = salonData.success ? salonData.data : [];
      const apptRes = await fetch(`${API_URL}/appointments/owner`,{headers:{Authorization:`Bearer ${token}`}});
      const apptData = await apptRes.json(); const appointments = apptData.success ? apptData.data : [];
      const totalRevenue = appointments.reduce((s,a)=>s+Number(a.total_price||0),0);
      let totalStaff = 0;
      for (let salon of salons) { const sr = await fetch(`${API_URL}/staff/salon/${salon.id}`,{headers:{Authorization:`Bearer ${token}`}}); const sd = await sr.json(); if(sd.success) totalStaff+=sd.data.length; }
      setStats({totalSalons:salons.length,totalAppointments:appointments.length,totalRevenue,activeStaff:totalStaff});
    } catch(e){console.error(e);}
  };
  return (
    <div className="dashboard">
      <div className="page-header"><h1>Dashboard</h1><p>Welcome back, {user.firstName}!</p></div>
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
// DEF_002: Added search box to filter salons by name/city/phone
// Added pagination for salon list
function MySalons() {
  const [salons, setSalons] = useState([]); const [loading, setLoading] = useState(true);
  const [viewSalon, setViewSalon] = useState(null); const [editSalon, setEditSalon] = useState(null);
  const [editForm, setEditForm] = useState({}); const [fieldErrors, setFieldErrors] = useState({});
  const [editError, setEditError] = useState(''); const [editSuccess, setEditSuccess] = useState(''); const [saving, setSaving] = useState(false);

  // DEF_002: search state
  const [salonSearch, setSalonSearch] = useState('');
  // Pagination
  const [salonPage, setSalonPage] = useState(1);
  const SALONS_PER_PAGE = 6;

  useEffect(() => { fetchSalons(); }, []);
  const fetchSalons = async () => {
    try { const token=localStorage.getItem('token'); const r=await fetch(`${API_URL}/salons/owner`,{headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); if(d.success) setSalons(d.data); } catch(e){console.error(e);} setLoading(false);
  };
  const openEdit = (salon) => { setEditSalon(salon); setEditForm({name:salon.name||'',description:salon.description||'',address:salon.address||'',city:salon.city||'',state:salon.state||'',zipCode:salon.zip_code||salon.zipCode||'',phone:salon.phone||'',email:salon.email||'',openingTime:salon.opening_time||salon.openingTime||'09:00',closingTime:salon.closing_time||salon.closingTime||'18:00'}); setFieldErrors({}); setEditError(''); setEditSuccess(''); };
  const closeEdit = () => { setEditSalon(null); setEditForm({}); };
  const handleEditChange = (e) => setEditForm(p=>({...p,[e.target.name]:e.target.value}));
  const validateEditForm = () => { const e={}; const n=validateSalonName(editForm.name);if(n)e.name=n; const a=validateAddress(editForm.address);if(a)e.address=a; const c=validateCity(editForm.city);if(c)e.city=c; const s=validateState(editForm.state);if(s)e.state=s; const z=validateZipCode(editForm.zipCode);if(z)e.zipCode=z; const p=validatePhone(editForm.phone);if(p)e.phone=p; if(editForm.email.trim()){const em=validateEmail(editForm.email);if(em)e.email=em;} if(!editForm.openingTime)e.openingTime='Opening time is required'; if(!editForm.closingTime)e.closingTime='Closing time is required'; if(editForm.openingTime&&editForm.closingTime&&editForm.openingTime>=editForm.closingTime)e.closingTime='Closing time must be after opening time'; return e; };
  const handleEditSubmit = async (e) => { e.preventDefault(); setEditError(''); setEditSuccess(''); const errs=validateEditForm(); if(Object.keys(errs).length){setFieldErrors(errs);return;} setFieldErrors({}); setSaving(true); try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/salons/${editSalon.id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(editForm)});const d=await r.json();if(d.success){setEditSuccess('Salon updated successfully!');fetchSalons();setTimeout(()=>closeEdit(),1500);}else setEditError(d.message||'Failed to update salon');}catch{setEditError('Connection error.');}setSaving(false);};
  const formatTime = (t) => { if(!t)return'N/A';const[h,m]=t.split(':');const d=new Date();d.setHours(+h,+m);return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});};

  // DEF_002: filtered salons
  const filteredSalons = useMemo(() => {
    if (!salonSearch.trim()) return salons;
    const q = salonSearch.toLowerCase();
    return salons.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.address?.toLowerCase().includes(q)
    );
  }, [salons, salonSearch]);

  // Pagination
  const totalSalonPages = Math.max(1, Math.ceil(filteredSalons.length / SALONS_PER_PAGE));
  const paginatedSalons = filteredSalons.slice((salonPage - 1) * SALONS_PER_PAGE, salonPage * SALONS_PER_PAGE);

  if(loading) return <div className="loading">Loading your salons...</div>;
  const fe=fieldErrors;
  return (
    <div className="salons-page">
      <div className="page-header"><div><h1>My Salons</h1><p>Manage your salon locations</p></div><Link to="/add-salon" className="btn-primary"><span>➕</span> Add New Salon</Link></div>

      {/* DEF_002: Search box for salons */}
      {salons.length > 0 && (
        <div className="svc-controls" style={{marginBottom:'1.5rem'}}>
          <div className="svc-search-wrap">
            <span className="svc-search-icon">🔍</span>
            <input
              className="svc-search"
              placeholder="Search by name, city, address or phone..."
              value={salonSearch}
              onChange={e => { setSalonSearch(e.target.value); setSalonPage(1); }}
            />
            {salonSearch && <button className="svc-search-clear" onClick={() => { setSalonSearch(''); setSalonPage(1); }}>✕</button>}
          </div>
        </div>
      )}

      {salons.length===0 ? (
        <div className="empty-state"><div className="empty-icon">✂️</div><h3>No Salons Yet</h3><p>Get started by adding your first salon</p><Link to="/add-salon" className="btn-primary">Add Salon</Link></div>
      ) : filteredSalons.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔍</div><h3>No Salons Found</h3><p>Try a different search term.</p><button className="btn-secondary" onClick={()=>setSalonSearch('')}>Clear Search</button></div>
      ) : (
        <>
          <div className="svc-results-count" style={{marginBottom:'1rem'}}>
            Showing <strong>{(salonPage-1)*SALONS_PER_PAGE+1}–{Math.min(salonPage*SALONS_PER_PAGE, filteredSalons.length)}</strong> of <strong>{filteredSalons.length}</strong> salons
          </div>
          <div className="salons-grid">{paginatedSalons.map(salon=>(
            <div key={salon.id} className="salon-card">
              <div className="salon-header"><h3>{salon.name}</h3><span className="salon-status active">Active</span></div>
              <div className="salon-details"><p><span className="icon">📍</span> {salon.address}, {salon.city}</p><p><span className="icon">📞</span> {salon.phone}</p><p><span className="icon">⭐</span> Rating: {salon.rating||'New'}</p></div>
              <div className="salon-actions"><button className="btn-edit" onClick={()=>openEdit(salon)}>Edit</button><button className="btn-view" onClick={()=>setViewSalon(salon)}>View Details</button></div>
            </div>
          ))}</div>
          {/* Pagination */}
          {totalSalonPages > 1 && (
            <div className="svc-pagination" style={{marginTop:'1.5rem'}}>
              <button disabled={salonPage===1} onClick={()=>setSalonPage(1)}>«</button>
              <button disabled={salonPage===1} onClick={()=>setSalonPage(p=>p-1)}>‹</button>
              {Array.from({length:totalSalonPages},(_,i)=>i+1).map(p=>(
                <button key={p} className={p===salonPage?'svc-page-active':''} onClick={()=>setSalonPage(p)}>{p}</button>
              ))}
              <button disabled={salonPage===totalSalonPages} onClick={()=>setSalonPage(p=>p+1)}>›</button>
              <button disabled={salonPage===totalSalonPages} onClick={()=>setSalonPage(totalSalonPages)}>»</button>
            </div>
          )}
        </>
      )}

      {viewSalon&&(<div className="modal-overlay" onClick={()=>setViewSalon(null)}><div className="modal-box" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2>✂️ {viewSalon.name}</h2><button className="modal-close" onClick={()=>setViewSalon(null)}>✕</button></div><div className="modal-body"><div className="detail-section"><h4>📍 Location</h4><p>{viewSalon.address}</p><p>{viewSalon.city}{viewSalon.state?`, ${viewSalon.state}`:''}{viewSalon.zip_code||viewSalon.zipCode?` - ${viewSalon.zip_code||viewSalon.zipCode}`:''}</p></div><div className="detail-section"><h4>📞 Contact</h4><p><strong>Phone:</strong> {viewSalon.phone||'N/A'}</p><p><strong>Email:</strong> {viewSalon.email||'N/A'}</p></div><div className="detail-section"><h4>🕐 Business Hours</h4><p><strong>Opens:</strong> {formatTime(viewSalon.opening_time||viewSalon.openingTime)}</p><p><strong>Closes:</strong> {formatTime(viewSalon.closing_time||viewSalon.closingTime)}</p></div>{viewSalon.description&&<div className="detail-section"><h4>📝 Description</h4><p>{viewSalon.description}</p></div>}<div className="detail-section"><h4>⭐ Rating</h4><p>{viewSalon.rating?`${viewSalon.rating} / 5`:'No ratings yet'}</p></div></div><div className="modal-footer"><button className="btn-secondary" onClick={()=>setViewSalon(null)}>Close</button><button className="btn-primary" onClick={()=>{setViewSalon(null);openEdit(viewSalon);}}>Edit Salon</button></div></div></div>)}
      {editSalon&&(<div className="modal-overlay" onClick={closeEdit}><div className="modal-box modal-box-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2>✏️ Edit — {editSalon.name}</h2><button className="modal-close" onClick={closeEdit}>✕</button></div><div className="modal-body">{editError&&<div className="error-message">{editError}</div>}{editSuccess&&<div className="success-message">✓ {editSuccess}</div>}<form onSubmit={handleEditSubmit} noValidate><div className="form-section"><h4>Basic Information</h4><div className="form-group"><label>Salon Name *</label><input type="text" name="name" value={editForm.name} onChange={handleEditChange}/>{fe.name&&<span className="field-error">{fe.name}</span>}</div><div className="form-group"><label>Description</label><textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3"/></div></div><div className="form-section"><h4>Location</h4><div className="form-group"><label>Address *</label><input type="text" name="address" value={editForm.address} onChange={handleEditChange}/>{fe.address&&<span className="field-error">{fe.address}</span>}</div><div className="form-row"><div className="form-group"><label>City *</label><input type="text" name="city" value={editForm.city} onChange={handleEditChange}/>{fe.city&&<span className="field-error">{fe.city}</span>}</div><div className="form-group"><label>State</label><input type="text" name="state" value={editForm.state} onChange={handleEditChange}/>{fe.state&&<span className="field-error">{fe.state}</span>}</div><div className="form-group"><label>Zip Code</label><input type="text" name="zipCode" value={editForm.zipCode} onChange={handleEditChange} maxLength={10}/>{fe.zipCode&&<span className="field-error">{fe.zipCode}</span>}</div></div></div><div className="form-section"><h4>Contact</h4><div className="form-row"><div className="form-group"><label>Phone *</label><input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} maxLength={10}/>{fe.phone&&<span className="field-error">{fe.phone}</span>}</div><div className="form-group"><label>Email</label><input type="email" name="email" value={editForm.email} onChange={handleEditChange}/>{fe.email&&<span className="field-error">{fe.email}</span>}</div></div></div><div className="form-section"><h4>Business Hours</h4><div className="form-row"><div className="form-group"><label>Opening Time *</label><input type="time" name="openingTime" value={editForm.openingTime} onChange={handleEditChange}/>{fe.openingTime&&<span className="field-error">{fe.openingTime}</span>}</div><div className="form-group"><label>Closing Time *</label><input type="time" name="closingTime" value={editForm.closingTime} onChange={handleEditChange}/>{fe.closingTime&&<span className="field-error">{fe.closingTime}</span>}</div></div></div><div className="modal-footer"><button type="button" className="btn-secondary" onClick={closeEdit}>Cancel</button><button type="submit" className="btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button></div></form></div></div></div>)}
    </div>
  );
}

// ─── Add Salon ────────────────────────────────────────────────────────────────
function AddSalon() {
  const [formData, setFormData] = useState({name:'',description:'',address:'',city:'',state:'',zipCode:'',phone:'',email:'',openingTime:'09:00',closingTime:'18:00'});
  const [fieldErrors, setFieldErrors] = useState({}); const [success, setSuccess] = useState(false); const [error, setError] = useState(''); const navigate = useNavigate();
  const validateForm = () => { const e={}; const n=validateSalonName(formData.name);if(n)e.name=n;const a=validateAddress(formData.address);if(a)e.address=a;const c=validateCity(formData.city);if(c)e.city=c;const s=validateState(formData.state);if(s)e.state=s;const z=validateZipCode(formData.zipCode);if(z)e.zipCode=z;const p=validatePhone(formData.phone);if(p)e.phone=p;if(formData.email.trim()){const em=validateEmail(formData.email);if(em)e.email=em;}if(!formData.openingTime)e.openingTime='Opening time required';if(!formData.closingTime)e.closingTime='Closing time required';if(formData.openingTime&&formData.closingTime&&formData.openingTime>=formData.closingTime)e.closingTime='Closing time must be after opening time';return e;};
  const handleSubmit = async (e) => { e.preventDefault();setError('');const errs=validateForm();if(Object.keys(errs).length){setFieldErrors(errs);return;}setFieldErrors({});try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/salons`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(formData)});const d=await r.json();if(d.success){setSuccess(true);setTimeout(()=>navigate('/salons'),2000);}else setError(d.message||'Failed to create salon');}catch{setError('Connection error.');}};
  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});
  const fe=fieldErrors;
  return (
    <div className="add-salon-page">
      <div className="page-header"><h1>Add New Salon</h1><p>Register a new salon location</p></div>
      {success&&<div className="success-message">✓ Salon created successfully! Redirecting...</div>}
      {error&&<div className="error-message">{error}</div>}
      <form className="salon-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section"><h3>Basic Information</h3><div className="form-group"><label>Salon Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Glamour Studio"/>{fe.name&&<span className="field-error">{fe.name}</span>}</div><div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Brief description (optional)"/></div></div>
        <div className="form-section"><h3>Location</h3><div className="form-group"><label>Address *</label><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address"/>{fe.address&&<span className="field-error">{fe.address}</span>}</div><div className="form-row"><div className="form-group"><label>City *</label><input type="text" name="city" value={formData.city} onChange={handleChange}/>{fe.city&&<span className="field-error">{fe.city}</span>}</div><div className="form-group"><label>State</label><input type="text" name="state" value={formData.state} onChange={handleChange}/>{fe.state&&<span className="field-error">{fe.state}</span>}</div><div className="form-group"><label>Zip Code</label><input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} maxLength={10}/>{fe.zipCode&&<span className="field-error">{fe.zipCode}</span>}</div></div></div>
        <div className="form-section"><h3>Contact Information</h3><div className="form-row"><div className="form-group"><label>Phone * (10 digits)</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10}/>{fe.phone&&<span className="field-error">{fe.phone}</span>}</div><div className="form-group"><label>Email (optional)</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="salon@example.com"/>{fe.email&&<span className="field-error">{fe.email}</span>}</div></div></div>
        <div className="form-section"><h3>Business Hours</h3><div className="form-row"><div className="form-group"><label>Opening Time *</label><input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange}/>{fe.openingTime&&<span className="field-error">{fe.openingTime}</span>}</div><div className="form-group"><label>Closing Time *</label><input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange}/>{fe.closingTime&&<span className="field-error">{fe.closingTime}</span>}</div></div></div>
        <div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>navigate('/salons')}>Cancel</button><button type="submit" className="btn-primary">Create Salon</button></div>
      </form>
    </div>
  );
}

// ─── Appointments ─────────────────────────────────────────────────────────────
// DEF_004 (Appointments): Added search box for appointment table
// DEF_006: Fixed status change — use controlled local state with optimistic update
function Appointments() {
  const [appointments, setAppointments] = useState([]); const [staffMap, setStaffMap] = useState({}); const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  // DEF_004: search state for appointments
  const [apptSearch, setApptSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1); const itemsPerPage = 5;

  useEffect(()=>{fetchAppointments();},[]);
  const formatDate=(d)=>d?new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
  const formatTime=(t)=>{if(!t)return'';const[h,m]=t.split(':');const d=new Date();d.setHours(h,m);return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});};
  const fetchAppointments=async()=>{try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/appointments/owner`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success){setAppointments(d.data);d.data.forEach(a=>{if(!staffMap[a.salon_id])fetchStaffBySalon(a.salon_id);});}}catch(e){console.error(e);}finally{setLoading(false);}};
  const fetchStaffBySalon=async(id)=>{try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/staff/salon/${id}`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success)setStaffMap(p=>({...p,[id]:d.data}));}catch(e){console.error(e);}};
  const assignStaff=async(apptId,staffId)=>{try{const token=localStorage.getItem('token');await fetch(`${API_URL}/appointments/${apptId}/assign`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({staff_id:staffId})});fetchAppointments();}catch(e){console.error(e);}};

  // DEF_006: optimistic status update so the select reflects the new value immediately
  const updateStatus=async(id,status)=>{
    // Update local state immediately for responsive UI
    setAppointments(prev => prev.map(a => a.id === id ? {...a, status} : a));
    try{
      const token=localStorage.getItem('token');
      const res = await fetch(`${API_URL}/appointments/${id}/status`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status})});
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        fetchAppointments();
      }
    }catch(e){console.error(e); fetchAppointments();}
  };

  const deleteAppointment=async(id)=>{if(!window.confirm('Are you sure?'))return;try{const token=localStorage.getItem('token');await fetch(`${API_URL}/appointments/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});fetchAppointments();}catch(e){console.error(e);}};

  // DEF_004: filter by status + search
  const filtered = useMemo(() => {
    let data = statusFilter === 'all' ? appointments : appointments.filter(a => a.status === statusFilter);
    if (apptSearch.trim()) {
      const q = apptSearch.toLowerCase();
      data = data.filter(a =>
        a.customer_name?.toLowerCase().includes(q) ||
        a.salon_name?.toLowerCase().includes(q) ||
        a.service_name?.toLowerCase().includes(q) ||
        a.staff_name?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [appointments, statusFilter, apptSearch]);

  const totalPages=Math.ceil(filtered.length/itemsPerPage)||1;
  const paginated=filtered.slice((currentPage-1)*itemsPerPage,currentPage*itemsPerPage);
  const totalRevenue=filtered.reduce((s,a)=>s+Number(a.total_price||0),0);
  if(loading)return<div className="loading">Loading appointments...</div>;
  return(
    <div className="page-container">
      <div className="page-header"><h1>Appointments</h1><p>Manage your bookings</p></div>

      {/* DEF_004: search + filter bar */}
      <div className="svc-controls" style={{marginBottom:'1.25rem'}}>
        <div className="svc-search-wrap" style={{flex:2}}>
          <span className="svc-search-icon">🔍</span>
          <input
            className="svc-search"
            placeholder="Search by customer, salon, service or staff..."
            value={apptSearch}
            onChange={e=>{setApptSearch(e.target.value);setCurrentPage(1);}}
          />
          {apptSearch && <button className="svc-search-clear" onClick={()=>{setApptSearch('');setCurrentPage(1);}}>✕</button>}
        </div>
        <div className="svc-filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setCurrentPage(1);}}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            
          </select>
        </div>
        {(apptSearch || statusFilter !== 'all') && (
          <button className="svc-clear-btn" onClick={()=>{setApptSearch('');setStatusFilter('all');setCurrentPage(1);}}>✕ Clear</button>
        )}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'1rem',color:'var(--text-gray)',fontSize:'0.9rem'}}>
          <span>Total: <strong style={{color:'var(--text-light)'}}>{filtered.length}</strong></span>
          <span>Revenue: <strong style={{color:'var(--primary)'}}>₹{totalRevenue}</strong></span>
        </div>
      </div>

      {filtered.length===0?<div className="empty-state"><h3>No Appointments Found</h3></div>:(
        <><div className="appointments-table"><table><thead><tr><th>Date</th><th>Customer</th><th>Salon</th><th>Staff</th><th>Service</th><th>Time</th><th>Price</th><th>Status</th><th>Delete</th></tr></thead><tbody>{paginated.map(appt=>(
          <tr key={appt.id}>
            <td>{formatDate(appt.appointment_date)}</td><td>{appt.customer_name}</td><td>{appt.salon_name}</td>
            <td>{appt.staff_id?(appt.staff_name||'Assigned'):(<select onChange={e=>assignStaff(appt.id,e.target.value)} defaultValue=""><option value="" disabled>Assign Staff</option>{staffMap[appt.salon_id]?.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}</select>)}</td>
            <td>{appt.service_name}</td><td>{formatTime(appt.start_time)} - {formatTime(appt.end_time)}</td><td>₹{appt.total_price}</td>
            {/* DEF_006: value is controlled by local state, onChange triggers immediate update */}
            <td>
              <select value={appt.status} onChange={e=>updateStatus(appt.id,e.target.value)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </td>
            <td><button className="btn-danger" onClick={()=>deleteAppointment(appt.id)}>Delete</button></td>
          </tr>
        ))}</tbody></table></div>
        <div className="pagination"><button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>◀ Prev</button><span>Page {currentPage} of {totalPages}</span><button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>Next ▶</button></div></>
      )}
    </div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  const [salons, setSalons]           = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [services, setServices]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [apiError, setApiError]       = useState('');

  // modals
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editService, setEditService]     = useState(null);
  const [viewService, setViewService]     = useState(null);
  const [deleteService, setDeleteService] = useState(null);

  // forms
  const [addForm, setAddForm]         = useState(EMPTY_SERVICE_FORM);
  const [addErrors, setAddErrors]     = useState({});
  const [addLoading, setAddLoading]   = useState(false);
  const [addSuccess, setAddSuccess]   = useState('');
  const [editForm, setEditForm]       = useState(EMPTY_SERVICE_FORM);
  const [editErrors, setEditErrors]   = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // filter / sort / page
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey]         = useState('name:asc');
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(9);

  // load salons
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/salons/owner`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.data.length > 0) { setSalons(data.data); setSelectedSalon(String(data.data[0].id)); }
        else setLoading(false);
      } catch { setApiError('Failed to load salons.'); setLoading(false); }
    };
    load();
  }, []);

  // load services when salon changes
  useEffect(() => { if (selectedSalon) fetchServices(selectedSalon); }, [selectedSalon]);

  const fetchServices = async (salonId) => {
    setLoading(true); setApiError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/salons/${salonId}/services`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setServices(data.data || []);
      else setApiError(data.message || 'Failed to load services.');
    } catch { setApiError('Server error. Please try again.'); }
    setLoading(false);
  };

  const validateSvcForm = (form) => {
    const e = {};
    if (!form.name.trim()) e.name = 'Service name is required.';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Enter a valid price (0 or more).';
    return e;
  };

  // add
  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = validateSvcForm(addForm); if (Object.keys(errs).length) { setAddErrors(errs); return; }
    setAddLoading(true); setAddErrors({});
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/salons/${selectedSalon}/services`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...addForm, price: Number(addForm.price), duration_minutes: Number(addForm.duration_minutes) }),
      });
      const data = await res.json();
      if (data.success) { setAddSuccess('Service added!'); setAddForm(EMPTY_SERVICE_FORM); fetchServices(selectedSalon); setTimeout(() => { setAddSuccess(''); setShowAddModal(false); }, 1200); }
      else setAddErrors({ api: data.message || 'Failed to add.' });
    } catch { setAddErrors({ api: 'Server error.' }); }
    setAddLoading(false);
  };

  // open edit
  const openEdit = (svc) => {
    setEditService(svc);
    setEditForm({ name: svc.name||'', description: svc.description||'', price: String(svc.price||''), duration_minutes: String(svc.duration_minutes||'30'), category: svc.category||'Hair Styling', is_active: svc.is_active!==false });
    setEditErrors({}); setEditSuccess(''); setViewService(null);
  };

  // save edit
  const handleEdit = async (e) => {
    e.preventDefault();
    const errs = validateSvcForm(editForm); if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditLoading(true); setEditErrors({});
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/services/${editService.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, price: Number(editForm.price), duration_minutes: Number(editForm.duration_minutes) }),
      });
      const data = await res.json();
      if (data.success) { setEditSuccess('Updated!'); fetchServices(selectedSalon); setTimeout(() => { setEditSuccess(''); setEditService(null); }, 1200); }
      else setEditErrors({ api: data.message || 'Update failed.' });
    } catch { setEditErrors({ api: 'Server error.' }); }
    setEditLoading(false);
  };

  // delete
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/services/${deleteService.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setDeleteService(null); fetchServices(selectedSalon); }
      else alert(data.message || 'Delete failed.');
    } catch { alert('Server error.'); }
    setDeleteLoading(false);
  };

  // quick status toggle
  const toggleStatus = async (svc) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/services/${svc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ is_active: !svc.is_active }) });
      fetchServices(selectedSalon);
    } catch {}
  };

  // filter / sort / paginate
  const filtered = useMemo(() => {
    let data = [...services];
    if (search) { const q = search.toLowerCase(); data = data.filter(s => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)); }
    if (catFilter !== 'all') data = data.filter(s => s.category === catFilter);
    if (statusFilter !== 'all') data = data.filter(s => String(s.is_active) === statusFilter);
    const [field, dir] = sortKey.split(':');
    data.sort((a, b) => {
      let av = a[field] ?? '', bv = b[field] ?? '';
      if (field === 'price' || field === 'duration_minutes') { av = Number(av); bv = Number(bv); } else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [services, search, catFilter, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const hasFilters = search || catFilter !== 'all' || statusFilter !== 'all';
  const stats = useMemo(() => ({ total: services.length, active: services.filter(s=>s.is_active).length, inactive: services.filter(s=>!s.is_active).length, avgPrice: services.length ? (services.reduce((s,x)=>s+Number(x.price||0),0)/services.length).toFixed(0) : 0 }), [services]);

  // shared form fields
  const SvcFormFields = ({ form, onChange, errors }) => (
    <>
      <div className="form-group">
        <label>Service Name *</label>
        <input placeholder="e.g. Classic Haircut" value={form.name} onChange={e=>onChange('name',e.target.value)} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>Category *</label>
        <select value={form.category} onChange={e=>onChange('category',e.target.value)}>
          {SERVICE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Price (₹) *</label>
          <input type="number" min="0" placeholder="e.g. 500" value={form.price} onChange={e=>onChange('price',e.target.value)} />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label>Duration *</label>
          <select value={form.duration_minutes} onChange={e=>onChange('duration_minutes',e.target.value)}>
            {DURATION_OPTIONS.map(d=><option key={d} value={d}>{fmtDuration(d)}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea rows={3} placeholder="Brief description..." value={form.description} onChange={e=>onChange('description',e.target.value)} style={{resize:'vertical'}} />
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginTop:'0.5rem'}}>
        <label className="svc-toggle">
          <input type="checkbox" checked={form.is_active} onChange={e=>onChange('is_active',e.target.checked)} />
          <span className="svc-toggle-slider" />
        </label>
        <span style={{color: form.is_active ? 'var(--success)' : 'var(--text-gray)', fontWeight:500}}>
          {form.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Services</h1><p>Manage the services offered at your salon</p></div>
        <button className="btn-primary" disabled={!selectedSalon}
          onClick={()=>{setShowAddModal(true);setAddForm(EMPTY_SERVICE_FORM);setAddErrors({});setAddSuccess('');}}>
          + Add Service
        </button>
      </div>

      {apiError && <div className="error-message">{apiError}</div>}

      {salons.length > 1 && (
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{color:'var(--text-gray)',marginRight:'0.75rem',fontSize:'0.9rem'}}>Salon:</label>
          <select value={selectedSalon} onChange={e=>{setSelectedSalon(e.target.value);setPage(1);}}>
            {salons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {salons.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">✂️</div>
          <h3>No Salons Found</h3>
          <p>Add a salon first before managing services.</p>
          <Link to="/add-salon" className="btn-primary">Add Salon</Link>
        </div>
      )}

      {selectedSalon && (<>
        <div className="svc-stats-strip">
          {[{label:'Total',value:stats.total,icon:'🗂️'},{label:'Active',value:stats.active,icon:'✅'},{label:'Inactive',value:stats.inactive,icon:'⏸️'},{label:'Avg Price',value:`₹${stats.avgPrice}`,icon:'💰'}].map(s=>(
            <div className="svc-stat-card" key={s.label}>
              <span className="svc-stat-icon">{s.icon}</span>
              <div><div className="svc-stat-value">{s.value}</div><div className="svc-stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        <div className="svc-controls">
          <div className="svc-search-wrap">
            <span className="svc-search-icon">🔍</span>
            <input className="svc-search" placeholder="Search services..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            {search && <button className="svc-search-clear" onClick={()=>{setSearch('');setPage(1);}}>✕</button>}
          </div>
          <div className="svc-filter-group">
            <label>Category</label>
            <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}}>
              <option value="all">All Categories</option>
              {SERVICE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="svc-filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="all">All</option><option value="true">Active</option><option value="false">Inactive</option>
            </select>
          </div>
          <div className="svc-filter-group">
            <label>Sort By</label>
            <select value={sortKey} onChange={e=>{setSortKey(e.target.value);setPage(1);}}>
              <option value="name:asc">Name A–Z</option>
              <option value="name:desc">Name Z–A</option>
              <option value="price:asc">Price Low–High</option>
              <option value="price:desc">Price High–Low</option>
              <option value="duration_minutes:asc">Duration Short–Long</option>
              <option value="duration_minutes:desc">Duration Long–Short</option>
            </select>
          </div>
          {hasFilters && <button className="svc-clear-btn" onClick={()=>{setSearch('');setCatFilter('all');setStatusFilter('all');setPage(1);}}>✕ Clear</button>}
          <div className="svc-filter-group" style={{marginLeft:'auto'}}>
            <label>Show</label>
            <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}>
              {[6,9,12,18].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="svc-results-count">
          Showing <strong>{filtered.length===0?0:(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)}</strong> of <strong>{filtered.length}</strong> services
          {hasFilters && ` (filtered from ${services.length})`}
        </div>

        {loading ? <div className="loading">⏳ Loading services...</div>
        : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No services found</h3>
            <p>{hasFilters ? 'Try adjusting your filters.' : 'Add your first service to get started.'}</p>
            {hasFilters ? <button className="btn-secondary" onClick={()=>{setSearch('');setCatFilter('all');setStatusFilter('all');setPage(1);}}>Clear Filters</button> : <button className="btn-primary" onClick={()=>setShowAddModal(true)}>+ Add Service</button>}
          </div>
        ) : (
          <div className="svc-grid">
            {paginated.map(svc => (
              <div className={`svc-card ${svc.is_active ? '' : 'svc-card-inactive'}`} key={svc.id}>
                <div className="svc-card-top">
                  <span className="svc-cat-icon-lg">{categoryIcon(svc.category)}</span>
                  <div className="svc-card-badges">
                    <span className="svc-badge svc-badge-cat">{svc.category || 'Other'}</span>
                    <button className={`svc-status-pill ${svc.is_active ? 'pill-active' : 'pill-inactive'}`} title="Click to toggle" onClick={()=>toggleStatus(svc)}>
                      {svc.is_active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>
                </div>
                <h3 className="svc-card-name">{svc.name}</h3>
                {svc.description && <p className="svc-card-desc">{svc.description}</p>}
                <div className="svc-card-meta">
                  <span className="svc-price">₹{Number(svc.price).toFixed(2)}</span>
                  <span className="svc-duration">⏱ {fmtDuration(svc.duration_minutes)}</span>
                </div>
                <div className="staff-actions">
                  <button className="btn-edit" onClick={()=>setViewService(svc)}>👁 View</button>
                  <button className="btn-edit" onClick={()=>openEdit(svc)}>✏️ Edit</button>
                  <button className="btn-danger" onClick={()=>setDeleteService(svc)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="svc-pagination">
            <button disabled={page===1} onClick={()=>setPage(1)}>«</button>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=2)
              .reduce((acc,p,i,arr)=>{if(i>0&&p-arr[i-1]>1)acc.push('…');acc.push(p);return acc;},[])
              .map((p,i)=>p==='…'?<span key={`e${i}`} className="svc-page-ellipsis">…</span>:<button key={p} className={p===page?'svc-page-active':''} onClick={()=>setPage(p)}>{p}</button>)}
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
            <button disabled={page===totalPages} onClick={()=>setPage(totalPages)}>»</button>
          </div>
        )}
      </>)}

      {showAddModal && (
        <div className="modal-overlay" onClick={()=>setShowAddModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>➕ Add New Service</h2><button className="modal-close" onClick={()=>setShowAddModal(false)}>✕</button></div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                {addSuccess && <div className="success-message">✅ {addSuccess}</div>}
                {addErrors.api && <div className="error-message">{addErrors.api}</div>}
                <SvcFormFields form={addForm} onChange={(k,v)=>setAddForm(f=>({...f,[k]:v}))} errors={addErrors} />
              </div>
              <div className="modal-footer"><button type="button" className="btn-secondary" onClick={()=>setShowAddModal(false)}>Cancel</button><button type="submit" className="btn-primary" disabled={addLoading}>{addLoading?'Saving…':'➕ Add Service'}</button></div>
            </form>
          </div>
        </div>
      )}

      {editService && (
        <div className="modal-overlay" onClick={()=>setEditService(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>✏️ Edit — {editService.name}</h2><button className="modal-close" onClick={()=>setEditService(null)}>✕</button></div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                {editSuccess && <div className="success-message">✅ {editSuccess}</div>}
                {editErrors.api && <div className="error-message">{editErrors.api}</div>}
                <SvcFormFields form={editForm} onChange={(k,v)=>setEditForm(f=>({...f,[k]:v}))} errors={editErrors} />
              </div>
              <div className="modal-footer"><button type="button" className="btn-secondary" onClick={()=>setEditService(null)}>Cancel</button><button type="submit" className="btn-primary" disabled={editLoading}>{editLoading?'Saving…':'💾 Save Changes'}</button></div>
            </form>
          </div>
        </div>
      )}

      {viewService && (
        <div className="modal-overlay" onClick={()=>setViewService(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Service Details</h2><button className="modal-close" onClick={()=>setViewService(null)}>✕</button></div>
            <div className="modal-body">
              <div className="svc-view-hero">
                <span className="svc-cat-icon">{categoryIcon(viewService.category)}</span>
                <div><h3 style={{margin:0,fontSize:'1.2rem'}}>{viewService.name}</h3><span className="svc-badge svc-badge-cat">{viewService.category||'Other'}</span></div>
                <span className={`svc-status-pill ${viewService.is_active?'pill-active':'pill-inactive'}`}>{viewService.is_active?'● Active':'○ Inactive'}</span>
              </div>
              <div className="detail-section"><h4>Pricing & Duration</h4><p><strong>Price:</strong> ₹{Number(viewService.price).toFixed(2)}</p><p><strong>Duration:</strong> {fmtDuration(viewService.duration_minutes)}</p></div>
              {viewService.description && <div className="detail-section"><h4>Description</h4><p>{viewService.description}</p></div>}
              <div className="detail-section"><h4>Metadata</h4>
                <p><strong>Created:</strong> {viewService.created_at?new Date(viewService.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</p>
                <p><strong>Updated:</strong> {viewService.updated_at?new Date(viewService.updated_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</p>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={()=>setViewService(null)}>Close</button><button className="btn-primary" onClick={()=>openEdit(viewService)}>✏️ Edit</button></div>
          </div>
        </div>
      )}

      {deleteService && (
        <div className="modal-overlay" onClick={()=>setDeleteService(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Service</h2><button className="modal-close" onClick={()=>setDeleteService(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{textAlign:'center',padding:'1rem 0'}}>
                <span style={{fontSize:'3rem'}}>⚠️</span>
                <p style={{marginTop:'1rem',fontSize:'1rem',color:'var(--text-light)',lineHeight:1.6}}>Are you sure you want to delete <strong>"{deleteService.name}"</strong>?</p>
                <p style={{color:'var(--text-gray)',fontSize:'0.9rem'}}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={()=>setDeleteService(null)}>Cancel</button><button className="btn-primary" style={{background:'var(--danger)'}} onClick={handleDelete} disabled={deleteLoading}>{deleteLoading?'Deleting…':'🗑 Yes, Delete'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Staff ────────────────────────────────────────────────────────────────────
// DEF_008: Prevent duplicate phone number across staff in same salon
function Staff() {
  const [staff, setStaff] = useState([]); const [salons, setSalons] = useState([]); const [selectedSalon, setSelectedSalon] = useState('');
  const [loading, setLoading] = useState(true); const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({first_name:'',last_name:'',phone:''}); const [fieldErrors, setFieldErrors] = useState({});
  const [editStaff, setEditStaff] = useState(null); const [editForm, setEditForm] = useState({first_name:'',last_name:'',phone:''});
  const [editErrors, setEditErrors] = useState({}); const [editError, setEditError] = useState(''); const [editSuccess, setEditSuccess] = useState(''); const [saving, setSaving] = useState(false);

  useEffect(()=>{fetchSalons();},[]);
  const fetchSalons=async()=>{try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/salons/owner`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success){setSalons(d.data);if(d.data.length>0){setSelectedSalon(d.data[0].id);fetchStaff(d.data[0].id);}}}catch(e){console.error(e);}setLoading(false);};
  const fetchStaff=async(id)=>{try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/staff/salon/${id}`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success)setStaff(d.data);}catch(e){console.error(e);}};
  const handleSalonChange=(e)=>{setSelectedSalon(e.target.value);fetchStaff(e.target.value);};
  const handleChange=(e)=>{
    // DEF: digits only, max 10 for phone
    if(e.target.name==='phone'){
      const digits=e.target.value.replace(/\D/g,'').slice(0,10);
      setFormData({...formData,phone:digits});
    } else {
      setFormData({...formData,[e.target.name]:e.target.value});
    }
  };
  const handleNameKeyDown=(e)=>{ if(/\d/.test(e.key)) e.preventDefault(); };

  const validateStaffForm=(data, excludeId=null)=>{
    const e={};
    const fn=validateName(data.first_name,'First name');
    const ln=validateName(data.last_name,'Last name');
    const ph=validatePhone(data.phone);
    if(fn)e.first_name=fn;
    if(ln)e.last_name=ln;
    if(ph)e.phone=ph;
    // DEF_008: check for duplicate phone in same salon
    if(!ph){
      const duplicate = staff.find(m => m.phone === data.phone && m.id !== excludeId);
      if(duplicate) e.phone = `Phone number already assigned to ${duplicate.first_name} ${duplicate.last_name}`;
    }
    return e;
  };

  const handleAddStaff=async(e)=>{
    e.preventDefault();
    const errs=validateStaffForm(formData);
    if(Object.keys(errs).length){setFieldErrors(errs);return;}
    setFieldErrors({});
    try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/staff`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({...formData,salon_id:selectedSalon})});const d=await r.json();if(d.success){setFormData({first_name:'',last_name:'',phone:''});setShowForm(false);fetchStaff(selectedSalon);}}catch(e){console.error(e);}
  };

  const handleDelete=async(id)=>{if(!window.confirm('Are you sure you want to delete this staff member?'))return;try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/staff/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success)fetchStaff(selectedSalon);}catch(e){console.error(e);}};
  const openEdit=(m)=>{setEditStaff(m);setEditForm({first_name:m.first_name,last_name:m.last_name,phone:m.phone||''});setEditErrors({});setEditError('');setEditSuccess('');};
  const closeEdit=()=>{setEditStaff(null);setEditForm({first_name:'',last_name:'',phone:''});};
  const handleEditChange=(e)=>{
    if(e.target.name==='phone'){
      const digits=e.target.value.replace(/\D/g,'').slice(0,10);
      setEditForm(p=>({...p,phone:digits}));
    } else {
      setEditForm(p=>({...p,[e.target.name]:e.target.value}));
    }
  };
  const handleEditSubmit=async(e)=>{
    e.preventDefault();setEditError('');setEditSuccess('');
    const errs=validateStaffForm(editForm, editStaff.id);
    if(Object.keys(errs).length){setEditErrors(errs);return;}
    setEditErrors({});setSaving(true);
    try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/staff/${editStaff.id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(editForm)});const d=await r.json();if(d.success){setEditSuccess('Staff updated successfully!');fetchStaff(selectedSalon);setTimeout(()=>closeEdit(),1500);}else setEditError(d.message||'Failed to update staff');}catch{setEditError('Connection error.');}setSaving(false);
  };

  const fe=fieldErrors; const ee=editErrors;
  return(
    <div className="page-container">
      <div className="page-header"><h1>Staff</h1><p>Manage your staff members</p></div>
      {salons.length>0&&<select value={selectedSalon} onChange={handleSalonChange} className="salon-select">{salons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}
      <div style={{margin:'20px 0'}}><button className="btn-primary" onClick={()=>{setShowForm(!showForm);setFieldErrors({});}}>{showForm?'Cancel':'➕ Add Staff'}</button></div>
      {showForm&&(
        <form onSubmit={handleAddStaff} className="staff-form" noValidate>
          <div>
            {/* DEF: block digit key presses in name fields */}
            <input type="text" name="first_name" placeholder="First Name (letters only)" value={formData.first_name} onChange={handleChange} onKeyDown={handleNameKeyDown}/>
            {fe.first_name&&<span className="field-error">{fe.first_name}</span>}
          </div>
          <div>
            <input type="text" name="last_name" placeholder="Last Name (letters only)" value={formData.last_name} onChange={handleChange} onKeyDown={handleNameKeyDown}/>
            {fe.last_name&&<span className="field-error">{fe.last_name}</span>}
          </div>
          <div>
            {/* DEF: digits only, max 10; DEF_008: duplicate check */}
            <input type="tel" name="phone" placeholder="Phone Number (10 digits)" value={formData.phone} onChange={handleChange} maxLength={10} inputMode="numeric" pattern="\d*"/>
            {fe.phone&&<span className="field-error">{fe.phone}</span>}
          </div>
          <button type="submit" className="btn-success">Save Staff</button>
        </form>
      )}
      {loading?<div className="loading">Loading staff...</div>:staff.length===0?<div className="empty-state"><h3>No Staff Found</h3><p>Add staff members to this salon</p></div>:(
        <div className="salons-grid">{staff.map(m=>(
          <div key={m.id} className="salon-card">
            <div className="salon-header"><h3>{m.first_name} {m.last_name}</h3><span className="salon-status active">Active</span></div>
            <div className="salon-details"><p><span className="icon">📞</span> <strong>Phone:</strong> {m.phone||'N/A'}</p></div>
            <div className="staff-actions"><button className="btn-edit" onClick={()=>openEdit(m)}>✏️ Edit</button><button className="btn-danger" onClick={()=>handleDelete(m.id)}>🗑️ Delete</button></div>
          </div>
        ))}</div>
      )}
      {editStaff&&(
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>✏️ Edit Staff</h2><button className="modal-close" onClick={closeEdit}>✕</button></div>
            <div className="modal-body">
              {editError&&<div className="error-message">{editError}</div>}
              {editSuccess&&<div className="success-message">✓ {editSuccess}</div>}
              <form onSubmit={handleEditSubmit} noValidate>
                <div className="form-section">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="first_name" value={editForm.first_name} onChange={handleEditChange} onKeyDown={e=>{ if(/\d/.test(e.key)) e.preventDefault(); }}/>
                    {ee.first_name&&<span className="field-error">{ee.first_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="last_name" value={editForm.last_name} onChange={handleEditChange} onKeyDown={e=>{ if(/\d/.test(e.key)) e.preventDefault(); }}/>
                    {ee.last_name&&<span className="field-error">{ee.last_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone * (10 digits)</label>
                    <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} maxLength={10} inputMode="numeric" pattern="\d*"/>
                    {ee.phone&&<span className="field-error">{ee.phone}</span>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={closeEdit}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
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
  return (<div className="page-container"><div className="page-header"><h1>Analytics</h1><p>View your business insights</p></div><div className="coming-soon"><h3>🚧 Coming Soon</h3><p>Analytics and reporting features will be available here</p></div></div>);
}

// ─── Profile ──────────────────────────────────────────────────────────────────
// DEF_22: Added Gallery tab for uploading owner/salon images
function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('info'); const [copied, setCopied] = useState(false);
  const [currentPwd, setCurrentPwd] = useState(''); const [newPwd, setNewPwd] = useState(''); const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false); const [showNewPwd, setShowNewPwd] = useState(false); const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({}); const [pwdSuccess, setPwdSuccess] = useState(''); const [pwdError, setPwdError] = useState(''); const [saving, setSaving] = useState(false);

  // DEF_22: Gallery state
  const [gallery, setGallery] = useState([]); const [galleryError, setGalleryError] = useState(''); const [uploading, setUploading] = useState(false);

  const userId = user.id || 'usr_' + (user.email||'').replace(/[^a-z0-9]/gi,'').slice(0,12);
  const handleCopyId=()=>{navigator.clipboard?.writeText(userId).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const getPwdStrength=(pwd)=>{if(!pwd)return 0;let s=0;if(pwd.length>=6)s++;if(/[A-Z]/.test(pwd))s++;if(/\d/.test(pwd))s++;if(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd))s++;return s;};
  const strength=getPwdStrength(newPwd);
  const strengthLabels=['','Weak','Fair','Good','Strong']; const strengthColors=['','#e74c3c','#e67e22','#f1c40f','#27ae60'];
  const validatePwdForm=()=>{const e={};if(!currentPwd)e.currentPwd='Current password is required';const np=validatePassword(newPwd);if(np)e.newPwd=np;if(!confirmPwd)e.confirmPwd='Please confirm your new password';else if(newPwd!==confirmPwd)e.confirmPwd='Passwords do not match';return e;};
  const handlePasswordSubmit=async(e)=>{e.preventDefault();setPwdError('');setPwdSuccess('');const errs=validatePwdForm();if(Object.keys(errs).length){setPwdErrors(errs);return;}setPwdErrors({});setSaving(true);try{const token=localStorage.getItem('token');const r=await fetch(`${API_URL}/auth/change-password`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({currentPassword:currentPwd,newPassword:newPwd})});const d=await r.json();if(d.success){setPwdSuccess('Password updated successfully!');setCurrentPwd('');setNewPwd('');setConfirmPwd('');setTimeout(()=>setPwdSuccess(''),4000);}else setPwdError(d.message||'Failed to update password');}catch{setPwdError('Connection error.');}setSaving(false);};
  const handleCancelPwd=()=>{setCurrentPwd('');setNewPwd('');setConfirmPwd('');setPwdErrors({});setPwdError('');setPwdSuccess('');};

  // DEF_22: Gallery handlers
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setGalleryError('');
    const allowedTypes = ['image/jpeg','image/png','image/webp','image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalid = files.find(f => !allowedTypes.includes(f.type));
    if (invalid) { setGalleryError('Only JPG, PNG, WEBP or GIF images are allowed.'); return; }
    const tooBig = files.find(f => f.size > maxSize);
    if (tooBig) { setGalleryError('Each image must be under 5MB.'); return; }
    setUploading(true);
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: Date.now() + Math.random(), name: file.name, src: reader.result, size: file.size, type: file.type });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(imgs => {
      setGallery(prev => [...prev, ...imgs]);
      setUploading(false);
    });
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleGalleryDelete = (id) => {
    setGallery(prev => prev.filter(img => img.id !== id));
  };

  const pe=pwdErrors;
  return(
    <div className="page-container">
      <div className="page-header"><h1>Profile Settings</h1><p>Manage your account information and security</p></div>
      <div className="profile-banner"><div className="profile-banner-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div><div className="profile-banner-info"><h2>{user.firstName} {user.lastName}</h2><p>{user.email}</p></div><span className="profile-owner-badge">⭐ Owner</span></div>
      {/* DEF_22: Added Gallery tab */}
      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab==='info'?'active':''}`} onClick={()=>setActiveTab('info')}>Account Info</button>
        <button className={`profile-tab ${activeTab==='password'?'active':''}`} onClick={()=>setActiveTab('password')}>Change Password</button>
        <button className={`profile-tab ${activeTab==='gallery'?'active':''}`} onClick={()=>setActiveTab('gallery')}>🖼️ Gallery</button>
        <button className={`profile-tab ${activeTab==='userid'?'active':''}`} onClick={()=>setActiveTab('userid')}>User ID</button>
      </div>

      {activeTab==='info'&&(<div className="profile-card"><h3>Account Information</h3><div className="profile-info-grid"><div className="profile-info-item"><label>First Name</label><div className="profile-info-value">{user.firstName}</div></div><div className="profile-info-item"><label>Last Name</label><div className="profile-info-value">{user.lastName}</div></div><div className="profile-info-item profile-info-full"><label>Email Address</label><div className="profile-info-value">{user.email}</div></div><div className="profile-info-item"><label>Role</label><div className="profile-info-value"><span className="profile-role-badge">{user.role}</span></div></div>{user.phone&&<div className="profile-info-item"><label>Phone</label><div className="profile-info-value">{user.phone}</div></div>}</div></div>)}

      {activeTab==='password'&&(<div className="profile-card"><h3>Change Password</h3><p className="profile-card-subtitle">Password must be at least 6 characters, include 1 uppercase letter and 1 special character.</p>{pwdError&&<div className="error-message">{pwdError}</div>}{pwdSuccess&&<div className="success-message">✓ {pwdSuccess}</div>}<form onSubmit={handlePasswordSubmit} noValidate className="profile-pwd-form"><div className="form-group"><label>Current Password *</label><div className="profile-input-wrap"><input type={showCurrentPwd?'text':'password'} placeholder="Enter your current password" value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)}/><button type="button" className="profile-eye-btn" onClick={()=>setShowCurrentPwd(v=>!v)}>{showCurrentPwd?'🙈':'👁️'}</button></div>{pe.currentPwd&&<span className="field-error">{pe.currentPwd}</span>}</div><div className="form-row"><div className="form-group"><label>New Password *</label><div className="profile-input-wrap"><input type={showNewPwd?'text':'password'} placeholder="Min. 6 chars, 1 uppercase, 1 special" value={newPwd} onChange={e=>setNewPwd(e.target.value)}/><button type="button" className="profile-eye-btn" onClick={()=>setShowNewPwd(v=>!v)}>{showNewPwd?'🙈':'👁️'}</button></div>{pe.newPwd&&<span className="field-error">{pe.newPwd}</span>}{newPwd&&<div className="profile-strength-wrap"><div className="profile-strength-bars">{[1,2,3,4].map(i=><div key={i} className="profile-strength-bar" style={{background:i<=strength?strengthColors[strength]:'#e0e0e0'}}/>)}</div><span className="profile-strength-label" style={{color:strengthColors[strength]}}>{strengthLabels[strength]}</span></div>}</div><div className="form-group"><label>Confirm New Password *</label><div className="profile-input-wrap"><input type={showConfirmPwd?'text':'password'} placeholder="Repeat new password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} style={confirmPwd&&newPwd!==confirmPwd?{borderColor:'#e74c3c'}:{}}/><button type="button" className="profile-eye-btn" onClick={()=>setShowConfirmPwd(v=>!v)}>{showConfirmPwd?'🙈':'👁️'}</button></div>{pe.confirmPwd&&<span className="field-error">{pe.confirmPwd}</span>}{confirmPwd&&!pe.confirmPwd&&newPwd===confirmPwd&&<span className="profile-match-ok">✓ Passwords match</span>}</div></div><div className="form-actions"><button type="button" className="btn-secondary" onClick={handleCancelPwd}>Cancel</button><button type="submit" className="btn-primary" disabled={saving}>{saving?'Updating...':'Update Password'}</button></div></form></div>)}

      {/* DEF_22: Gallery tab content */}
      {activeTab==='gallery'&&(
        <div className="profile-card">
          <h3>Gallery</h3>
          <p className="profile-card-subtitle">Upload images for your salon profile. Supported formats: JPG, PNG, WEBP, GIF (max 5MB each).</p>
          {galleryError && <div className="error-message">{galleryError}</div>}
          <div className="gallery-upload-area">
            <label className="gallery-upload-label" htmlFor="gallery-file-input">
              <span className="gallery-upload-icon">📷</span>
              <span>{uploading ? 'Processing...' : 'Click to upload images'}</span>
              <span className="gallery-upload-hint">or drag & drop</span>
              <input
                id="gallery-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                style={{display:'none'}}
                onChange={handleGalleryUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {gallery.length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem',color:'var(--text-gray)',fontSize:'0.95rem'}}>
              No images uploaded yet. Add some photos to showcase your salon!
            </div>
          ) : (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'1rem 0 0.75rem'}}>
                <span style={{color:'var(--text-gray)',fontSize:'0.85rem'}}>{gallery.length} image{gallery.length!==1?'s':''} uploaded</span>
                <button className="svc-clear-btn" onClick={()=>setGallery([])}>🗑 Clear All</button>
              </div>
              <div className="gallery-grid">
                {gallery.map(img=>(
                  <div className="gallery-item" key={img.id}>
                    <img src={img.src} alt={img.name} className="gallery-img" />
                    <div className="gallery-item-overlay">
                      <span className="gallery-item-name">{img.name}</span>
                      <button className="gallery-delete-btn" onClick={()=>handleGalleryDelete(img.id)} title="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab==='userid'&&(<div className="profile-card"><h3>User ID</h3><p className="profile-card-subtitle">Your unique identifier used across the SIZZER platform.</p><div className="profile-userid-box"><div className="profile-userid-label">Unique User ID</div><div className="profile-userid-value">{userId}</div><button className={`profile-copy-btn ${copied?'copied':''}`} onClick={handleCopyId}>{copied?'✓ Copied!':'📋 Copy ID'}</button></div><div className="profile-userid-note">⚠️ This ID is read-only and cannot be changed. Use it when contacting support.</div></div>)}
    </div>
  );
}

export default App;