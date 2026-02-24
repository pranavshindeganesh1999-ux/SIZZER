const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/* =========================================
   CREATE PAYMENT
========================================= */
router.post('/', async (req, res) => {
  try {
    const {
      appointment_id,
      user_id,
      amount,
      payment_method
    } = req.body;

    const id = uuidv4();

    await db.query(
      `INSERT INTO payments 
       (id, appointment_id, user_id, amount, payment_method, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, appointment_id, user_id, amount, payment_method, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment_id: id
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


/* =========================================
   GET ALL PAYMENTS
========================================= */
router.get('/', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT * FROM payments ORDER BY created_at DESC`
    );

    res.json({ 
      success: true, 
      data: result.rows 
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


/* =========================================
   GET PAYMENT BY ID
========================================= */
router.get('/:id', async (req, res) => {
  try {

    const result = await db.query(
      `SELECT * FROM payments WHERE id = ?`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


/* =========================================
   UPDATE PAYMENT STATUS
========================================= */
router.put('/:id/status', async (req, res) => {
  try {

    const { payment_status, transaction_id } = req.body;

    const allowedStatus = ['pending', 'completed', 'failed', 'refunded'];

    if (!allowedStatus.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const result = await db.query(
      `UPDATE payments 
       SET payment_status = ?, transaction_id = ?
       WHERE id = ?`,
      [payment_status, transaction_id || null, req.params.id]
    );

    // MySQL execute doesn't return affectedRows in your wrapper
    // so just check again if payment exists
    const check = await db.query(
      `SELECT id FROM payments WHERE id = ?`,
      [req.params.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


/* =========================================
   DELETE PAYMENT
========================================= */
router.delete('/:id', async (req, res) => {
  try {

    const result = await db.query(
      `DELETE FROM payments WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
