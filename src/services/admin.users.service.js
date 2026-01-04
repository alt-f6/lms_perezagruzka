const bcrypt = require("bcrypt");
const adminUserRepo = require("../repos/admin.user.repo");
const userRepo = require("../repos/user.repo");

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function createStudent({ email, name, password, password2 }) {
  const normalizedEmail = normalizeEmail(email);
  const safeName = String(name || "").trim() || null;

  const errors = {};

  if (!normalizedEmail) errors.email = "Email is required";
  if (normalizedEmail && !normalizedEmail.includes("@")) errors.email = "Invalid email";

  const p1 = String(password || "");
  const p2 = String(password2 || "");

  if (p1.length < 8) errors.password = "Password must be at least 8 characters";
  if (p1 !== p2) errors.password2 = "Passwords do not match";

  if (Object.keys(errors).length > 0) {
    const err = new Error("VALIDATION_ERROR");
    err.status = 400;
    err.errors = errors;
    throw err;
  }

  const existing = await userRepo.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error("EMAIL_ALREADY_EXISTS");
    err.status = 409;
    err.errors = { email: "Email already exists" };
    throw err;
  }

  const passwordHash = await bcrypt.hash(p1, BCRYPT_ROUNDS);

  return adminUserRepo.createStudent({
    email: normalizedEmail,
    name: safeName,
    passwordHash,
  });
}

module.exports = {
  createStudent,
};
