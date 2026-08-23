---
name: git-github-setup
description: 정적 HTML/CSS/JS 프로젝트의 로컬 git 저장소 초기화, .gitignore 작성, 첫 커밋, gh CLI를 이용한 GitHub 원격 저장소 생성/연결 절차를 안내. "git 연결", "GitHub에 올려줘", "저장소 만들어줘" 요청 시 사용.
---

# Git & GitHub Setup

정적 사이트 프로젝트를 로컬 git으로 버전 관리하고 GitHub 원격 저장소에 연결하는 절차.

## 절차

### 1. 로컬 초기화

```bash
git init
git branch -M main   # 기본 브랜치명을 main으로 통일
```

이미 `git init`이 되어 있는지(`.git` 폴더 존재) 먼저 확인하고, 되어 있으면 건너뛴다 — 재실행 시 초기화를 중복하지 않는다.

### 2. .gitignore 작성

정적 HTML/CSS/JS 프로젝트 기준 최소한의 `.gitignore`:

```gitignore
.DS_Store
Thumbs.db
node_modules/
*.log
.vscode/
_workspace_*/
```

`_workspace/`(하네스 중간 산출물)는 감사 추적용으로 커밋에 포함할지 사용자에게 확인한다 — 기본은 포함(기획/디자인 결정 기록으로 유용)하되, 이전 버전 백업 디렉토리(`_workspace_YYYYMMDD_HHMMSS/`)는 제외한다.

### 3. 첫 커밋

```bash
git add -A
git commit -m "포트폴리오 랜딩페이지 초기 구성"
```

커밋 메시지 끝에는 다음을 반드시 포함한다(이 하네스가 자동 생성한 커밋임을 명시):
```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

### 4. GitHub 원격 저장소 생성/연결

`gh` CLI 인증 상태를 먼저 확인한다:

```bash
gh auth status
```

인증되어 있지 않으면 임의로 로그인 절차를 진행하지 않고, 사용자에게 `gh auth login` 실행을 요청한다.

인증되어 있으면, 저장소 이름과 공개 범위(public/private)를 사용자에게 확인한 뒤(외부에 공개되는 저장소 생성은 되돌리기 번거로운 작업이므로 반드시 확인) 생성·연결한다:

```bash
gh repo create {저장소명} --public --source=. --remote=origin --push
```

- `--public` 대신 `--private`로 비공개 생성 가능.
- `--source=. --remote=origin --push`는 현재 디렉토리를 소스로 원격을 연결하고 즉시 push까지 수행한다.

이미 원격(`origin`)이 연결되어 있는 재실행 상황이면, 새로 생성하지 않고 `git push`만 수행한다.

### 5. 확인

```bash
git remote -v
git log --oneline -1
```

두 명령 결과를 사용자에게 보고해, 원격 URL과 최신 커밋이 실제로 존재함을 확인시킨다.

## 후속 커밋 규칙

이후 기능 추가/수정 시:
- 의미 있는 작업 단위로 커밋을 나눈다(전체를 한 커밋에 몰아넣지 않는다).
- 커밋 메시지는 무엇을 왜 바꿨는지 한국어로 간결하게 작성한다.
- 사용자가 명시적으로 push를 요청했거나, 이미 원격이 연결되어 있고 이전에 push 승인을 받은 흐름의 연장이면 push한다 — 그 외에는 로컬 커밋까지만 하고 push 여부를 확인한다.
