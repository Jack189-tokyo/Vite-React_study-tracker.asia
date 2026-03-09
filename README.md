# Rolling Dice 学习记录（React + Vite）

基于 React + TypeScript + Vite 的学习记录应用，使用 TailwindCSS 做样式、Supabase 作为后端服务。

## 本地开发

```bash
npm install
npm run dev
```

## 环境变量 & Supabase 配置

**重要：`.env` 文件不会提交到仓库中，拉取代码后默认是没有 Supabase 配置的。**

本项目依赖以下环境变量（Vite 前缀为 `VITE_`）：

```env
VITE_SUPABASE_URL=你的-supabase-url
VITE_SUPABASE_ANON_KEY=你的-supabase-anon-key
```

由于这两项配置直接关联到线上数据库，请**不要自行猜测或随便填写**，而是：

1. 先从仓库根目录复制示例文件（如果存在）：
   ```bash
   cp .env.example .env
   ```
2. 然后**联系仓库所有者**获取正确的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，填入本地 `.env`。

没有配置 `.env` 或配置错误，会导致应用无法正常连接 Supabase（例如登录失败、数据加载失败等）。
