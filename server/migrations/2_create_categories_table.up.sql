-- ============================================================
-- 002: 创建 categories 表
-- 设计要点：
--   - slug 是分类对外关联的唯一标识
--   - parent_id 保留整数类型（自引用树形结构，ID 稳定不变）
--   - 无物理外键
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    parent_id BIGINT,
    icon VARCHAR(50),
    sort_order INT4 NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_categories_name_parent ON categories(name, parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

