# QSL 卡片管理

使用 Nuxt 4 + `@nuxtjs/supabase` 作为后端，Supabase 保存 QSL 卡片和样式数据。

## 环境
- 复制 `.env.example` 为 `.env`，填入 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`（服务端写操作）。
- 安装依赖：`pnpm install`
- 开发：`pnpm dev`

## 数据库
运行 `supabase/migrations/001_init_qsl.sql`（在 Supabase SQL 编辑器或 CLI）来创建表：
- `qsl_card_styles(id, style_name, created_at)`
- `qsl_cards(card_number, style_id, to_radio, created_at, updated_at)`，包含触发器自动更新 `updated_at`。

## API 路由
所有路由都使用 Supabase Service Role Key（服务端执行）。

- `GET /api/styles`：列出样式
- `POST /api/styles`：创建样式 `{ styleName, styleId? }`
- `GET /api/styles/:id`：获取单个样式
- `PUT /api/styles/:id`：更新样式名称 `{ styleName }`
- `DELETE /api/styles/:id`：删除样式（如果有卡片引用会返回 409）

- `GET /api/cards`：列出卡片
- `POST /api/cards`：创建卡片 `{ cardNumber, styleId, toRadio }`
- `GET /api/cards/:cardNumber`：获取卡片
- `PUT /api/cards/:cardNumber`：更新卡片字段 `{ cardNumber?, styleId?, toRadio? }`
- `DELETE /api/cards/:cardNumber`：删除卡片
