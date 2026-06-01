# NutriGuide 部署指南

## 架构

```
前端 (Vercel 免费)         后端 (Render 免费)
┌──────────────────┐     ┌──────────────────────┐
│  Vite + React    │     │  Express + SQLite    │
│  CDN 全球加速    │←──→│  Node.js Web Service │
│  HTTPS 自动      │ API │  休眠保护可用        │
└──────────────────┘     └──────────────────────┘
```

---

## 第一步：推送代码到 GitHub

```bash
cd /Users/junes/WorkBuddy/2026-06-01-00-18-11/nutriguide
git init
git add .
git commit -m "Initial commit: NutriGuide MVP"
git branch -M main
# 在 GitHub 创建 nutriguide 仓库，然后：
git remote add origin https://github.com/你的用户名/nutriguide.git
git push -u origin main
```

---

## 第二步：部署后端到 Render

1. 注册 [Render.com](https://render.com)（免费，支持 GitHub 登录）
2. Dashboard → **New +** → **Web Service**
3. 连接刚创建的 GitHub 仓库 `nutriguide`
4. 配置：
   | 字段 | 值 |
   |------|-----|
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Plan | `Free` |
5. 展开 **Advanced → Add Environment Variable**：
   - `JWT_SECRET`：`Generate` 自动生成
   - `GEMINI_API_KEY`：填写你的 Gemini API Key（可选，留空则用本地方案）
   - `DEEPSEEK_API_KEY`：同上（可选）
   - `FRONTEND_URL`：先留空，等前端部署完再填
6. 点击 **Create Web Service**
7. 等待部署完成（约 2-3 分钟），记下后端 URL，格式如：
   ```
   https://nutriguide-backend.onrender.com
   ```

---

## 第三步：部署前端到 Vercel

1. 注册 [Vercel.com](https://vercel.com)（免费，支持 GitHub 登录）
2. Dashboard → **Add New...** → **Project**
3. 导入同一个 GitHub 仓库 `nutriguide`
4. 配置：
   | 字段 | 值 |
   |------|-----|
   | Root Directory | `frontend` |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
5. 展开 **Environment Variables**：
   - `VITE_API_BASE`：`https://你的后端URL.onrender.com/api`
   - 例如：`https://nutriguide-backend.onrender.com/api`
6. 点击 **Deploy**
7. 等待构建完成（约 1 分钟），记下前端 URL，格式如：
   ```
   https://nutriguide.vercel.app
   ```
8. **回到 Render**，在 Backend 服务的 Environment Variables 里设置：
   - `FRONTEND_URL`：`https://你的前端URL.vercel.app`
9. 在 Render 点击 **Manual Deploy → Clear Build Cache & Deploy** 重启后端

---

## 第四步：创建管理员账号

1. 访问前端 URL `https://xxx.vercel.app`
2. 点击右上角 **登录** → **注册**
3. 注册第一个账号（如 `admin@nutriguide.com`）
4. 在 Render 的 Shell 标签页（或本地连数据库）执行：
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 1;
   ```
5. 重新登录，即可访问 `/admin` 管理后台

---

## 免费额度与限制

| 项目 | 免费额度 | 注意事项 |
|------|-----------|-------------|
| Render Web Service | 永久免费 | 15 分钟无流量会休眠，唤醒需 30-50 秒 |
| Vercel Hobby | 永久免费 | 无限带宽，构建不限 |
| Render Postgres | 90 天试用 | 之后 $7/月，建议试用期内升级 |

### 防止后端休眠

注册 [UptimeRobot](https://uptimerobot.com) 免费版：
1. **Add New Monitor** → **HTTP(s)**
2. **URL**：`https://你的后端URL.onrender.com/api/health`
3. **Monitoring Interval**：`5 minutes`
4. 保存 — Render 每 5 分钟收到请求，不会休眠

---

## 可选：自定义域名

- **前端**：Vercel Dashboard → Settings → Domains → 添加域名
- **后端**：Render Dashboard → Settings → Custom Domain → 添加域名

---

## 故障排查

### 前端无法调用后端 API（CORS 错误）
→ 检查 Render 环境变量 `FRONTEND_URL` 是否填写了正确的 Vercel 域名

### 后端唤醒慢
→ 安装 UptimeRobot 保持唤醒

### 数据库数据丢失（Render 休眠后）
→ Render 免费层的磁盘是 **临时** 的，休眠后可能重置。解决方案：
1. 使用 Render Postgres 付费版（$7/月）
2. 或接受临时数据，让用户自行注册和保存

### `better-sqlite3` 构建失败
→ 在 Render 的 Build Command 里加上 `npm rebuild better-sqlite3`
