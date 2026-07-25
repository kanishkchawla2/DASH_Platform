/**
 * Seed script — creates admin user and invite codes.
 * Run: node scripts/seed.js
 */
import { createUser, createInviteCode, getDb } from '../src/lib/db.js';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const ADMIN_EMAIL = 'kanishkchawla2@gmail.com';
const ADMIN_PASSWORD = 'admin123'; // CHANGE THIS

async function seed() {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL);
  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    createUser({ id: nanoid(16), email: ADMIN_EMAIL, name: 'Kanishk', passwordHash, role: 'admin' });
    console.log('✓ Admin user created:', ADMIN_EMAIL);
  } else {
    console.log('→ Admin user already exists:', ADMIN_EMAIL);
  }

  for (const code of ['BETA2025', 'DASHLAUNCH', 'CLOSEFOLKS']) {
    createInviteCode(code);
  }
  console.log('✓ Invite codes created: BETA2025, DASHLAUNCH, CLOSEFOLKS');

  db.close();
}

seed().catch(console.error);
