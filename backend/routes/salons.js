const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database');

/*
=================================
GET ALL SALONS (PUBLIC)
=================================
*/
router.get('/', async (req, res) => {
  try {
    const { city, search, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT s.*,
             CONCAT(u.first_name, ' ', u.last_name) AS owner_name
      FROM salons s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.is_active = 1
    `;

    const params = [];

    if (city) {
      query += ` AND LOWER(s.city) = LOWER(?)`;
      params.push(city);
    }

    if (search) {
      query += `
        AND (
          LOWER(s.name) LIKE LOWER(?) 
          OR LOWER(s.description) LIKE LOWER(?)
        )
      `;
      params.push(`%${search}%`, `%${search}%`);
    }

    // ✅ Only once ORDER BY
    query += ` ORDER BY s.rating DESC, s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get salons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salons'
    });
  }
});

/*
=================================
GET SALON BY ID
=================================
*/
router.get('/owner', authenticate, authorize('owner'), async (req, res) => {
  try {

    const result = await db.query(
      `SELECT * FROM salons 
       WHERE owner_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Owner salons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching owner salons'
    });
  }
});

/*
=================================
GET SALON BY ID (PUBLIC)
=================================
*/
router.get('/:id', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT s.*,
              CONCAT(u.first_name, ' ', u.last_name) AS owner_name
       FROM salons s
       LEFT JOIN users u ON s.owner_id = u.id
       WHERE s.id = ? AND s.is_active = 1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get salon by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salon'
    });
  }
});

/*
=================================
CREATE SALON
=================================
*/
router.post('/', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      openingTime,
      closingTime
    } = req.body;

    const ownerId = req.user.role === 'owner'
      ? req.user.id
      : req.body.ownerId;

    const id = require('uuid').v4();

    await db.query(
      `INSERT INTO salons
       (id, owner_id, name, description, address, city, state, zip_code,
        country, phone, email, opening_time, closing_time, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        ownerId,
        name,
        description || null,
        address,
        city,
        state || null,
        zipCode || null,
        country || 'USA',
        phone,
        email || null,
        openingTime || null,
        closingTime || null
      ]
    );

    const created = await db.query(
      `SELECT * FROM salons WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Salon created successfully',
      data: created.rows[0]
    });

  } catch (error) {
    console.error('Create salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating salon'
    });
  }
});


/*
=================================
UPDATE SALON
=================================
*/
router.put('/:id', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'owner') {
      const check = await db.query(
        `SELECT id FROM salons WHERE id = ? AND owner_id = ?`,
        [id, req.user.id]
      );

      if (check.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No permission to update this salon'
        });
      }
    }

    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      openingTime,
      closingTime
    } = req.body;

    await db.query(
      `UPDATE salons SET
        name = ?,
        description = ?,
        address = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        phone = ?,
        email = ?,
        opening_time = ?,
        closing_time = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        description,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        openingTime,
        closingTime,
        id
      ]
    );

    const updated = await db.query(
      `SELECT * FROM salons WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Salon updated successfully',
      data: updated.rows[0]
    });

  } catch (error) {
    console.error('Update salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating salon'
    });
  }
});


/*
=================================
DELETE SALON
=================================
*/
router.delete('/:id', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {

    if (req.user.role === 'owner') {
      const check = await db.query(
        `SELECT id FROM salons WHERE id = ? AND owner_id = ?`,
        [req.params.id, req.user.id]
      );

      if (check.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No permission to delete this salon'
        });
      }
    }

    await db.query(
      `DELETE FROM salons WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Salon deleted successfully'
    });

  } catch (error) {
    console.error('Delete salon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting salon'
    });
  }
});

module.exports = router;
