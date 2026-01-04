const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const adminLessonsEditController = require("../controllers/admin.lessons.edit.controller");

const adminUsersController = require("../controllers/admin.users.controller");
const adminUsersCreateController = require("../controllers/admin.users.create.controller");
const adminUsersDeleteController = require("../controllers/admin.users.delete.controller");

const adminLessonsController = require("../controllers/admin.lessons.controller");
const adminLessonsDeleteController = require("../controllers/admin.lessons.delete.controller");

router.use("/admin", requireAuth, requireRole("admin"));

router.get("/admin", (req, res) => res.redirect("/admin/dashboard"));

router.get("/admin/dashboard", (req, res) => {
  return res.render("admin/dashboard");
});

router.get("/admin/users", adminUsersController.getUsersPage);
router.get("/admin/users/new", adminUsersCreateController.getNewUserPage);
router.post("/admin/users", adminUsersCreateController.postCreateUser);
router.post("/admin/users/:id/delete", adminUsersDeleteController.postDeleteUser);

router.post("/admin/lessons/:id/delete", adminLessonsDeleteController.postDeleteLesson);

router.get("/admin/lessons", adminLessonsController.getLessonsPage);
router.get("/admin/lessons/new", adminLessonsController.getNewLessonPage);
router.get("/admin/lessons/:id/edit", adminLessonsEditController.getEditLesson);
router.post("/admin/lessons/:id", adminLessonsEditController.postEditLesson);
router.post("/admin/lessons", adminLessonsController.postCreateLesson);
router.post("/admin/lessons/:id/publish", adminLessonsController.postTogglePublish);

module.exports = router;
