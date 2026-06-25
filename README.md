# SNUTI to Silicon Valley — 개인별 일정 · 버스 호차 조회

서울대학교 첨단융합학부 **SNUTI to Silicon Valley** 하계 연수(6.23~6.28) 참가자가
**이름을 검색하거나 조(클러스터)를 눌러 본인 일자별 일정과 각 활동의 탑승 호차(N호차)** 를
모바일에서 바로 확인하는 정적 웹앱입니다.

- 핵심: 호차는 **활동마다 다를 수 있어**, 개인 페이지에서 활동마다 **색으로 구분된 호차**를 표시합니다.
- 개인 페이지 = 본인 확정 일정(활동별 호차) + **차량 교체 안내**(그날 호차가 바뀌면 자동) + **접이식 전체 일정**(그날 프로그램) + **오늘 일자 강조**(진입 시 오늘 카드로 스크롤).
- 학교·기업 일정 옆 **돋보기🔎** → 3문장 소개 + **공식 유튜브 홍보영상** 팝업(`js/places.js` 큐레이션, 영상은 oEmbed 검증).
- 모바일 우선(반응형, 큰 탭 영역, iOS safe-area), 흰 배경 + 청록/네이비 포인트, Pretendard.
- **빌드 단계 없는 순수 정적 사이트** — 배포는 `git push`만 하면 됩니다.

배포 주소(검색엔진 비노출): **https://sumin-kim.com/SNUTI-to-Silicon-Valley/**
(`smkim37.github.io/SNUTI-to-Silicon-Valley/` 로 들어와도 커스텀 도메인으로 자동 연결됩니다.)

---

## 디렉터리 구조

앱 파일이 **저장소 루트**에 있고, 루트가 그대로 GitHub Pages로 서빙됩니다.

```
.
├── index.html           # ← 진입점(앱). 루트에 있으므로 README보다 우선 서빙됨
├── css/styles.css
├── js/…                 # util / data / render / places / placeinfo / search / app + views/*
├── data/                # people.json, overview.json (커밋된 정적 데이터)
├── assets/              # 앱에서 쓰는 이미지(로고 + 마스코트)
├── .nojekyll            # Jekyll 비활성화(파일 그대로 서빙)
├── robots.txt
├── build.py             # (로컬 전용) schedule.xlsx -> data/*.json 재생성 도구
├── schedule.xlsx        # 원본(개인정보 시트 포함) — .gitignore, 커밋/배포 안 함
└── README.md
```

## 데이터 처리 요약

`build.py`는 시트 **`전체명단_0617_v7`** 를 파싱해 `data/people.json`·`data/overview.json`을 만듭니다.

- 시트는 이름으로 해석(파일명 하드코딩 없음). 헤더(1행)로 열을 매핑.
- `차량`(베이스 호차)은 병합셀이라 그룹 첫 행에만 있음 → 병합 정보로 채움(구분행에서 리셋).
- 각 셀 `활동명 (N호차[, 메모])` → 활동명 / 호차 / 메모로 분리. `7VAN`, 호차 없는 자유식, `드랍` 메모 등 예외 처리.
- 이름 정규화: 끝 `A/B` 제거, `(...)` 제거, trim. 동명이인은 동적 검출 후 **조 선택**으로 식별.
- 전체 일정(프로그램)은 `26하계 일정` 시트 기반 **큐레이션 상수(`PROGRAM`)** — 전체 일정 페이지와 개인 페이지의 접이식 "전체 일정"이 동일 데이터를 공유.
- 개인 페이지의 **차량 교체 안내**는 그날 활동별 탑승 호차가 2개 이상이면 프런트엔드에서 자동 표시(엑셀 메모칸에 의존하지 않음).
- **개인정보 비공개**: 전화·이메일·학번·특이사항(알러지)이 있는 `조편성 및 특이사항` 시트는 열지 않으며, 출력 JSON은 PII 패턴 가드를 통과해야 빌드됩니다.

## 로컬 미리보기

```bash
python3 -m http.server 8000     # 저장소 루트에서 실행
# http://localhost:8000  접속  →  바로 앱이 뜸
```

- 이름 검색(부분 일치·초성·별칭) 또는 조 그리드에서 본인 선택 → 개인 페이지.
- 개인 URL은 `#/p/<번호>`로 북마크/공유 가능.

## 배포 (GitHub Pages, 빌드 단계 없음)

GitHub Pages **Source: `main` 브랜치 / `/`(root)** 로 서빙됩니다.
커스텀 도메인 `sumin-kim.com`은 사용자 GitHub Pages 개인 사이트(`smkim37.github.io`)에 연결돼 있어,
이 프로젝트는 자동으로 `sumin-kim.com/SNUTI-to-Silicon-Valley/` 에 노출됩니다.

> 배포 = `git push` 한 번. 별도 빌드/Actions 단계가 없습니다.
> `index.html`이 루트에 있어 `README.md`가 아니라 앱이 서빙됩니다.

```bash
git add -A && git commit -m "변경 내용" && git push
# 1~2분 후 https://sumin-kim.com/SNUTI-to-Silicon-Valley/ 에 반영
```

### 데이터 갱신(엑셀이 바뀔 때만, 로컬에서)

`build.py`는 **배포 도구가 아니라** 엑셀이 갱신됐을 때 JSON을 다시 만드는 로컬 도구입니다.

```bash
python3 build.py            # data/*.json 재생성(루트에 기록)
python3 build.py --verify   # 쓰기 없이 파싱 검증/요약만 출력
git add data && git commit -m "데이터 갱신" && git push
```

> 이미지(로고·마스코트)는 `assets/`에 직접 커밋해 관리합니다(빌드가 복사하지 않음).

> `schedule.xlsx`는 개인정보 시트를 포함하므로 로컬에만 두고 커밋하지 않습니다.

## 개인정보 / 공개 범위

- 공개 JSON에는 **이름·조·일자별 활동·호차**만 포함합니다. 민감정보는 제외됩니다.
- `index.html`의 `noindex` 메타로 검색엔진 색인을 막습니다(링크를 받은 참가자 접근 전제).
