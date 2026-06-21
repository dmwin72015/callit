-- ============================================================
-- 007: 创建 item_tags 表
-- 设计要点：
--   - id BIGSERIAL PRIMARY KEY（自增主键必须保留）
--   - 业务唯一约束 (item_slug, tag_name)
--   - item_slug 关联 items.slug，tag_name 关联 tags.name
--   - 无任何物理外键，全部逻辑关联
-- ============================================================

CREATE TABLE IF NOT EXISTS item_tags (
    id BIGSERIAL PRIMARY KEY,
    item_slug VARCHAR(100) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (item_slug, tag_name)
);

-- PRIMARY KEY auto-creates item_tags_pkey index
CREATE INDEX idx_item_tags_item_slug ON item_tags(item_slug);
CREATE INDEX idx_item_tags_tag_name ON item_tags(tag_name);

COMMENT ON TABLE item_tags IS '物品和标签的多对多关联表';
COMMENT ON COLUMN item_tags.item_slug IS '关联物品 slug（逻辑关联）';
COMMENT ON COLUMN item_tags.tag_name IS '关联标签 name（逻辑关联）';
