const lessonRepo = require("../repos/lesson.repo");

async function getLessonsPage(req, res, next) {
  try {
    const lessons = await lessonRepo.listLessonsAdmin();
    res.render("admin/lessons", { lessons });
  } catch (e) {
    next(e);
  }
}

async function getNewLessonPage(req, res) {
  res.render("admin/lesson_new", {
    error: null,
    values: { title: "", description: "", order: 0, video_url: "" },
  });
}

async function postCreateLesson(req, res, next) {
  try {
    const { title, description, order, video_url } = req.body;

    if (!title || !title.trim()) {
      return res.render("admin/lesson_new", {
        error: "Title is required",
        values: { title, description, order, video_url },
      });
    }

    await lessonRepo.createLesson({
      title: title.trim(),
      description,
      videoUrl: video_url,
      order,
      isPublished: false,
    });

    res.redirect("/admin/lessons");
  } catch (e) {
    next(e);
  }
}

async function postTogglePublish(req, res, next) {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    await lessonRepo.setPublished(id, is_published === "true");
    res.redirect("/admin/lessons");
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getLessonsPage,
  getNewLessonPage,
  postCreateLesson,
  postTogglePublish,
};
