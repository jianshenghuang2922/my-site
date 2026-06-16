# 部署指南

## 快速开始：本地开发

### 1. 创建 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Tokens (classic)"
3. 设置名称：`my-site-dev`
4. **权限勾选**：
   - ✅ `repo` (完整权限)
   - ✅ `write:repo_hook` (可选，用于 Webhook)
5. 复制生成的 Token（开头为 `ghp_` 或 `github_pat_`）

### 2. 配置本地环境

在项目根目录创建 `.env.local` 文件（仅本地使用，已在 .gitignore 中）：

```bash
# GitHub API 配置（提交评价功能）
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_OWNER=jianshenghuang2922
GITHUB_REPO=my-site

# Turnstile（可选，测试时可用示例值）
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**重要**：`GITHUB_TOKEN` 必须是真实有效的 Token（格式：`ghp_xxxx` 或 `github_pat_xxxx`）

### 3. 运行开发服务器

```bash
npm install
npm run dev
```

访问 http://localhost:3000，提交评价应该能正常工作。

---

## Vercel 部署

### 1. 在 Vercel 中配置环境变量

- 访问 Vercel 项目设置 → **Environment Variables**
- 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GITHUB_TOKEN` | `ghp_...` | GitHub Personal Access Token |
| `GITHUB_OWNER` | `jianshenghuang2922` | 仓库所有者 |
| `GITHUB_REPO` | `my-site` | 仓库名称 |
| `REVALIDATE_SECRET` | 自定义值 | (可选) Webhook 重新验证密钥 |

### 2. 使用 GitHub Actions 刷新

(可选) 如果启用了 `REVIEW_DATA_SOURCE=github`，可在 GitHub Actions 中调用 `/api/revalidate`。

---

## 故障排除

### 错误：GitHub 配置不完整，缺少: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO

**原因**：`.env.local` 文件不存在或环境变量未设置

**解决**：
1. 确保项目根目录有 `.env.local` 文件
2. 检查变量名拼写是否正确（大小写敏感）
3. 重启开发服务器：`npm run dev`

### 错误：GitHub 认证失败（401 Bad credentials）

**原因**：Token 无效、过期或权限不足

**解决**：
1. 检查 Token 格式是否为 `ghp_` 或 `github_pat_` 开头
2. 重新生成 Token (Settings → Developer settings → Personal access tokens)
3. 确保 Token 权限包含：`repo` (或 `contents:write` + `pull_requests:write`)
4. 如果 Token 已过期，删除后重新生成

### 错误：GitHub 仓库不存在（404）

**原因**：`GITHUB_OWNER` 或 `GITHUB_REPO` 配置错误

**解决**：
1. 检查 `.env.local` 中的拼写
2. 确认 GitHub 上的仓库确实存在
3. 如果仓库是私有的，Token 需要读取权限

---

## 测试提交评价功能

```bash
# 启动开发服务器
npm run dev

# 在另一个终端测试 API
curl -X POST http://localhost:3000/api/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "university": "UC Berkeley",
    "major": "Computer Science",
    "rating": 5,
    "title": "Great school",
    "content": "Amazing experience!"
  }'
```

成功响应示例：
```json
{
  "success": true,
  "message": "评价已提交，Pull Request 创建成功。",
  "pullRequestUrl": "https://github.com/jianshenghuang2922/my-site/pull/123"
}
```


