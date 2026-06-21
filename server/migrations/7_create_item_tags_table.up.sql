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
CREATE INDEX IF NOT EXISTS idx_item_tags_item_slug ON item_tags(item_slug);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_name ON item_tags(tag_name);

