-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    icon VARCHAR(50),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 同一父分类下名称唯一
CREATE UNIQUE INDEX uniq_categories_name_parent ON categories(name, parent_id);

-- 创建索引
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- 添加注释
COMMENT ON TABLE categories IS '物品分类表，支持多级分类';
