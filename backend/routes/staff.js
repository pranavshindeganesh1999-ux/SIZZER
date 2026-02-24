const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(authenticate, authorize('owner'));

/*
=================================
GET STAFF BY SALON
=================================
*/
router.get('/salon/:salonId', async (req, res) => {
  try {

    const salonCheck = await db.query(
      `SELECT id FROM salons WHERE id = ? AND owner_id = ?`,
      [req.params.salonId, req.user.id]
    );

    if (salonCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this salon'
      });
    }

    const result = await db.query(
      `SELECT *
       FROM staff
       WHERE salon_id = ?
       AND is_active = 1
       ORDER BY created_at DESC`,
      [req.params.salonId]
    );

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Error fetching staff' });
  }
});


/*
=================================
CREATE STAFF
=================================
*/
router.post('/', async (req, res) => {
  try {

    const { salon_id, first_name, last_name, phone } = req.body;

    // 🔐 Check salon ownership
    const salonCheck = await db.query(
      `SELECT id FROM salons WHERE id = ? AND owner_id = ?`,
      [salon_id, req.user.id]
    );

    if (salonCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this salon'
      });
    }

    const id = uuidv4();

    await db.query(
      `INSERT INTO staff
       (id, salon_id, first_name, last_name, phone, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        id,
        salon_id,
        first_name,
        last_name,
        phone || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Staff created successfully'
    });

  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


/*
=================================
UPDATE STAFF
=================================
*/
router.put('/:id', async (req, res) => {
  try {

    const check = await db.query(
      `SELECT st.id 
       FROM staff st
       JOIN salons s ON st.salon_id = s.id
       WHERE st.id = ? AND s.owner_id = ?`,
      [req.params.id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission'
      });
    }

    await db.query(
      `UPDATE staff
       SET first_name = ?,
           last_name = ?,
           phone = ?
       WHERE id = ?`,
      [
        req.body.first_name,
        req.body.last_name,
        req.body.phone,
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: 'Staff updated successfully'
    });

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Error updating staff' });
  }
});


/*
=================================
SOFT DELETE STAFF
=================================
*/
router.delete('/:id', async (req, res) => {
  try {

    const check = await db.query(
      `SELECT st.id 
       FROM staff st
       JOIN salons s ON st.salon_id = s.id
       WHERE st.id = ? AND s.owner_id = ?`,
      [req.params.id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission'
      });
    }

    await db.query(
      `UPDATE staff SET is_active = 0 WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Staff deactivated successfully'
    });

  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Error deleting staff' });
  }
});

module.exports = router;
