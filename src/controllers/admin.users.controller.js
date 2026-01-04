const adminUserRepo = require("../repos/admin.user.repo");

async function getUsersPage(req, res, next) {
  try {
    const q = req.query.q || "";
    const page = req.query.page || "1";
    const limit = req.query.limit || "20";

    const result = await adminUserRepo.listUsers({ q, page, limit });

    const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

    return res.render("admin/users", {
      q,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages,
      users: result.rows,
      session: req.session,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsersPage,
};
