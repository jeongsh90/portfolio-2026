---
name: html-css-design-system
description: 순수 HTML/CSS(프레임워크·컴포넌트 라이브러리 없음) 기준으로 디자인 토큰(컬러/타이포그래피/스페이싱/브레이크포인트)을 CSS 커스텀 프로퍼티로 정의하고 반응형 레이아웃을 작성하는 방법을 안내. 포트폴리오 랜딩페이지의 시각 디자인을 설계하거나 CSS를 작성할 때 반드시 사용.
---

# HTML/CSS Design System

React/shadcn 같은 컴포넌트 라이브러리 없이, 순수 HTML/CSS만으로 일관된 디자인 시스템을 구성하는 방법을 안내한다.

## 디자인 토큰을 CSS 변수로

모든 색상·크기 값은 하드코딩하지 않고 `:root`의 커스텀 프로퍼티로 선언한 뒤 참조한다. 이렇게 하면 (1) 다크모드 대응이 변수 재정의 한 번으로 끝나고, (2) 디자이너가 정의한 토큰과 실제 구현이 어긋나지 않는다.

```css
:root {
  /* 컬러 — 역할 기반 명명 (구체적 색상명이 아니라 용도로) */
  --color-bg: #0a0a0f;
  --color-fg: #f5f5f7;
  --color-muted: #8a8a93;
  --color-accent: #6c5ce7;
  --color-border: rgba(245, 245, 247, 0.12);

  /* 타이포그래피 스케일 — 배수 비율(1.25 등)로 일관되게 */
  --font-sans: 'Pretendard', -apple-system, sans-serif;
  --fs-hero: clamp(2.5rem, 6vw, 5rem);
  --fs-h2: clamp(1.75rem, 4vw, 2.75rem);
  --fs-body: 1rem;
  --fs-small: 0.875rem;

  /* 스페이싱 스케일 — 4px 또는 8px 기준 배수 */
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2.5rem;
  --space-5: 4rem;
  --space-6: 6rem;

  /* 브레이크포인트는 미디어쿼리에 직접 쓸 수밖에 없으므로 주석으로 문서화 */
  /* mobile: ~639px, tablet: 640~1023px, desktop: 1024px~ */
}
```

## 한글 타이포그래피 원칙

한글 텍스트에 라틴 알파벳 기본 자간(0 또는 양수)을 그대로 쓰면 글자 사이가 벌어져 보여 어색하다. Pretendard 등 한글 최적화 폰트를 우선 사용하고, 자간은 본문 기준 `-0.01em`~`-0.02em`, 큰 제목(히어로)일수록 더 좁게(`-0.02em`~`-0.04em`) 잡는다. 행간은 본문 1.5~1.7, 제목 1.1~1.3을 기준으로 한다.

```css
h1, h2, h3 { letter-spacing: -0.03em; line-height: 1.15; }
p, li { letter-spacing: -0.01em; line-height: 1.6; }
```

Pretendard는 CDN(`https://cdn.jsdelivr.net/gh/orioncactus/pretendard/...`) 또는 npm 패키지로 받되, 이 프로젝트는 빌드 도구가 없으므로 `@font-face`로 웹폰트 파일을 직접 로드하거나 CDN `<link>`를 사용한다. `font-display: swap`을 반드시 지정해 폰트 로딩 중 텍스트가 안 보이는 현상(FOIT)을 막는다.

## 레이아웃 — Flexbox/Grid 우선

절대 위치(`position: absolute`)로 레이아웃을 짜지 않는다 — 반응형에서 깨지기 쉽다. 섹션 내부 배치는 `display: flex` 또는 `display: grid`로 구성하고, 각 섹션은 `min-height: 100svh`(또는 필요한 만큼) + 안쪽 여백으로 뷰포트 단위 리듬을 만든다.

```css
.section {
  padding: var(--space-6) var(--space-3);
  max-width: 1200px;
  margin-inline: auto;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-3);
}
```

`grid-template-columns: repeat(auto-fill, minmax(...))` 패턴은 미디어쿼리 없이도 화면 폭에 따라 열 수가 자연스럽게 줄어드는 반응형을 만든다 — 카드형 섹션(프로젝트 그리드 등)에 우선 사용한다.

## 반응형 작성 규칙

- 모바일 우선(mobile-first)으로 기본 스타일을 작성하고, `min-width` 미디어쿼리로 큰 화면에 확장하는 방식과, 데스크톱 우선으로 작성 후 `max-width`로 축소하는 방식 중 하나를 프로젝트 전체에서 일관되게 유지한다.
- 폰트 크기는 가능하면 `clamp(min, preferred, max)`로 뷰포트에 따라 자연스럽게 스케일링해, 브레이크포인트마다 개별 크기를 지정하는 반복을 줄인다.
- 터치 타겟(버튼, 링크)은 모바일에서 최소 44×44px를 확보한다.

## 다크 모드(선택)

포트폴리오 디자인이 다크 테마를 기본으로 한다면, `prefers-color-scheme`로 라이트 대응 여부를 판단한다 — 반드시 둘 다 지원할 필요는 없다(디자이너가 정한 방향에 따른다). 지원한다면 색상 토큰을 `@media (prefers-color-scheme: light)` 블록에서만 재정의하고, 나머지 CSS는 변수를 그대로 참조하게 해 로직 중복을 피한다.
