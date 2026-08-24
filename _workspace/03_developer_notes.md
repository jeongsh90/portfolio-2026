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

## 이미지 파일을 `images/`로 분리 (2026-08-24)

**무엇을** — 프로젝트 루트에 흩어져 있던 이미지 13개(갤러리 `1.b2dd7476.jpg` ~ `12.d01438d5.jpg` 12장 + `favicon.26242483.ico`)를 새로 만든 `images/` 폴더로 옮기고, `index.html`의 참조 경로 13곳을 `images/` 접두사가 붙도록 갱신했다. `fonts/`는 이번 범위 밖이라 손대지 않았다.

**왜** — 앞서 진행한 css/js 폴더 분리(`cd974f2`)와 같은 패턴으로, 루트에 남아 있던 정적 에셋을 종류별 디렉터리로 정리해 루트를 `index.html` + 에셋 폴더(`css/`, `js/`, `fonts/`, `images/`)만 남는 구조로 맞추기 위함. 사용자 요청.

**어떻게 확인** — Playwright(Chromium 1228) + 로컬 정적 서버(:4599)로 실제 페이지를 열어 실측했다.
- 네트워크: `/images/` 요청 13건 전부 200, 프로젝트 전체에서 4xx/실패 요청 0건, 콘솔 에러 0건.
- 갤러리: `.gallery__item-imginner` 12개의 computed `background-image`에서 URL을 뽑아 `Image` 객체로 디코드 검증 — 12/12 성공(각 400x600, item4만 480x600).
- 파비콘: `link[rel*=icon]`의 href가 `/images/favicon.26242483.ico`로 해석되고 fetch 200 / 15086바이트 / `image/x-icon`.
- 모달: 첫 항목을 클릭해 `modal is-open` 상태 진입 확인, `.modal__media`의 배경이 `/images/1.b2dd7476.jpg`로 잡히고 디코드 성공. 스크린샷으로 갤러리·모달 모두 이미지가 실제 렌더링되는 것까지 눈으로 확인.

**경로 관련 주의점(이번엔 문제 없었던 이유)** — 예전 폰트 경로 이슈처럼 CSS의 `url(...)`은 CSS 파일 자신의 위치 기준 상대경로라 함정이 되지만, 이번 이미지 참조는 전부 `index.html`의 인라인 `style="background-image: url(...)"`에 있어 문서 기준 상대경로다. 따라서 `images/` 접두사만 붙이면 되고 `../` 보정이 필요 없다. `css/*.css` 안에는 이미지 `url()`이 하나도 없고(`gallery.css`의 `url()`은 `../fonts/...` 폰트뿐), `js/*.js`에도 하드코딩된 이미지 경로가 없다 — `modal.js`는 `getComputedStyle(imgInner).backgroundImage`로 이미 절대 URL로 해석된 값을 복사하고, `gallery.js`의 imagesLoaded도 computed style을 읽으므로 둘 다 경로 변경에 영향받지 않는다.

**git** — 13개 파일 모두 `git mv`로 옮겨 `git diff --cached -M`에서 `R100`(내용 동일 rename)으로 잡히는 것을 확인했다. 커밋 시점에 작업 트리에 이번 작업과 무관한 사용자 편집(`.gallery__text` 첫 span의 "Verjuice" → "2026")이 남아 있어, 이 줄은 스테이징에서 제외하고 이미지 경로 변경만 커밋했다(해당 편집은 커밋되지 않은 채 작업 트리에 그대로 유지). push는 사용자 요청 전까지 하지 않음 — 로컬 커밋까지만.

## 갤러리 이미지를 sample 이미지로 교체 (2026-08-24)

**무엇을** — 사용자가 기존 갤러리 이미지 12장(`1.b2dd7476.jpg` ~ `12.d01438d5.jpg`)을 직접 삭제하고 `images/sample 1.png` ~ `sample 11.png` 11장을 새로 넣어둔 상태에서, `index.html`의 갤러리 항목 12개 `background-image` 참조를 새 파일로 교체했다. 항목1~11은 순서대로 `sample 1`~`sample 11`에 매핑하고, 이미지가 한 장 부족한 항목12는 사용자가 선택한 대로 `sample 1.png`를 재사용한다.

**파일명 공백 처리** — 새 파일명에 공백이 있어(`sample 1.png`) CSS `url()`에 그대로 넣으면 파싱이 깨질 수 있다. 인라인 `style` 속성이 큰따옴표를 쓰고 있으므로 URL은 작은따옴표로 감싸고, 공백은 `%20`으로 퍼센트 인코딩했다 — 최종 형태는 `url('images/sample%201.png')`. 따옴표는 CSS 파서를, 퍼센트 인코딩은 실제 요청 URL을 각각 안전하게 만드는 이중 방어이며, 둘 중 하나만으로도 동작하지만 함께 쓰는 편이 확실하다.

**다른 파일 영향 없음** — 프로젝트 전체를 검색해 기존 jpg 파일명을 하드코딩한 곳은 `index.html` 12줄이 전부였다. `js/modal.js`는 `getComputedStyle(imgInner).backgroundImage`를 복사하고, `js/gallery.js`의 imagesLoaded도 computed style에서 `/url\((['"])?(.*?)\1\)/` 정규식으로 URL을 뽑으므로 — 이 정규식은 따옴표로 감싼 형태를 정상 처리한다 — 양쪽 모두 수정이 필요 없었다.

**어떻게 확인** — Playwright(Chromium 1228) + 로컬 정적 서버(:8899)로 실측했다.
- 로딩 게이트: `preloadImages('.gallery__item-imginner')` 프로미스가 resolve되어 `body.loading` 클래스가 정상 해제됨 — 이미지 한 장이라도 로드 실패하면 페이지가 loading 상태에 갇히므로 이 자체가 12장 전부 로드됐다는 증거다.
- 갤러리: 12개 항목의 computed `background-image`가 의도한 매핑과 정확히 일치(1~11 → sample 1~11, 12 → sample 1), 12/12 전부 `Image.decode()` 성공(각 400x600).
- 네트워크: `/images/` 요청 12건 전부 200(sample 11장 + favicon), 4xx/실패 요청 0건, 콘솔 에러 0건, 페이지 에러 0건.
- 모달: 항목 5·11·12를 각각 열어 `.modal__media` 배경이 `sample 5.png`(Uroboros) / `sample 11.png`(Eurhythmic) / `sample 1.png`(Dariole)로 잡히고 디코드까지 성공하는 것을 확인. 항목12만 검증하면 sample 1이 "재사용 결과"인지 "직전 모달의 잔상"인지 구분되지 않으므로, 서로 다른 이미지를 쓰는 항목을 섞어 열어 모달이 항목별로 올바른 이미지를 집어오는 것까지 확인했다.

**git** — 이미지 관련 변경분만 선별 스테이징했다. 작업 트리에는 이번 요청과 무관한 사용자의 진행 중 편집이 남아 있었다: `index.html`의 `.gallery__text` 장식 텍스트("Verjuice/Zyrian" → "2026/Portfolio")와 `css/gallery.css`의 `.gallery__item-number { display: none }` 추가 및 text-stroke 색상 `#645c5b` → `#bebebe`. `index.html`은 한 파일 안에 사용자 편집 1줄과 이미지 변경 12줄이 섞여 있어 파일 단위 `git add`로는 분리가 불가능하므로, `git show HEAD:index.html`로 받은 원본에 이미지 치환 12건만 적용한 blob을 `git hash-object -w` → `git update-index --cacheinfo`로 인덱스에 직접 넣었다(작업 트리 파일은 건드리지 않음). 결과적으로 스테이징된 `index.html` diff는 12줄 +/-, 미스테이징으로 남은 diff는 `.gallery__text` 1줄뿐임을 확인했다. push는 하지 않음 — 로컬 커밋까지만.
