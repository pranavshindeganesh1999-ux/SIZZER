// ============================================================
//  serviceRoutes.js – Salon Service Routes
// ============================================================

const express = require("express");
<<<<<<< HEAD
const router  = express.Router();
const db      = require("../config/database");           // adjust to your DB helper
const auth    = require("../middleware/auth");      // sets req.user
//const ownerAuth = require("../middleware/ownerAuth"); // verifies salon ownership
=======
const router = express.Router();
const db = require("../config/database");
const { authenticate: auth, ownerAuth } = require("../middleware/auth"); // ✅ FIXED: no separate ownerAuth file needed
const jwt = require("jsonwebtoken");
>>>>>>> 2e5f8e49cfb13012f87f1b47c39db918eb93119e

// ──────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────

function validateService(body) {
  const errors = {};
  const { name, price } = body;

  if (!name || String(name).trim().length < 2) {
    errors.name = "Service name must be at least 2 characters.";
  }

  if (
    price === undefined ||
    price === null ||
    isNaN(price) ||
    Number(price) < 0
  ) {
    errors.price = "Price must be a number ≥ 0.";
  }

  return errors;
}

// ──────────────────────────────────────────────────────────
// PUBLIC – Get services of a salon
// ──────────────────────────────────────────────────────────

router.get("/salons/:salonId/services", async (req, res) => {
  try {
    const { salonId } = req.params;

    const [salonRows] = await db.query(
      "SELECT id FROM salons WHERE id = ?",
      [salonId]
    );

    if (salonRows.length === 0) {
      return res.status(404).json({ success: false, message: "Salon not found." });
    }

    const isOwner = await checkSalonOwnership(req, salonId);

    const [services] = isOwner
      ? await db.query(
          "SELECT * FROM services WHERE salon_id = ? ORDER BY name ASC",
          [salonId]
        )
      : await db.query(
          "SELECT * FROM services WHERE salon_id = ? AND is_active = 1 ORDER BY name ASC",
          [salonId]
        );

    return res.json({ success: true, data: services });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
// OWNER – Create service
// ──────────────────────────────────────────────────────────

router.post("/salons/:salonId/services", ...ownerAuth, async (req, res) => {
  try {
    const { salonId } = req.params;

    const {
      name,
      category = "Other",
      price,
      duration_minutes = 30,
      description = "",
      is_active = true,
    } = req.body;

    const errors = validateService({ name, price });
    if (Object.keys(errors).length) {
      return res.status(422).json({ success: false, errors });
    }

    const [result] = await db.query(
      `INSERT INTO services 
       (salon_id, name, category, price, duration_minutes, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        salonId,
        String(name).trim(),
        category,
        Number(price),
        Number(duration_minutes),
        description,
        is_active ? 1 : 0,
      ]
    );

    const [newService] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: newService[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
// OWNER – Update service
// ──────────────────────────────────────────────────────────

router.put("/services/:serviceId", auth, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    const svc = rows[0];

    const isOwner = await checkSalonOwnership(req, svc.salon_id);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const {
      name = svc.name,
      category = svc.category,
      price = svc.price,
      duration_minutes = svc.duration_minutes,
      description = svc.description,
      is_active = svc.is_active,
    } = req.body;

    if (req.body.name !== undefined || req.body.price !== undefined) {
      const errors = validateService({ name, price });
      if (Object.keys(errors).length) {
        return res.status(422).json({ success: false, errors });
      }
    }

    await db.query(
      `UPDATE services SET
        name = ?, category = ?, price = ?, duration_minutes = ?,
        description = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        String(name).trim(),
        category,
        Number(price),
        Number(duration_minutes),
        description,
        is_active ? 1 : 0,
        serviceId,
      ]
    );

    const [updated] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
// OWNER – Delete service
// ──────────────────────────────────────────────────────────

router.delete("/services/:serviceId", auth, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    const svc = rows[0];

    const isOwner = await checkSalonOwnership(req, svc.salon_id);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    await db.query("DELETE FROM services WHERE id = ?", [serviceId]);

    return res.json({ success: true, message: "Service deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
// USER – Book appointment
// ──────────────────────────────────────────────────────────

router.post("/appointments", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      salon_id,
      service_id,
      appointment_date,
      start_time = "09:00:00",
      end_time = "10:00:00",
      total_price,
    } = req.body;

    if (!salon_id || !service_id || !appointment_date) {
      return res.status(422).json({
        success: false,
        message: "salon_id, service_id, and appointment_date are required.",
      });
    }

    const today = new Date().toISOString().split("T")[0];
    if (appointment_date < today) {
      return res.status(422).json({
        success: false,
        message: "Appointment date cannot be in the past.",
      });
    }

    const [serviceRows] = await db.query(
      "SELECT * FROM services WHERE id = ? AND salon_id = ? AND is_active = 1",
      [service_id, salon_id]
    );

    if (serviceRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive.",
      });
    }

    const svc = serviceRows[0];

    const [existingRows] = await db.query(
      `SELECT id FROM appointments
       WHERE user_id = ? AND service_id = ? AND appointment_date = ?
       AND status != 'cancelled'`,
      [userId, service_id, appointment_date]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment for this service on that date.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO appointments
       (user_id, salon_id, service_id, appointment_date,
        start_time, end_time, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        salon_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        Number(total_price ?? svc.price),
      ]
    );

    const [newAppt] = await db.query(
      "SELECT * FROM appointments WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: newAppt[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
// Ownership helper
// ──────────────────────────────────────────────────────────

async function checkSalonOwnership(req, salonId) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return false;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT id FROM salons WHERE id = ? AND owner_id = ?",
      [salonId, decoded.id]
    );

    return rows.length > 0;
  } catch {
    return false;
  }
}

module.exports = router;