import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'dash.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

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

export function getUserByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserById(id) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser({ id, email, name, passwordHash, role = 'user' }) {
  getDb().prepare(
    'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(id, email, name, passwordHash, role);
}

export function createRequest({ id, userId, symbol, companyName, notes = '' }) {
  getDb().prepare(
    'INSERT INTO requests (id, user_id, symbol, company_name, notes, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, userId, symbol, companyName, notes, 'queued');
}

export function getRequestsByUser(userId, limit = 50) {
  return getDb().prepare(
    'SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit);
}

export function getAllRequests(limit = 100) {
  return getDb().prepare(
    'SELECT r.*, u.email, u.name as user_name FROM requests r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC LIMIT ?'
  ).all(limit);
}

export function getRequestById(id) {
  return getDb().prepare('SELECT * FROM requests WHERE id = ?').get(id);
}

export function updateRequestStatus(id, status, error = null) {
  const stmt = error
    ? getDb().prepare('UPDATE requests SET status = ?, error = ?, completed_at = datetime(\'now\') WHERE id = ?')
    : getDb().prepare('UPDATE requests SET status = ?, completed_at = datetime(\'now\') WHERE id = ?');
  if (error) return stmt.run(status, error, id);
  return stmt.run(status, id);
}

export function getUsage(userId) {
  const month = new Date().toISOString().slice(0, 7);
  let row = getDb().prepare('SELECT report_count FROM usage WHERE user_id = ? AND month = ?').get(userId, month);
  if (!row) {
    getDb().prepare('INSERT OR IGNORE INTO usage (user_id, report_count, month) VALUES (?, 0, ?)').run(userId, month);
    return 0;
  }
  return row.report_count;
}

export function incrementUsage(userId) {
  const month = new Date().toISOString().slice(0, 7);
  getDb().prepare(`
    INSERT INTO usage (user_id, report_count, month) VALUES (?, 1, ?)
    ON CONFLICT(user_id, month) DO UPDATE SET report_count = report_count + 1
  `).run(userId, month);
}

export function validateInviteCode(code) {
  const row = getDb().prepare('SELECT * FROM invite_codes WHERE code = ? AND used = 0').get(code);
  if (row) {
    getDb().prepare('UPDATE invite_codes SET used = 1 WHERE code = ?').run(code);
    return true;
  }
  return false;
}

export function createInviteCode(code) {
  getDb().prepare('INSERT OR IGNORE INTO invite_codes (code) VALUES (?)').run(code);
}
