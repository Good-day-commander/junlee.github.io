# 🔄 Cowork 핸드오프 — Jun's Academic Portfolio

## 프로젝트 개요
Hugo Blox Academic CV 기반 학술 포트폴리오 웹사이트 구축 중.
GitHub Pages로 배포 예정.

---

## 현재 상태

### ✅ 완료
- Hugo Extended v0.155.3 + Go + Node.js + TailwindCSS 설치됨
- GitHub 레포: `Good-day-commander/junlee.github.io` (Fork 완료)
- 로컬 경로: `~/Desktop/junlee.github.io/`
- `hugo server` 로컬 미리보기 성공 확인 (localhost:1313)
- 디자인 방향 전체 확정

### 🔲 남은 작업 (아래 순서대로 진행)
1. `content/authors/admin/_index.md` → 실제 프로필로 수정
2. 프로필 사진 `avatar.jpg` 추가 (512x512px 이상)
3. `content/_index.md` → 홈페이지 섹션 구성 수정
4. `config/_default/params.yaml` → 테마 설정 수정
5. `config/_default/menus.yaml` → 네비게이션 수정
6. `assets/scss/custom.scss` → 커스텀 CSS 생성
7. 프로젝트 카드 5개 작성
8. 논문 정보 입력
9. CV PDF 업로드
10. GitHub Pages 배포

---

## 핵심 디자인 결정 사항

- **구조**: 하이브리드 (홈 = 원페이지 스크롤, 각 섹션은 서브페이지도 가능)
- **테마**: 밝은 배경 기본 (`mode: light`) + 다크 모드 토글 지원
- **스타일**: 미니멀 & 클린 학술 스타일
- **필수 섹션**: About → Projects (Tech 태그 카드) → Publications (BibTeX) → Contact + CV 다운로드
- **폰트**: 시스템 네이티브 폰트 (`font: native`)

### 디자인 레퍼런스 4개
| 사이트 | URL | 가져올 요소 |
|--------|-----|------------|
| Meghna Roy Chowdhury | roycmeghna.github.io | 프로젝트 카드 + Tech 태그 |
| Max Xu | maxxu05.github.io | 뉴스/타임라인 + 간결한 논문 리스트 |
| Mohammad Arafat Hussain | marafathussain.github.io | Hugo Academic 정석 구조, BibTeX |
| Ana Matoso | anamatoso.github.io | 원페이지 미니멀 |

---

## 파일별 수정 내용

### 1. `config/_default/params.yaml` — 아래로 교체

```yaml
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

### 2. `config/_default/menus.yaml` — 아래로 교체

```yaml
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
    url: uploads/resume.pdf
    weight: 50
```

### 3. `content/_index.md` — 아래로 교체

```yaml
---
type: landing

sections:
  - block: about.biography
    id: about
    content:
      title: ""
      username: admin

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

  - block: collection
    id: publications
    content:
      title: Publications
      filters:
        folders:
          - publication
        featured_only: false
      count: 0
    design:
      view: citation

  - block: contact
    id: contact
    content:
      title: Contact
      subtitle: ''
      email: your-email@example.com
      autolink: true
---
```

### 4. `content/authors/admin/_index.md` — 프로필 (Jun이 직접 채울 부분 [  ]로 표시)

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
    url: 'mailto:[이메일]'
    label: E-mail Me
  - icon: brands/github
    url: https://github.com/Good-day-commander
  - icon: brands/google-scholar
    url: https://scholar.google.com/citations?user=[ID]
  - icon: brands/linkedin
    url: https://linkedin.com/in/[프로필]
  - icon: brands/orcid
    url: https://orcid.org/[ORCID]
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

### 5. `assets/scss/custom.scss` — 새로 생성

```scss
body {
  line-height: 1.8;
}

.card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  margin: 2px;
}

.navbar {
  backdrop-filter: blur(10px);
}

.home-section {
  padding: 80px 0;
}

.avatar-wrapper .avatar {
  border-radius: 50%;
}

.dark {
  .card {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
  }
}
```

### 6. 프로젝트 카드 5개 — 각각 `content/project/<이름>/index.md`

| 폴더명 | 제목 | 태그 |
|--------|------|------|
| `ppg-fluid-loading` | PPG-based Fluid Loading Prediction | Medical AI, PPG, Deep Learning, Ensemble |
| `easycheck` | EASYCHECK Dehydration & Viscosity System | PPG, Software, Wearable, Clinical |
| `pino-coronary` | PINO Coronary Flow Prediction | Fluid Dynamics, PINO, Neural Operator |
| `deeponet-cardiovascular` | DeepONet Cardiovascular Modeling | Fluid Dynamics, DeepONet, Physics-Informed |
| `cardios-cad` | CARDIOS CAD Diagnosis | Medical AI, Coronary Artery, Software |

### 7. GitHub Actions — `.github/workflows/hugo.yaml`

Hugo 버전: `0.155.3` (로컬과 동일하게), Node.js 20, TZ: Asia/Seoul

---

## Cowork 작업 순서 요약

```
1. ~/Desktop/junlee.github.io/ 폴더 열기
2. config/_default/params.yaml 수정
3. config/_default/menus.yaml 수정
4. content/_index.md 수정
5. content/authors/admin/_index.md 수정 (Jun이 [  ] 부분 채우기)
6. assets/scss/custom.scss 생성
7. content/project/ 아래 프로젝트 5개 폴더+index.md 생성
8. avatar.jpg 추가 (content/authors/admin/)
9. static/uploads/resume.pdf 추가
10. hugo server 로 확인
11. git push → GitHub Actions 자동 배포
```

---

## 참고: 터미널 명령어

```bash
cd ~/Desktop/junlee.github.io
hugo server                          # 미리보기
git add . && git commit -m "Portfolio setup" && git push   # 배포
```
