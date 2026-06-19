-- 创建物品别名表
CREATE TABLE IF NOT EXISTS item_aliases (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    alias_name VARCHAR(100) NOT NULL,
    region_id BIGINT NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    name_type VARCHAR(20) NOT NULL CHECK (name_type IN ('COMMON', 'ALIAS')),
    votes_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 防止同一物品+地区+别名的重复提交
CREATE UNIQUE INDEX uniq_alias_item_region ON item_aliases(item_id, region_id, alias_name);

-- 创建索引
CREATE INDEX idx_aliases_item_id ON item_aliases(item_id);
CREATE INDEX idx_aliases_region_id ON item_aliases(region_id);
CREATE INDEX idx_aliases_status ON item_aliases(status);
CREATE INDEX idx_aliases_submitted_by ON item_aliases(submitted_by);
CREATE INDEX idx_aliases_created_at ON item_aliases(created_at);

-- 添加注释
COMMENT ON TABLE item_aliases IS '物品别名表，记录不同地区对同一物品的叫法';
COMMENT ON COLUMN item_aliases.name_type IS '名称类型: COMMON=常用名, ALIAS=别名/俗称';
COMMENT ON COLUMN item_aliases.status IS '状态: PENDING=待审核, APPROVED=已通过, REJECTED=已拒绝';
