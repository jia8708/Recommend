# 导师推荐系统

这是一个基于 Next.js 构建的导师推荐系统，采用前后端分离架构，集成了用户管理、导师管理、论坛交流等功能。

## 系统架构

### 技术栈

- 前端：Next.js 13 (App Router) + TypeScript + Ant Design
- 后端：Spring Boot + MySQL
- 认证：NextAuth.js
- 部署：Docker

### 目录结构

```bash
recommend/
├── app/                      # Next.js 13 应用目录
│   ├── api/                  # API 路由
│   │   ├── auth/            # 认证相关 API
│   │   └── proxy/           # API 代理服务
│   ├── leader/              # 导师相关页面
│   │   ├── [slug]/          # 导师详情页
│   │   │   ├── forum/       # 导师论坛
│   │   │   ├── introduce/   # 导师介绍
│   │   │   ├── research/    # 研究方向
│   │   │   ├── project/     # 项目经历
│   │   │   └── plan/        # 就业方向
│   │   └── util.ts          # 导师相关工具函数
│   ├── recommend/           # 推荐系统页面
│   │   ├── page.tsx         # 问卷调查页面
│   │   └── util.ts          # 推荐相关工具函数
│   ├── resume/              # 简历分析页面
│   ├── user/                # 用户相关页面
│   │   ├── history/         # 历史记录
│   │   ├── info/           # 个人信息
│   │   ├── leaders/        # 导师管理
│   │   ├── message/        # 消息中心
│   │   └── users/          # 用户管理
│   └── layout.tsx           # 全局布局
├── components/              # 公共组件
│   ├── auth/               # 认证相关组件
│   ├── SurveyDetailModal/  # 问卷详情模态框
│   └── leaderCard/         # 导师卡片组件
├── public/                 # 静态资源
│   └── img/               # 图片资源
├── utils/                 # 工具函数
│   ├── api.ts            # API 请求封装
│   ├── constance.ts      # 常量定义
│   └── type.ts           # TypeScript 类型定义
└── next.config.js        # Next.js 配置文件
```

### 核心功能模块

1. **用户认证系统**

   - 使用 NextAuth.js 实现用户认证
   - 支持 JWT token 认证
   - 角色权限管理（管理员/普通用户）

2. **导师管理系统**

   - 导师信息管理
   - 研究方向展示
   - 项目经历管理
   - 就业方向展示

3. **推荐系统**

   - 基于问卷的导师推荐
   - 智能匹配算法
   - 历史推荐记录

4. **论坛系统**

   - 帖子发布与管理
   - 评论互动
   - 点赞功能

5. **简历分析系统**
   - PDF 简历上传
   - 智能分析
   - 面试问题生成

### 关键文件说明

1. **API 相关**

   - `app/api/proxy/route.ts`: API 代理服务，处理与后端的通信
   - `app/api/auth/[...nextauth]/route.ts`: NextAuth 配置，处理用户认证

2. **工具函数**

   - `utils/api.ts`: 封装 API 请求函数，统一处理请求和响应
   - `utils/util.ts`: 通用工具函数，如日期格式化、图片处理等

3. **页面组件**

   - `app/leader/[slug]/page.tsx`: 导师详情页面
   - `app/recommend/page.tsx`: 推荐系统问卷页面
   - `app/user/info/page.tsx`: 用户信息页面

4. **公共组件**
   - `components/SurveyDetailModal.tsx`: 问卷详情展示组件
   - `components/leaderCard.tsx`: 导师信息卡片组件

### 部署说明

1. **环境要求**

   - Node.js 18+
   - Docker
   - Docker Compose

2. **环境变量配置**

   ```env
   NEXT_PUBLIC_API_URL=http://10.16.60.77:8080
   NEXTAUTH_URL=http://10.16.90.231:3000
   NEXTAUTH_SECRET=Fo9xQccimowaBWbwqhR/4WRlMNPa7MsfpvMUzT+qozM=
   ```

3. **部署步骤**

   ```bash
   # 安装依赖
   npm install

   # 构建项目
   npm run build

   # 部署项目
   npm run deploy
   ```

### 开发指南

1. **本地开发**

   ```bash
   # 安装依赖
   npm install

   # 启动开发服务器
   npm run dev
   ```

2. **代码规范**
   - 使用 TypeScript 进行类型检查
   - 遵循 ESLint 规则
   - 使用 Prettier 进行代码格式化
