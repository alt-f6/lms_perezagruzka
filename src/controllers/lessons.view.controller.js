const lessonsService = require("../services/lessons.service");

async function viewLesson(req, res, next) {
  try {
    const lesson = await lessonsService.getLessonForStudent(req.params.id);

    return res.render("lessons/view", {
      title: lesson.title,
      lesson,
    });
  } catch (err) {
    if (err && err.code === "LESSON_NOT_FOUND") {
      return res.status(404).render("errors/404", {
        message: "Lesson not available",
      });
    }
    return next(err);
  }
}

module.exports = {
  viewLesson,
};
