const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('user'));


/*
=================================
GET USER PROFILE
=================================
*/
router.get('/profile', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT id, email, first_name, last_name, phone, avatar_url, is_active, created_at
       FROM users
       WHERE id = ? AND is_active = 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});


/*
=================================
UPDATE USER PROFILE
=================================
*/
router.put('/profile', async (req, res) => {
  try {

    const { first_name, last_name, phone, avatar_url } = req.body;

    await db.query(
      `UPDATE users
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           phone = COALESCE(?, phone),
           avatar_url = COALESCE(?, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        first_name || null,
        last_name || null,
        phone || null,
        avatar_url || null,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

module.exports = router;
