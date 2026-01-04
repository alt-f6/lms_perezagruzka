const userRepo = require("../repos/user.repo");

async function attachCurrentUser(req, res, next) {
  try {
    req.user = null;

    const userId = req.session && req.session.user_id;
    if (!userId) {
      res.locals.user = null;
      return next();
    }

    const user = await userRepo.findById(userId);

    if (!user) {
      console.log("attachCurrentUser: user not found in DB for id =", userId);
      req.session.user_id = null;
      req.session.role = null;
      res.locals.user = null;
      return next();
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    res.locals.user = req.user;
    return next();
  } catch (err) {
    console.log("attachCurrentUser ERROR:", err);
    return next(err);
  }
}

module.exports = { attachCurrentUser };
