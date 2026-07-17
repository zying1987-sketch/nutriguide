# NutriGuide → Zeabur 部署指南

> **为什么选 Zeabur**：台湾团队运营，国内可直连（无需翻墙），免费 tier 可用，支持 Docker 多阶段构建，GitHub 自动部署。

---

## 一、前置准备

1. **GitHub 仓库**：代码已在 `main` 分支（含 `Dockerfile` + 新建的 `zeabur.toml`）
2. **Zeabur 账号**：https://zeabur.com → 用 GitHub 登录
3. **通义千问 API Key**：https://dashscope.aliyun.com （已有：`sk-b5030eaa...`）

---

## 二、创建项目

1. 登录 Zeabur 控制台 → **Projects** → **Create Project**
2. 选择 **Deploy from GitHub repo**
3. 授权并选择 `nutriguide` 仓库
4. Zeabur 自动检测 `Dockerfile` → 开始构建（约 3-5 分钟）

---

## 三、配置环境变量

在 Zeabur 项目 → **Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产模式 |
| `DASHSCOPE_API_KEY` | `sk-b5030eaa2c044ae8b9ff3efd0fbcf843` | 通义千问主模型 |
| `FRONTEND_URL` | `https://你的域名.zeabur.app` | CORS 白名单 |
| `ADMIN_EMAIL` | `junefwo@126.com` | 自动创建管理员 |
| `ADMIN_PASSWORD` | `admin123` | 管理员密码 |
| `DB_PATH` | `/app/data/nutriguide.db` | SQLite 路径 |

> 部署后 Zeabur 会分配 `*.zeabur.app` 子域名，把 `FRONTEND_URL` 改成实际域名即可。

---

## 四、验证部署

1. 等待构建完成（状态变绿）
2. 访问 `https://你的项目.zeabur.app/api/health` → 应返回 `{"status":"ok"}`
3. 访问首页 → 双入口布局正常
4. 访问 `/#/admin` → 用 `junefwo@126.com / admin123` 登录

---

## 五、数据库持久化（重要）

⚠️ **Zeabur 免费版存储是临时的**：每次重新部署，SQLite 数据会重置。

**影响**：
- ✅ 管理员账号会自动重建（setup.js 逻辑）
- ❌ 用户自测记录、积分会丢失

**解决方案（按推荐顺序）**：

### 方案 A：升级 Zeabur 付费版 + 挂载持久卷（推荐）
- 价格：~$5/月
- 在 Zeabur 项目 → **Storage** → 添加 Volume，挂载到 `/app/data`
- SQLite 数据永久保存

### 方案 B：使用 Zeabur PostgreSQL（免费 512MB）
- 项目 → **Add Service** → **Database** → **PostgreSQL**
- 需改后端代码：`better-sqlite3` → `pg`（约 1-2 天工作量）
- 适合长期生产

### 方案 C：MVP 阶段接受临时存储
- 不改动代码，部署即用
- 适合演示 / 早期验证

---

## 六、自定义域名（可选）

1. Zeabur 项目 → **Domains** → **Add Domain**
2. 添加你的域名（如 `nutriguide.com`）
3. 在域名 DNS 添加 CNAME 指向 Zeabur
4. Zeabur 自动签发 SSL 证书

---

## 七、本地测试命令参考

```bash
# 本地启动（已在运行）
cd backend && NODE_OPTIONS="" node server.js

# 本地访问
# 首页: http://localhost:3030
# 后台: http://localhost:3030/#/admin
```

---

## 八、回滚方案

若 Zeabur 部署失败：
1. 本地服务仍可用：`http://localhost:3030`
2. 回退到 Railway：充值后 resume（不推荐，需翻墙）
3. 迁移阿里云轻量服务器：见 `DEPLOY_ALIYUN.md`（待补充）
