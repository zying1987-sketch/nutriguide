const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'nutriguide.db')

let db

function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initTables()
  }
  return db
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      step_data TEXT NOT NULL,
      result TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      population_tags TEXT,
      plan_data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_credits (
      user_id INTEGER PRIMARY KEY,
      balance INTEGER NOT NULL DEFAULT 0,
      total_purchased INTEGER NOT NULL DEFAULT 0,
      total_used INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      model TEXT DEFAULT 'qwen-plus',
      credits_used INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      created_by INTEGER,
      used_by INTEGER,
      used_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS agreement_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      agreement_type TEXT NOT NULL DEFAULT 'privacy',
      version TEXT NOT NULL DEFAULT '2026.06',
      accepted_at TEXT DEFAULT (datetime('now')),
      ip_address TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      display_name TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      age INTEGER,
      height INTEGER,
      weight REAL,
      city TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // 迁移：为旧表加列
  try { db.exec('ALTER TABLE users ADD COLUMN phone TEXT DEFAULT \'\'') } catch (e) { /* 已存在 */ }
  try { db.exec('ALTER TABLE users ADD COLUMN wechat_id TEXT DEFAULT \'\'') } catch (e) { /* 已存在 */ }
  try { db.exec('ALTER TABLE assessments ADD COLUMN full_report TEXT DEFAULT \'\'') } catch (e) { /* 已存在 */ }
  try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wechat ON users(wechat_id) WHERE wechat_id != \'\'') } catch (e) { /* 已存在 */ }

  // 自动创建默认管理员（若无管理员账号）
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin')
  if (adminCount.count === 0) {
    const bcrypt = require('bcryptjs')
    const adminEmail = process.env.ADMIN_EMAIL || 'junefwo@126.com'
    const adminPass  = process.env.ADMIN_PASSWORD || 'admin123'
    const hash = bcrypt.hashSync(adminPass, 10)
    const result = db.prepare(
      'INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).run(adminEmail, hash, 'Admin', 'admin')
    if (result.changes > 0) {
      // 为管理员初始化积分
      db.prepare('INSERT OR IGNORE INTO user_credits (user_id, balance, total_purchased) VALUES (?, 100, 100)').run(result.lastInsertRowid)
      console.log(`[setup] 自动创建管理员账号: ${adminEmail}`)
    }
  }

  // 为已有用户初始化积分（如果没有记录）
  const usersWithoutCredits = db.prepare(`
    SELECT u.id FROM users u
    LEFT JOIN user_credits c ON u.id = c.user_id
    WHERE c.user_id IS NULL
  `).all()
  const initCredit = db.prepare('INSERT INTO user_credits (user_id, balance, total_purchased) VALUES (?, 3, 3)')
  for (const u of usersWithoutCredits) {
    initCredit.run(u.id)
  }
  if (usersWithoutCredits.length > 0) {
    console.log(`为 ${usersWithoutCredits.length} 个已有用户初始化了积分`)
  }
}

module.exports = { getDb }
