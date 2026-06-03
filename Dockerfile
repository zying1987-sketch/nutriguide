# ============================================================
# NutriGuide Dockerfile — 多阶段构建
# 阶段1: 构建前端 → 阶段2: 生产运行
# ============================================================

# ---------- 阶段1: 前端构建 ----------
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---------- 阶段2: 生产镜像 ----------
FROM node:22-alpine

WORKDIR /app

# 安装 SQLite 命令行工具（用于备份）
RUN apk add --no-cache sqlite

# 复制后端依赖文件并安装
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# 复制后端源码
COPY backend/ ./

# 复制前端构建产物（vite.config 输出到 ../backend/public，即 /app/backend/public）
COPY --from=frontend-builder /app/backend/public ./public

# 复制知识库（backend 运行时需要 ../knowledge-base/ 路径）
COPY knowledge-base/ ../knowledge-base/

# 复制备份脚本
COPY scripts/ ./scripts/

# 创建数据目录（Railway 卷挂载点）
RUN mkdir -p /app/data

# 环境变量默认值
ENV NODE_ENV=production
ENV PORT=3030
ENV DB_PATH=/app/data/nutriguide.db

EXPOSE 3030

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "var p=process.env.PORT||3030;require('http').get('http://localhost:'+p+'/api/health',function(r){process.exit(r.statusCode===200?0:1)})"

CMD ["node", "server.js"]
