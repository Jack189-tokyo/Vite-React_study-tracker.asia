# Rolling Dice 学习记录（React + Vite）

一个功能完整的学习记录追踪应用，帮助学生记录和可视化日常学习进度。基于 React + TypeScript + Vite 构建，使用 TailwindCSS 进行样式设计，Supabase 作为后端数据库服务。

## ✨ 功能特性

- 📚 **多科目学习记录**：支持数学、阅读、拼写等多个科目的学习进度记录
- 📅 **日历视图**：直观展示每日学习情况和历史记录
- 📊 **数据可视化**：使用 Chart.js 展示学习进度和准确率趋势
- 📝 **错题本功能**：记录和复习错题，提高学习效率
- 🏆 **荣誉墙系统**：通过勋章系统激励学习积极性
- 🔐 **用户认证**：安全的登录注册系统，支持密码重置
- 📱 **响应式设计**：适配各种设备屏幕尺寸
- 🌈 **动态背景**：美观的视觉效果提升用户体验

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

## 🏗️ 项目结构

```
src/
├── components/
│   ├── AuthForm.tsx          # 登录注册表单
│   ├── CalendarView.tsx      # 日历视图组件
│   ├── DailyView.tsx         # 每日详情视图
│   ├── WrongBook.tsx         # 错题本组件
│   ├── HonorWall.tsx         # 荣誉墙组件
│   ├── Header.tsx            # 页面头部导航
│   └── DynamicBackground.tsx # 动态背景效果
├── context/
│   ├── AuthContext.tsx       # 认证状态管理
│   └── AuthProvider.tsx      # 认证提供者
├── utils/
│   └── supabaseClient.ts     # Supabase 客户端配置
└── App.tsx                   # 主应用组件
```

## 🚀 部署

### Docker 部署

项目包含 Dockerfile，可以使用 Docker 进行部署：

```bash
# 构建镜像
docker build -t rolling-dice-react .

# 运行容器
docker run -p 3000:80 rolling-dice-react
```

### 生产环境构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📊 数据库表结构

应用使用 Supabase 作为后端，主要包含以下数据表：

- `learning_records`：学习记录表（日期、各科目准确率）
- `wrong_book`：错题本表（日期、错题内容）
- `honor_wall`：荣誉墙表（日期、勋章类型）
- `profiles`：用户配置表

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 7
- **样式框架**：TailwindCSS 4
- **图表库**：Chart.js + react-chartjs-2
- **后端服务**：Supabase
- **日期处理**：date-fns
- **代码规范**：ESLint

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📝 开发说明

- 代码遵循 ESLint 规范
- 使用 TypeScript 进行类型检查
- 组件采用函数式组件 + Hooks 模式
- 样式完全使用 TailwindCSS，避免自定义 CSS

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue：[GitHub Issues](https://github.com/your-username/rolling-dice-react/issues)
- 邮箱：your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
