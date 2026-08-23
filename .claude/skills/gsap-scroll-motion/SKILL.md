---
name: gsap-scroll-motion
description: GSAP + ScrollTrigger로 스크롤 연동 등장 애니메이션(페이드업, 스태거, 패럴랙스, 핀 고정 등)을 성능 안전하게 구현하는 방법과 버벅임 진단 체크리스트를 안내. GSAP 애니메이션 작성, ScrollTrigger 설정, "스크롤하면 버벅인다" 진단 시 반드시 사용.
---

# GSAP Scroll Motion

GSAP와 ScrollTrigger로 스크롤에 반응하는 애니메이션을 구현하고, 실제로 버벅이지 않는지 성능 관점에서 검증하는 방법을 안내한다.

## 기본 설정

빌드 도구 없는 정적 사이트이므로 CDN으로 로드한다:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>
  gsap.registerPlugin(ScrollTrigger);
</script>
```

## 성능 원칙 — "합성 전용" 속성만 매 프레임 애니메이션한다

브라우저는 `transform`과 `opacity` 변경만 GPU 합성 스레드에서 처리할 수 있다(리페인트/레이아웃 재계산 없이). 그 외 속성은 스크롤마다 매 프레임 메인 스레드를 점유해 카드가 여러 개 겹치는 순간 실제로 버벅임(long task)이 발생한다 — 이것은 이론이 아니라 실측으로 반복 확인된 패턴이다:

- **`filter: blur()`를 매 프레임 바꾸지 않는다** — blur 반경만큼 픽셀을 다시 샘플링해야 해서 무겁다. 필요하면 시작/끝 두 상태만(트랜지션으로) 쓰고, ScrollTrigger의 `scrub`로 연속 프레임마다 갱신하지 않는다.
- **텍스트가 있는 요소의 `scale`을 스크럽 애니메이션에 쓰지 않는다** — 서브픽셀 재래스터화를 유발해 텍스트가 많은 페이지에서 무겁다. 카드/이미지처럼 텍스트가 없는 요소의 scale은 비교적 안전하지만, 확신이 없으면 opacity+translate 조합으로 대체한다.
- **`box-shadow`, `background-position` 등 페인트 유발 속성**도 스크럽 애니메이션에서는 피한다.
- 안전한 조합: `opacity` + `transform: translateY()/translateX()` (+ 텍스트 없는 요소에 한해 `scale`).

## 등장 애니메이션 패턴

```js
gsap.utils.toArray('.section').forEach((section) => {
  gsap.from(section.querySelectorAll('.reveal'), {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',   // 섹션 상단이 뷰포트 80% 지점에 닿으면 시작
      toggleActions: 'play none none reverse',
    },
  });
});
```

- `toggleActions: 'play none none reverse'`는 스크롤을 올렸다 내렸다 할 때 애니메이션이 자연스럽게 되감기게 한다. 한 번만 재생하고 끝내려면 `'play none none none'` + `once: true`.
- 여러 요소를 순차적으로 보여줄 때는 `stagger`를 쓰고, 개별 `ScrollTrigger`를 요소마다 만들지 않는다(트리거 인스턴스가 늘어날수록 스크롤 리스너 오버헤드가 커진다) — 부모(섹션) 하나에 트리거를 걸고 자식들을 배열로 애니메이션한다.

## 핀 고정(sticky) 섹션

특정 섹션을 화면에 고정한 채 스크롤에 따라 내부 콘텐츠를 전환하는 효과는, GSAP `pin` 옵션보다 순수 CSS `position: sticky`로 고정을 맡기고 GSAP `scrub`는 그 안의 트랜지션(투명도/스케일 등)만 담당하게 하는 조합이 더 가볍고 예측 가능하다:

```css
.pin-card { position: sticky; top: 0; height: 100svh; }
```

```js
ScrollTrigger.create({
  trigger: '.pin-card',
  start: 'center center',
  end: '+=100%',
  scrub: true,
  onUpdate: (self) => {
    gsap.set('.pin-card .content', { opacity: 1 - self.progress, y: self.progress * -40 });
  },
});
```

## `prefers-reduced-motion` 대응

모션을 줄이거나 끄고 싶은 사용자 설정을 존중한다 — 접근성 기본기다:

```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  gsap.set('.reveal', { opacity: 1, y: 0, clearProps: 'all' });
} else {
  // 위의 ScrollTrigger 애니메이션 등록
}
```

## React useLayoutEffect 류의 타이밍 함정은 없지만, DOM 준비 타이밍은 주의

정적 HTML이므로 스크립트를 `</body>` 직전(또는 `defer`)에 로드해 DOM이 이미 존재하는 상태에서 `ScrollTrigger.create`를 호출한다. 이미지 로딩으로 레이아웃 높이가 나중에 바뀌는 요소가 있으면(예: 프로젝트 썸네일), 이미지 `load` 이벤트 이후 `ScrollTrigger.refresh()`를 호출해 트리거 위치를 재계산한다 — 그렇지 않으면 이미지 로드 전 계산된 위치 기준으로 트리거가 어긋난다.

## 버벅임 진단 체크리스트 (QA 단계)

1. 실제 브라우저에서 스크롤(가능하면 빠른 연타 스크롤도)하며 `PerformanceObserver`로 longtask(50ms 이상)를 계측한다 — 체감(벽시계 기준)이 아니라 계측값으로 판단한다. 원격/자동화 환경은 이벤트 왕복 지연이 커서 벽시계 기준 측정이 신뢰할 수 없다.
2. longtask가 잡히면 그 구간에서 애니메이션 중인 속성을 먼저 의심한다 — `filter`/`box-shadow`/텍스트 요소 `scale`이 있는지 확인.
3. 여러 요소가 동시에 애니메이션되는 지점(카드 그리드 스태거 등)에서 유독 심하면, 개별 트리거 인스턴스 수를 줄이거나(부모 하나로 통합) 스태거 총 개수를 줄인다.
