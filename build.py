#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SNUTI to Silicon Valley — schedule.xlsx -> docs/data/*.json 변환기

표준 라이브러리만 사용한다(openpyxl/pandas 불필요). 시트 `전체명단_0617_v7`를
파싱해 개인별 일정/호차를 추출하고, 개인정보(전화·이메일·학번·알러지)는
일절 포함하지 않는다.

사용법:
  python3 build.py            # docs/data/*.json + docs/assets/* 생성
  python3 build.py --verify   # 쓰기 없이 파싱 검증/요약만 출력
"""
import argparse
import json
import os
import re
import shutil
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(ROOT, "schedule.xlsx")
ASSETS_SRC = os.path.join(ROOT, "assests")          # 원본 폴더(오타 그대로)
DOCS = os.path.join(ROOT, "docs")
DATA_OUT = os.path.join(DOCS, "data")
ASSETS_OUT = os.path.join(DOCS, "assets")

SHEET_NAME = "전체명단_0617_v7"

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RNS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

# ---- 일자 메타 ------------------------------------------------------------
DATE_ORDER = ["6.23", "6.24", "6.25", "6.26", "6.27", "6.28"]
DATE_LABELS = {
    "6.23": "6.23 (화) Day 1",
    "6.24": "6.24 (수) Day 2",
    "6.25": "6.25 (목) Day 3",
    "6.26": "6.26 (금) Day 4",
    "6.27": "6.27 (토) Day 5",
    "6.28": "6.28 (일) Day 6",
}

# ---- 슬롯(활동 컬럼) 설정 -------------------------------------------------
# (열 인덱스 0-based, 날짜, 라벨, is_memo, 헤더에 들어있어야 하는 날짜 검증값)
# A=0 차량, B=1 번호, C=2 조, D=3 이름. 활동 슬롯은 E(4)~T(19).
SLOTS = [
    (4,  "6.23", "점심", False),   # E  6.23 점심 자유식
    (5,  "6.23", "석식", False),   # F  6.23 석식
    (6,  "6.24", "오전", False),   # G  6.24 오전
    (7,  "6.24", "중식", False),   # H  6.24 중식
    (8,  "6.24", None,   True),    # I  버스 교체(메모, 활동 아님)
    (9,  "6.24", "오후", False),   # J  6.24 오후
    (10, "6.24", "석식", False),   # K  6.24 석식
    (11, "6.25", "점심", False),   # L  6.25 점심자유식
    (12, "6.25", "석식", False),   # M  6.25 석식자유식
    (13, "6.26", "오전", False),   # N  6.26 오전
    (14, "6.26", "중식", False),   # O  6.26 중식자유식
    (15, "6.26", "오후", False),   # P  6.26 오후
    (16, "6.26", "석식", False),   # Q  6.26 석식
    (17, "6.27", "점심", False),   # R  (헤더 비어있음 → 6.27 점심 보정)
    (18, "6.27", "석식", False),   # S  6.27 (BBQ 등)
    (19, "6.28", "이동", False),   # T  6.28 (공항 등)
]

# ---- 공통 일정(전체 동일) : 26하계 일정 시트에서 큐레이션한 상수 ----------
# 이 시트는 병합/오타/줄바꿈이 심하고 강사 연락처가 인접해 자동 파싱 대신
# 아래 상수로 관리한다(스케줄 변경 시 이 한 곳만 수정).
COMMON_SCHEDULE = OrderedDict([
    ("6.23", {"sessions": [
        {"time": "19:30–20:30", "title": "오리엔테이션", "place": "Grand Ballroom"},
        {"time": "20:30–21:30", "title": "네트워킹", "place": "Grand Ballroom"},
    ]}),
    ("6.24", {"sessions": [
        {"time": "06:00–08:40", "title": "호텔 조식", "place": None},
        {"time": "19:30–20:30", "title": "Education in AI Era", "place": "Grand Ballroom"},
        {"time": "20:30–21:30", "title": "네트워킹", "place": "Grand Ballroom"},
    ]}),
    ("6.25", {"sessions": [
        {"time": "06:00–08:40", "title": "호텔 조식", "place": None},
        {"time": "19:30–20:30", "title": "AI-Native", "place": "Grand Ballroom"},
        {"time": "20:30–21:30", "title": "네트워킹", "place": "Grand Ballroom"},
    ]}),
    ("6.26", {"sessions": [
        {"time": "06:00–08:40", "title": "호텔 조식", "place": None},
        {"time": "19:30–20:30", "title": "Physical AI", "place": "Grand Ballroom"},
        {"time": "20:30–21:30", "title": "네트워킹", "place": "Grand Ballroom"},
    ]}),
    ("6.27", {"sessions": [
        {"time": "06:00–08:40", "title": "호텔 조식", "place": None},
        {"time": "09:00–11:30", "title": "해커톤 (디자인씽킹·주제선정)", "place": "Grand Ballroom"},
        {"time": "12:30–16:00", "title": "해커톤 본선 + 멘토링", "place": "Grand Ballroom"},
        {"time": "16:00–16:30", "title": "발표회 (조별 4분)", "place": "Grand Ballroom"},
        {"time": "19:30–20:00", "title": "시상식 (해커톤·전체 시상)", "place": "Grand Ballroom"},
        {"time": "20:00–21:00", "title": "특별세션: AI 시대 창업 10년의 이야기", "place": "Grand Ballroom"},
        {"time": "21:00–22:00", "title": "네트워킹", "place": "Grand Ballroom"},
    ]}),
    ("6.28", {"sessions": [
        {"time": "06:00–07:40", "title": "호텔 조식", "place": None},
        {"time": "—", "title": "공항 이동 / 출국", "place": None},
    ]}),
])


# ===========================================================================
# XLSX 읽기 (표준 라이브러리)
# ===========================================================================
def col_to_idx(ref):
    """'AB12' -> 0-based 열 인덱스."""
    letters = re.match(r"[A-Z]+", ref).group()
    idx = 0
    for ch in letters:
        idx = idx * 26 + (ord(ch) - ord("A") + 1)
    return idx - 1


def parse_ref(ref):
    """'A12' -> (row:int, col:int 0-based)."""
    m = re.match(r"([A-Z]+)(\d+)", ref)
    return int(m.group(2)), col_to_idx(ref)


def cell_value(c, shared):
    t = c.get("t")
    if t == "s":
        v = c.find(NS + "v")
        if v is not None and v.text is not None:
            return shared[int(v.text)]
        return ""
    if t == "inlineStr":
        is_el = c.find(NS + "is")
        if is_el is not None:
            return "".join(x.text or "" for x in is_el.iter(NS + "t"))
        return ""
    v = c.find(NS + "v")
    return v.text if (v is not None and v.text is not None) else ""


def load_shared_strings(z):
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall(NS + "si"):
            shared.append("".join(t.text or "" for t in si.iter(NS + "t")))
    return shared


def resolve_sheet_path(z, sheet_name):
    """시트 이름 -> xl/worksheets/sheetN.xml 경로(파일명 하드코딩 금지)."""
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rid_for_name = {}
    for s in wb.find(NS + "sheets").findall(NS + "sheet"):
        rid_for_name[s.get("name")] = s.get(RNS + "id")
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    target_for_rid = {rel.get("Id"): rel.get("Target") for rel in rels}
    rid = rid_for_name.get(sheet_name)
    if not rid:
        raise SystemExit("시트 '%s' 를 찾을 수 없습니다. 존재하는 시트: %s"
                         % (sheet_name, list(rid_for_name)))
    target = target_for_rid[rid]
    if not target.startswith("xl/"):
        target = "xl/" + target.lstrip("/")
    return target


def read_sheet(z, path, shared):
    root = ET.fromstring(z.read(path))
    sheet_data = root.find(NS + "sheetData")
    rows = {}
    for row in sheet_data.findall(NS + "row"):
        r = int(row.get("r"))
        cells = {}
        for c in row.findall(NS + "c"):
            ref = c.get("r")
            val = cell_value(c, shared)
            cells[col_to_idx(ref)] = (val or "").strip()
        rows[r] = cells
    # 병합셀
    merge_fill = {}
    mc = root.find(NS + "mergeCells")
    if mc is not None:
        for m in mc.findall(NS + "mergeCell"):
            a, b = m.get("ref").split(":")
            r1, c1 = parse_ref(a)
            r2, c2 = parse_ref(b)
            origin = rows.get(r1, {}).get(c1, "")
            for rr in range(r1, r2 + 1):
                for cc in range(c1, c2 + 1):
                    merge_fill[(rr, cc)] = origin
    return rows, merge_fill


# ===========================================================================
# 파싱 로직
# ===========================================================================
BUS_RE = re.compile(r"^\d+\s*호차$")
VAN_RE = re.compile(r"^\d*\s*VAN$", re.I)


def norm_bus(token):
    token = re.sub(r"\s+", "", token)
    if token.upper().endswith("VAN"):
        return token.upper()
    return token


def parse_activity(raw):
    """'활동명 (N호차[, 메모])' -> {activity, bus, note} 또는 None."""
    raw = (raw or "").strip()
    if not raw:
        return None
    m = re.match(r"^(?P<name>.*?)\s*\((?P<paren>[^)]*)\)\s*$", raw)
    if not m:
        return {"activity": raw, "bus": None, "note": None}
    name = m.group("name").strip()
    paren = m.group("paren").strip()
    head, _, rest = (paren.partition(","))
    head = head.strip()
    rest = rest.strip()
    if BUS_RE.match(head) or VAN_RE.match(head):
        return {"activity": name or raw, "bus": norm_bus(head), "note": rest or None}
    # 괄호가 호차가 아니면 활동명의 일부로 간주(원문 유지)
    return {"activity": raw, "bus": None, "note": None}


def normalize_person_name(raw):
    """이름 원문 -> (표시이름, 별칭|None, 괄호호차|None)."""
    raw = (raw or "").strip()
    alias, paren_bus = None, None
    m = re.search(r"\(([^)]*)\)", raw)
    if m:
        p = m.group(1).strip()
        if BUS_RE.match(p) or VAN_RE.match(p):
            paren_bus = norm_bus(p)
        else:
            alias = p
    base = re.sub(r"\([^)]*\)", "", raw).strip()
    base = re.sub(r"(?<=[가-힣])[A-Z]$", "", base).strip()  # 끝 A/B 제거
    return base, alias, paren_bus


def parse_group(raw):
    raw = (raw or "").strip()
    if raw.isdigit():
        n = int(raw)
        return "student", n, "%d조" % n
    if raw == "교수님":
        return "professor", "교수님", "교수님"
    if raw == "조교":
        return "ta", "조교", "조교"
    if raw == "올바른":
        return "company", "올바른", "올바른네트웍스"
    return "other", raw, raw


# ===========================================================================
# 빌드
# ===========================================================================
def build_people(rows, merge_fill):
    def get(r, c):
        v = rows.get(r, {}).get(c, "")
        if not v:
            v = merge_fill.get((r, c), "")
        return (v or "").strip()

    max_row = max(rows) if rows else 0

    # 헤더 검증(컬럼 밀림 감지)
    warnings = []
    for (ci, date, label, is_memo) in SLOTS:
        header = get(1, ci)
        if is_memo:
            if "버스" not in header:
                warnings.append("I열 헤더가 예상('버스 교체')과 다름: %r" % header)
            continue
        # 헤더에 날짜가 들어있는지(R열은 비어있을 수 있음)
        if header and date.replace(".", ".") not in header and ci != 17:
            warnings.append("%d열 헤더 %r 에 날짜 %s 없음" % (ci, header, date))

    people = []
    # 집계용
    agg = OrderedDict()       # (date,label) -> [활동...]
    agg_keys = [(d, l) for (ci, d, l, m) in SLOTS if not m]
    for k in agg_keys:
        agg[k] = []
    memo_agg = OrderedDict((d, []) for d in DATE_ORDER)

    for r in range(2, max_row + 1):
        name_raw = get(r, 3)
        num_raw = get(r, 1)
        if not name_raw and not num_raw:
            continue  # 빈 구분행(131, 142)
        if not name_raw:
            continue
        number = int(num_raw) if num_raw.isdigit() else None
        base_name, alias, paren_bus = normalize_person_name(name_raw)
        role, group, group_label = parse_group(get(r, 2))
        base_bus = get(r, 0) or paren_bus or None

        day_map = OrderedDict()
        for (ci, date, label, is_memo) in SLOTS:
            cell = get(r, ci)
            if is_memo:
                if cell:
                    d = day_map.setdefault(date, {"date": date, "memo": None, "items": []})
                    d["memo"] = cell
                    if cell not in memo_agg[date]:
                        memo_agg[date].append(cell)
                continue
            parsed = parse_activity(cell)
            if parsed:
                d = day_map.setdefault(date, {"date": date, "memo": None, "items": []})
                d["items"].append({
                    "slot": label,
                    "activity": parsed["activity"],
                    "bus": parsed["bus"],
                    "note": parsed["note"],
                })
                if parsed["activity"] not in agg[(date, label)]:
                    agg[(date, label)].append(parsed["activity"])

        days = []
        for date in DATE_ORDER:
            if date in day_map:
                d = day_map[date]
                if d["items"] or d["memo"]:
                    days.append(d)

        people.append({
            "id": number,
            "name": base_name,
            "alias": alias,
            "group": group,
            "groupLabel": group_label,
            "role": role,
            "baseBus": base_bus,
            "isDuplicate": False,  # 아래에서 채움
            "days": days,
        })

    # 동명이인(정규화 이름 기준 동적 검출)
    name_counts = Counter(p["name"] for p in people)
    duplicates = {}
    for p in people:
        if name_counts[p["name"]] > 1:
            p["isDuplicate"] = True
            duplicates.setdefault(p["name"], []).append(p["id"])

    people_json = {
        "meta": {
            "source": SHEET_NAME,
            "title": "SNUTI to Silicon Valley",
            "subtitle": "서울대학교 첨단융합학부 하계 연수",
            "personCount": len(people),
            "dates": [{"id": d, "label": DATE_LABELS[d]} for d in DATE_ORDER],
        },
        "duplicates": duplicates,
        "people": people,
    }

    # 전체 일정(옵션 집계 + 공통 세션)
    ov_days = []
    for date in DATE_ORDER:
        slots = []
        for (ci, d2, label, is_memo) in SLOTS:
            if d2 == date and not is_memo:
                opts = agg.get((date, label), [])
                if opts:
                    slots.append({"slot": label, "options": opts})
        memos = memo_agg.get(date, [])
        common = COMMON_SCHEDULE.get(date, {}).get("sessions", [])
        if slots or memos or common:
            ov_days.append({
                "date": date,
                "label": DATE_LABELS[date],
                "slots": slots,
                "memos": memos,
                "common": common,
            })

    overview_json = {
        "meta": {
            "title": "SNUTI to Silicon Valley",
            "subtitle": "전체 일정 개요",
            "note": "오전/오후 방문지와 식사는 조·호차마다 다릅니다. 본인 확정 일정은 이름 검색에서 확인하세요.",
        },
        "days": ov_days,
    }

    return people_json, overview_json, warnings


def assert_no_pii(*objs):
    blob = json.dumps(objs, ensure_ascii=False)
    bad = []
    if re.search(r"\d{3}-\d{4}-\d{4}", blob):
        bad.append("전화번호 패턴")
    if re.search(r"@snu\.ac\.kr", blob):
        bad.append("이메일 패턴")
    if re.search(r"\b20\d{2}-\d{5}\b", blob):
        bad.append("학번 패턴")
    if bad:
        raise SystemExit("PII 가드 실패 — 출력에 민감정보 의심 패턴 발견: %s" % bad)


def copy_assets():
    os.makedirs(ASSETS_OUT, exist_ok=True)
    wanted = ["logo.png", "action01.png", "action02.png",
              "action03.png", "action04.png", "action05.png"]
    copied = []
    for fn in wanted:
        src = os.path.join(ASSETS_SRC, fn)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(ASSETS_OUT, fn))
            copied.append(fn)
    return copied


# ===========================================================================
# 검증/요약 출력
# ===========================================================================
def verify(people_json, overview_json, warnings):
    people = people_json["people"]
    print("=" * 60)
    print("검증 요약")
    print("=" * 60)
    print("총 인원:", len(people))
    by_role = Counter(p["role"] for p in people)
    print("역할별:", dict(by_role))
    print("동명이인:", people_json["duplicates"])

    no_bus = [p["name"] for p in people if p["role"] == "student" and not p["baseBus"]]
    print("학생 중 baseBus 없음:", no_bus if no_bus else "없음(OK)")

    def find(num):
        return next((p for p in people if p["id"] == num), None)

    print("-" * 60)
    p = find(1)
    print("번호1 %s / 조 %s / baseBus %s" % (p["name"], p["groupLabel"], p["baseBus"]))
    for d in p["days"]:
        line = "  %s: " % d["date"]
        line += ", ".join("%s=%s[%s]" % (it["slot"], it["activity"], it["bus"]) for it in d["items"])
        if d["memo"]:
            line += "  <memo:%s>" % d["memo"].replace("\n", " ")
        print(line)

    print("-" * 60)
    # 엣지 케이스 점검
    checks = []
    van = [it for p in people for d in p["days"] for it in d["items"]
           if it["bus"] and "VAN" in it["bus"]]
    checks.append(("애플 7VAN 등 VAN 호차 존재", bool(van), van[:2]))
    drop = [it for p in people for d in p["days"] for it in d["items"]
            if it["note"]]
    checks.append(("note(드랍 등) 파싱됨", bool(drop), [(d["activity"], d["bus"], d["note"]) for d in drop[:3]]))
    memo_people = [p["name"] for p in people for d in p["days"] if d["memo"]]
    checks.append(("메모 보유 인원 수", len(memo_people), memo_people[:5]))
    for label, ok, sample in checks:
        print("  [%s] %s  e.g. %s" % ("OK" if ok else "??", label, sample))

    print("-" * 60)
    print("동명이인 페이지 차이 확인:")
    for name, ids in people_json["duplicates"].items():
        groups = [find(i)["groupLabel"] for i in ids]
        print("  %s -> %s (조 %s)" % (name, ids, groups))

    if warnings:
        print("-" * 60)
        print("경고:")
        for w in warnings:
            print("  !", w)

    print("-" * 60)
    assert_no_pii(people_json, overview_json)
    print("PII 가드: 통과(민감정보 패턴 0건)")
    print("=" * 60)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--verify", action="store_true", help="쓰기 없이 검증만")
    args = ap.parse_args()

    if not os.path.exists(XLSX):
        raise SystemExit("엑셀 파일 없음: %s" % XLSX)

    z = zipfile.ZipFile(XLSX)
    shared = load_shared_strings(z)
    path = resolve_sheet_path(z, SHEET_NAME)
    rows, merge_fill = read_sheet(z, path, shared)
    people_json, overview_json, warnings = build_people(rows, merge_fill)

    assert_no_pii(people_json, overview_json)

    if args.verify:
        verify(people_json, overview_json, warnings)
        return

    os.makedirs(DATA_OUT, exist_ok=True)
    with open(os.path.join(DATA_OUT, "people.json"), "w", encoding="utf-8") as f:
        json.dump(people_json, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA_OUT, "overview.json"), "w", encoding="utf-8") as f:
        json.dump(overview_json, f, ensure_ascii=False, indent=2)
    copied = copy_assets()

    print("생성 완료:")
    print("  docs/data/people.json   (%d명)" % people_json["meta"]["personCount"])
    print("  docs/data/overview.json (%d일)" % len(overview_json["days"]))
    print("  docs/assets/            (%s)" % ", ".join(copied))
    if warnings:
        print("경고:")
        for w in warnings:
            print("  !", w)


if __name__ == "__main__":
    main()
