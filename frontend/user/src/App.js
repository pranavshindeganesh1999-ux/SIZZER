import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router, Routes, Route, Link,
  useNavigate, useLocation, useParams,
} from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000/api";

// ── Service helpers ──────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  "All","Hair Styling","Hair Coloring","Beard & Shaving",
  "Nail Care","Skin Care","Spa & Massage","Makeup","Waxing","Other",
];
const categoryIcon = (cat) => ({
  "Hair Styling":"","Hair Coloring":"","Beard & Shaving":"",
  "Nail Care":"","Skin Care":"","Spa & Massage":"",
  "Makeup":"","Waxing":"","Other":"",
}[cat] || "");
const fmtDuration = (d) => {
  d = Number(d);
  if (!d) return "—";
  if (d < 60) return `${d} min`;
  return `${Math.floor(d/60)}h${d%60?` ${d%60}m`:""}`;
};

// =============================================
// THEME HOOK
// =============================================
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("sizzer-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sizzer-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));
  return { theme, toggleTheme };
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// =============================================
// NAVBAR
// =============================================
function Navbar({ user, onLogout, theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/" onClick={() => setMobileMenu(false)}>
            <div className="logo">
              <img src="/images/logo-icon.png" alt="SIZZER" className="logo-image" />
              <div className="logo-text"><span className="logo-main">SIZZER</span><span className="logo-sub">SALON BOOKING</span></div>
            </div>
          </Link>
        </div>
        <div className={`hamburger ${mobileMenu ? "active" : ""}`} onClick={() => setMobileMenu(!mobileMenu)}>
          <span /><span /><span />
        </div>
        <div className={`nav-links ${mobileMenu ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenu(false)}>HOME</Link>
          <Link to="/salons" className="nav-link" onClick={() => setMobileMenu(false)}>SALONS</Link>
          <Link to="/services" className="nav-link" onClick={() => setMobileMenu(false)}>SERVICES</Link>
          <Link to="/about" className="nav-link" onClick={() => setMobileMenu(false)}>ABOUT</Link>
          <Link to="/gallery" className="nav-link" onClick={() => setMobileMenu(false)}>GALLERY</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMobileMenu(false)}>CONTACT</Link>
          {user ? (
            <>
              <Link to="/my-appointments" className="nav-link" onClick={() => setMobileMenu(false)}>BOOKINGS</Link>
              <Link to="/profile" className="nav-link" onClick={() => setMobileMenu(false)}>PROFILE</Link>
              <button className="btn-primary" onClick={() => { onLogout(); setMobileMenu(false); }}>LOGOUT</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" onClick={() => setMobileMenu(false)}>BOOK NOW</Link>
          )}
          <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Light Mode" : "Dark Mode"} aria-label="Toggle theme">
            <span className="theme-toggle-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// =============================================
// HOME
// =============================================
function Home() {
  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <div className="decorative-line"></div>
              <h1 className="hero-title">PREMIUM<span className="gold-text"> SALON</span><br />EXPERIENCE</h1>
              <p className="hero-subtitle">Book with SIZZER - Where Style Meets Excellence</p>
              <div className="hero-buttons">
                <Link to="/salons" className="btn-primary-large">FIND SALONS<span className="arrow">→</span></Link>
                <Link to="/services" className="btn-outline-large">EXPLORE SERVICES</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator"><span>SCROLL</span><div className="scroll-line"></div></div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-number">500+</div><div className="stat-label">Expert Salons</div></div>
            <div className="stat-item"><div className="stat-number">10K+</div><div className="stat-label">Happy Clients</div></div>
            <div className="stat-item"><div className="stat-number">15+</div><div className="stat-label">Years Experience</div></div>
            <div className="stat-item"><div className="stat-number">4.9★</div><div className="stat-label">Rating</div></div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <div className="image-frame">
                <div className="image-placeholder">
                  <img src="/images/Salon-Interior.jpg" alt="Salon Interior" className="placeholder-icon" />
                </div>
                <div className="image-border"></div>
              </div>
            </div>
            <div className="about-content">
              <div className="section-label">ABOUT US</div>
              <h2 className="section-title">YOUR TRUSTED<span className="gold-text"> SALON BOOKING</span><br />PLATFORM</h2>
              <p className="section-description">We connect you with the finest salons and expert stylists in your area. Our platform offers seamless booking, verified reviews, and exceptional service.</p>
              <ul className="features-list">
                <li><span className="check-icon">✓</span>Expert & Certified Stylists</li>
                <li><span className="check-icon">✓</span>Premium Quality Products</li>
                <li><span className="check-icon">✓</span>Convenient Online Booking</li>
                <li><span className="check-icon">✓</span>Verified Customer Reviews</li>
              </ul>
              <Link to="/salons" className="btn-primary">EXPLORE SALONS</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label">OUR SERVICES</div>
            <h2 className="section-title">WHAT WE<span className="gold-text"> OFFER</span></h2>
          </div>
          <div className="services-grid">
            {[
              {icon:"💇",title:"HAIR STYLING",desc:"Expert cuts, coloring, and styling by professional hairstylists"},
              {icon:"🧔",title:"BEARD GROOMING",desc:"Precision beard trims and grooming for the modern gentleman"},
              {icon:"💅",title:"NAIL CARE",desc:"Manicures, pedicures, and creative nail art designs"},
              {icon:"💆",title:"SPA TREATMENTS",desc:"Relaxing massages and rejuvenating spa therapies"},
              {icon:"💄",title:"MAKEUP",desc:"Professional makeup for events, weddings, and photoshoots"},
              {icon:"🌟",title:"SKIN CARE",desc:"Facials, treatments, and personalized skin care routines"},
            ].map((s,i) => (
              <div className="service-card" key={i} style={{"--index":i}}>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"3rem"}}>
            <Link to="/services" className="btn-primary-large">VIEW ALL SERVICES<span className="arrow">→</span></Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-overlay"></div>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">READY FOR A NEW LOOK?</h2>
            <p className="cta-subtitle">Book your appointment today and experience premium salon services</p>
            <Link to="/salons" className="btn-primary-large">BOOK NOW<span className="arrow">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// =============================================
// SERVICES PAGE  (user-facing)
// =============================================
function ServicesPage({ user }) {
  const navigate = useNavigate();

  const [salons, setSalons]     = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState("All");
  const [salonFilter, setSalonFilter] = useState("all");
  const [sortKey, setSortKey]         = useState("name:asc");
  const [page, setPage]               = useState(1);
  const PER_PAGE                      = 9;

  const [viewService, setViewService] = useState(null);
  const [bookService, setBookService] = useState(null);
  const [bookDate, setBookDate]       = useState("");
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState("");
  const [bookError, setBookError]     = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true); setApiError("");
      try {
        const res  = await fetch(`${API_URL}/salons?limit=100`);
        const data = await res.json();
        if (!data.success) throw new Error();
        const salonList = data.data || [];
        setSalons(salonList);

        const results = await Promise.all(
          salonList.map(async (s) => {
            try {
              const r = await fetch(`${API_URL}/salons/${s.id}/services`);
              const d = await r.json();
              return (d.success ? d.data || [] : [])
                .filter(sv => sv.is_active !== false)
                .map(sv => ({ ...sv, salon_id: s.id, salon_name: s.name, salon_city: s.city }));
            } catch { return []; }
          })
        );
        setServices(results.flat());
      } catch { setApiError("Failed to load services. Please try again."); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = [...services];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.salon_name?.toLowerCase().includes(q)
      );
    }
    if (catFilter !== "All") data = data.filter(s => s.category === catFilter);
    if (salonFilter !== "all") data = data.filter(s => String(s.salon_id) === salonFilter);

    const [field, dir] = sortKey.split(":");
    data.sort((a, b) => {
      let av = a[field] ?? "", bv = b[field] ?? "";
      if (field === "price" || field === "duration_minutes") { av = Number(av); bv = Number(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      return dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [services, search, catFilter, salonFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilters = search || catFilter !== "All" || salonFilter !== "all";

  const stats = useMemo(() => {
    const cats   = [...new Set(services.map(s => s.category).filter(Boolean))];
    const prices = services.map(s => Number(s.price || 0));
    return {
      total: services.length,
      categories: cats.length,
      minPrice: prices.length ? Math.min(...prices) : 0,
      salonCount: salons.length,
    };
  }, [services, salons]);

  const openBook = (svc) => {
    if (!user) { navigate("/login"); return; }
    setBookService(svc);
    setBookDate(""); setBookSuccess(""); setBookError("");
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookDate) { setBookError("Please select a date."); return; }
    setBookLoading(true); setBookError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          salon_id: bookService.salon_id,
          service_id: bookService.id,
          appointment_date: bookDate,
          start_time: "09:00:00",
          end_time: "10:00:00",
          total_price: bookService.price,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookSuccess("✅ Appointment booked successfully!");
        setTimeout(() => { setBookService(null); navigate("/my-appointments"); }, 1800);
      } else setBookError(data.message || "Booking failed. Please try again.");
    } catch { setBookError("Connection error. Please try again."); }
    setBookLoading(false);
  };

  return (
    <div className="usr-svc-page">

      {/* HERO */}
      <section className="usr-svc-hero">
        <div className="usr-svc-hero-overlay" />
        <div className="container">
          <div className="decorative-line" />
          <h1 className="page-title">EXPLORE<span className="gold-text"> SERVICES</span></h1>
          <p className="page-subtitle">Discover premium treatments at top salons near you</p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="usr-svc-stats-section">
        <div className="container">
          <div className="usr-svc-stats-grid">
            {[
              {icon:"🗂️", value: loading?"—":stats.total,      label:"Total Services"},
              {icon:"🏷️", value: loading?"—":stats.categories, label:"Categories"},
              {icon:"💰", value: loading?"—":`₹${stats.minPrice}`, label:"Starting From"},
              {icon:"✂️", value: loading?"—":stats.salonCount, label:"Partner Salons"},
            ].map(s => (
              <div className="usr-svc-stat" key={s.label}>
                <span className="usr-svc-stat-icon">{s.icon}</span>
                <span className="usr-svc-stat-value">{s.value}</span>
                <span className="usr-svc-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <div className="usr-svc-cat-bar">
        <div className="container">
          <div className="usr-svc-cat-pills">
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`usr-svc-cat-pill ${catFilter === cat ? "active" : ""}`}
                onClick={() => { setCatFilter(cat); setPage(1); }}
              >
                {cat !== "All" && <span className="pill-emoji">{categoryIcon(cat)}</span>}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <section className="usr-svc-main">
        <div className="container">

          {/* Controls */}
          <div className="usr-svc-controls">
            <div className="usr-svc-search-wrap">
              <span>🔍</span>
              <input
                className="usr-svc-search"
                placeholder="Search services, salons, categories…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {search && <button className="usr-svc-x" onClick={() => { setSearch(""); setPage(1); }}>✕</button>}
            </div>

            <div className="usr-svc-filter-group">
              <label>Salon</label>
              <select value={salonFilter} onChange={e => { setSalonFilter(e.target.value); setPage(1); }}>
                <option value="all">All Salons</option>
                {salons.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
            </div>

            <div className="usr-svc-filter-group">
              <label>Sort By</label>
              <select value={sortKey} onChange={e => { setSortKey(e.target.value); setPage(1); }}>
                <option value="name:asc">Name A–Z</option>
                <option value="name:desc">Name Z–A</option>
                <option value="price:asc">Price Low–High</option>
                <option value="price:desc">Price High–Low</option>
                <option value="duration_minutes:asc">Quickest First</option>
                <option value="duration_minutes:desc">Longest First</option>
              </select>
            </div>

            {hasFilters && (
              <button className="usr-svc-clear" onClick={() => { setSearch(""); setCatFilter("All"); setSalonFilter("all"); setPage(1); }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Count */}
          {!loading && (
            <p className="usr-svc-count">
              Showing <strong>{filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> services
              {hasFilters && ` (filtered from ${services.length})`}
            </p>
          )}

          {apiError && <div className="error-dark" style={{marginBottom:"2rem"}}>{apiError}</div>}

          {loading && (
            <div className="loading-container"><div className="loader"></div><p>Loading services…</p></div>
          )}

          {!loading && paginated.length === 0 && (
            <div className="no-results">
              <span className="no-results-icon">💆</span>
              <h3>NO SERVICES FOUND</h3>
              <p>{hasFilters ? "Try adjusting your filters or search." : "No services available yet."}</p>
              {hasFilters && <button className="btn-primary" style={{marginTop:"1.5rem"}} onClick={() => { setSearch(""); setCatFilter("All"); setSalonFilter("all"); setPage(1); }}>CLEAR FILTERS</button>}
            </div>
          )}

          {/* Cards */}
          {!loading && paginated.length > 0 && (
            <div className="usr-svc-grid">
              {paginated.map((svc, idx) => (
                <div className="usr-svc-card" key={`${svc.id}-${svc.salon_id}`} style={{"--idx":idx}}>

                  <div className="usr-svc-card-top">
                    <div className="usr-svc-emoji-circle">{categoryIcon(svc.category)}</div>
                    <div className="usr-svc-tags">
                      <span className="usr-svc-cat-chip">{svc.category || "Other"}</span>
                      <span className="usr-svc-dur-chip">⏱ {fmtDuration(svc.duration_minutes)}</span>
                    </div>
                  </div>

                  <h3 className="usr-svc-name">{svc.name}</h3>

                  {svc.description && <p className="usr-svc-desc">{svc.description}</p>}

                  <div className="usr-svc-salon-row">
                    <span className="usr-svc-salon-icon">✂️</span>
                    <span className="usr-svc-salon-name">{svc.salon_name}</span>
                    {svc.salon_city && <span className="usr-svc-salon-city">· {svc.salon_city}</span>}
                  </div>

                  <div className="usr-svc-card-footer">
                    <div className="usr-svc-price-block">
                      <span className="usr-svc-price-from">from</span>
                      <span className="usr-svc-price">₹{Number(svc.price).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="usr-svc-actions">
                      <button className="usr-svc-btn-details" onClick={() => setViewService(svc)}>Details</button>
                      <button className="usr-svc-btn-book" onClick={() => openBook(svc)}>
                        {user ? "Book" : "Login"}<span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="usr-svc-pagination">
              <button disabled={page===1} onClick={()=>setPage(1)}>«</button>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              {Array.from({length:totalPages},(_,i)=>i+1)
                .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=2)
                .reduce((acc,p,i,arr)=>{if(i>0&&p-arr[i-1]>1)acc.push("…");acc.push(p);return acc;},[])
                .map((p,i)=>p==="…"
                  ?<span key={`e${i}`} className="usr-svc-ellipsis">…</span>
                  :<button key={p} className={p===page?"usr-svc-page-active":""} onClick={()=>setPage(p)}>{p}</button>
                )}
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
              <button disabled={page===totalPages} onClick={()=>setPage(totalPages)}>»</button>
            </div>
          )}
        </div>
      </section>

      {/* ── DETAIL MODAL ── */}
      {viewService && (
        <div className="usr-svc-overlay" onClick={()=>setViewService(null)}>
          <div className="usr-svc-modal" onClick={e=>e.stopPropagation()}>
            <button className="usr-svc-modal-close" onClick={()=>setViewService(null)}>✕</button>
            <div className="usr-svc-modal-head">
              <span className="usr-svc-modal-emoji">{categoryIcon(viewService.category)}</span>
              <div>
                <h2 className="usr-svc-modal-title">{viewService.name}</h2>
                <span className="usr-svc-cat-chip">{viewService.category||"Other"}</span>
              </div>
            </div>
            {viewService.description && <p className="usr-svc-modal-body">{viewService.description}</p>}
            <div className="usr-svc-modal-rows">
              {[
                {label:"💰 Price",    val:`₹${Number(viewService.price).toLocaleString("en-IN")}`},
                {label:"⏱ Duration", val:fmtDuration(viewService.duration_minutes)},
                {label:"✂️ Salon",   val:viewService.salon_name},
                ...(viewService.salon_city?[{label:"📍 Location",val:viewService.salon_city}]:[]),
              ].map(r=>(
                <div className="usr-svc-modal-row" key={r.label}>
                  <span className="usr-svc-modal-row-label">{r.label}</span>
                  <span className="usr-svc-modal-row-val">{r.val}</span>
                </div>
              ))}
            </div>
            <div className="usr-svc-modal-ftbtn">
              <button className="usr-svc-btn-cancel" onClick={()=>setViewService(null)}>Close</button>
              <button className="usr-svc-btn-book" onClick={()=>{setViewService(null);openBook(viewService);}}>
                {user?"Book Now →":"Login to Book →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOOK MODAL ── */}
      {bookService && (
        <div className="usr-svc-overlay" onClick={()=>setBookService(null)}>
          <div className="usr-svc-modal" onClick={e=>e.stopPropagation()}>
            <button className="usr-svc-modal-close" onClick={()=>setBookService(null)}>✕</button>
            <div className="usr-svc-modal-head">
              <span className="usr-svc-modal-emoji">{categoryIcon(bookService.category)}</span>
              <div>
                <h2 className="usr-svc-modal-title">Book — {bookService.name}</h2>
                <p style={{color:"var(--text-gray)",fontSize:"0.88rem",marginTop:"4px"}}>
                  {bookService.salon_name} · ₹{Number(bookService.price).toLocaleString("en-IN")} · {fmtDuration(bookService.duration_minutes)}
                </p>
              </div>
            </div>
            <form onSubmit={handleBook}>
              {bookSuccess && <div className="success-message" style={{margin:"1rem 0"}}>{bookSuccess}</div>}
              {bookError   && <div className="error-dark" style={{margin:"1rem 0"}}>{bookError}</div>}
              <div className="usr-svc-book-field">
                <label>Appointment Date *</label>
                <input type="date" min={today} value={bookDate} onChange={e=>setBookDate(e.target.value)} required />
              </div>
              <div className="usr-svc-book-summary">
                <span>⏱ Duration: <strong>{fmtDuration(bookService.duration_minutes)}</strong></span>
                <span>💰 Total: <strong>₹{Number(bookService.price).toLocaleString("en-IN")}</strong></span>
              </div>
              <div className="usr-svc-modal-ftbtn">
                <button type="button" className="usr-svc-btn-cancel" onClick={()=>setBookService(null)}>Cancel</button>
                <button type="submit" className="usr-svc-btn-book" disabled={bookLoading}>
                  {bookLoading ? "Booking…" : "Confirm Booking →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// SALONS LIST
// =============================================
function SalonsList() {
  const [salons, setSalons] = useState([]); const [filteredSalons, setFilteredSalons] = useState([]); const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState(""); const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const categories = ["all","Hair Salon","Barber Shop","Nail Salon","Spa"];
  useEffect(()=>{fetchSalons();},[]);
  useEffect(()=>{filterSalons();},[salons,searchCity,selectedCategory]);
  const fetchSalons = async()=>{setLoading(true);try{const r=await fetch(`${API_URL}/salons?limit=20`);const d=await r.json();if(d.success)setSalons(d.data);}catch(e){console.error(e);}setLoading(false);};
  const filterSalons=()=>{let f=[...salons];if(searchCity)f=f.filter(s=>s.city?.toLowerCase().includes(searchCity.toLowerCase())||s.name?.toLowerCase().includes(searchCity.toLowerCase()));if(selectedCategory!=="all")f=f.filter(s=>s.category===selectedCategory);setFilteredSalons(f);};
  return(
    <div className="salons-page">
      <div className="page-header"><div className="container"><div className="decorative-line"></div><h1 className="page-title">DISCOVER<span className="gold-text"> PREMIUM</span><br/>SALONS</h1><p className="page-subtitle">Find the perfect salon for your style</p></div></div>
      <div className="search-filter-section"><div className="container"><div className="search-box"><input type="text" placeholder="Search by city or salon name..." value={searchCity} onChange={e=>setSearchCity(e.target.value)} className="search-input"/><button className="search-btn"><span>🔍</span></button></div><div className="category-filters">{categories.map(cat=><button key={cat} className={`filter-btn ${selectedCategory===cat?"active":""}`} onClick={()=>setSelectedCategory(cat)}>{cat==="all"?"ALL":cat.toUpperCase()}</button>)}</div></div></div>
      <div className="container">
        {loading?<div className="loading-container"><div className="loader"></div><p>Finding salons...</p></div>:(
          <><div className="results-info"><p>FOUND <span className="gold-text">{filteredSalons.length}</span> SALONS</p></div>
          <div className="salons-grid-dark">
            {filteredSalons.length===0?<div className="no-results"><span className="no-results-icon">🔍</span><h3>NO SALONS FOUND</h3><p>Try adjusting your search or filters</p></div>:(
              filteredSalons.map((salon,index)=>(
                <div key={salon.id} className="salon-card-dark" style={{"--index":index}} onClick={()=>navigate(`/salon/${salon.id}`)}>
                  <div className="salon-image-dark"><div className="salon-overlay"></div><span className="salon-placeholder">✂</span>{salon.rating&&<div className="salon-rating"><span>⭐</span><span>{Number(salon.rating||0).toFixed(1)}</span></div>}</div>
                  <div className="salon-info-dark"><h3>{salon.name}</h3><p className="salon-location-dark"><span>📍</span>{salon.city}, {salon.state}</p><p className="salon-desc-dark">{salon.description||"Professional salon services"}</p><div className="salon-meta-dark"><span><span>🕐</span>{salon.opening_time?.slice(0,5)} - {salon.closing_time?.slice(0,5)}</span></div><button className="btn-book">BOOK NOW<span className="arrow">→</span></button></div>
                </div>
              ))
            )}
          </div></>
        )}
      </div>
    </div>
  );
}

// =============================================
// LOGIN
// =============================================
function Login({ onLogin }) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const [isRegister,setIsRegister]=useState(false); const [firstName,setFirstName]=useState(""); const [lastName,setLastName]=useState(""); const [phone,setPhone]=useState("");
  const navigate=useNavigate();
  const handleSubmit=async(e)=>{e.preventDefault();setError("");const endpoint=isRegister?"/auth/register":"/auth/login";const body=isRegister?{email,password,firstName,lastName,phone,role:"user"}:{email,password};try{const r=await fetch(`${API_URL}${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(data.success){localStorage.setItem("token",data.data.token);localStorage.setItem("user",JSON.stringify(data.data.user));onLogin(data.data.user);navigate("/");}else setError(data.message||"Operation failed");}catch{setError("Connection error. Please try again.");}};
  return(
    <div className="login-page-dark"><div className="login-container-dark"><div className="login-box-dark"><div className="decorative-line"></div><h2>{isRegister?"CREATE ACCOUNT":"WELCOME BACK"}</h2><form onSubmit={handleSubmit}>{isRegister&&(<><input type="text" placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} required/><input type="text" placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} required/><input type="tel" placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} required/></>)}<input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>{error&&<div className="error-dark">{error}</div>}<button type="submit" className="btn-primary-full">{isRegister?"SIGN UP":"LOGIN"}</button></form><p className="toggle-text-dark">{isRegister?"Already have an account?":"Don't have an account?"}<button className="toggle-btn-dark" onClick={()=>setIsRegister(!isRegister)}>{isRegister?"Login":"Sign Up"}</button></p></div></div></div>
  );
}

// =============================================
// SALON DETAIL
// =============================================
function SalonDetail(){
  const[salon,setSalon]=useState(null); const navigate=useNavigate(); const{id}=useParams();
  useEffect(()=>{(async()=>{const r=await fetch(`${API_URL}/salons/${id}`);const d=await r.json();if(d.success)setSalon(d.data);})();},[id]);
  if(!salon)return<div className="loading-container"><div className="loader"></div></div>;
  return<div className="page-container"><div className="container"><h1>{salon.name}</h1><p>{salon.description}</p><p>📍 {salon.city}, {salon.state}</p><p>📞 {salon.phone}</p><p>🕐 {salon.opening_time?.slice(0,5)} - {salon.closing_time?.slice(0,5)}</p><button className="btn-primary-large" onClick={()=>navigate(`/book/${salon.id}`)}>BOOK APPOINTMENT →</button></div></div>;
}

// =============================================
// MY APPOINTMENTS
// =============================================
function MyAppointments(){
  const[appointments,setAppointments]=useState([]);
  useEffect(()=>{(async()=>{const token=localStorage.getItem("token");const r=await fetch(`${API_URL}/appointments`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success)setAppointments(d.data);})();},[]);
  const formatDate=(iso)=>iso?new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"";
  const formatTime=(t)=>{if(!t)return"";const[h,m]=t.split(":");const d=new Date();d.setHours(h,m);return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});};
  return<div className="page-container"><div className="container"><h1>My Appointments</h1>{appointments.length===0?<p style={{color:"var(--text-gray)"}}>No bookings yet.</p>:appointments.map(appt=><div key={appt.id} className="appointment-card"><p>📅 {formatDate(appt.appointment_date)}</p><p>⏰ {formatTime(appt.start_time)} - {formatTime(appt.end_time)}</p><p>Status: {appt.status}</p><hr/></div>)}</div></div>;
}

// =============================================
// PROFILE
// =============================================
function Profile({user}){return<div className="page-container"><div className="container"><h1>My Profile</h1><div className="profile-box"><p><strong>Name:</strong> {user.firstName} {user.lastName}</p><p><strong>Email:</strong> {user.email}</p></div></div></div>;}

// =============================================
// ABOUT
// =============================================
function AboutPage(){
  const team=[{name:"John Smith",role:"Founder & CEO",image:"👨‍💼"},{name:"Sarah Johnson",role:"Head of Operations",image:"👩‍💼"},{name:"Mike Chen",role:"Technology Director",image:"👨‍💻"},{name:"Emily Davis",role:"Customer Success",image:"👩‍🦰"}];
  return<div className="about-page"><section className="about-hero"><div className="container"><div className="decorative-line"></div><h1 className="page-title">ABOUT<span className="gold-text"> SIZZER</span></h1><p className="page-subtitle">Your Trusted Partner in Beauty & Grooming</p></div></section><section className="mission-section"><div className="container"><div className="mission-grid"><div className="mission-content"><div className="section-label">OUR MISSION</div><h2 className="section-title">TRANSFORMING THE WAY<span className="gold-text"> YOU BOOK</span><br/>SALON SERVICES</h2><p className="section-description">We believe everyone deserves access to premium salon services.</p><p className="section-description">Since our launch, we've helped thousands of customers discover their perfect salon match.</p></div><div className="mission-stats"><div className="mission-stat-card"><div className="stat-icon">🎯</div><h3>Our Vision</h3><p>To become the world's most trusted salon booking platform</p></div><div className="mission-stat-card"><div className="stat-icon">💎</div><h3>Our Values</h3><p>Quality, Trust, Innovation, and Customer Satisfaction</p></div></div></div></div></section><section className="why-choose-section"><div className="container"><div className="section-header-center"><div className="section-label">WHY CHOOSE US</div><h2 className="section-title">WHAT MAKES US<span className="gold-text"> DIFFERENT</span></h2></div><div className="why-grid">{[{icon:"✓",title:"VERIFIED SALONS",desc:"All salons thoroughly vetted"},{icon:"⭐",title:"REAL REVIEWS",desc:"Authentic customer reviews"},{icon:"📱",title:"EASY BOOKING",desc:"Book in seconds"},{icon:"💳",title:"SECURE PAYMENTS",desc:"Safe encrypted payments"}].map((c,i)=><div key={i} className="why-card"><div className="why-icon">{c.icon}</div><h3>{c.title}</h3><p>{c.desc}</p></div>)}</div></div></section><section className="team-section"><div className="container"><div className="section-header-center"><div className="section-label">OUR TEAM</div><h2 className="section-title">MEET THE<span className="gold-text"> EXPERTS</span></h2></div><div className="team-grid">{team.map((m,i)=><div key={i} className="team-card"><div className="team-image"><span className="team-avatar">{m.image}</span></div><h3>{m.name}</h3><p>{m.role}</p></div>)}</div></div></section></div>;
}

// =============================================
// CONTACT
// =============================================
function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ── Validators ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    // Name – required, letters/spaces/hyphens/apostrophes only, no digits
    if (!formData.name.trim()) {
      e.name = "Name is required.";
    } else if (/\d/.test(formData.name)) {
      e.name = "Name must not contain numbers.";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      e.name = "Name contains invalid characters.";
    } else if (formData.name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }

    // Email – required, valid format
    if (!formData.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      e.email = "Enter a valid email address.";
    }

    // Phone – optional; if provided must be valid format
    if (formData.phone.trim()) {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        e.phone = "Phone number must be 7–15 digits.";
      }
    }

    // Subject – optional, max 100 chars
    if (formData.subject.trim() && formData.subject.trim().length > 100) {
      e.subject = "Subject must be under 100 characters.";
    }

    // Message – required, 10–1000 chars
    if (!formData.message.trim()) {
      e.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      e.message = "Message must be at least 10 characters.";
    } else if (formData.message.trim().length > 1000) {
      e.message = "Message must be under 1000 characters.";
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Allow only digits, +, spaces, hyphens, parentheses
      const cleaned = value.replace(/[^\d+\s\-()]/g, "").slice(0, 20);
      setFormData((prev) => ({ ...prev, phone: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear this field's error as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Block digit key presses in name field only
  const handleNameKeyDown = (e) => {
    if (/\d/.test(e.key)) e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <div className="decorative-line"></div>
          <h1 className="page-title">
            GET IN<span className="gold-text"> TOUCH</span>
          </h1>
          <p className="page-subtitle">We'd Love to Hear From You</p>
        </div>
      </section>

      <section className="contact-content-section">
        <div className="container">
          <div className="contact-grid">

            {/* ── Contact Info ── */}
            <div className="contact-info">
              <h2>CONTACT INFORMATION</h2>
              <p>Have questions? We're here to help!</p>
              {[
                { icon: "📍", title: "ADDRESS", body: "123 Salon Street\nNew York, NY 10001" },
                { icon: "📞", title: "PHONE",   body: "+1 (555) 123-4567" },
                { icon: "📧", title: "EMAIL",   body: "info@sizzer.com" },
              ].map((item, i) => (
                <div key={i} className="contact-info-item">
                  <div className="contact-icon">{item.icon}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Contact Form ── */}
            <div className="contact-form-container">
              <h2>SEND US A MESSAGE</h2>

              {submitted && (
                <div className="success-message">✓ Message sent successfully!</div>
              )}

              <form className="contact-form" onSubmit={handleSubmit} noValidate>

                {/* Row 1: Name + Email */}
                <div className="form-row">
                  <div className="form-field">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={handleChange}
                      onKeyDown={handleNameKeyDown}
                      className={errors.name ? "input-error" : ""}
                    />
                    <span className="field-error">{errors.name || "\u00A0"}</span>
                  </div>

                  <div className="form-field">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email *"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "input-error" : ""}
                    />
                    <span className="field-error">{errors.email || "\u00A0"}</span>
                  </div>
                </div>

                {/* Row 2: Phone + Subject */}
                <div className="form-row">
                  <div className="form-field">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number (optional)"
                      value={formData.phone}
                      onChange={handleChange}
                      inputMode="tel"
                      className={errors.phone ? "input-error" : ""}
                    />
                    <span className="field-error">{errors.phone || "\u00A0"}</span>
                  </div>

                  <div className="form-field">
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject (optional)"
                      value={formData.subject}
                      onChange={handleChange}
                      maxLength={100}
                      className={errors.subject ? "input-error" : ""}
                    />
                    <span className="field-error">{errors.subject || "\u00A0"}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="form-field">
                  <textarea
                    name="message"
                    placeholder="Your Message * (10–1000 characters)"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={1000}
                    className={errors.message ? "input-error" : ""}
                  />
                  <div className="message-meta">
                    <span className="field-error">{errors.message || "\u00A0"}</span>
                    <span
                      className="char-count"
                      style={{ color: formData.message.length > 950 ? "#EF4444" : undefined }}
                    >
                      {formData.message.length}/1000
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn-primary-large">
                  SEND MESSAGE <span className="arrow">→</span>
                </button>

              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
// =============================================
// GALLERY
// =============================================
function GalleryPage(){
  const[selectedCategory,setSelectedCategory]=useState("all");
  const categories=["all","haircuts","coloring","styling","spa","nails"];
  const galleryItems=[{id:1,category:"haircuts",title:"Modern Fade",img:"/images/modern-fade.jpg"},{id:2,category:"coloring",title:"Blonde Highlights",img:"/images/blonde-highlights.jpg"},{id:3,category:"styling",title:"Elegant Updo",img:"/images/elegant-updo.webp"},{id:4,category:"spa",title:"Facial Treatment",img:"/images/facial-treatment.jpg"},{id:5,category:"nails",title:"Nail Art",img:"/images/nail-art.jpg"},{id:6,category:"haircuts",title:"Classic Cut",img:"/images/classic-cut.jpg"},{id:7,category:"coloring",title:"Balayage",img:"/images/balayage.avif"},{id:8,category:"styling",title:"Beach Waves",img:"/images/beach-waves.avif"},{id:9,category:"spa",title:"Massage",img:"/images/massage.png"},{id:10,category:"nails",title:"French Manicure",img:"/images/french-manicure.jpg"},{id:11,category:"haircuts",title:"Layered Cut",img:"/images/layered-cut.webp"},{id:12,category:"coloring",title:"Ombre",img:"/images/ombre.jpg"}];
  const filtered=selectedCategory==="all"?galleryItems:galleryItems.filter(i=>i.category===selectedCategory);
  return<div className="gallery-page"><section className="gallery-hero"><div className="container"><div className="decorative-line"></div><h1 className="page-title">OUR<span className="gold-text"> GALLERY</span></h1><p className="page-subtitle">Showcasing Excellence in Every Style</p></div></section><section className="gallery-content-section"><div className="container"><div className="gallery-filters">{categories.map(c=><button key={c} className={`gallery-filter-btn ${selectedCategory===c?"active":""}`} onClick={()=>setSelectedCategory(c)}>{c.toUpperCase()}</button>)}</div><div className="gallery-grid">{filtered.map((item,index)=><div key={item.id} className="gallery-item" style={{"--index":index}}><div className="gallery-image"><img src={item.img} alt={item.title} className="gallery-img"/><div className="gallery-overlay"><h3>{item.title}</h3><p>{item.category}</p></div></div></div>)}</div></div></section><section className="gallery-cta"><div className="container"><h2>INSPIRED BY WHAT YOU SEE?</h2><p>Book your appointment today</p><Link to="/salons" className="btn-primary-large">FIND YOUR SALON<span className="arrow">→</span></Link></div></section></div>;
}

// =============================================
// FOOTER
// =============================================
function Footer(){
  return<footer className="footer-dark"><div className="container"><div className="footer-grid"><div className="footer-col"><div className="footer-logo"><img src="/images/logo-icon.png" alt="SIZZER" className="footer-logo-image"/><div className="logo-text"><span className="logo-main">SIZZER</span><span className="logo-sub">SALON BOOKING</span></div></div><p>Your trusted platform for premium salon bookings</p></div><div className="footer-col"><h4>QUICK LINKS</h4><Link to="/">Home</Link><Link to="/salons">Find Salons</Link><Link to="/services">Services</Link><Link to="/about">About Us</Link><Link to="/gallery">Gallery</Link><Link to="/contact">Contact</Link></div><div className="footer-col"><h4>CONTACT</h4><p>📧 info@sizzer.com</p><p>📞 +1 (555) 123-4567</p><p>📍 123 Salon Street, NY 10001</p></div></div><div className="footer-bottom"><p>&copy; 2026 SIZZER. All Rights Reserved.</p></div></div></footer>;
}

// =============================================
// BOOK APPOINTMENT
// =============================================
function BookAppointment(){
  const{salonId}=useParams();const navigate=useNavigate();
  const[formData,setFormData]=useState({appointment_date:"",start_time:"",end_time:""});const[loading,setLoading]=useState(false);
  const today=new Date().toISOString().split("T")[0];
  const handleChange=(e)=>setFormData({...formData,[e.target.name]:e.target.value});
  const calc=(s,e_)=>{if(!s||!e_)return"";const[sh,sm]=s.split(":").map(Number);const[eh,em]=e_.split(":").map(Number);const diff=(eh*60+em)-(sh*60+sm);if(diff<=0)return"Invalid";return`${Math.floor(diff/60)?Math.floor(diff/60)+" hr ":""}${diff%60} min`;};
  const handleSubmit=async(e)=>{e.preventDefault();if(formData.start_time>=formData.end_time){alert("End time must be after start time");return;}setLoading(true);const token=localStorage.getItem("token");try{const r=await fetch(`${API_URL}/appointments`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({salon_id:salonId,appointment_date:formData.appointment_date,start_time:formData.start_time+":00",end_time:formData.end_time+":00",total_price:500})});const data=await r.json();if(data.success){alert("✅ Appointment Booked Successfully!");navigate("/my-appointments");}else alert(data.message||"Booking failed");}catch{alert("Server error. Please try again.");}setLoading(false);};
  return<div className="book-page"><div className="book-card"><h1 className="book-title">📅 Book Your Appointment</h1><form onSubmit={handleSubmit} className="book-form"><div className="form-group"><label>Select Date</label><input type="date" name="appointment_date" min={today} required value={formData.appointment_date} onChange={handleChange}/></div><div className="form-group"><label>Start Time</label><input type="time" name="start_time" required value={formData.start_time} onChange={handleChange}/></div><div className="form-group"><label>End Time</label><input type="time" name="end_time" required value={formData.end_time} onChange={handleChange}/></div>{formData.start_time&&formData.end_time&&<p className="time-hint">⏱ Duration: {calc(formData.start_time,formData.end_time)}</p>}<button type="submit" className="btn-primary-large" disabled={loading}>{loading?"Booking...":"Confirm Booking →"}</button></form></div></div>;
}

// =============================================
// APP ROOT
// =============================================
function App() {
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  useEffect(() => { const u = localStorage.getItem("user"); if (u) setUser(JSON.parse(u)); }, []);
  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };

  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/salons"         element={<SalonsList />} />
          <Route path="/salon/:id"      element={<SalonDetail />} />
          <Route path="/services"       element={<ServicesPage user={user} />} />
          <Route path="/about"          element={<AboutPage />} />
          <Route path="/gallery"        element={<GalleryPage />} />
          <Route path="/contact"        element={<ContactPage />} />
          <Route path="/login"          element={<Login onLogin={handleLogin} />} />
          <Route path="/my-appointments" element={user ? <MyAppointments /> : <Login onLogin={handleLogin} />} />
          <Route path="/profile"        element={user ? <Profile user={user} /> : <Login onLogin={handleLogin} />} />
          <Route path="/book/:salonId"  element={user ? <BookAppointment /> : <Login onLogin={handleLogin} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;