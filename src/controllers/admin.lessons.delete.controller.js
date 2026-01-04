const service = require("../services/admin.lessons.service");

async function postDeleteLesson(req, res) {
  await service.deleteLesson(req.params.id);
  res.redirect("/admin/lessons");
}

module.exports = {
  postDeleteLesson,
};
