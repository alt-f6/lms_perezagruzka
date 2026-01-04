const lessonsRepo = require("../repos/lessons.repo");

async function getLessonForStudent(lessonId) {
  const lesson = await lessonsRepo.getPublishedLessonById(lessonId);
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.code = "LESSON_NOT_FOUND";
    throw err;
  }
  return lesson;
}

module.exports = {
  getLessonForStudent,
};