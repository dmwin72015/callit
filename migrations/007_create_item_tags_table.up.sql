-- 创建物品标签关联表
CREATE TABLE IF NOT EXISTS item_tags (
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (item_id, tag_id)
);

-- 添加注释
COMMENT ON TABLE item_tags IS '物品和标签的多对多关联表';
