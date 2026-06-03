#!/bin/sh
# ============================================================
# NutriGuide SQLite 备份脚本
# 用法: ./scripts/backup-db.sh [数据库路径] [备份目录] [保留天数]
# 示例: ./scripts/backup-db.sh ./backend/nutriguide.db ./backups 30
#
# Docker 中: docker compose exec nutriguide sh scripts/backup-db.sh
# 定时任务: 0 3 * * * /app/scripts/backup-db.sh >> /app/data/backup.log 2>&1
# ============================================================

DB_PATH="${1:-${DB_PATH:-./backend/nutriguide.db}}"
BACKUP_DIR="${2:-${BACKUP_DIR:-./data}}"
RETENTION_DAYS="${3:-30}"

# ============================================================
# 安全校验
# ============================================================

if [ ! -f "$DB_PATH" ]; then
  echo "[ERROR] 数据库文件不存在: $DB_PATH"
  exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# ============================================================
# 生成备份文件名
# ============================================================

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="$BACKUP_DIR/nutriguide_${TIMESTAMP}.db"
CHKSUM_FILE="$BACKUP_DIR/nutriguide_${TIMESTAMP}.sha256"

# ============================================================
# 执行备份（使用 SQLite .backup 命令，一致性快照）
# ============================================================

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份: $DB_PATH → $BACKUP_FILE"

if sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份完成: $BACKUP_FILE ($FILE_SIZE)"

  # 生成校验和
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$BACKUP_FILE" | awk '{print $1}' > "$CHKSUM_FILE"
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$BACKUP_FILE" | awk '{print $1}' > "$CHKSUM_FILE"
  fi
else
  echo "[ERROR] 备份失败！"
  exit 1
fi

# ============================================================
# 清理过期备份
# ============================================================

echo "清理 ${RETENTION_DAYS} 天前的备份..."
OLD_COUNT=$(find "$BACKUP_DIR" -name "nutriguide_*.db" -mtime "+${RETENTION_DAYS}" | wc -l | tr -d ' ')

if [ "$OLD_COUNT" -gt 0 ]; then
  find "$BACKUP_DIR" -name "nutriguide_*" -mtime "+${RETENTION_DAYS}" -delete
  echo "已清理 ${OLD_COUNT} 个过期备份"
else
  echo "无过期备份需要清理"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份作业完成"
