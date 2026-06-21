-- ============================================================
-- 006: 创建 item_aliases 表
-- 设计要点：
--   - id BIGSERIAL PRIMARY KEY（自增主键必须保留）
--   - 业务唯一约束 (item_slug, region_code, alias_name)
--   - item_slug 关联 items.slug，region_code 关联 regions.code
--   - submitter_slug / reviewer_slug 关联 users.slug
--   - 无任何物理外键，全部逻辑关联
-- ============================================================

CREATE TABLE IF NOT EXISTS item_aliases (
    id BIGSERIAL PRIMARY KEY,
    item_slug VARCHAR(100) NOT NULL,
    region_code VARCHAR(12) NOT NULL,
    alias_name VARCHAR(100) NOT NULL,
    name_type VARCHAR(20) NOT NULL CHECK (name_type IN ('COMMON', 'ALIAS')),
    votes_count INT4 NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitter_slug VARCHAR(50),
    reviewer_slug VARCHAR(50),
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (item_slug, region_code, alias_name)
);

-- Composite unique key covers queries on item_slug alone (prefix index)
-- PRIMARY KEY auto-creates item_aliases_pkey index
CREATE INDEX IF NOT EXISTS idx_aliases_region_code ON item_aliases(region_code);
CREATE INDEX IF NOT EXISTS idx_aliases_status ON item_aliases(status);
CREATE INDEX IF NOT EXISTS idx_aliases_submitter_slug ON item_aliases(submitter_slug);
CREATE INDEX IF NOT EXISTS idx_aliases_reviewer_slug ON item_aliases(reviewer_slug);
CREATE INDEX IF NOT EXISTS idx_aliases_created_at ON item_aliases(created_at);

Comment ON TABLE item_aliases IS '物品别名表，记录同一物品在不同地区的叫法';
Comment ON COLUMN item_aliases.item_slug IS '关联物品 slug（逻辑关联）';
Comment ON COLUMN item_aliases.region_code IS '关联地区 code（逻辑关联）';
Comment ON COLUMN item_aliases.submitter_slug IS '提交者 slug（逻辑关联）';
Comment ON COLUMN item_aliases.reviewer_slug IS '审核者 slug（逻辑关联）';
