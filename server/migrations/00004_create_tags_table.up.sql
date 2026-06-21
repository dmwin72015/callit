-- ============================================================
-- 004: 创建 tags 表
-- 设计要点：
--   - name 作为标签的唯一自然键（外部通过 name 关联）
--   - 无物理外键
-- ============================================================

CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#1890ff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


COMMENT ON TABLE tags IS '物品标签表';
COMMENT ON COLUMN tags.name IS '标签名称，对外关联的唯一标识';
