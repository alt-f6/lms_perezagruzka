const path = require("path");
const express = require("express");

const { sessionMiddleware } = require("./config/session");
const { attachCurrentUser } = require("./middlewares/attachCurrentUser");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const adminRoutes = require("./routes/admin.routes");
const lessonsRoutes = require("./routes/lessons.routes");

function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/public", express.static(path.join(process.cwd(), "public")));

  app.use(sessionMiddleware());

  app.use((req, res, next) => {
    console.log("LOG1", req.method, req.url);
    console.log("  cookie:", req.headers.cookie || "(none)");
    console.log("  session.user_id:", req.session?.user_id);
    console.log("  session.role:", req.session?.role);
    console.log("  user:", req.user);
    next();
  });

  app.use(attachCurrentUser);

  app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.currentPath = req.path;
    next();
  });

  app.use((req, res, next) => {
    console.log("LOG2", req.method, req.url);
    console.log("  user:", req.user);
    next();
  });

  app.use(authRoutes);
  app.use(studentRoutes);
  app.use(adminRoutes);
  app.use("/lessons", lessonsRoutes);

  app.get("/", (req, res) => {
    if (!req.user) return res.redirect("/login");
    return res.redirect(
      req.user.role === "admin"
        ? "/admin/dashboard"
        : "/student/dashboard"
    );
  });

  app.get("/dashboard", (req, res) => {
    if (!req.user) return res.redirect("/login");
    return res.redirect(
      req.user.role === "admin"
        ? "/admin/dashboard"
        : "/student/dashboard"
    );
  });

  app.use((req, res) => {
    res.status(404).send("Not found");
  });

  return app;
}

module.exports = { createApp };
