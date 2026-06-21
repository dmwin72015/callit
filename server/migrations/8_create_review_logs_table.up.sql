-- ============================================================
-- 008: 创建 review_logs 表
-- 设计要点：
--   - item_slug + region_code + alias_name 关联别名记录
--   - reviewer_slug 关联 users.slug
--   - 无任何物理外键，全部逻辑关联
-- ============================================================

CREATE TABLE IF NOT EXISTS review_logs (
    id BIGSERIAL PRIMARY KEY,
    item_slug VARCHAR(100) NOT NULL,
    region_code VARCHAR(12) NOT NULL,
    alias_name VARCHAR(100) NOT NULL,
    reviewer_slug VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_logs_alias_slug ON review_logs(item_slug, region_code, alias_name);
CREATE INDEX IF NOT EXISTS idx_review_logs_reviewer_slug ON review_logs(reviewer_slug);
CREATE INDEX IF NOT EXISTS idx_review_logs_created_at ON review_logs(created_at);

