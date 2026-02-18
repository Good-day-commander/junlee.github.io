# 🎓 Jun's Academic Portfolio — 최종 디자인 & 구현 가이드

> **최종 업데이트**: 2026년 2월 17일
> **플랫폼**: Hugo Blox Academic CV + GitHub Pages
> **레포지토리**: `Good-day-commander/junlee.github.io`

---

## 📋 디자인 결정 요약

### 전체 방향
| 항목 | 결정 사항 |
|------|----------|
| 플랫폼 | Hugo Blox (Academic CV) + GitHub Pages |
| 전체 구조 | **하이브리드** — 홈은 원페이지 스크롤 + 각 섹션 서브페이지 |
| 디자인 톤 | 미니멀 & 클린 학술 스타일 |
| 컬러 테마 | **밝은 배경 기본** + 다크 모드 토글 지원 |
| 첫인상 | 라이트 모드 (학술적 신뢰감 우선) |

### 디자인 레퍼런스 (최종 선정 4개)
| 순위 | 사이트 | 가져올 요소 |
|------|--------|------------|
| #11 | **Meghna Roy Chowdhury** — roycmeghna.github.io | 프로젝트 카드 + Tech Highlights 태그 |
| #10 | **Max Xu** — maxxu05.github.io | 뉴스/타임라인 + 간결한 논문 리스트 |
| #2 | **Mohammad Arafat Hussain** — marafathussain.github.io | Hugo Academic 정석 구조, BibTeX 자동 관리 |
| #4 | **Ana Matoso** — anamatoso.github.io | 원페이지 미니멀, 핵심만 한눈에 |

### 요소별 레퍼런스 매트릭스
| 요소 | 참고 사이트 |
|------|------------|
| 전체 구조/레이아웃 | #2 Arafat + #4 Ana |
| 프로젝트 카드 디자인 | #11 Meghna (Tech 태그 포함) |
| 뉴스/타임라인 | #10 Max |
| 논문 페이지 | #2 Arafat (BibTeX 자동) |
| 미니멀 톤 | #4 Ana |

---

## 🏗️ 사이트 구조

### 홈페이지 (원페이지 스크롤)
```
┌─────────────────────────────────────┐
│  [Nav] About | Projects | Pubs | CV │  ← 상단 네비게이션
├─────────────────────────────────────┤
│  👤 About / Bio                     │  ← 프로필 + 소개
│  ────────────────────────────       │
│  🔬 Research Projects               │  ← Meghna식 카드 + Tech 태그
│  ────────────────────────────       │
│  📄 Publications                    │  ← BibTeX 자동 논문 리스트
│  ────────────────────────────       │
│  📬 Contact                         │  ← 이메일 + 소셜 링크
└─────────────────────────────────────┘
```

### 서브페이지
- `/projects/` → 전체 프로젝트 목록 + 각 프로젝트 상세 페이지
- `/publications/` → 전체 논문 리스트 (필터링 가능)
- `/cv/` → CV PDF 다운로드 링크

### 네비게이션 메뉴
```yaml
# config/_default/menus.yaml
main:
  - name: About
    url: '#about'
    weight: 10
  - name: Projects
    url: '#projects'
    weight: 20
  - name: Publications
    url: '#publications'
    weight: 30
  - name: Contact
    url: '#contact'
    weight: 40
  - name: CV
    url: uploads/resume.pdf    # PDF 다운로드
    weight: 50
```

---

## 🎨 스타일 설정

### 테마 & 외관
```yaml
# config/_default/params.yaml
appearance:
  mode: light              # ★ 기본값: 밝은 모드 (신뢰감)
  theme_day: minimal       # 밝은 테마
  theme_night: minimal     # 다크 테마
  font: native             # 시스템 폰트 (가장 깔끔)
  font_size: L

# 다크 모드 토글 활성화
show_day_night: true       # 🌙 토글 버튼 표시
```

### 커스텀 CSS
```scss
// assets/scss/custom.scss

// ── 기본 타이포그래피 ──
body {
  line-height: 1.8;
}

// ── 프로젝트 카드 (Meghna 스타일) ──
.card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

// ── Tech 태그 스타일 (Meghna식) ──
.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  margin: 2px;
}

// ── 네비게이션 바 ──
.navbar {
  backdrop-filter: blur(10px);
}

// ── 섹션 간격 ──
.home-section {
  padding: 80px 0;
}

// ── 프로필 사진 ──
.avatar-wrapper .avatar {
  border-radius: 50%;
}

// ── 다크 모드 보정 ──
.dark {
  .card {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
  }
}
```

---

## 📝 콘텐츠 구성

### 홈페이지 섹션 구성
```yaml
# content/_index.md
---
type: landing

sections:
  # ── 1. About ──
  - block: about.biography
    id: about
    content:
      title: ""
      username: admin

  # ── 2. Research Projects (Meghna식 카드 + Tech 태그) ──
  - block: portfolio
    id: projects
    content:
      title: Research Projects
      filters:
        folders:
          - project
      default_button_index: 0
      buttons:
        - name: All
          tag: '*'
        - name: Medical AI
          tag: Medical AI
        - name: Fluid Dynamics
          tag: Fluid Dynamics
        - name: Software
          tag: Software
    design:
      columns: '2'
      view: showcase
      flip_alt_rows: true

  # ── 3. Publications (BibTeX 자동) ──
  - block: collection
    id: publications
    content:
      title: Publications
      filters:
        folders:
          - publication
        featured_only: false
      count: 0             # 전체 표시
    design:
      view: citation

  # ── 4. Contact ──
  - block: contact
    id: contact
    content:
      title: Contact
      subtitle: ''
      email: your-email@example.com
      autolink: true
---
```

### 프로필 (`content/authors/admin/_index.md`)
```yaml
---
title: Jun
name_pronunciation: ''
first_name: Jun
last_name: '[성]'
status:
  icon: 🔬
superuser: true
role: Graduate Researcher
organizations:
  - name: MFDL BIOS (Multi-scale Fluid Dynamics Lab)
    url: '[연구실 URL]'
  - name: '[소속 대학교]'
    url: ''

bio: >
  Developing AI-driven non-invasive biomarker prediction systems
  using photoplethysmography (PPG) signals for clinical applications.

interests:
  - Medical AI & Deep Learning
  - PPG Signal Processing
  - Cardiovascular Fluid Dynamics
  - Physics-Informed Neural Networks
  - Non-invasive Biomarker Prediction

education:
  - area: '[학위] in [전공]'
    institution: '[대학교명]'
    date_start: '20XX-03-01'
    date_end: ''
    summary: |
      Thesis: [논문 주제]
      Advisor: Prof. Lee Jun-sang
  - area: '[학사 전공]'
    institution: '[대학교명]'
    date_start: '20XX-03-01'
    date_end: '20XX-02-28'

profiles:
  - icon: at-symbol
    url: 'mailto:your-email@example.com'
    label: E-mail Me
  - icon: brands/github
    url: https://github.com/Good-day-commander
  - icon: brands/google-scholar
    url: https://scholar.google.com/citations?user=YOUR_ID
  - icon: brands/linkedin
    url: https://linkedin.com/in/YOUR_PROFILE
  - icon: brands/orcid
    url: https://orcid.org/YOUR_ORCID
---

## About Me

I am a graduate researcher at the Multi-scale Fluid Dynamics Lab (MFDL BIOS),
working at the intersection of biomedical engineering and artificial intelligence.
My research focuses on developing AI-powered non-invasive diagnostic systems using
photoplethysmography (PPG) signals, with applications in fluid loading prediction,
dehydration assessment, and blood viscosity analysis.

I collaborate with clinical partners at Severance Hospital and other medical institutions,
conducting IRB-approved studies for emergency medicine and cardiovascular applications.
```

### 프로젝트 카드 (Meghna식 Tech 태그)

각 프로젝트: `content/project/<이름>/index.md`

```yaml
# 예시: content/project/ppg-fluid-loading/index.md
---
title: "PPG-based Fluid Loading Prediction"
summary: >
  AI system for predicting fluid responsiveness using PPG spectrograms
  with ensemble deep learning models achieving AUC 0.85+
tags:                          # ← Meghna식 Tech 태그로 표시됨
  - Medical AI
  - PPG
  - Deep Learning
  - PyTorch
  - Ensemble
date: '2024-01-01T00:00:00Z'

image:
  caption: 'PPG Spectrogram Classification Pipeline'
  focal_point: Smart

links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/Good-day-commander/ppg-project
---

## Overview
Developed a non-invasive AI system that predicts fluid loading responsiveness
using photoplethysmography (PPG) signals.

## Key Results
- Patient-level averaging: AUC 0.75
- 5-model ensemble: AUC ~0.85
- 7-model ensemble: AUC ~0.86

## Clinical Collaboration
Conducted in partnership with Severance Hospital under IRB approval.
```

**계획된 프로젝트 카드 목록:**

| 프로젝트 | 태그 |
|---------|------|
| PPG Fluid Loading Prediction | Medical AI, PPG, Deep Learning, Ensemble |
| EASYCHECK Dehydration System | PPG, Software, Wearable, Clinical |
| PINO Coronary Flow Prediction | PINO, CFD, Neural Operator, Cardiovascular |
| DeepONet Cardiovascular Modeling | DeepONet, Physics-Informed, Hemodynamics |
| CARDIOS CAD Diagnosis | Medical AI, Coronary Artery, Software |

### 논문 (BibTeX 자동 import)

```bash
# BibTeX 파일에서 자동 변환
pip install academic
academic import --bibtex my-papers.bib

# 또는 수동: content/publication/<논문이름>/index.md
```

```yaml
# 수동 예시
---
title: '[논문 제목]'
authors:
  - admin
  - '[공저자]'
date: '2024-06-01T00:00:00Z'
doi: '10.xxxx/xxxxx'
publication_types: ['article-journal']
publication: '*Journal Name*, Vol. XX, pp. XX-XX'
abstract: >
  논문 초록...
tags:
  - PPG
  - Medical AI
featured: true
---
```

---

## ⚙️ 사이트 기본 설정

### hugo.yaml
```yaml
# config/_default/hugo.yaml
title: "Jun | MFDL BIOS"
baseURL: "https://Good-day-commander.github.io/"
defaultContentLanguage: en
```

### params.yaml
```yaml
# config/_default/params.yaml
appearance:
  mode: light
  theme_day: minimal
  theme_night: minimal
  font: native
  font_size: L

show_day_night: true

marketing:
  seo:
    site_type: Person
    org_name: 'MFDL BIOS'
    description: 'Graduate Researcher | Medical AI | PPG Signal Processing'

footer:
  copyright:
    notice: '© {year} Jun. Built with Hugo Blox.'
```

---

## 📁 폴더 구조

```
junlee.github.io/
├── config/
│   └── _default/
│       ├── hugo.yaml          ← 사이트 기본 설정
│       ├── params.yaml        ← 테마, 외관, SEO (★ 라이트모드 기본)
│       └── menus.yaml         ← 네비게이션 메뉴
├── content/
│   ├── _index.md              ← 홈페이지 섹션 구성
│   ├── authors/
│   │   └── admin/
│   │       ├── _index.md      ← 프로필 정보
│   │       └── avatar.jpg     ← 프로필 사진 (512x512+)
│   ├── project/               ← 프로젝트 카드들
│   │   ├── ppg-fluid-loading/
│   │   ├── easycheck/
│   │   ├── pino-coronary/
│   │   ├── deeponet-cardiovascular/
│   │   └── cardios-cad/
│   └── publication/           ← 논문들 (BibTeX 자동 import)
│       ├── paper-1/
│       └── paper-2/
├── assets/
│   └── scss/
│       └── custom.scss        ← 커스텀 스타일 (★ 다크모드 보정 포함)
├── static/
│   └── uploads/
│       └── resume.pdf         ← CV PDF
└── .github/
    └── workflows/
        └── hugo.yaml          ← GitHub Actions 자동 배포
```

---

## 🚀 GitHub Actions 배포

```yaml
# .github/workflows/hugo.yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.155.3
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb \
            https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Node.js dependencies
        run: npm ci
      - name: Build with Hugo
        env:
          HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
          HUGO_ENVIRONMENT: production
          TZ: Asia/Seoul
        run: |
          hugo \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## ✅ 진행 체크리스트

### 완료됨
- [x] Hugo Extended v0.155.3 + Go + Node.js 설치
- [x] GitHub에서 Hugo Blox Academic CV 템플릿 Fork
- [x] 레포 이름 `junlee.github.io`로 설정
- [x] TailwindCSS CLI 설치
- [x] `hugo server` 로컬 미리보기 성공 (localhost:1313)
- [x] 디자인 레퍼런스 선정 (Meghna, Max, Arafat, Ana)
- [x] 사이트 구조 결정 (하이브리드: 홈 원페이지 + 서브페이지)
- [x] 필수 섹션 결정 (프로젝트 카드 + BibTeX 논문 + CV)
- [x] 컬러 테마 결정 (라이트 기본 + 다크 토글)

### 다음 할 일
- [ ] `content/authors/admin/_index.md` → 실제 프로필로 수정
- [ ] 프로필 사진 추가 (`avatar.jpg`, 512x512+)
- [ ] 프로젝트 5개 카드 작성 (PPG, EASYCHECK, PINO, DeepONet, CARDIOS)
- [ ] 논문 정보 입력 (BibTeX import 또는 수동)
- [ ] 커스텀 CSS 적용 (`custom.scss`)
- [ ] CV PDF 업로드 (`static/uploads/resume.pdf`)
- [ ] GitHub Pages 배포 (Actions 워크플로우)
- [ ] (선택) 커스텀 도메인 연결

---

## 💡 유지보수 팁

```bash
# 새 프로젝트 추가
hugo new content/project/new-project/index.md

# 새 논문 추가
hugo new content/publication/new-paper/index.md

# BibTeX 일괄 import
academic import --bibtex my-papers.bib

# 로컬 확인 후 배포
hugo server                    # 미리보기
git add . && git commit -m "Update" && git push
# → GitHub Actions가 자동 배포!
```

---

## 🔗 레퍼런스 사이트 전체 목록

| # | 사이트 | URL | 특징 |
|---|--------|-----|------|
| 1 | Shun Liu | shunliu1.github.io | PPG 연구, al-folio |
| 2 | **Mohammad Arafat Hussain** | **marafathussain.github.io** | **Hugo Academic 정석 ★** |
| 3 | Nathan C. Frey | ncfrey.github.io | ML + 단백질 공학 |
| 4 | **Ana Matoso** | **anamatoso.github.io** | **원페이지 미니멀 ★** |
| 5 | Linh Le | — | 신경영상 타임라인 |
| 6 | Dr. Patrick Manser | patrick-manser.com | 2025 Best Portfolio |
| 7 | Dr. Erika Cedillo-González | erikacedillo.com | 2025 Best Storytelling |
| 8 | Dr. Cecilia Baldoni | cecibaldoni.github.io | 2025 Best Interactive |
| 9 | Jiarong Chen | chenjiar3.github.io | PPG + 심혈관 AI |
| 10 | **Max Xu** | **maxxu05.github.io** | **뉴스/타임라인 ★** |
| 11 | **Meghna Roy Chowdhury** | **roycmeghna.github.io** | **프로젝트 카드 + Tech 태그 ★** |
| 12 | Wei-Long Zheng | weilongzheng.github.io | BCI + 논문 페이지 |
| 13 | Pascal Michaillat | pascalmichaillat.org | 극 미니멀 템플릿 |
| 14 | Matteo Courthoud | matteocourthoud.github.io | Hugo 커스텀 가이드 |
| 15 | Ritu Raman | rituraman.com | MIT 교수 레퍼런스 |

(★ = 최종 선정 레퍼런스)

---

*이 가이드는 2026년 2월 17일 기준 최종 업데이트되었습니다.*
*"포트폴리오 이어서 하자" 라고 하면 바로 다음 할 일부터 시작합니다.*
