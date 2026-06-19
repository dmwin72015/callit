-- 创建审核日志表
CREATE TABLE IF NOT EXISTS review_logs (
    id BIGSERIAL PRIMARY KEY,
    alias_id BIGINT NOT NULL REFERENCES item_aliases(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_review_logs_alias_id ON review_logs(alias_id);
CREATE INDEX idx_review_logs_reviewer_id ON review_logs(reviewer_id);
CREATE INDEX idx_review_logs_created_at ON review_logs(created_at);

-- 添加注释
COMMENT ON TABLE review_logs IS '审核日志表，记录所有审核操作';
