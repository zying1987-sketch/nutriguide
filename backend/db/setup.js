const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'nutriguide.db')

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
  `)

  // 检查是否需要创建默认管理员
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin')
  if (adminCount.count === 0) {
    console.log('尚未创建管理员账号，请使用 /api/auth/register 注册第一个用户后手动在数据库中将 role 改为 admin')
  }
}

module.exports = { getDb }
