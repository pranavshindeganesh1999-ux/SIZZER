const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/*
=================================
GET USER APPOINTMENTS
=================================
*/
router.get('/', authenticate, authorize('user'), async (req, res) => {
  try {

    const result = await db.query(
      `SELECT a.*, 
       s.name AS salon_name,
       CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
       sv.name AS service_name
       FROM appointments a
       JOIN salons s ON a.salon_id = s.id
       LEFT JOIN staff st ON a.staff_id = st.id
       LEFT JOIN services sv ON a.service_id = sv.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('User appointments error:', error);
    res.status(500).json({ success: false });
  }
});


/*
=================================
GET ALL APPOINTMENTS
=================================
*/
router.get('/owner', authenticate, authorize('owner'), async (req, res) => {
  try {

    const result= await db.query(
      `SELECT a.*, 
       CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
       s.name AS salon_name,
       CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
       sv.name AS service_name
       FROM appointments a
       JOIN salons s ON a.salon_id = s.id
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN staff st ON a.staff_id = st.id
       LEFT JOIN services sv ON a.service_id = sv.id
       WHERE s.owner_id = ?
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [req.user.id]
    );

res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Owner appointments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
});



/*
=================================
CREATE APPOINTMENT
=================================
*/
router.post('/', authenticate, authorize('user'), async (req, res) => {
  try {

    const {
      salon_id,
      staff_id,
      service_id,
      appointment_date,
      start_time,
      end_time,
      total_price,
      notes
    } = req.body;

    const id = uuidv4();

await db.query(
  `INSERT INTO appointments 
   (id, salon_id, user_id, staff_id, service_id, 
    appointment_date, start_time, end_time, 
    total_price, notes, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    id,
    salon_id,
    req.user.id,
    staff_id || null,
    service_id || null,
    appointment_date,
    start_time,
    end_time,
    total_price,
    notes || null,
    'pending'
  ]

    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully'
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: 'Error creating appointment' });
  }
});


/*
=================================
UPDATE STATUS
=================================
*/
/*
=================================
ASSIGN STAFF TO APPOINTMENT
=================================
*/
router.put('/:id/assign', authenticate, authorize('owner'), async (req, res) => {
  try {

    const { staff_id } = req.body;

    // 🔐 Check ownership
    const check = await db.query(
      `SELECT a.id 
       FROM appointments a
       JOIN salons s ON a.salon_id = s.id
       WHERE a.id = ? AND s.owner_id = ?`,
      [req.params.id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission'
      });
    }

    await db.query(
      `UPDATE appointments
       SET staff_id = ?, status = 'confirmed'
       WHERE id = ?`,
      [staff_id, req.params.id]
    );

    res.json({
      success: true,
      message: 'Staff assigned and appointment confirmed'
    });

  } catch (error) {
    console.error('Assign staff error:', error);
    res.status(500).json({ success: false, message: 'Error assigning staff' });
  }
});




/*
=================================
DELETE APPOINTMENT
=================================
*/
router.delete('/:id', authenticate, authorize('owner'), async (req, res) => {
  try {

    const check = await db.query(
      `SELECT a.id 
       FROM appointments a
       JOIN salons s ON a.salon_id = s.id
       WHERE a.id = ? AND s.owner_id = ?`,
      [req.params.id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission'
      });
    }

    await db.query(
      `DELETE FROM appointments WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ success: false, message: 'Error deleting appointment' });
  }
});

/*
=================================
USER CANCEL APPOINTMENT
=================================
*/
router.delete('/cancel/:id', authenticate, authorize('user'), async (req, res) => {
  try {

    const check = await db.query(
      `SELECT id FROM appointments 
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed'
      });
    }

    await db.query(
      `UPDATE appointments 
       SET status = 'cancelled' 
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled'
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


module.exports = router;
