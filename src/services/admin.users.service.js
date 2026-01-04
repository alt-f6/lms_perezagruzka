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

  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (password !== password2) errors.password2 = "Passwords do not match";

  if (Object.keys(errors).length) {
    const err = new Error("VALIDATION_ERROR");
    err.status = 400;
    err.errors = errors;
    throw err;
  }

  const existing = await userRepo.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error("EMAIL_ALREADY_EXISTS");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return adminUserRepo.createStudent({
    email: normalizedEmail,
    name: safeName,
    passwordHash,
  });
}

async function deleteUser(targetUserId, actorUserId) {
  if (String(targetUserId) === String(actorUserId)) {
    const err = new Error("CANNOT_DELETE_SELF");
    err.status = 400;
    throw err;
  }

  const user = await userRepo.findById(targetUserId);
  if (!user) return;

  if (user.role === "admin") {
    const adminsCount = await userRepo.countAdmins();
    if (adminsCount <= 1) {
      const err = new Error("CANNOT_DELETE_LAST_ADMIN");
      err.status = 400;
      throw err;
    }
  }

  await userRepo.deleteUserById(targetUserId);
}

module.exports = {
  createStudent,
  deleteUser,
};
