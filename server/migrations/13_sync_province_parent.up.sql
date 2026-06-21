-- ============================================================
-- 013: 同步省份的 parent_code 和 parent_id，建立省份与大区的关联
-- ============================================================

-- 1. 补全缺失 parent_code 的直辖市和特别行政区
UPDATE regions SET parent_code = '01' WHERE id IN (9, 10);   -- 北京、天津 → 华北
UPDATE regions SET parent_code = '03' WHERE id = 17;          -- 上海 → 华东
UPDATE regions SET parent_code = '06' WHERE id = 30;          -- 重庆 → 西南
UPDATE regions SET parent_code = '08' WHERE id IN (40, 41, 42); -- 台湾、香港、澳门 → 港澳台

-- 2. 根据 parent_code 回填 parent_id
UPDATE regions r
SET parent_id = p.id
FROM regions p
WHERE r.region_type = 'PROVINCE'
  AND p.region_type = 'MACRO_REGION'
  AND p.code = r.parent_code
  AND r.parent_id IS NULL;
