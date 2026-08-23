## 하네스: 포트폴리오 랜딩페이지 (D:\MyCloud\2026포트폴리오)

**목표:** HTML + CSS + JavaScript + GSAP로 만드는 정적 포트폴리오 랜딩페이지를 기획(섹션 구성/콘텐츠 필드)부터 디자인(토큰/레이아웃/모션 컨셉), 구현(반응형+ScrollTrigger 애니메이션), QA(반응형·애니메이션·성능·접근성 실검증), git/GitHub 연결까지 에이전트 팀으로 구축한다. 빌드 도구·프레임워크 없는 순수 정적 사이트가 원칙.

**트리거:** 포트폴리오/랜딩페이지/섹션 추가·수정/디자인/GSAP 애니메이션/반응형/git 연결/GitHub 업로드 관련 작업 요청 시 `portfolio-landing-orchestrator` 스킬을 사용하라. 후속 수정·재실행·특정 섹션만 다시·콘텐츠를 실제 내용으로 교체·QA 재검증 요청도 동일 스킬로 처리한다. 단순 질문은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-08-23 | 초기 구성 (4개 에이전트: 기획/디자인/개발(GSAP+git)/QA, 5개 스킬 + 오케스트레이터, 에이전트 팀 모드) | 전체 | "포트폴리오 랜딩페이지를 HTML/CSS/JS/GSAP로 만들고 git 연결" 요청. Git 범위는 "로컬 init + GitHub 원격 연결", 콘텐츠는 "아직 없음 — 플레이스홀더 구조부터"로 확인 |
| 2026-08-23 | **범위 대폭 축소** — 인트로/포트폴리오/연혁/자기소개 4-뷰 해시라우팅 SPA 설계를 폐기하고, **단일 포트폴리오 페이지 하나만** 만드는 것으로 재구성. 사용자가 제공한 참고 자산 `HorizontalSmoothScrollLayout-main/`(Codrops 데모, Locomotive Scroll 기반 가로 스크롤 갤러리)의 **데모2를 GSAP(스무스스크롤+ScrollTrigger)로 동일하게 재구현**하는 것이 현재 유일한 목표. 연혁·자기소개는 이번 범위에서 뺌(추후 필요시 재추가 가능하도록 기존 4-뷰 산출물은 `_workspace/_prev_multiview/`에 보존). "일단 페이지 구성하고 나면 이후 명령"이라 밝혀, 이후 세션에서 요구사항이 다시 확장될 수 있음 — `portfolio-planner`/`portfolio-designer` 에이전트와 그 스킬은 삭제하지 않고 향후 확장(페이지 추가 등) 시 재사용 대기 | CLAUDE.md, 루트 index.html/css/js(전면 재작성 예정), `.claude/skills/portfolio-landing-orchestrator` | "하네스를 다시 구성해 — 데모2를 활용해서 단일 포트폴리오 페이지를 만들꺼야, 똑같이 만드는데 gsap로 다시만들면돼, 연혁·자기소개는 뺄꺼야, gsap 스무스스크롤·스크롤트리거" 요구사항 |
| 2026-08-23 | 바로 위에서 GSAP로 새로 재구현한 버전(마크업/CSS/JS 전부 새로 작성, 스킨은 데모2와 유사하게)을 사용자가 곧바로 다시 리셋 — **재구현하지 말고 데모2 원본 파일을 그대로 가져오는 것**으로 변경. GSAP 재구현물은 `_workspace/_prev_gsap_rebuild/`에 보존. `HorizontalSmoothScrollLayout-main/HorizontalSmoothScrollLayout-main/dist/`(Parcel로 이미 빌드된 정적 산출물 — 소스의 ES 모듈/Locomotive Scroll import를 브라우저에서 바로 실행 가능한 번들로 변환해둔 것)에서 `index2.html`→`index.html`, `base.98fd6c19.css`/`demo2.06b37b5f.css`/`demo2.44794d1a.js`/`favicon.26242483.ico`와 참조된 이미지 12장을 파일명·경로 그대로 프로젝트 루트에 복사. 즉 지금은 **Locomotive Scroll 기반 데모2 원본 그대로**이며 GSAP가 아님 — Playwright로 실제 렌더링(이미지 회전 트릭, Typekit moret 서체, explore 버튼, 태그) 정상 확인. 콘텐츠도 데모 원본 그대로(스톡사진 인물 12장, 영문 카피)라 아직 포트폴리오 실제 콘텐츠로 치환되지 않은 상태 | 루트 index.html/base.98fd6c19.css/demo2.06b37b5f.css/demo2.44794d1a.js/favicon.26242483.ico/1~12번 jpg(신규, 데모2 dist 원본 그대로) | "리셋하고 그냥 데모2가져와" 요구사항 |
