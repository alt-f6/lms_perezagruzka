require('dotenv').config();
const bcrypt = require('bcrypt');
const usersRepo = require('../src/repos/usersRepo');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await usersRepo.createUser({
    email,
    passwordHash,
    role: 'admin',
    name,
  });

  console.log('Admin created:', { id: admin.id, email: admin.email, role: admin.role });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
