# SNUTI to Silicon Valley — 개인별 일정 · 버스 호차 조회

서울대학교 첨단융합학부 **SNUTI to Silicon Valley** 하계 연수(6.23~6.28) 참가자가
**이름을 검색해 본인 일자별 일정과 각 활동의 탑승 호차(N호차)** 를 모바일에서 바로 확인하는 정적 웹앱입니다.

- 핵심: 호차는 **활동마다 다를 수 있어** 개인 페이지에서 활동별로 호차 배지를 표시합니다.
- 모바일 우선(반응형, 큰 탭 영역, iOS safe-area), 흰 배경 + 청록/네이비 포인트, Pretendard.
- 빌드 도구 불필요 — 순수 HTML/CSS/JS + Python 표준 라이브러리 변환기.

배포 주소(검색엔진 비노출): `https://smkim37.github.io/SNUTI-to-Silicon-Valley/`

---

## 디렉터리 구조

```
.
├── schedule.xlsx        # 원본(개인정보 시트 포함) — .gitignore 처리, 공개 레포에 올리지 않음
├── build.py             # schedule.xlsx -> docs/data/*.json 변환기 (표준 라이브러리만)
├── assests/             # 원본 에셋(로고 + 마스코트 5종)
└── docs/                # ← GitHub Pages가 서빙하는 폴더
    ├── index.html
    ├── css/styles.css
    ├── js/…             # util / data / search / app + views/*
    ├── data/            # people.json, overview.json (build.py 생성물, 커밋함)
    ├── assets/          # build.py가 복사한 이미지
    ├── .nojekyll
    └── robots.txt       # 검색엔진 비노출(Disallow: /)
```

## 데이터 처리 요약

`build.py`는 시트 **`전체명단_0617_v7`** 를 파싱합니다.

- 시트는 이름으로 해석(파일명 하드코딩 없음). 헤더(1행)로 열을 매핑.
- `차량`(베이스 호차)은 병합셀이라 그룹 첫 행에만 있음 → 병합 정보로 채움(구분행에서 리셋).
- 각 셀 `활동명 (N호차[, 메모])` → 활동명 / 호차 / 메모로 분리. `7VAN`, 호차 없는 자유식, `드랍` 메모 등 예외 처리.
- 이름 정규화: 끝 `A/B` 제거, `(...)` 제거, trim. 동명이인은 동적 검출 후 **조 선택**으로 식별.
- 스태프 괄호: `(1호차)`는 호차, `(사이먼 신)`은 별칭으로 자동 구분.
- **개인정보 비공개**: 전화·이메일·학번·특이사항(알러지)이 있는 `조편성 및 특이사항` 시트는 열지 않으며, 출력 JSON은 PII 패턴 가드를 통과해야 빌드됩니다.

### 데이터 갱신(엑셀이 바뀌면)

```bash
python3 build.py            # docs/data/*.json + docs/assets/* 재생성
python3 build.py --verify   # 쓰기 없이 파싱 검증/요약만 출력
```

> `schedule.xlsx`는 개인정보 시트를 포함하므로 로컬에만 두고 커밋하지 않습니다.
> 재생성하려면 이 파일을 프로젝트 루트에 둔 상태로 `build.py`를 실행하세요.

## 로컬 미리보기

```bash
python3 -m http.server 8000 --directory docs
# http://localhost:8000  접속
```

- 검색 → (동명이인이면) 조 선택 → 개인 페이지. 개인 URL은 `#/p/<번호>`로 북마크/공유 가능.
- 초성 검색(예: `ㄱㄱㅅ`), 부분 일치, 별칭(영문/별명) 검색 지원.

## GitHub Pages 배포

이미 생성된 레포(`smkim37/SNUTI-to-Silicon-Valley`)에 배포합니다.

```bash
git push -u origin main
```

그다음 GitHub에서:

**Settings → Pages → Source: _Deploy from a branch_ → Branch: `main` / 폴더: `/docs` → Save**

수 분 후 `https://smkim37.github.io/SNUTI-to-Silicon-Valley/` 에서 확인됩니다.
이후 데이터가 바뀌면 `build.py` 재실행 → `docs/` 커밋 → push 하면 자동 재배포됩니다.

### (선택) GitHub Actions 자동 배포

`docs/`를 자동 배포하려면 Actions를 쓸 수 있습니다(레포 Settings → Pages → Source를 _GitHub Actions_ 로 변경). 다만 기본은 위의 브랜치 배포가 가장 단순합니다.

## 개인정보 / 공개 범위

- 공개 JSON에는 **이름·조·일자별 활동·호차**만 포함합니다. 민감정보는 제외됩니다.
- 검색엔진 비노출(`robots.txt`, `noindex`)이므로 링크를 받은 참가자만 접근하는 것을 전제로 합니다.
- 비공개 레포의 Pages는 유료 플랜이 필요할 수 있습니다. 현재는 공개 레포 + 최소 정보 + 검색 비노출 방식입니다.
