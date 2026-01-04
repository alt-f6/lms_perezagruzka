const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { redirectIfAuth } = require("../middlewares/redirectIfAuth");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,                
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/login", redirectIfAuth, authController.getLoginPage);

router.post("/login", loginLimiter, authController.postLogin);

router.post("/logout", authController.postLogout);

module.exports = router;
