-- ============================================================
-- 001: 创建 users 表
-- 设计要点：
--   - slug 是用户对外关联的唯一标识（替代 email）
--   - email 仅作为联系/登录字段，不再做唯一约束
--   - 无物理外键，所有关联通过 slug 逻辑关联
-- ============================================================

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

Comment ON TABLE users IS '用户表';
Comment ON COLUMN users.slug IS '用户唯一标识符，用于与其他表关联';
Comment ON COLUMN users.email IS '用户邮箱（联系/登录用，不再做唯一约束）';
