const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

const adminUsersController = require("../controllers/admin.users.controller");
const adminUsersCreateController = require("../controllers/admin.users.create.controller");
const adminLessonsController = require("../controllers/admin.lessons.controller");

router.use("/admin", requireAuth, requireRole("admin"));

router.get("/admin", (req, res) => res.redirect("/admin/dashboard"));

router.get("/admin/dashboard", (req, res) => {
  return res.render("admin/dashboard");
});

router.get("/admin/users", adminUsersController.getUsersPage);

router.get("/admin/users/new", adminUsersCreateController.getNewUserPage);

router.post("/admin/users", adminUsersCreateController.postCreateUser);

router.get("/admin/lessons", adminLessonsController.getLessonsPage);
router.get("/admin/lessons/new", adminLessonsController.getNewLessonPage);
router.post("/admin/lessons", adminLessonsController.postCreateLesson);
router.post("/admin/lessons/:id/publish", adminLessonsController.postTogglePublish);

module.exports = router;
