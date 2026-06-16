## GitHub Pages（离线可读版）

在线访问（静态镜像）：`https://jianshenghuang2922.github.io/my-site/`

> GitHub Pages 版本为**静态导出**（离线可读）。可浏览评价，但**不支持提交评价**（无服务端 API）。

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 部署方式一：GitHub Pages（静态导出）

本仓库已内置 GitHub Actions 工作流（`.github/workflows/deploy-github-pages.yml`）。

在 GitHub 仓库中启用 Pages：
- GitHub → **Settings** → **Pages**
- **Source** 选择 **GitHub Actions**

之后每次推送 `main`，会自动构建并发布到 GitHub Pages。

如果你打开后看到的是 `README.md` 页面，说明 Pages 仍在使用“Branch”模式：
- 到 **Settings → Pages**
- 把 **Source** 改为 **GitHub Actions**
- 等待 `Deploy to GitHub Pages` 工作流完成后刷新页面

你也可以本地验证静态导出：

```bash
npm run build:gh-pages
```

产物在 `out/`。

## 部署方式二：Vercel（完整版：支持提交/PR/按需刷新）

Vercel 部署可启用服务端 API：
- `/api/submit-review`：创建 GitHub PR（含 Turnstile 人机验证）
- `/api/revalidate`：Webhook 按需刷新（用于内容增量更新）

### 1) 导入仓库

在 Vercel 新建项目并导入该仓库即可。

### 2) 配置环境变量（Vercel Project → Settings → Environment Variables）

- **Turnstile**
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
- **GitHub（提交 PR / 读取内容）**
  - `GITHUB_OWNER=jianshenghuang2922`
  - `GITHUB_REPO=my-site`
  - `GITHUB_TOKEN=...`（建议最小权限：`contents:write` + `pull_requests:write`；私有仓库读取也需要）
  - `REVIEW_DATA_SOURCE=github`（生产环境建议开启：运行时从 GitHub 拉取最新 Markdown）
  - `GITHUB_CONTENT_BRANCH=main`（可选，默认 `main`）
- **按需刷新（Webhook）**
  - `REVALIDATE_SECRET=...`（用于保护 `/api/revalidate`）

### 3) （可选）跳过内容变更导致的全量重建

如果你希望 “仅 `content/reviews/` 变更时不触发 Vercel 全站重构”，可以在 Vercel：
- **Settings → Git → Ignored Build Step** 填入：

```bash
bash scripts/vercel-ignore-build.sh
```

并通过 GitHub Actions 调用 `/api/revalidate` 来增量更新页面。


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
