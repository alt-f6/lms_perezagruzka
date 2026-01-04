const USERS = [
    {
        id: 1,
        email: "admin@lms.local",
        password: "123",
        role: "admin",
        name: "Admin"
    },
    {
        id: 2,
        email: "student@lms.local",
        password: "123",
        role: "student",
        name: "Student"
    }
];

function findUserByEmail(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    return USERS.find(u => u.email.toLowerCase() === normalized) || null;
}

function findUserById(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  return USERS.find(u => u.id === num) || null;
}

module.exports = {
    USERS,
    findUserByEmail,
    findUserById
}