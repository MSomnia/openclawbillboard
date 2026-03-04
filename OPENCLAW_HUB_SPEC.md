# OpenClaw Hub — 项目规划与技术规格书

> 本文档用于在 Claude Code 中指导项目的逐步实现。请将此文件放在项目根目录，作为开发参考。

---

## 1. 项目概述

**项目名称**: OpenClaw Hub  
**目标**: 构建一个自动聚合 GitHub 上所有 OpenClaw 相关项目信息的网站，每日自动采集、分析并展示项目动态。  
**核心价值**: 一站式追踪 OpenClaw 生态的所有开源项目，包括活跃度、趋势、新项目发现。

---

## 2. 技术栈

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| 框架 | Next.js 14+ (App Router) | 全栈统一，SSG 静态生成为核心 |
| 语言 | TypeScript | 类型安全，减少运行时错误 |
| 数据库 | SQLite (via Prisma ORM) | 零运维，文件级存储，提交到 Git |
| 样式 | Tailwind CSS | 快速开发，与 Next.js 深度集成 |
| 图表 | Recharts | React 生态，轻量级趋势图 |
| 定时任务 | GitHub Actions (cron schedule) | 免服务器，每日自动采集+构建 |
| 部署 | Vercel (SSG 静态部署) | 免费，自动部署，无需本地服务器 |

### 2.1 部署架构说明（方案 B：Git 托管 SQLite + Vercel 静态部署）

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions (每日定时)                      │
│                                                                  │
│  1. 拉取仓库代码（含 SQLite 数据库文件）                            │
│  2. 运行采集脚本 → 调用 GitHub API → 写入 SQLite                   │
│  3. 将更新后的 SQLite 文件提交回 Git 仓库                           │
│  4. Git push 触发 Vercel 自动重新部署                              │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────┐           ┌──────────────────────────────┐
│   GitHub 仓库         │           │   Vercel (自动构建)           │
│                      │  push触发  │                              │
│  - 源代码             │ ────────► │  1. npm ci                   │
│  - prisma/dev.db     │           │  2. npx prisma generate      │
│    (SQLite 数据文件)  │           │  3. next build (SSG 静态生成) │
│                      │           │  4. 部署静态页面               │
└──────────────────────┘           └──────────────┬───────────────┘
                                                  │
                                                  ▼
                                   ┌──────────────────────────────┐
                                   │   用户访问                     │
                                   │   https://openclaw-hub.vercel │
                                   │   .app                        │
                                   │                              │
                                   │   ✅ 24 小时可访问             │
                                   │   ✅ 无需本地电脑开机           │
                                   │   ✅ 全部免费                  │
                                   │   ✅ 每日自动更新数据           │
                                   └──────────────────────────────┘
```

**为什么选择这个方案：**
- OpenClaw 项目数据变化频率为日级，无需实时查询，SSG 完全满足需求
- SQLite 文件提交到 Git，采集和构建都在 GitHub Actions 的云端 runner 上完成
- Vercel 免费额度（每月 100GB 带宽）对个人聚合站绰绰有余
- 你的电脑完全不需要开着，整个系统自动运行
- 后续如数据量增大，可无缝迁移到 Turso（云端 SQLite）或 PostgreSQL

**局限性：**
- 数据每天只更新一次（对本项目足够）
- SQLite 文件长期提交会让 Git 仓库变大（可通过 Git LFS 或定期压缩历史缓解）
- 不支持用户实时交互写入（如评论、收藏），如需要则迁移到云数据库

---

## 3. 项目目录结构

```
openclaw-hub/
├── OPENCLAW_HUB_SPEC.md          # 本规格文档
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma              # 数据模型定义
│   ├── dev.db                     # SQLite 数据文件（提交到 Git）
│   └── migrations/                # 数据库迁移文件
├── src/
│   ├── data/                      # 导出的 JSON 数据（由采集脚本生成，提交到 Git）
│   │   ├── projects.json          # 所有项目列表
│   │   ├── snapshots.json         # 趋势快照数据
│   │   ├── stats.json             # 聚合统计
│   │   └── trending.json          # 趋势排行榜
│   ├── app/                       # Next.js App Router 页面（SSG 静态生成）
│   │   ├── layout.tsx             # 全局布局（导航栏、页脚）
│   │   ├── page.tsx               # 首页：热门项目 + 最近活跃
│   │   ├── projects/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # 项目详情页
│   │   ├── discover/
│   │   │   └── page.tsx           # 发现页：筛选与搜索
│   │   └── trends/
│   │       └── page.tsx           # 趋势页：Star/Fork 增长排行
│   ├── lib/
│   │   ├── github.ts              # GitHub API 封装
│   │   ├── db.ts                  # Prisma 客户端实例（仅采集脚本使用）
│   │   ├── data.ts                # JSON 数据读取工具（SSG 页面使用）
│   │   ├── analyzer.ts            # 趋势分析与评分逻辑
│   │   └── constants.ts           # 搜索关键词、配置常量
│   ├── components/
│   │   ├── ProjectCard.tsx        # 项目卡片组件
│   │   ├── TrendChart.tsx         # Star/Fork 趋势图
│   │   ├── FilterBar.tsx          # 筛选栏（语言、活跃度、排序）
│   │   ├── Navbar.tsx             # 顶部导航
│   │   └── Footer.tsx             # 页脚
│   └── types/
│       └── index.ts               # TypeScript 类型定义
├── scripts/
│   ├── fetch-daily.ts             # 每日采集脚本（GitHub Actions 调用）
│   └── export-json.ts            # 数据导出脚本（SQLite → JSON，供 SSG 使用）
└── .github/
    └── workflows/
        └── daily-fetch.yml        # GitHub Actions 定时工作流
```

---

## 4. 数据模型 (Prisma Schema)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // file:./dev.db
}

generator client {
  provider = "prisma-client-js"
}

// 核心：GitHub 仓库信息
model Repository {
  id              Int       @id @default(autoincrement())
  githubId        Int       @unique          // GitHub 仓库 ID
  fullName        String    @unique          // owner/repo
  name            String                     // 仓库名
  owner           String                     // 所有者
  description     String?                    // 仓库描述
  url             String                     // 仓库 URL
  homepage        String?                    // 项目主页
  language        String?                    // 主要编程语言
  stars           Int       @default(0)      // 当前 Star 数
  forks           Int       @default(0)      // 当前 Fork 数
  openIssues      Int       @default(0)      // 开放 Issue 数
  topics          String    @default("[]")   // JSON 数组：标签
  license         String?                    // 许可证
  isArchived      Boolean   @default(false)  // 是否归档
  createdAt       DateTime                   // 仓库创建时间
  updatedAt       DateTime                   // 仓库最后更新时间
  pushedAt        DateTime?                  // 最后 push 时间
  firstSeenAt     DateTime  @default(now())  // 首次被本系统发现的时间
  lastFetchedAt   DateTime  @default(now())  // 最后采集时间
  activityScore   Float     @default(0)      // 综合活跃度评分

  // 关联
  snapshots       DailySnapshot[]
  commits         CommitRecord[]

  @@index([stars])
  @@index([activityScore])
  @@index([language])
}

// 每日快照：追踪指标变化趋势
model DailySnapshot {
  id            Int       @id @default(autoincrement())
  repositoryId  Int
  date          DateTime                    // 快照日期
  stars         Int                         // 当日 Star 数
  forks         Int                         // 当日 Fork 数
  openIssues    Int                         // 当日 Issue 数
  starsDelta    Int       @default(0)       // 相比前一天 Star 增量
  forksDelta    Int       @default(0)       // 相比前一天 Fork 增量
  commitsCount  Int       @default(0)       // 当日 commit 数量

  repository    Repository @relation(fields: [repositoryId], references: [id])

  @@unique([repositoryId, date])
  @@index([date])
  @@index([starsDelta])
}

// 最近 Commit 记录
model CommitRecord {
  id            Int       @id @default(autoincrement())
  repositoryId  Int
  sha           String
  message       String
  authorName    String
  authorDate    DateTime
  url           String

  repository    Repository @relation(fields: [repositoryId], references: [id])

  @@unique([repositoryId, sha])
  @@index([authorDate])
}

// 系统运行日志
model FetchLog {
  id            Int       @id @default(autoincrement())
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  reposFound    Int       @default(0)
  reposUpdated  Int       @default(0)
  newRepos      Int       @default(0)
  errors        String    @default("[]")    // JSON 数组：错误信息
  status        String    @default("running") // running | completed | failed
}
```

---

## 5. 核心模块设计

### 5.1 GitHub API 封装 (`src/lib/github.ts`)

```
功能：
- searchRepositories(keywords: string[]): 搜索包含关键词的仓库
  - 搜索关键词: ["openclaw", "open-claw", "open_claw"]
  - API: GET /search/repositories?q={keyword}&sort=updated
  - 处理分页，合并去重

- getRepoDetails(fullName: string): 获取单个仓库详情
  - API: GET /repos/{owner}/{repo}

- getRecentCommits(fullName: string, since: Date): 获取最近 commit
  - API: GET /repos/{owner}/{repo}/commits?since={date}

- 速率限制处理:
  - 读取 X-RateLimit-Remaining header
  - 剩余 < 100 时降速（增加请求间隔）
  - 剩余 = 0 时等待至 X-RateLimit-Reset

- 认证:
  - 使用 GITHUB_TOKEN 环境变量
  - 带 token: 5000 请求/小时
```

### 5.2 每日采集脚本 (`scripts/fetch-daily.ts`)

```
执行流程：
1. 创建 FetchLog 记录
2. 遍历搜索关键词，调用 searchRepositories
3. 对每个仓库：
   a. 查询数据库是否已存在
   b. 存在 → 更新指标 + 创建 DailySnapshot（含增量计算）
   c. 不存在 → 插入新记录 + 首个 DailySnapshot
   d. 获取最近 24h 的 commit 并入库
4. 计算所有仓库的 activityScore（见 5.3）
5. 更新 FetchLog 状态
6. 输出采集报告到 stdout（供 GitHub Actions 日志查看）
```

### 5.3 活跃度评分 (`src/lib/analyzer.ts`)

```
activityScore 计算公式（0-100 分）:

score = w1 * normalize(recentCommits)      // 近 7 天 commit 数
      + w2 * normalize(starGrowthRate)       // 近 7 天 star 增长率
      + w3 * normalize(issueActivity)        // 近 7 天 issue 活动
      + w4 * normalize(daysSinceLastPush)    // 最后 push 距今天数（越近越高）
      + w5 * normalize(totalStars)           // 总 star 数（基线热度）

建议权重:
  w1 = 0.30 (commit 活跃度最重要)
  w2 = 0.25 (star 增长反映社区关注)
  w3 = 0.15 (issue 活动反映用户参与)
  w4 = 0.20 (更新频率)
  w5 = 0.10 (基线热度)

normalize: min-max 归一化到 [0, 1]
```

---

## 6. 前端页面规划

### 6.1 首页 (`/`)

- **Hero 区域**: 项目标题 + 简介 + 统计数字（总项目数、今日新增、活跃项目数）
- **热门项目**: Top 10 by star，卡片式展示
- **近期活跃**: Top 10 by activityScore，展示最近 commit 摘要
- **新发现**: 最近 7 天新入库的项目

### 6.2 项目详情页 (`/projects/[slug]`)

- 仓库基本信息（描述、语言、许可证、链接）
- Star / Fork 趋势折线图（Recharts，最近 30 天）
- Commit 时间线（最近 20 条 commit）
- 活跃度评分雷达图

### 6.3 发现页 (`/discover`)

- 筛选栏：语言、Star 范围、活跃度范围、排序方式
- 搜索框：仓库名 / 描述关键词搜索
- 分页列表展示

### 6.4 趋势页 (`/trends`)

- 今日 Star 增长最快 Top 10
- 本周最活跃 Top 10
- 新兴项目（创建时间 < 30 天 & Star > 10）

---

## 7. GitHub Actions 定时工作流

### 7.1 每日数据采集 + 触发部署

```yaml
# .github/workflows/daily-fetch.yml

name: Daily OpenClaw Fetch & Deploy

on:
  schedule:
    - cron: '0 8 * * *'    # 每天 UTC 8:00（北京时间 16:00）
  workflow_dispatch:         # 支持手动触发

jobs:
  fetch-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: file:./prisma/dev.db

      - name: Execute daily fetch
        run: npx tsx scripts/fetch-daily.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          DATABASE_URL: file:./prisma/dev.db

      - name: Export data to JSON (供 SSG 使用)
        run: npx tsx scripts/export-json.ts
        env:
          DATABASE_URL: file:./prisma/dev.db

      - name: Commit data changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add prisma/dev.db src/data/
          git diff --staged --quiet || git commit -m "chore: daily data update $(date -u +%Y-%m-%d)"
          git push
        # push 后 Vercel 会自动检测到新 commit 并触发重新构建部署
```

### 7.2 数据导出脚本 (`scripts/export-json.ts`)

```
目的：将 SQLite 数据导出为 JSON 文件，供 Next.js SSG 在构建时直接读取。
      这样 Vercel 构建时无需连接数据库，只需读取 JSON 即可。

输出文件：
- src/data/projects.json        → 所有项目列表（含最新指标）
- src/data/snapshots.json       → 最近 30 天快照数据（供趋势图使用）
- src/data/stats.json           → 聚合统计（总项目数、今日新增、活跃数等）
- src/data/trending.json        → 趋势排行榜数据

流程：
1. 从 SQLite 查询所有数据
2. 按页面需求组织成 JSON 结构
3. 写入 src/data/ 目录
4. 这些 JSON 文件会被 git commit 并推送，Vercel 构建时直接 import 使用
```

---

## 8. 环境变量

```env
# .env.local

# GitHub Personal Access Token（需要 public_repo 权限）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 数据库路径
DATABASE_URL=file:./prisma/dev.db

# 可选：部署 URL
NEXT_PUBLIC_SITE_URL=https://openclaw-hub.vercel.app
```

---

## 9. 实施计划（分阶段）

### Phase 1: 基础采集 (Day 1-2)
- [ ] 初始化 Next.js + TypeScript + Tailwind 项目
- [ ] 配置 Prisma + SQLite，执行初始迁移
- [ ] 实现 `src/lib/github.ts`（搜索、详情、commits）
- [ ] 实现 `scripts/fetch-daily.ts`（完整采集流程）
- [ ] 实现 `scripts/export-json.ts`（SQLite → JSON 导出）
- [ ] 本地运行验证：采集 → 入库 → 导出 JSON 全链路通畅

### Phase 2: 前端展示 (Day 3-5)
- [ ] 实现 `src/lib/data.ts`（从 JSON 读取数据的工具函数）
- [ ] 实现全局布局（Navbar + Footer）
- [ ] 首页：统计卡片 + 热门项目列表（SSG，从 JSON 读数据）
- [ ] 项目详情页：基本信息 + 趋势图（SSG + generateStaticParams）
- [ ] 发现页：客户端筛选 + 搜索（加载完整 JSON 后在浏览器端筛选）

### Phase 3: 自动化与部署 (Day 6-7)
- [ ] 配置 GitHub Actions 定时工作流（采集 → 导出 → 提交 → 触发部署）
- [ ] 注册 Vercel，关联 GitHub 仓库，配置自动部署
- [ ] 配置 GitHub Secrets（GH_PAT）
- [ ] 手动触发一次 workflow 验证全流程
- [ ] 添加活跃度评分系统
- [ ] 添加趋势页

### Phase 4: 增强功能 (后续迭代)
- [ ] RSS 订阅：新项目通知
- [ ] 邮件摘要：每周 OpenClaw 生态报告
- [ ] 对比功能：两个项目并排对比
- [ ] 贡献者排行榜
- [ ] 暗色模式支持
- [ ] 数据库迁移到 Turso（如 Git 仓库体积过大）

---

## 10. 开发命令速查

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 数据库操作
npx prisma migrate dev      # 创建迁移
npx prisma studio           # 可视化查看数据
npx prisma generate          # 重新生成客户端

# 手动执行采集
npx tsx scripts/fetch-daily.ts

# 构建
npm run build
npm start
```

---

## 注意事项

1. **GitHub API 速率限制**: 未认证 60次/小时，认证后 5000次/小时。务必使用 Token。
2. **SQLite 并发**: SQLite 不支持高并发写入，但本项目为日级单进程采集，完全够用。
3. **数据库存储在 Git 中**: SQLite 文件和导出的 JSON 都提交到 Git。优点是简单免费；缺点是仓库体积会逐步增大。可通过以下方式缓解：
   - 使用 Git LFS 管理 `prisma/dev.db` 文件
   - 定期用 `git filter-branch` 清理历史中的旧数据库文件
   - 当仓库超过 500MB 时考虑迁移到 Turso 云数据库
4. **搜索关键词扩展**: 初期以 `openclaw` 为核心，后续可根据发现的项目动态扩展关联关键词。
5. **SSG 页面与客户端筛选**: 所有页面在构建时生成静态 HTML。发现页的筛选和搜索功能通过加载 JSON 数据后在客户端（浏览器）完成，无需后端 API。
6. **Vercel 部署配置**: 确保 Vercel 项目设置中 Build Command 为 `npm run build`，Output Directory 为 `.next`，且关联了正确的 GitHub 仓库分支。
7. **免费额度参考**: GitHub Actions 免费账户 2000 分钟/月（本项目每天约 2-3 分钟，绰绰有余）；Vercel 免费版 100GB 带宽/月。

---

## 迁移路径（未来扩展）

当项目增长到需要实时交互时，可按以下路径迁移：

```
当前方案 (SQLite + Git + SSG)
    │
    ├─► 中期：SQLite → Turso（云端 SQLite，仅改连接字符串）
    │         去掉 JSON 导出，改为 SSR 直接查询 Turso
    │
    └─► 长期：Turso → PostgreSQL（Supabase / Neon）
              加入用户系统、评论、收藏等实时交互功能
              SSG → SSR/ISR 混合渲染
```
