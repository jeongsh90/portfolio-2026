# 01b. 구조 변경 addendum — 메인페이지 = 포트폴리오 (2026-08-23, 대화 중 갱신)

`01_planner_ia.md`, `02_designer_system.md` 작성 이후 사용자가 참고 자산(`HorizontalSmoothScrollLayout-main/`, Codrops "Horizontal Smooth Scroll Layout" 데모2)을 제공하며 구조를 갱신했다. 이 문서는 두 산출물을 **대체하지 않고 보완**한다 — 아래 변경 사항만 반영하고, 나머지(색/타이포/연혁/자기소개 설계 등)는 기존 문서를 그대로 따른다.

## 사용자 확정 사항 (대화 원문 근거)

- "메인페이지 = 포트폴리오 = 프로젝트 페이지" — 별도의 V0 인트로 화면(메뉴 3개짜리 100vh 랜딩)은 더 이상 두지 않는다. **사이트 진입 시 바로 포트폴리오(프로젝트) 갤러리가 보인다.**
- "데모2를 참고해서 만드는데 레이아웃 구조(여백, 기능, 애니메이션)는 동일하게, 마크업은 처음부터 만드는 조건으로 GSAP를 활용하고 반응형 고려" — 데모2의 **코드를 복사하지 않는다**(원본은 Locomotive Scroll 기반, 우리는 GSAP ScrollTrigger). 레이아웃 비례·기능·애니메이션 아이디어만 참고해 마크업/스타일/스크립트를 새로 작성한다.

## 데모2에서 가져오는 것 (참고 위치: `HorizontalSmoothScrollLayout-main/HorizontalSmoothScrollLayout-main/src/{index2.html, css/demo2.css, js/demo2/index.js}`)

1. **가로 스크롤 갤러리** — 세로 휠/터치 입력을 가로 이동으로 변환해 프로젝트를 옆으로 훑어보게 한다.
2. **항목 구성**: 큰 세리프 인덱스 번호(좌상단) + 프로젝트명(번호 옆, 큰 타이포) + 이미지(중앙, 스크롤 시 이미지 내부만 반대 방향으로 살짝 움직이는 패럴랙스) + 태그(우하단, 텍스트 나열) + 원형 "탐색"류 링크 버튼(좌하단) — 클릭 시 상세 다이얼로그(V1-D, 기존 설계 그대로) 오픈.
3. **스크롤 속도 반응 스큐(skew)** — 스크롤 속도가 빠를수록 이미지가 살짝 기울어지는(skewX, -15~15deg 클램프) "속도감" 연출.
4. **장식용 대형 아웃라인 텍스트** — 항목 사이사이에 배경처럼 깔리는 거대한 stroke-only 텍스트(우리는 실제 콘텐츠 문구나 장식 한글/영문 단어로 대체 가능, 선택 요소로 취급).
5. **여백 비례** — 항목 간 좌우 마진(≈3vw), 이미지 폭 언더컷(이미지 내부 요소가 프레임보다 넓어 패럴랙스 여유폭 확보) 등 원본의 비례 감각을 참고하되 정확한 vw 값을 그대로 베끼지 말고 우리 그리드/스페이싱 토큰에 맞게 재조정한다.

## 가져오지 않는 것 (그대로 쓰면 안 되는 것)

- **다크 테마+빨강 링크 팔레트를 그대로 쓰지 않는다.** `02_designer_system.md`의 "조판된 낱장" 팔레트(`--paper` 종이 배경, `--ink` 먹색 텍스트, `--accent` 주묵 강조)를 그대로 적용한다 — 우연히 데모2의 레드 계열(#cc0000)과 우리 accent(#C4331F)가 비슷한 톤이라 이질감은 적을 것이다.
- **Locomotive Scroll 라이브러리, Typekit `moret` 유료 폰트, `.rotate{transform:rotate(-4deg)}` 전체 기울임 트릭**은 가져오지 않는다. 스크롤은 GSAP ScrollTrigger로 직접 구현(아래 기술 노트), 서체는 기존에 정한 한글 타이포그래피 시스템(Pretendard 등)을 유지하되 대형 인덱스 번호·프로젝트명 같은 디스플레이 요소에는 디자이너가 이미 정의한 세리프/디스플레이 서체 방향이 있으면 그것을 쓴다.
- 커스텀 원형 커서(`.cursor`)는 데스크톱 전용 장식 요소로만 선택 적용 — 모바일/터치 기기에서는 렌더링하지 않는다.

## GSAP ScrollTrigger 구현 방향 (Locomotive Scroll horizontal mode 대체)

표준 "핀 고정 가로 스크롤" 패턴을 쓴다:

```js
const track = document.querySelector('.gallery-track');
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.gallery-section',
    pin: true,
    scrub: 1,
    end: () => '+=' + (track.scrollWidth - window.innerWidth),
    invalidateOnRefresh: true,
  },
});
```

- 스큐 효과는 `scrollTrigger.onUpdate`에서 `self.getVelocity()`로 계산해 클램프 후 이미지에 적용(매 프레임 transform만 건드리므로 `gsap-scroll-motion` 스킬의 성능 원칙에 부합).
- 항목별 패럴랙스(이미지 내부 요소가 트랙보다 살짝 다른 속도로 움직이는 효과)는 같은 스크럽 진행률(progress)을 공유하는 별도 tween으로 구현 — 개별 ScrollTrigger를 항목마다 만들지 않는다.

## 반응형 (사용자가 명시적으로 요구한 항목)

핀+스크럽 방식은 좁은 화면에서 터치 제스처와 충돌하거나 스크롤 높이 계산이 부담스러울 수 있다. `ScrollTrigger.matchMedia()`로 분기하라:

- **데스크톱/태블릿(가로 폭 충분, 예: 900px 이상):** 위 핀+스크럽+스큐 패턴 그대로 적용.
- **모바일(900px 미만):** 핀을 걸지 않고, `.gallery-track`을 네이티브 `overflow-x: auto` + `scroll-snap-type: x mandatory`로 전환해 손가락 스와이프로 넘기게 한다. 스큐/장식 아웃라인 텍스트는 생략하거나 대폭 축소해도 무방(모바일 성능·가독성 우선).
- 두 모드 모두 항목 클릭 시 동일한 V1-D 상세 다이얼로그가 열려야 한다.

## 사이트 구조 갱신 요약

```
[메인페이지 = 포트폴리오 갤러리] (구 V1, 이제 사이트 진입점)
  - 좌상단 코너: 이름/직군 오버레이 (구 V0 인트로 정보 일부를 여기로 압축 이전 — 별도 화면 아님)
  - 우상단 또는 코너: 전역 내비게이션 (연혁 / 자기소개로 이동)
  - 가로 스크롤 갤러리 본문 (데모2 구조 참고)
  - 항목 클릭 → [V1-D] 상세 다이얼로그 (기존 설계 그대로 유지)
[연혁] — 기존 설계 그대로 (세로 타임라인, 스무스 스크롤)
[자기소개] — 기존 설계 그대로 (세로 스크롤)
```

해시 라우팅은 유지: `#/` 또는 `#/portfolio`가 메인(포트폴리오 갤러리), `#/portfolio/{id}`가 상세, `#/history`, `#/about`은 기존과 동일.
