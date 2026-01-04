const service = require("../services/admin.users.service");

async function postDeleteUser(req, res, next) {
  try {
    await service.deleteUser(req.params.id, req.session.user_id);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postDeleteUser,
};
