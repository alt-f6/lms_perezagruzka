const lessonsRepo = require("../repos/lessons.repo");

async function getLessonForEdit(id) {
  const lesson = await lessonsRepo.getLessonById(id);
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.code = "LESSON_NOT_FOUND";
    throw err;
  }
  return lesson;
}

async function updateLesson(id, { content }) {
  await lessonsRepo.updateLessonContent(id, content);
}

async function deleteLesson(id) {
  const lesson = await lessonsRepo.getLessonById(id);
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.code = "LESSON_NOT_FOUND";
    throw err;
  }

  await lessonsRepo.deleteLessonById(id);
}

module.exports = {
  getLessonForEdit,
  updateLesson,
  deleteLesson,
};
