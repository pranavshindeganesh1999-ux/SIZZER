const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

/*
=================================
GET REVIEWS BY SALON
=================================
*/
router.get('/salon/:salonId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
       CONCAT(u.first_name, ' ', u.last_name) AS user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.salon_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.salonId]
    );

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});


/*
=================================
CREATE REVIEW (ONLY AFTER COMPLETED APPOINTMENT)
=================================
*/
router.post('/', authenticate, async (req, res) => {
  try {
    const { salon_id, appointment_id, rating, comment } = req.body;

    // Check appointment exists and belongs to user
    const appointment = await db.query(
      `SELECT id FROM appointments
       WHERE id = ?
       AND user_id = ?
       AND status = 'completed'`,
      [appointment_id, req.user.id]
    );

    if (appointment.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or incomplete appointment'
      });
    }

    // Prevent duplicate review
    const existing = await db.query(
      `SELECT id FROM reviews WHERE appointment_id = ?`,
      [appointment_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted for this appointment'
      });
    }

    await db.query(
      `INSERT INTO reviews (salon_id, user_id, appointment_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [salon_id, req.user.id, appointment_id, rating, comment || null]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
});


/*
=================================
DELETE REVIEW (ONLY OWNER OR USER)
=================================
*/
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM reviews WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
});

module.exports = router;
