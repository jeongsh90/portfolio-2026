# 코드 주석 모음

`js`/`css` 소스 파일 안에 있던 주석을 전부 빼서 여기로 옮겼다. 각 항목은 원래 어느 파일의 어느 코드 옆에 있었는지 표시했다.

(제외 대상: `js/gallery.js`, `css/base.css`의 Locomotive Scroll 벤더 블록에 있는 라이선스/저작권 주석은 서드파티 코드 라이선스 조건상 원본 그대로 남겨뒀다 — 옮기거나 지우지 않음.)

## js/modal.js

**`window.addEventListener('resize', recalc);` 위**
> 창 크기가 바뀌면(개발자도구 토글, 창 리사이즈 등) viewport.clientHeight도 바뀌는데, 그때 max를 다시 계산하지 않으면 예전 높이 기준의 스크롤 한계에 갇혀 실제 콘텐츠 끝(마지막 섹션)까지 스크롤이 닿지 않는다.

**`ResizeObserver`로 `scrollEl` 관찰하는 블록 위**
> 이미지 로드, 폰트 반영, 콘텐츠 변경 등 어떤 이유로든 .modal__scroll의 실제 높이가 바뀌면 스크롤 최대치가 그 즉시 최신 값으로 갱신되게 한다 — 개별 원인마다 리스너를 따로 달지 않아도, 마지막 섹션이 스크롤로 닿지 않는 채 잘려 보이는 문제를 한 곳에서 막는다.

**`hideSectionReveals()` 함수 위 (섹션 2/3 등장 애니메이션 블록 전체 설명)**
> 섹션 2(컴포넌트 링크)·섹션 3(이미지 갤러리) 등장 애니메이션 — 모달은 실제 스크롤이 아니라 .modal__scroll의 transform으로 움직이지만, IntersectionObserver는 화면상 실제 좌표 교차를 보기 때문에 그대로 잘 작동한다. viewport(고정 뷰포트, overflow:hidden)를 root로 줘야 그 안에서의 교차만 감지한다.

**`setupSectionReveals()` 안, `IntersectionObserver` 미지원 분기 위**
> IntersectionObserver 미지원 브라우저는 등장 애니메이션 없이 바로 노출

## js/dot-grid.js

**`SPACING`/`RADIUS`/`BASE_A`/`PEAK_A` 상수 옆에 각각 붙어있던 설명**
- `SPACING = 30` — 점 사이 간격, 키우면 더 성기게 배치됨
- `RADIUS = 400` — 포인터 반응 반경, 키우면 더 넓은 범위의 점이 반응
- `BASE_A = 0.13` — 평상시 점 투명도
- `PEAK_A = 1` — 포인터에 닿았을 때 점 투명도

## css/modal.css

**`.modal__info` 규칙 안, 지워진 비활성 선언**
> `/* max-width: 32rem; */` — 이전에 있던 값을 주석 처리만 해두고 지우지는 않은 상태였음(사용자가 `width:100%`로 대체)

## css/gallery.css

**`[data-scroll-container]` 규칙 안, 지워진 비활성 선언**
> `/* cursor: grab; */`

## css/base.css

**Page Loader 섹션 위**
> Page Loader
