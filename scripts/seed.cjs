/**
 * Seed script — creates admin user and invite codes.
 * Run: node scripts/seed.cjs
 */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'dash.db');
const fs = require('fs');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      company_name TEXT DEFAULT '',
      status TEXT DEFAULT 'queued',
      notes TEXT DEFAULT '',
      error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      report_count INTEGER DEFAULT 0,
      month TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, month)
    );
    CREATE TABLE IF NOT EXISTS invite_codes (
      code TEXT PRIMARY KEY,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function nanoid(size = 16) {
  return randomBytes(size).toString('base64url').slice(0, size);
}

async function seed() {
  initSchema();

  const ADMIN_EMAIL = 'kanishkchawla2@gmail.com';
  const ADMIN_PASSWORD = 'admin123'; // CHANGE THIS IN PRODUCTION

  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL);
  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    db.prepare(
      'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(nanoid(16), ADMIN_EMAIL, 'Kanishk', passwordHash, 'admin');
    console.log('✓ Admin user created:', ADMIN_EMAIL);
  } else {
    console.log('→ Admin user exists:', ADMIN_EMAIL);
  }

  for (const code of ['BETA2025', 'DASHLAUNCH', 'CLOSEFOLKS']) {
    db.prepare('INSERT OR IGNORE INTO invite_codes (code) VALUES (?)').run(code);
  }
  console.log('✓ Invite codes: BETA2025, DASHLAUNCH, CLOSEFOLKS');

  db.close();
  console.log('✓ Seed complete');
}

seed().catch(console.error);
