---
name: portfolio-landing-orchestrator
description: "HTML/CSS/JavaScript/GSAP 기반 포트폴리오 랜딩페이지의 기획→디자인→구현→QA→git/GitHub 연결을 조율하는 오케스트레이터. '포트폴리오 만들어줘', '랜딩페이지 구축', '섹션 추가', 'GSAP 애니메이션 넣어줘', 'git 연결해줘', 'GitHub에 올려줘' 등 초기 요청 시 사용. 후속 작업(재실행, 특정 섹션만 다시, 디자인 수정, 애니메이션 수정, 반응형 버그 수정, QA 재검증, 콘텐츠를 실제 내용으로 교체, 결과 개선) 요청에도 반드시 이 스킬을 사용한다."
---

# Portfolio Landing Orchestrator

포트폴리오 랜딩페이지(HTML/CSS/JS/GSAP, 빌드 도구 없는 정적 사이트)를 기획부터 git/GitHub 연결까지 만드는 에이전트 팀을 조율하는 통합 스킬.

## 현재 범위 (2026-08-23 갱신 — 반드시 먼저 확인)

초기에는 인트로/포트폴리오/연혁/자기소개 4개 뷰를 해시 라우팅으로 페이드 전환하는 구조로 설계했으나, 사용자가 **"단일 포트폴리오 페이지 하나만" 만드는 것으로 범위를 축소**했다. 사용자가 제공한 참고 자산(`HorizontalSmoothScrollLayout-main/` — Codrops "Horizontal Smooth Scroll Layout" 데모, Locomotive Scroll 기반)의 **데모2를 GSAP(스무스스크롤+ScrollTrigger)로 그대로 재구현**하는 것이 현재 유일한 작업 목표다 — 연혁·자기소개는 뺐다.

- **아래 "에이전트 구성"·"워크플로우"는 4-뷰 구조 기준으로 작성된 원래 설계다.** 새 세션에서 이 스킬이 트리거되면, 먼저 사용자에게 지금도 단일 페이지(데모2 클론) 범위인지, 아니면 연혁/자기소개 등을 다시 포함하는 확장 요청인지 확인하라 — "일단 페이지 구성하고 나면 이후 명령"이라 밝혔으므로 후속 세션에서 범위가 다시 넓어질 수 있다.
- 단일 페이지 범위일 때는 planner/designer 풀 팀을 소집할 필요가 없다 — 구조와 시각 언어가 이미 데모2로 확정되어 있으므로, `portfolio-developer` 단독(+마무리 단계에 `qa-inspector`)으로 처리한다. 데모2 재구현 시 참고할 것: 데모2 소스는 `HorizontalSmoothScrollLayout-main/HorizontalSmoothScrollLayout-main/src/{index2.html, css/demo2.css, js/demo2/index.js}`이며, **코드를 그대로 복사하지 않고 마크업/스타일/스크립트를 새로 작성**하되 레이아웃 구조·여백 비례·기능·애니메이션(가로 핀+스크럽 스크롤, 스크롤 속도 반응 스큐, 항목별 패럴랙스)은 동일하게 재현한다. 반응형(좁은 화면에서 핀 방식 대신 네이티브 가로 스와이프+스크롤 스냅으로 폴백)을 반드시 고려한다.
- 연혁/자기소개가 다시 요청되면 `_workspace/_prev_multiview/`에 보존된 이전 4-뷰 산출물(IA·디자인 문서·구현 코드)을 재사용 가능한 출발점으로 삼는다 — 처음부터 다시 기획하지 않는다.
- 이 스킬 자체(에이전트 구성표, Phase 2 팀 생성 프롬프트 등)는 향후 다시 다중 뷰로 확장될 것을 대비해 그대로 남겨두었다 — 단일 페이지 범위에서는 아래 내용 중 developer(+qa) 관련 부분만 적용하면 된다.

## 실행 모드: 에이전트 팀

기획→디자인→구현이 순차 의존(파이프라인)이면서도, 디자이너-개발자 간 기술적 실현 가능성 협의, 개발자-QA 간 버그 보고·재검증 루프가 실시간으로 필요하므로 에이전트 팀 모드를 기본으로 한다.

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 |
|------|-------------|------|------|------|
| planner | portfolio-planner | 섹션 구조, 콘텐츠 필드, 플레이스홀더 카피 설계 | portfolio-ia | `_workspace/01_planner_ia.md` |
| designer | portfolio-designer | 디자인 토큰, 레이아웃, 모션 컨셉 설계 | html-css-design-system | `_workspace/02_designer_system.md` |
| developer | portfolio-developer | HTML/CSS/JS/GSAP 구현, git/GitHub 연결 | html-css-design-system, gsap-scroll-motion, git-github-setup | 실제 코드 + `_workspace/03_developer_notes.md` |
| qa | qa-inspector | 반응형/애니메이션/성능/접근성/git 연결 실검증 | portfolio-qa-review | `_workspace/04_qa_report.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인 (후속 작업 지원)

1. `_workspace/` 디렉토리와 프로젝트 루트의 `index.html` 존재 여부를 확인한다.
2. 실행 모드 결정:
   - **`_workspace/`와 `index.html` 모두 미존재** → 초기 실행. Phase 1로 진행.
   - **존재 + 사용자가 특정 부분(섹션/디자인/애니메이션/버그)만 수정 요청** → 부분 재실행. 해당 담당 에이전트만 호출한다(예: "히어로 애니메이션만 바꿔줘" → developer 단독 호출, 팀 전체를 새로 구성하지 않아도 됨). 관련 없는 다른 팀원은 소집하지 않는다.
   - **존재 + 사용자가 실제 콘텐츠(진짜 프로젝트 이력 등)를 제공하며 플레이스홀더 교체 요청** → 콘텐츠 교체 실행. planner가 새 콘텐츠를 `01_planner_ia.md`에 반영 → developer가 코드에 반영. designer/qa는 레이아웃에 영향이 있을 때만 소집.
   - **존재 + 완전히 새로운 방향(다른 컨셉/레퍼런스) 제공** → 새 실행. 기존 `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동한 뒤 Phase 1부터 전체 재실행.
3. 부분 재실행 시, 소집하는 에이전트에게 기존 산출물 경로(`_workspace/0N_*.md`)와 실제 코드 경로를 함께 전달해 "무엇을 이미 알고 있는 상태에서 시작하는지" 명시한다.

### Phase 1: 준비

1. 사용자 요청 분석 — 디자인 레퍼런스(이미지/URL/설명)가 있는지, 특별히 강조하고 싶은 섹션/톤이 있는지 확인한다.
2. `_workspace/` 생성(초기 실행 시) 또는 기존 것 보존(부분 재실행 시).
3. 디자인 레퍼런스가 제공되면 `_workspace/00_input/`에 저장하거나 경로를 기록해 designer에게 전달할 수 있게 한다.

### Phase 2: 팀 구성

```
TeamCreate(
  team_name: "portfolio-team",
  members: [
    { name: "planner", agent_type: "portfolio-planner", model: "opus",
      prompt: "포트폴리오 랜딩페이지의 섹션 구조와 플레이스홀더 콘텐츠를 설계하라. portfolio-ia 스킬을 로드하라. 사용자 요청: {요청 요약}" },
    { name: "designer", agent_type: "portfolio-designer", model: "opus",
      prompt: "planner의 _workspace/01_planner_ia.md를 기반으로 디자인 시스템을 설계하라. html-css-design-system 스킬을 로드하라. 레퍼런스: {있으면 경로/설명}" },
    { name: "developer", agent_type: "portfolio-developer", model: "opus",
      prompt: "planner와 designer의 산출물을 기반으로 HTML/CSS/JS/GSAP로 실제 구현하고, 완료 후 git 초기화 및 GitHub 연결까지 수행하라. html-css-design-system, gsap-scroll-motion, git-github-setup 스킬을 로드하라." },
    { name: "qa", agent_type: "qa-inspector", model: "opus",
      prompt: "developer의 구현을 실제 브라우저에서 검증하라. portfolio-qa-review 스킬을 로드하라." },
  ]
)
```

작업 등록:

```
TaskCreate(tasks: [
  { title: "섹션 구조 설계", assignee: "planner" },
  { title: "디자인 시스템 설계", assignee: "designer", depends_on: ["섹션 구조 설계"] },
  { title: "HTML/CSS/JS/GSAP 구현", assignee: "developer", depends_on: ["디자인 시스템 설계"] },
  { title: "git 초기화 및 GitHub 연결", assignee: "developer", depends_on: ["HTML/CSS/JS/GSAP 구현"] },
  { title: "반응형/애니메이션/성능/접근성/git 검증", assignee: "qa", depends_on: ["git 초기화 및 GitHub 연결"] },
])
```

### Phase 3: 실행 (팀원 자체 조율)

**실행 방식:** 팀원들이 공유 작업 목록에서 의존성이 해소된 작업을 순서대로 수행. 리더는 진행 상황을 모니터링한다.

**팀원 간 통신 규칙:**
- planner → designer: 섹션 구조 완료 시 SendMessage로 알림.
- designer → developer: 디자인 시스템 완료 시 SendMessage로 알림. developer가 구현 중 기술적 난점(성능/실현 가능성)을 질문하면 SendMessage로 왕복 협의.
- developer → qa: 구현 및 git 연결 완료 시 SendMessage로 알림 + 로컬 확인 방법(파일 경로 또는 로컬 서버 실행법) 전달.
- qa → developer: 버그 발견 시 즉시(전체 검증 종료를 기다리지 않고) SendMessage로 보고. developer는 수정 후 SendMessage로 재검증 요청.
- 같은 유형의 버그가 반복되면 qa는 developer에게 근본 원인 재검토를 명시적으로 요청한다(patch 반복 금지).

**리더 모니터링:** TaskGet으로 진행률 확인. 팀원이 유휴 상태면 SendMessage로 상태 확인 후 재지시.

### Phase 4: 통합 및 보고

1. 모든 작업 완료 대기(TaskGet).
2. `_workspace/04_qa_report.md`를 Read해 실패 항목이 있으면, 해당 항목이 해결되었는지 developer/qa에게 재확인.
3. 사용자에게 최종 요약 보고: 구현된 섹션, 디자인 방향, GSAP 애니메이션 개요, GitHub 원격 저장소 URL, QA 결과 요약(발견/수정된 이슈).

### Phase 5: 정리

1. 팀원들에게 종료 SendMessage.
2. `TeamDelete`로 팀 정리.
3. `_workspace/`는 보존(감사 추적용).
4. Phase 7 피드백 수집 절차에 따라 사용자에게 개선 의견을 요청한다.

## 데이터 흐름

```
[리더] → TeamCreate → [planner] → 01_planner_ia.md
                            │ SendMessage
                            ↓
                       [designer] → 02_designer_system.md
                            │ SendMessage
                            ↓
                       [developer] → 실제 코드 + git/GitHub 연결 + 03_developer_notes.md
                            │ SendMessage
                            ↓
                          [qa] → 04_qa_report.md
                            │ (버그 발견 시 SendMessage 왕복)
                            ↓
                     [리더: 통합·보고]
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| planner/designer 산출물이 모호해 developer가 구현 불가 | developer가 SendMessage로 명확화 요청 → 담당 팀원이 산출물 보완 |
| gh CLI 미인증으로 GitHub 연결 실패 | 로컬 git까지는 완료, 실패 사유를 최종 보고에 명시. 임의로 인증 우회하지 않음 |
| qa가 발견한 버그를 developer가 재현 못함 | qa가 재현 방법(스크린샷/스텝)을 더 구체화해 재전달. 그래도 안 되면 사용자에게 확인 요청 |
| 팀원 1명 중단/실패 | 리더가 유휴 알림 수신 → SendMessage로 상태 확인 → 재시작. 재실패 시 해당 산출물 없이 진행하고 최종 보고에 누락 명시 |
| 팀원 간 디자인-구현 의견 충돌(성능상 구현 불가 등) | 삭제하지 않고 대안을 SendMessage로 협의, 합의 결과를 산출물에 반영 |

## 테스트 시나리오

### 정상 흐름
1. 사용자가 "포트폴리오 랜딩페이지 만들어줘, 콘텐츠는 아직 없어" 요청.
2. Phase 0에서 `_workspace/` 미존재 확인 → 초기 실행.
3. Phase 2에서 4인 팀 구성 + 5개 작업 등록.
4. Phase 3에서 planner→designer→developer(구현+git 연결)→qa 순으로 진행, qa가 버그 1건 발견해 developer에게 보고 → 수정 → 재검증 통과.
5. Phase 4에서 리더가 결과 종합, GitHub 저장소 URL 포함해 사용자에게 보고.
6. 예상 결과: 프로젝트 루트에 `index.html`/`css/`/`js/` 생성, GitHub 원격 저장소 연결, `_workspace/04_qa_report.md`에 통과 기록.

### 후속(부분 재실행) 흐름
1. 사용자가 "히어로 섹션 애니메이션만 좀 더 화려하게 해줘" 요청.
2. Phase 0에서 기존 `_workspace/`와 `index.html` 존재 확인 → 부분 재실행 판단, developer(필요 시 designer)만 소집.
3. developer가 기존 코드를 Read로 확인 후 히어로 섹션 애니메이션만 수정.
4. qa가 해당 섹션만 재검증(전체 체크리스트 반복하지 않음).
5. 결과를 사용자에게 보고, `_workspace/03_developer_notes.md`에 변경 사항 추가.

### 에러 흐름
1. developer가 `gh auth status` 확인 결과 미인증 상태를 발견.
2. developer가 로컬 git init/커밋까지 완료하고, GitHub 연결은 실패 사유와 함께 `03_developer_notes.md`에 기록.
3. 리더가 최종 보고에 "GitHub 연결은 `gh auth login` 필요 — 완료 후 재요청 시 원격 연결 진행" 명시.
