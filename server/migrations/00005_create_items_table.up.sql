-- ============================================================
-- 005: 创建 items 表
-- 设计要点：
--   - slug 是物品对外关联的唯一标识（替代 id 做外联）
--   - category_slug 替代 category_id，通过分类 slug 关联
--   - created_by_slug 替代 created_by，通过用户 slug 关联
--   - 无物理外键，所有关联通过 slug 逻辑关联
-- ============================================================

CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category_slug VARCHAR(50),
    description TEXT,
    created_by_slug VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uniq_items_name_category ON items(name, category_slug);
CREATE INDEX idx_items_category_slug ON items(category_slug);
CREATE INDEX idx_items_created_by_slug ON items(created_by_slug);

COMMENT ON TABLE items IS '物品表';
COMMENT ON COLUMN items.slug IS '物品唯一标识符，别名表等通过此字段关联物品';
COMMENT ON COLUMN items.category_slug IS '关联分类的 slug（逻辑关联，无物理外键）';
COMMENT ON COLUMN items.created_by_slug IS '创建者的 slug（逻辑关联，无物理外键）';
