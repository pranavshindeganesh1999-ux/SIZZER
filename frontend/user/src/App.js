import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Navbar({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/">
            <div className="logo">
              <img
                src="/images/logo-icon.png"
                alt="SIZZER"
                className="logo-image"
              />
              <div className="logo-text">
                <span className="logo-main">SIZZER</span>
                <span className="logo-sub">SALON BOOKING</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            HOME
          </Link>
          <Link to="/salons" className="nav-link">
            SALONS
          </Link>
          <Link to="/about" className="nav-link">
            ABOUT
          </Link>
          <Link to="/gallery" className="nav-link">
            GALLERY
          </Link>
          <Link to="/contact" className="nav-link">
            CONTACT
          </Link>
          {user ? (
            <>
              <Link to="/my-appointments" className="nav-link">
                BOOKINGS
              </Link>
              <Link to="/profile" className="nav-link">
                PROFILE
              </Link>
              <button className="btn-primary" onClick={onLogout}>
                LOGOUT
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              BOOK NOW
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <div className="decorative-line"></div>
              <h1 className="hero-title">
                PREMIUM
                <span className="gold-text"> SALON</span>
                <br />
                EXPERIENCE
              </h1>
              <p className="hero-subtitle">
                Book with SIZZER - Where Style Meets Excellence
              </p>
              <div className="hero-buttons">
                <Link to="/salons" className="btn-primary-large">
                  FIND SALONS
                  <span className="arrow">→</span>
                </Link>
                <Link to="/login" className="btn-outline-large">
                  BOOK APPOINTMENT
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>SCROLL</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Expert Salons</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <div className="image-frame">
                <div className="image-placeholder">
                  <img
                    src={"/images/Salon-Interior.jpg"}
                    alt="Salon Interior"
                    className="placeholder-icon"
                  />
                </div>
                <div className="image-border"></div>
              </div>
            </div>
            <div className="about-content">
              <div className="section-label">ABOUT US</div>
              <h2 className="section-title">
                YOUR TRUSTED
                <span className="gold-text"> SALON BOOKING</span>
                <br />
                PLATFORM
              </h2>
              <p className="section-description">
                We connect you with the finest salons and expert stylists in
                your area. Our platform offers seamless booking, verified
                reviews, and exceptional service.
              </p>
              <ul className="features-list">
                <li>
                  <span className="check-icon">✓</span>
                  Expert & Certified Stylists
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Premium Quality Products
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Convenient Online Booking
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Verified Customer Reviews
                </li>
              </ul>
              <Link to="/salons" className="btn-primary">
                EXPLORE SALONS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label">OUR SERVICES</div>
            <h2 className="section-title">
              WHAT WE
              <span className="gold-text"> OFFER</span>
            </h2>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💇</div>
              <h3>HAIR STYLING</h3>
              <p>
                Expert cuts, coloring, and styling by professional hairstylists
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">🧔</div>
              <h3>BEARD GROOMING</h3>
              <p>
                Precision beard trims and grooming services for the modern
                gentleman
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>NAIL CARE</h3>
              <p>Manicures, pedicures, and creative nail art designs</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💆</div>
              <h3>SPA TREATMENTS</h3>
              <p>Relaxing massages and rejuvenating spa therapies</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💄</div>
              <h3>MAKEUP</h3>
              <p>Professional makeup for events, weddings, and photoshoots</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌟</div>
              <h3>SKIN CARE</h3>
              <p>Facials, treatments, and personalized skin care routines</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-overlay"></div>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">READY FOR A NEW LOOK?</h2>
            <p className="cta-subtitle">
              Book your appointment today and experience premium salon services
            </p>
            <Link to="/salons" className="btn-primary-large">
              BOOK NOW
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SalonsList() {
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const categories = ["all", "Hair Salon", "Barber Shop", "Nail Salon", "Spa"];

  useEffect(() => {
    fetchSalons();
  }, []);

  useEffect(() => {
    filterSalons();
  }, [salons, searchCity, selectedCategory]);

  const fetchSalons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/salons?limit=20`);
      const data = await response.json();
      if (data.success) {
        setSalons(data.data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const filterSalons = () => {
    let filtered = [...salons];

    if (searchCity) {
      filtered = filtered.filter(
        (salon) =>
          salon.city?.toLowerCase().includes(searchCity.toLowerCase()) ||
          salon.name?.toLowerCase().includes(searchCity.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (salon) => salon.category === selectedCategory,
      );
    }

    setFilteredSalons(filtered);
  };

  return (
    <div className="salons-page">
      <div className="page-header">
        <div className="container">
          <div className="decorative-line"></div>
          <h1 className="page-title">
            DISCOVER
            <span className="gold-text"> PREMIUM</span>
            <br />
            SALONS
          </h1>
          <p className="page-subtitle">Find the perfect salon for your style</p>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by city or salon name..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <span>🔍</span>
            </button>
          </div>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "ALL" : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Finding salons...</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <p>
                FOUND <span className="gold-text">{filteredSalons.length}</span>{" "}
                SALONS
              </p>
            </div>
            <div className="salons-grid-dark">
              {filteredSalons.length === 0 ? (
                <div className="no-results">
                  <span className="no-results-icon">🔍</span>
                  <h3>NO SALONS FOUND</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredSalons.map((salon, index) => (
                  <div
                    key={salon.id}
                    className="salon-card-dark"
                    style={{ "--index": index }}
                    onClick={() => navigate(`/salon/${salon.id}`)}
                  >
                    <div className="salon-image-dark">
                      <div className="salon-overlay"></div>
                      <span className="salon-placeholder">✂</span>
                      {salon.rating && (
                        <div className="salon-rating">
                          <span>⭐</span>
                          <span>{Number(salon.rating || 0).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="salon-info-dark">
                      <h3>{salon.name}</h3>
                      <p className="salon-location-dark">
                        <span>📍</span>
                        {salon.city}, {salon.state}
                      </p>
                      <p className="salon-desc-dark">
                        {salon.description || "Professional salon services"}
                      </p>
                      <div className="salon-meta-dark">
                        <span>
                          <span>🕐</span>
                          {salon.opening_time?.slice(0, 5)} -{" "}
                          {salon.closing_time?.slice(0, 5)}
                        </span>
                      </div>
                      <button className="btn-book">
                        BOOK NOW
                        <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const body = isRegister
      ? { email, password, firstName, lastName, phone, role: "user" }
      : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        onLogin(data.data.user);
        navigate("/");
      } else {
        setError(data.message || "Operation failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div className="login-page-dark">
      <div className="login-container-dark">
        <div className="login-box-dark">
          <div className="decorative-line"></div>
          <h2>{isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}</h2>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
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
            {error && <div className="error-dark">{error}</div>}
            <button type="submit" className="btn-primary-full">
              {isRegister ? "SIGN UP" : "LOGIN"}
            </button>
          </form>
          <p className="toggle-text-dark">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button
              className="toggle-btn-dark"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SalonDetail() {
  const [salon, setSalon] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchSalon();
  }, []);

  const fetchSalon = async () => {
    try {
      const response = await fetch(`${API_URL}/salons/${id}`);
      const data = await response.json();

      if (data.success) {
        setSalon(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!salon) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="container">
        <h1>{salon.name}</h1>
        <p>{salon.description}</p>
        <p>
          📍 {salon.city}, {salon.state}
        </p>
        <p>📞 {salon.phone}</p>
        <p>
          🕐 {salon.opening_time?.slice(0, 5)} -{" "}
          {salon.closing_time?.slice(0, 5)}
        </p>

        <button
          className="btn-primary-large"
          onClick={() => navigate(`/book/${salon.id}`)}
        >
          BOOK APPOINTMENT →
        </button>
      </div>
    </div>
  );
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      setAppointments(data.data);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";

    // handles HH:mm:ss
    const [h, m] = time.split(":");
    const date = new Date();
    date.setHours(h, m);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="page-container">
      <div className="container">
        <h1>My Appointments</h1>

        {appointments.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="appointment-card">
              <p>📅 {formatDate(appt.appointment_date)}</p>

              <p>
                ⏰ {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
              </p>

              <p className={`status ${appt.status}`}>Status: {appt.status}</p>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Profile({ user }) {
  return (
    <div className="page-container">
      <div className="container">
        <h1>My Profile</h1>
        <div className="profile-box">
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  const team = [
    { name: "John Smith", role: "Founder & CEO", image: "👨‍💼" },
    { name: "Sarah Johnson", role: "Head of Operations", image: "👩‍💼" },
    { name: "Mike Chen", role: "Technology Director", image: "👨‍💻" },
    { name: "Emily Davis", role: "Customer Success", image: "👩‍🦰" },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="decorative-line"></div>
          <h1 className="page-title">
            ABOUT<span className="gold-text"> SIZZER</span>
          </h1>
          <p className="page-subtitle">
            Your Trusted Partner in Beauty & Grooming
          </p>
        </div>
      </section>

      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content">
              <div className="section-label">OUR MISSION</div>
              <h2 className="section-title">
                TRANSFORMING THE WAY<span className="gold-text"> YOU BOOK</span>
                <br />
                SALON SERVICES
              </h2>
              <p className="section-description">
                We believe everyone deserves access to premium salon services.
                Our platform connects you with the finest salons and expert
                stylists.
              </p>
              <p className="section-description">
                Since our launch, we've helped thousands of customers discover
                their perfect salon match and enjoy exceptional service.
              </p>
            </div>
            <div className="mission-stats">
              <div className="mission-stat-card">
                <div className="stat-icon">🎯</div>
                <h3>Our Vision</h3>
                <p>To become the world's most trusted salon booking platform</p>
              </div>
              <div className="mission-stat-card">
                <div className="stat-icon">💎</div>
                <h3>Our Values</h3>
                <p>Quality, Trust, Innovation, and Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label">WHY CHOOSE US</div>
            <h2 className="section-title">
              WHAT MAKES US<span className="gold-text"> DIFFERENT</span>
            </h2>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">✓</div>
              <h3>VERIFIED SALONS</h3>
              <p>All salons thoroughly vetted for quality</p>
            </div>
            <div className="why-card">
              <div className="why-icon">⭐</div>
              <h3>REAL REVIEWS</h3>
              <p>Authentic reviews from real customers</p>
            </div>
            <div className="why-card">
              <div className="why-icon">📱</div>
              <h3>EASY BOOKING</h3>
              <p>Book in seconds with our platform</p>
            </div>
            <div className="why-card">
              <div className="why-icon">💳</div>
              <h3>SECURE PAYMENTS</h3>
              <p>Safe encrypted payment processing</p>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-label">OUR TEAM</div>
            <h2 className="section-title">
              MEET THE<span className="gold-text"> EXPERTS</span>
            </h2>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">
                  <span className="team-avatar">{member.image}</span>
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <div className="contact-info">
              <h2>CONTACT INFORMATION</h2>
              <p>Have questions? We're here to help!</p>
              <div className="contact-info-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h3>ADDRESS</h3>
                  <p>
                    123 Salon Street
                    <br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h3>PHONE</h3>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h3>EMAIL</h3>
                  <p>info@sizzer.com</p>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>SEND US A MESSAGE</h2>
              {submitted && (
                <div className="success-message">
                  ✓ Message sent successfully!
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  rows="6"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                ></textarea>
                <button type="submit" className="btn-primary-large">
                  SEND MESSAGE<span className="arrow">→</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = ["all", "haircuts", "coloring", "styling", "spa", "nails"];
  const galleryItems = [
    {
      id: 1,
      category: "haircuts",
      title: "Modern Fade",
      img: "/images/modern-fade.jpg",
    },
    {
      id: 2,
      category: "coloring",
      title: "Blonde Highlights",
      img: "/images/blonde-highlights.jpg",
    },
    {
      id: 3,
      category: "styling",
      title: "Elegant Updo",
      img: "/images/elegant-updo.webp",
    },
    {
      id: 4,
      category: "spa",
      title: "Facial Treatment",
      img: "/images/facial-treatment.jpg",
    },
    {
      id: 5,
      category: "nails",
      title: "Nail Art",
      img: "/images/nail-art.jpg",
    },
    {
      id: 6,
      category: "haircuts",
      title: "Classic Cut",
      img: "/images/classic-cut.jpg",
    },
    {
      id: 7,
      category: "coloring",
      title: "Balayage",
      img: "/images/balayage.avif",
    },
    {
      id: 8,
      category: "styling",
      title: "Beach Waves",
      img: "/images/beach-waves.avif",
    },
    { id: 9, category: "spa", title: "Massage", img: "/images/massage.png" },
    {
      id: 10,
      category: "nails",
      title: "French Manicure",
      img: "/images/french-manicure.jpg",
    },
    {
      id: 11,
      category: "haircuts",
      title: "Layered Cut",
      img: "/images/layered-cut.webp",
    },
    { id: 12, category: "coloring", title: "Ombre", img: "/images/ombre.jpg" },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="container">
          <div className="decorative-line"></div>
          <h1 className="page-title">
            OUR<span className="gold-text"> GALLERY</span>
          </h1>
          <p className="page-subtitle">Showcasing Excellence in Every Style</p>
        </div>
      </section>

      <section className="gallery-content-section">
        <div className="container">
          <div className="gallery-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`gallery-filter-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="gallery-item"
                style={{ "--index": index }}
              >
                <div className="gallery-image">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="gallery-img"
                  />
                  <div className="gallery-overlay">
                    <h3>{item.title}</h3>
                    <p>{item.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-cta">
        <div className="container">
          <h2>INSPIRED BY WHAT YOU SEE?</h2>
          <p>Book your appointment today</p>
          <Link to="/salons" className="btn-primary-large">
            FIND YOUR SALON<span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer-dark">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <img
                src="/images/logo-icon.png"
                alt="SIZZER"
                className="footer-logo-image"
              />
              <div className="logo-text">
                <span className="logo-main">SIZZER</span>
                <span className="logo-sub">SALON BOOKING</span>
              </div>
            </div>
            <p>Your trusted platform for premium salon bookings</p>
          </div>
          <div className="footer-col">
            <h4>QUICK LINKS</h4>
            <Link to="/">Home</Link>
            <Link to="/salons">Find Salons</Link>
            <Link to="/about">About Us</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>CONTACT</h4>
            <p>📧 info@sizzer.com</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>📍 123 Salon Street, NY 10001</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SIZZER. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
function BookAppointment() {
  const { salonId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    appointment_date: "",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Convert HH:mm → HH:mm:ss (Spring Boot friendly)
  const formatTimeForAPI = (time) => {
    if (!time) return null;
    return time.length === 5 ? `${time}:00` : time;
  };

  // ⭐ Duration helper (user clarity)
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    if (endMin <= startMin) return "Invalid time range";

    const diff = endMin - startMin;
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    return `${h ? h + " hr " : ""}${m} min`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validation
    if (formData.start_time >= formData.end_time) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salon_id: salonId,
          appointment_date: formData.appointment_date,
          start_time: formatTimeForAPI(formData.start_time),
          end_time: formatTimeForAPI(formData.end_time),
          total_price: 500,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Appointment Booked Successfully!");
        navigate("/my-appointments");
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="book-page">
      <div className="book-card">
        <h1 className="book-title">📅 Book Your Appointment</h1>

        <form onSubmit={handleSubmit} className="book-form">
          {/* Date */}
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              name="appointment_date"
              min={today}
              required
              value={formData.appointment_date}
              onChange={handleChange}
            />
          </div>

          {/* Time section */}
          <div className="time-section">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="start_time"
                required
                value={formData.start_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="end_time"
                required
                value={formData.end_time}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Duration preview */}
          {formData.start_time && formData.end_time && (
            <p className="time-preview">
              ⏱ Duration:{" "}
              {calculateDuration(formData.start_time, formData.end_time)}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary-large"
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking →"}
          </button>
        </form>
      </div>
    </div>
  );
}
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
      <ScrollToTop />
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/salons" element={<SalonsList />} />
          <Route path="/salon/:id" element={<SalonDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/my-appointments"
            element={
              user ? <MyAppointments /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile user={user} /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/book/:salonId"
            element={
              user ? <BookAppointment /> : <Login onLogin={handleLogin} />
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
