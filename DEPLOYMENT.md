# 部署指南

## 环境变量配置

### Vercel 部署

在 Vercel 项目设置中配置以下环境变量（Settings → Environment Variables）：

#### 必需变量（提交评价功能）
- `GITHUB_TOKEN`: GitHub Personal Access Token，权限需要：`contents:write`, `pull_requests:write`
  - 创建方式：GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - 可选：如果仓库是私有的，还需要读取权限
- `GITHUB_OWNER`: 仓库所有者（如：`jianshenghuang2922`）
- `GITHUB_REPO`: 仓库名称（如：`my-site`）

#### 可选变量
- `REVALIDATE_SECRET`: Webhook 重新验证密钥（如果使用 `/api/revalidate` 接口）
- `REVIEW_DATA_SOURCE`: 设置为 `github` 可启用运行时从 GitHub 拉取最新评价

### 本地开发

创建 `.env.local` 文件（仅本地使用，不会提交到 GitHub）：

```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=jianshenghuang2922
GITHUB_REPO=my-site
```

## 故障排除

### 错误："服务端 GitHub 配置不完整，请联系管理员"

**原因**：缺少必需的环境变量

**解决方案**：
1. 确保 `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` 都已配置
2. 对于 Vercel 部署，检查 Settings → Environment Variables
3. 对于本地开发，检查 `.env.local` 文件是否存在且格式正确

### Token 认证失败

**原因**：Token 权限不足或已过期

**解决方案**：
1. 检查 Token 权限是否包含 `contents:write` 和 `pull_requests:write`
2. 如果 Token 已过期，重新生成新 Token
3. 对于私有仓库，确保 Token 有读取权限

