const service = require("../services/admin.lessons.service");

function extractEmbedUrl(input) {
  if (!input) return null;

  const iframeMatch = input.match(/src="([^"]+)"/i);
  if (iframeMatch) return iframeMatch[1];

  return input.trim();
}

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
    const { content, video_url } = req.body;

    await service.updateLesson(req.params.id, {
      content,
    });

    const videoUrl = extractEmbedUrl(video_url);

    await service.updateLessonVideo(req.params.id, {
      videoUrl,
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
