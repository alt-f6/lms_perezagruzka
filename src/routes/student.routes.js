const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

const pool = require("../db");

router.use("/student", requireAuth, requireRole("student"));

router.get("/student", (req, res) => res.redirect("/student/dashboard"));

router.get("/student/dashboard", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT id, title, description
      FROM lessons
      WHERE is_published = true
      ORDER BY "order" ASC, created_at ASC
      `
    );

    return res.render("student/dashboard", {
      lessons: result.rows,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
