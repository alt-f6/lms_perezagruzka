const adminUsersService = require("../services/admin.users.service");

function getNewUserPage(req, res) {
  return res.render("admin/users_new", {
    error: null,
    errors: {},
    values: { email: "", name: "" },
  });
}

async function postCreateUser(req, res, next) {
  try {
    const { email, name, password, password2 } = req.body;

    const created = await adminUsersService.createStudent({
      email,
      name,
      password,
      password2,
    });

    return res.render("admin/users_new_success", { user: created });
  } catch (err) {
    if (err.message === "VALIDATION_ERROR" || err.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(err.status || 400).render("admin/users_new", {
        error: err.message === "EMAIL_ALREADY_EXISTS" ? "Email already exists" : "Please fix the errors",
        errors: err.errors || {},
        values: {
          email: req.body.email || "",
          name: req.body.name || "",
        },
      });
    }
    next(err);
  }
}

module.exports = {
  getNewUserPage,
  postCreateUser,
};
