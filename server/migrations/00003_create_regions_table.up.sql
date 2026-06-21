-- ============================================================
-- 003: 创建 regions 表
-- 设计要点：
--   - 四级树形结构：MACRO_REGION → PROVINCE → CITY → DISTRICT
--   - MACRO_REGION 是大区顶层节点（华北、华东、华南等），parent_id = NULL
--   - PROVINCE 的 parent_id 指向所属大区
--   - code（GB/T 2260）是地区对外关联的唯一自然键
--   - id 使用 SERIAL 自增，仅内部使用
--   - 无物理外键，全部逻辑关联
--   - 用户选择层面仍为三级联动：省 → 市 → 区县
--   - 大区用于数据统计和模糊展示（如"华北地区通常称为xxx"）
-- ============================================================

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id INT4,
    region_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM' CHECK (region_type IN ('CUSTOM', 'MACRO_REGION', 'PROVINCE', 'CITY', 'DISTRICT')),
    code VARCHAR(12) NOT NULL UNIQUE,
    parent_code VARCHAR(12),
    sort_order INT4 NOT NULL DEFAULT 0,
    latitude FLOAT8,
    longitude FLOAT8,
    postal_code VARCHAR(10),
    area_code VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regions_parent_id ON regions(parent_id);
CREATE INDEX idx_regions_type ON regions(region_type);
CREATE INDEX idx_regions_parent_type ON regions(parent_id, region_type);
CREATE INDEX idx_regions_parent_code ON regions(parent_code);

COMMENT ON TABLE regions IS '行政地区表，四级结构：大区→省→市→区县';
COMMENT ON COLUMN regions.code IS '行政区划代码：省市区为6位GB/T 2260，街道为9位，对外关联的唯一标识';
COMMENT ON COLUMN regions.region_type IS 'CUSTOM=自定义, MACRO_REGION=大区, PROVINCE=省, CITY=市, DISTRICT=区县';
COMMENT ON COLUMN regions.parent_id IS '父级地区ID（逻辑关联，树形结构）';
COMMENT ON COLUMN regions.parent_code IS '父级地区code（冗余字段，避免join查询父级code）';
COMMENT ON COLUMN regions.latitude IS '纬度（WGS84）';
COMMENT ON COLUMN regions.longitude IS '经度（WGS84）';
COMMENT ON COLUMN regions.postal_code IS '邮政编码';
COMMENT ON COLUMN regions.area_code IS '区号';
