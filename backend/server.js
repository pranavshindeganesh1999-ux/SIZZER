const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();


const app = express();


/* ==============================
   CORS CONFIG (3 FRONTENDS)
============================== */


const allowedOrigins = [
  "http://localhost:3000", // Admin
  "http://localhost:3001", // Owner
  "http://localhost:3002"  // User
];


app.use(cors({
  origin: function (origin, callback) {


    // Allow Postman or server-to-server calls
    if (!origin) return callback(null, true);


    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }


    console.log("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


/* ==============================
   MIDDLEWARE
============================== */


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* ==============================
   ROUTES
============================== */


app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/user', require('./routes/user'));
app.use('/api/salons', require('./routes/salons'));
app.use('/api/appointments', require('./routes/appointments'));
//app.use('/api/services', require('./routes/services'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/staff', require('./routes/staff'));
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);



/* ==============================
   HEALTH CHECK
============================== */


app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


/* ==============================
   ERROR HANDLER
============================== */


app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);


  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


/* ==============================
   404 HANDLER
============================== */


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


/* ==============================
   SERVER START
============================== */


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});


module.exports = app;