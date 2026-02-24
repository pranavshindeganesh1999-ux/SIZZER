const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');


/*
=================================
GET SERVICES BY SALON
=================================
*/
router.get('/salon/:salonId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM services
       WHERE salon_id = ?
       AND is_active = 1
       ORDER BY created_at DESC`,
      [req.params.salonId]
    );

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});


/*
=================================
CREATE SERVICE (OWNER ONLY)
=================================
*/
router.post('/', authenticate, authorize('owner'), async (req, res) => {
  try {
    const {
      salon_id,
      name,
      description,
      duration_minutes,
      price,
      category
    } = req.body;

    // 🔐 Check salon belongs to owner
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
      `INSERT INTO services
       (id, salon_id, name, description, duration_minutes, price, category, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        salon_id,
        name,
        description || null,
        duration_minutes,
        price,
        category || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully'
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Error creating service' });
  }
});


/*
=================================
UPDATE SERVICE
=================================
*/
router.put('/:id', authenticate, authorize('owner'), async (req, res) => {
  try {

    await db.query(
      `UPDATE services
       SET name = ?,
           description = ?,
           duration_minutes = ?,
           price = ?,
           category = ?,
           is_active = ?
       WHERE id = ?`,
      [
        req.body.name,
        req.body.description,
        req.body.duration_minutes,
        req.body.price,
        req.body.category,
        req.body.is_active ? 1 : 0,
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: 'Service updated successfully'
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Error updating service' });
  }
});


/*
=================================
SOFT DELETE SERVICE
=================================
*/
router.delete('/:id', authenticate, authorize('owner'), async (req, res) => {
  try {

    await db.query(
      `UPDATE services SET is_active = 0 WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Service deactivated successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Error deleting service' });
  }
});

module.exports = router;
