const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database');

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, phone, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// Get all salons
router.get('/salons', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT s.*, 
       CONCAT(u.first_name, ' ', u.last_name) AS owner_name
       FROM salons s
       LEFT JOIN users u ON s.owner_id = u.id
       ORDER BY s.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows   // 👈 IMPORTANT
    });

  } catch (error) {
    console.error('Get salons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salons'
    });
  }
});


// Get dashboard statistics

router.get('/stats',  async (req, res) => {
  try {

    const users = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role='user'`);
    const owners = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role='owner'`);
    const salons = await db.query(`SELECT COUNT(*) AS total FROM salons`);
    const appointments = await db.query(`SELECT COUNT(*) AS total FROM appointments`);
    const revenue = await db.query(`
  SELECT SUM(total_price) AS total
FROM appointments
WHERE status IN ('completed', 'confirmed');

`);


    res.json({
      success: true,
      data: {
        totalUsers: users.rows[0]?.total || 0,
        totalOwners: owners.rows[0]?.total || 0,
        totalSalons: salons.rows[0]?.total || 0,
        totalAppointments: appointments.rows[0]?.total || 0,
        totalBookingValue: revenue.rows[0]?.total || 0

      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/appointments', async (req, res) => {
  try {

    const result = await db.query(`
      SELECT a.*,
             CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
             s.name AS salon_name,
             CONCAT(st.first_name, ' ', st.last_name) AS staff_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN salons s ON a.salon_id = s.id
      LEFT JOIN staff st ON a.staff_id = st.id
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
});

module.exports = router;
