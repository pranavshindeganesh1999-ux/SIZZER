// ============================================================
//  serviceRoutes.js  –  Salon Service Routes
//  Covers:
//    Owner  → GET / POST / PUT / DELETE per salon
//    Public → GET all salons' services (user browse)
//    Auth   → POST /appointments (user booking)
// ============================================================

const express = require("express");
const router  = express.Router();
const db      = require("../db");           // adjust to your DB helper
const auth    = require("../middleware/auth");      // sets req.user
const ownerAuth = require("../middleware/ownerAuth"); // verifies salon ownership

// ──────────────────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────────────────

/** Validate a service form payload; returns an error object (empty = valid). */
function validateService(body) {
  const errors = {};
  const { name, price } = body;

  if (!name || String(name).trim().length < 2) {
    errors.name = "Service name must be at least 2 characters.";
  }
  if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
    errors.price = "Price must be a number ≥ 0.";
  }
  return errors;
}

// ──────────────────────────────────────────────────────────
//  PUBLIC / USER  –  Browse services across all salons
//  GET /salons?limit=100  (already exists – just listed for context)
// ──────────────────────────────────────────────────────────

/**
 * GET /salons/:salonId/services
 * Public – returns active services for one salon.
 * Used by: ServicesPage (user browse) + owner Services page.
 */
router.get("/salons/:salonId/services", async (req, res) => {
  try {
    const { salonId } = req.params;

    // Verify salon exists
    const salon = await db.query("SELECT id FROM salons WHERE id = ?", [salonId]);
    if (!salon.length) {
      return res.status(404).json({ success: false, message: "Salon not found." });
    }

    // Owner requests see all; public requests see only active
    const isOwner = req.headers.authorization
      ? await checkSalonOwnership(req, salonId)
      : false;

    const rows = isOwner
      ? await db.query("SELECT * FROM services WHERE salon_id = ? ORDER BY name ASC", [salonId])
      : await db.query(
          "SELECT * FROM services WHERE salon_id = ? AND is_active = 1 ORDER BY name ASC",
          [salonId]
        );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /salons/:salonId/services", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
//  OWNER  –  Create a service
//  POST /salons/:salonId/services
// ──────────────────────────────────────────────────────────

/**
 * POST /salons/:salonId/services
 * Owner only – add a new service to the salon.
 * Body: { name, category, price, duration_minutes, description?, is_active? }
 */
router.post("/salons/:salonId/services", auth, ownerAuth, async (req, res) => {
  try {
    const { salonId } = req.params;
    const {
      name,
      category        = "Other",
      price,
      duration_minutes = 30,
      description      = "",
      is_active        = true,
    } = req.body;

    // Validation
    const errors = validateService({ name, price });
    if (Object.keys(errors).length) {
      return res.status(422).json({ success: false, errors });
    }

    const result = await db.query(
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

    const newService = await db.query("SELECT * FROM services WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({ success: true, data: newService[0] });
  } catch (err) {
    console.error("POST /salons/:salonId/services", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
//  OWNER  –  Update a service
//  PUT /services/:serviceId
// ──────────────────────────────────────────────────────────

/**
 * PUT /services/:serviceId
 * Owner only – edit an existing service (including status toggle).
 * Body: any subset of { name, category, price, duration_minutes, description, is_active }
 */
router.put("/services/:serviceId", auth, async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Fetch the service and verify the caller owns its salon
    const [svc] = await db.query("SELECT * FROM services WHERE id = ?", [serviceId]);
    if (!svc) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    const ownerCheck = await checkSalonOwnership(req, svc.salon_id);
    if (!ownerCheck) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const {
      name             = svc.name,
      category         = svc.category,
      price            = svc.price,
      duration_minutes = svc.duration_minutes,
      description      = svc.description,
      is_active        = svc.is_active,
    } = req.body;

    // Only run full validation when name/price are explicitly sent
    if (req.body.name !== undefined || req.body.price !== undefined) {
      const errors = validateService({ name, price });
      if (Object.keys(errors).length) {
        return res.status(422).json({ success: false, errors });
      }
    }

    await db.query(
      `UPDATE services
          SET name = ?, category = ?, price = ?, duration_minutes = ?,
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

    const [updated] = await db.query("SELECT * FROM services WHERE id = ?", [serviceId]);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /services/:serviceId", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
//  OWNER  –  Delete a service
//  DELETE /services/:serviceId
// ──────────────────────────────────────────────────────────

/**
 * DELETE /services/:serviceId
 * Owner only – permanently removes the service.
 */
router.delete("/services/:serviceId", auth, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const [svc] = await db.query("SELECT * FROM services WHERE id = ?", [serviceId]);
    if (!svc) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    const ownerCheck = await checkSalonOwnership(req, svc.salon_id);
    if (!ownerCheck) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    await db.query("DELETE FROM services WHERE id = ?", [serviceId]);
    return res.json({ success: true, message: "Service deleted." });
  } catch (err) {
    console.error("DELETE /services/:serviceId", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
//  USER  –  Book an appointment
//  POST /appointments
// ──────────────────────────────────────────────────────────

/**
 * POST /appointments
 * Authenticated user – creates an appointment for a specific service.
 * Body: {
 *   salon_id, service_id, appointment_date,
 *   start_time, end_time, total_price
 * }
 */
router.post("/appointments", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      salon_id,
      service_id,
      appointment_date,
      start_time = "09:00:00",
      end_time   = "10:00:00",
      total_price,
    } = req.body;

    // Basic presence checks
    if (!salon_id || !service_id || !appointment_date) {
      return res.status(422).json({
        success: false,
        message: "salon_id, service_id, and appointment_date are required.",
      });
    }

    // Date must not be in the past
    const today = new Date().toISOString().split("T")[0];
    if (appointment_date < today) {
      return res.status(422).json({
        success: false,
        message: "Appointment date cannot be in the past.",
      });
    }

    // Verify service is active and belongs to the salon
    const [svc] = await db.query(
      "SELECT * FROM services WHERE id = ? AND salon_id = ? AND is_active = 1",
      [service_id, salon_id]
    );
    if (!svc) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive.",
      });
    }

    // Prevent duplicate booking (same user + service + date)
    const [existing] = await db.query(
      `SELECT id FROM appointments
        WHERE user_id = ? AND service_id = ? AND appointment_date = ?
          AND status NOT IN ('cancelled')`,
      [userId, service_id, appointment_date]
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment for this service on that date.",
      });
    }

    const result = await db.query(
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

    return res.status(201).json({ success: true, data: newAppt });
  } catch (err) {
    console.error("POST /appointments", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────────────────
//  PRIVATE HELPER  –  Ownership check (no middleware needed)
// ──────────────────────────────────────────────────────────

/**
 * Returns true if the JWT user owns the given salonId.
 * Works for routes that inline the check without ownerAuth middleware.
 */
async function checkSalonOwnership(req, salonId) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return false;
    const jwt  = require("jsonwebtoken");
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const [row] = await db.query(
      "SELECT id FROM salons WHERE id = ? AND owner_id = ?",
      [salonId, data.id]
    );
    return !!row;
  } catch {
    return false;
  }
}

module.exports = router;