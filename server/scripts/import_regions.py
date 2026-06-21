#!/usr/bin/env python3
"""
从民政部官方 API 获取行政区划数据
https://dmfw.mca.gov.cn/XzqhVersionPublish.html

第一级请求: GET https://dmfw.mca.gov.cn/xzqh/getList?code=0&trimCode=true&maxLevel=3
  一次性返回: 省(2位code) → 市(6位) → 区县(6位)

第二级请求(补街道): GET https://dmfw.mca.gov.cn/xzqh/getCodeList?code=<区县code>&trimCode=true
  对每个区县单独请求,获取街道/镇/乡数据

直辖市没有市层级, 区县直接挂在省下面
"""
import json
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE_LIST = "https://dmfw.mca.gov.cn/xzqh/getList"
BASE_CODE_LIST = "https://dmfw.mca.gov.cn/xzqh/getCodeList"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://dmfw.mca.gov.cn/XzqhVersionPublish.html',
    'Accept': 'application/json',
}

MACRO_MAP = {
    '11': ('01', '华北'), '12': ('01', '华北'), '13': ('01', '华北'), '14': ('01', '华北'), '15': ('01', '华北'),
    '21': ('02', '东北'), '22': ('02', '东北'), '23': ('02', '东北'),
    '31': ('03', '华东'), '32': ('03', '华东'), '33': ('03', '华东'), '34': ('03', '华东'),
    '35': ('03', '华东'), '36': ('03', '华东'), '37': ('03', '华东'),
    '41': ('04', '华中'), '42': ('04', '华中'), '43': ('04', '华中'),
    '44': ('05', '华南'), '45': ('05', '华南'), '46': ('05', '华南'),
    '50': ('06', '西南'), '51': ('06', '西南'), '52': ('06', '西南'), '53': ('06', '西南'), '54': ('06', '西南'),
    '61': ('07', '西北'), '62': ('07', '西北'), '63': ('07', '西北'), '64': ('07', '西北'), '65': ('07', '西北'),
    '71': ('08', '港澳台'), '81': ('08', '港澳台'), '82': ('08', '港澳台'),
}



def fetch_url(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if attempt < retries - 1:
                wait = 2 ** attempt
                print(f"  Retry {attempt+1}/{retries} after {wait}s: {e}", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  FAILED after {retries} retries: {e}", file=sys.stderr)
                return None


def fetch_tree():
    """第一级: 获取省→市→区县整棵树"""
    url = f"{BASE_LIST}?code=0&trimCode=true&maxLevel=3"
    print(f"Fetching tree from: {url}", file=sys.stderr)
    data = fetch_url(url)
    if not data:
        sys.exit("FATAL: failed to fetch region tree")
    return data['data']


def fetch_streets(district_code, district_name):
    """第二级: 获取单个区县下的街道/镇/乡 (POST form-data, 返回flat list)"""
    post_data = (
        f"parentCode={urllib.parse.quote(district_code)}"
        f"&placeCode=&title=&tableName=Xzqh20251231&type=2"
    ).encode('utf-8')

    streets = []
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                BASE_CODE_LIST,
                data=post_data,
                headers={**HEADERS, 'Content-Type': 'application/x-www-form-urlencoded'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode('utf-8'))
            break
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if attempt < 2:
                wait = 2 ** attempt
                print(f"  Retry {attempt+1}/3 after {wait}s: {e}", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  FAILED to fetch streets for {district_name}({district_code}): {e}", file=sys.stderr)
                return streets

    items = data.get('data') or []
    for item in items:
        code = item.get('code', '')
        name = item.get('name', '')
        level = item.get('level', 0)
        if code and name and level >= 4:
            streets.append({
                'code': code,
                'name': name,
                'region_type': 'STREET',
                'parent_code': district_code,
                'sort_order': 4,
            })
    return streets


def process():
    print("=" * 60, file=sys.stderr)
    print("Step 1: Fetching region tree (provinces → cities → districts)", file=sys.stderr)
    root = fetch_tree()
    provinces = root.get('children') or []
    print(f"Found {len(provinces)} provinces", file=sys.stderr)

    all_regions = []
    seen_codes = set()
    macro_codes_seen = set()
    districts_to_fetch = []

    for prov in provinces:
        raw_code = prov.get('code', '')
        pname = prov.get('name', '')
        children = prov.get('children') or []

        if raw_code == '资料暂缺' or not raw_code:
            pcode = '71'
            pname = '台湾省'
            children = []
        else:
            pcode = raw_code

        # 大区
        macro_code, macro_name = MACRO_MAP.get(pcode, ('08', '港澳台'))
        if macro_code not in macro_codes_seen:
            macro_codes_seen.add(macro_code)
            all_regions.append({
                'code': macro_code,
                'name': macro_name,
                'region_type': 'MACRO_REGION',
                'parent_code': None,
                'sort_order': 0,
            })

        # 省级 (包括港澳台也归属大区)
        parent_macro = macro_code

        all_regions.append({
            'code': pcode,
            'name': pname,
            'region_type': 'PROVINCE',
            'parent_code': parent_macro,
            'sort_order': 1,
        })

        # 子级: 市或区县
        for child in children:
            raw_ccode = child.get('code', '')
            cname = child.get('name', '')
            clevel = child.get('level', 0)
            city_children = child.get('children') or []

            if clevel == 2:
                # 地级市
                all_regions.append({
                    'code': raw_ccode,
                    'name': cname,
                    'region_type': 'CITY',
                    'parent_code': pcode,
                    'sort_order': 2,
                })

                # 区县
                for dist in city_children:
                    raw_dcode = dist.get('code', '')
                    dname = dist.get('name', '')
                    dlevel = dist.get('level', 0)

                    if dlevel == 3:
                        all_regions.append({
                            'code': raw_dcode,
                            'name': dname,
                            'region_type': 'DISTRICT',
                            'parent_code': raw_ccode,
                            'sort_order': 3,
                        })
                        districts_to_fetch.append((raw_dcode, dname))

            elif clevel == 3:
                # 直辖市下的区县
                all_regions.append({
                    'code': raw_ccode,
                    'name': cname,
                    'region_type': 'DISTRICT',
                    'parent_code': pcode,
                    'sort_order': 3,
                })
                districts_to_fetch.append((raw_ccode, cname))

    # 去重(tree部分)
    unique = {}
    for r in all_regions:
        unique[r['code']] = r
    all_regions = list(unique.values())

    tree_counts = {}
    for r in all_regions:
        t = r['region_type']
        tree_counts[t] = tree_counts.get(t, 0) + 1
    print(f"Tree: {len(all_regions)} regions", file=sys.stderr)
    for t in sorted(tree_counts):
        print(f"  {t}: {tree_counts[t]}", file=sys.stderr)

    # Step 2: 逐个请求区县的街道数据
    print()
    print("=" * 60, file=sys.stderr)
    print(f"Step 2: Fetching streets for {len(districts_to_fetch)} districts", file=sys.stderr)
    print("=" * 60, file=sys.stderr)

    street_count = 0
    failed = []
    for i, (dcode, dname) in enumerate(districts_to_fetch, 1):
        if i % 50 == 0 or i == 1:
            print(f"  [{i}/{len(districts_to_fetch)}] Fetching streets...", file=sys.stderr)
        streets = fetch_streets(dcode, dname)
        if not streets and i % 50 == 0:
            failed.append((dcode, dname))
        for s in streets:
            if s['code'] not in unique:
                unique[s['code']] = s
                street_count += 1
        # 控制请求频率,避免被限流
        time.sleep(0.1)

    all_regions = sorted(unique.values(), key=lambda x: (x['sort_order'], x['code']))

    # 汇总
    print()
    print("=" * 60, file=sys.stderr)
    print(f"Total regions: {len(all_regions)}", file=sys.stderr)
    types = {}
    for r in all_regions:
        t = r['region_type']
        types[t] = types.get(t, 0) + 1
    for t in sorted(types):
        print(f"  {t}: {types[t]}", file=sys.stderr)

    if failed:
        print()
        print(f"WARNING: {len(failed)} districts had no/failed street fetch:", file=sys.stderr)
        for code, name in failed[:10]:
            print(f"  {name}({code})", file=sys.stderr)
        if len(failed) > 10:
            print(f"  ... and {len(failed) - 10} more", file=sys.stderr)

    return all_regions


def generate_sql(regions):
    lines = []
    lines.append("-- ============================================")
    lines.append("-- Import Chinese administrative regions data")
    lines.append("-- Source: dmfw.mca.gov.cn (Ministry of Civil Affairs)")
    lines.append("-- 4-level: PROVINCE(2位) → CITY(6位) → DISTRICT(6位) → STREET(9位)")
    lines.append("-- ============================================")
    lines.append("")
    lines.append("TRUNCATE TABLE regions RESTART IDENTITY CASCADE;")
    lines.append("")

    insert_values = []
    for r in regions:
        name = r['name'].replace("'", "''")
        rtype = r['region_type']
        pc = f"'{r['parent_code']}'" if r['parent_code'] else 'NULL'
        insert_values.append(
            f"('{name}', NULL, '{rtype}', '{r['code']}', {pc}, {r['sort_order']}, NULL, NULL, NULL, NULL, NOW(), NOW())"
        )

    for i in range(0, len(insert_values), 1000):
        chunk = insert_values[i:i + 1000]
        lines.append(
            f"INSERT INTO regions (name, parent_id, region_type, code, parent_code, sort_order, latitude, longitude, postal_code, area_code, created_at, updated_at) "
            f"VALUES {','.join(chunk)};"
        )

    lines.append("")
    lines.append("-- Update parent_id: PROVINCE → MACRO_REGION")
    lines.append(
        "UPDATE regions r SET parent_id = m.id FROM regions m "
        "WHERE r.region_type = 'PROVINCE' AND m.region_type = 'MACRO_REGION' "
        "AND r.parent_code = m.code;"
    )
    lines.append("")
    lines.append("-- Update parent_id: CITY → PROVINCE")
    lines.append(
        "UPDATE regions r SET parent_id = p.id FROM regions p "
        "WHERE r.region_type = 'CITY' AND p.region_type = 'PROVINCE' "
        "AND r.parent_code = p.code;"
    )
    lines.append("")
    lines.append("-- Update parent_id: DISTRICT → CITY")
    lines.append(
        "UPDATE regions r SET parent_id = c.id FROM regions c "
        "WHERE r.region_type = 'DISTRICT' AND c.region_type = 'CITY' "
        "AND r.parent_code = c.code;"
    )
    lines.append("")
    lines.append("-- Update parent_id: DISTRICT → PROVINCE (municipalities, no city level)")
    lines.append(
        "UPDATE regions r SET parent_id = p.id FROM regions p "
        "WHERE r.region_type = 'DISTRICT' AND p.region_type = 'PROVINCE' "
        "AND r.parent_code = p.code AND r.parent_id IS NULL;"
    )
    lines.append("")
    lines.append("-- Update parent_id: STREET → DISTRICT")
    lines.append(
        "UPDATE regions r SET parent_id = d.id FROM regions d "
        "WHERE r.region_type = 'STREET' AND d.region_type = 'DISTRICT' "
        "AND r.parent_code = d.code;"
    )
    lines.append("")
    lines.append("-- Update parent_id: STREET → CITY (no district level)")
    lines.append(
        "UPDATE regions r SET parent_id = c.id FROM regions c "
        "WHERE r.region_type = 'STREET' AND c.region_type = 'CITY' "
        "AND r.parent_code = c.code AND r.parent_id IS NULL;"
    )
    lines.append("")
    lines.append("-- Update parent_id: STREET → PROVINCE (municipalities)")
    lines.append(
        "UPDATE regions r SET parent_id = p.id FROM regions p "
        "WHERE r.region_type = 'STREET' AND p.region_type = 'PROVINCE' "
        "AND r.parent_code = p.code AND r.parent_id IS NULL;"
    )

    return lines


if __name__ == '__main__':
    regions = process()
    sql = generate_sql(regions)

    output_path = '/Users/rdd/playground/cnalias/server/migrations/00010_refresh_regions_data.up.sql'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql) + '\n')

    print(f"\nSQL written: {output_path} ({len(sql)} lines)")
    print(f"Total regions: {len(regions)}")

    types = {}
    for r in regions:
        t = r['region_type']
        types[t] = types.get(t, 0) + 1
    print("Breakdown:")
    for t in sorted(types):
        print(f"  {t}: {types[t]}")
