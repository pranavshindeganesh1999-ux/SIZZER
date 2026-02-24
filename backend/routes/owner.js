const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database');

// Only owner allowed
router.use(authenticate, authorize('owner'));

router.get('/dashboard', async (req, res) => {
  try {

    // Get owner's salon
    const salonResult = await db.query(
      `SELECT id FROM salons WHERE owner_id = ?`,
      [req.user.id]
    );

    if (salonResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    const salonId = salonResult.rows[0].id;

    // Total Appointments
    const appointmentResult = await db.query(
      `SELECT COUNT(*) AS total_appointments
       FROM appointments
       WHERE salon_id = ?`,
      [salonId]
    );

    // Total Revenue (completed only)
    const revenueResult = await db.query(
      `SELECT SUM(total_price) AS total_revenue
       FROM appointments
       WHERE salon_id = ?
       AND status = 'completed'`,
      [salonId]
    );

    res.json({
      success: true,
      data: {
        totalAppointments: parseInt(appointmentResult.rows[0].total_appointments),
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0)
      }
    });

  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

module.exports = router;
