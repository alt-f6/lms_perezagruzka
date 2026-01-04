const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const controller = require("../controllers/lessons.view.controller");

const router = express.Router();

router.get(
  "/:id",
  requireAuth,
  requireRole("student"),
  controller.viewLesson
);

module.exports = router;
