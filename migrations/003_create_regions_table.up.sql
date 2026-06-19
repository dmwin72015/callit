-- 创建地区表
CREATE TABLE IF NOT EXISTS regions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT REFERENCES regions(id) ON DELETE SET NULL,
    region_type VARCHAR(20) NOT NULL CHECK (region_type IN ('PROVINCE', 'CITY', 'DIALECT', 'CUSTOM')),
    code VARCHAR(20) UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 同一父分类下名称唯一
CREATE UNIQUE INDEX uniq_regions_name_parent ON regions(name, parent_id);

-- 创建索引
CREATE INDEX idx_regions_parent_id ON regions(parent_id);
CREATE INDEX idx_regions_type ON regions(region_type);

-- 添加注释
COMMENT ON TABLE regions IS '地区表，支持省、市、方言区等多级结构';
COMMENT ON COLUMN regions.region_type IS '地区类型: PROVINCE=省, CITY=市, DIALECT=方言区, CUSTOM=自定义';
