# 03. 개발 노트 — 단일 포트폴리오 페이지 (데모2 GSAP 재구현)

작성: portfolio-developer (2026-08-23, 범위 축소 이후 재작업)

## 배경

`01_planner_ia.md`/`02_designer_system.md` 기준의 4-뷰(인트로/포트폴리오/연혁/자기소개) SPA를 이미 상당 부분 구현했었으나(구현물은 `_workspace/_prev_multiview/`에 보존), 사용자가 대화 중 범위를 "데모2를 GSAP로 똑같이 재구현한 단일 포트폴리오 페이지"로 축소했다(`01b_addendum_main_page.md` 이후 추가 확정 — 연혁·자기소개 제외, "똑같이" 요구). 이 노트는 그 축소된 범위로 새로 작성한 구현을 설명한다.

## 구현 범위

- 파일: `index.html`, `css/style.css`, `js/data.js`, `js/main.js`, `assets/{favicon.svg, placeholder-16x9.svg}`. 단일 페이지, 라우팅 없음.
- 데모2(`HorizontalSmoothScrollLayout-main/.../src/{index2.html, css/demo2.css, js/demo2/index.js}`) 구조를 참고해 마크업/스타일/스크립트를 새로 작성. Locomotive Scroll 대신 GSAP + ScrollTrigger 사용.

## 데모2 대비 재해석

| 데모2 | 이번 구현 |
|---|---|
| Locomotive Scroll `direction:'horizontal'` | GSAP ScrollTrigger `pin:true` + `scrub` + `gsap.to(track, {x: -(scrollWidth-innerWidth)})` (표준 가로 핀 스크롤 패턴) |
| `data-scroll-speed`로 요소별 개별 패럴랙스 | 이번 1차 구현에서는 생략(항목 수가 적고 카피가 플레이스홀더라 우선순위 낮음) — 필요 시 추가 요청으로 처리 |
| 스크롤 속도 → 이미지 skewX(-15~15deg) | 동일하게 구현. `ScrollTrigger.onUpdate`에서 `self.getVelocity()`를 읽어 클램프 후 적용 (transform만 사용, 성능 원칙 준수) |
| Typekit `moret`(유료 세리프 이탤릭) | Google Fonts `Fraunces`(이탤릭, 유사한 성격의 무료 대체 서체)로 대체. 인덱스 번호와 장식 텍스트에만 사용, 한글 타이틀은 Pretendard 유지(한글은 이탤릭 처리하지 않음) |
| `.rotate{transform:rotate(-4deg)}` 전체 기울임 | 가져오지 않음(순수 장식 트릭, 가독성에 불리하다고 판단) |
| 커스텀 원형 커서(lerp 기반) | 동일한 lerp 방식으로 재구현하되 라이브러리 없이 `gsap.ticker`로 직접 구동. 데스크톱(≥900px)에서만 활성화 |
| 다크 배경 + 빨강 링크 팔레트 | 색상 값까지 거의 동일하게 유지(`--color-bg:#0e0e0d`, `--color-link:#cc0000` 등) — 사용자가 "똑같이"를 명시적으로 요구했기 때문 |
| 정적 HTML에 항목 하드코딩 | `js/data.js`(프로젝트 6개, 플레이스홀더)에서 JS로 렌더링 — 나중에 실제 콘텐츠로 교체할 때 마크업을 건드리지 않아도 되도록 |

## 반응형

`ScrollTrigger.matchMedia()`로 분기:
- **900px 이상**: 핀+스크럽+스큐+커스텀 커서 전부 적용.
- **900px 미만**: 핀을 걸지 않는다. `.gallery-track`을 `overflow-x:auto; scroll-snap-type:x proximity`로 전환해 네이티브 가로 스와이프로 넘긴다. 스큐·커서·장식 텍스트는 CSS 미디어쿼리로 숨김.
- `prefers-reduced-motion: reduce`이면 데스크톱 폭이어도 핀/스큐/커서를 적용하지 않는다(스크립트에서 조기 반환).

## 알려진 제한 (다음 단계에서 다룰 수 있는 것)

- 항목의 "살펴보기" 링크는 실제 프로젝트 상세로 연결되지 않는다(데모2 원본도 동일 — 링크가 실제 목적지 없음). 실제 프로젝트 URL이 생기거나 상세 다이얼로그가 필요해지면 `data.js`의 `href` 필드를 채우거나 별도 요청으로 다이얼로그를 추가한다.
- 핀+스크럽 방식에서는 Tab 키로 화면 밖 항목에 포커스가 가도 뷰가 그 항목 쪽으로 자동으로 스크롤되지 않는다(transform 기반 가짜 스크롤의 공통적 한계). 필요하면 포커스 시 해당 진행률로 프로그램적으로 스크롤하는 로직을 추가할 수 있다.
- 데모2의 요소별 개별 패럴랙스(`data-scroll-speed`)는 이번 1차 구현에서 생략했다.

## Git / GitHub

- 로컬 `git init` 필요(이전 세션에서 초기화되지 않음) — 이 노트 작성 시점 기준 아직 실행 전. 다음 단계(git 연결)에서 `.gitignore` 작성 후 `git init` → 첫 커밋 → `gh repo create portfolio-2026 --public --source=. --remote=origin --push` 순서로 진행 예정.
- `.gitignore`에 `_workspace_*/`, `node_modules/` 등과 함께 사용자가 참고용으로 넣어둔 `HorizontalSmoothScrollLayout-main*`(원본 데모 zip/폴더, 우리 저장소 콘텐츠 아님)을 제외해야 한다.
