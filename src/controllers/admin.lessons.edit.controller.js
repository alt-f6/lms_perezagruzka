const service = require("../services/admin.lessons.service");

async function getEditLesson(req, res, next) {
  try {
    const lesson = await service.getLessonForEdit(req.params.id);

    return res.render("admin/lessons/edit", {
      title: `Edit: ${lesson.title}`,
      lesson,
    });
  } catch (err) {
    if (err && err.code === "LESSON_NOT_FOUND") {
      return res.status(404).render("errors/404", { message: "Lesson not found" });
    }
    return next(err);
  }
}

async function postEditLesson(req, res, next) {
  try {
    await service.updateLesson(req.params.id, {
      content: req.body.content,
    });

    return res.redirect("/admin/lessons");
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getEditLesson,
  postEditLesson,
};