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
  `)

  // 检查是否需要创建默认管理员
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin')
  if (adminCount.count === 0) {
    console.log('尚未创建管理员账号，请使用 /api/auth/register 注册第一个用户后手动在数据库中将 role 改为 admin')
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
