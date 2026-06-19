-- 创建物品表
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 同一分类下物品名称唯一
CREATE UNIQUE INDEX uniq_items_name_category ON items(name, category_id);

-- 创建索引
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_name ON items(name);

-- 添加注释
COMMENT ON TABLE items IS '物品表，存储标准/通用名称';
