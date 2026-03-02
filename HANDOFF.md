# Portfolio Site Handoff Document

> 마지막 업데이트: 2026-03-02
> 레포: `Good-day-commander/junlee.github.io`
> 도메인: `https://hyeongjunlee.me/`

---

## 1. 프로젝트 개요

Hugo Blox Academic CV 템플릿 기반 학술 포트폴리오 사이트. GitHub Pages로 배포, Cloudflare에서 구매한 커스텀 도메인(`hyeongjunlee.me`) 연결.

**소유자:** Hyeong Jun Lee (이형준), Yonsei University PhD Candidate, MFDL (Multi-scale Fluid Dynamics Lab)

---

## 2. 기술 스택

| 항목 | 버전/상세 |
|------|-----------|
| Hugo | Extended v0.155.3+ |
| Hugo Blox | v2 schema (`hugoblox:` top-level key) |
| Go | 최신 버전 |
| Node.js | v20+ |
| 패키지매니저 | pnpm (npx hugo mod npm pack → pnpm install) |
| CSS | Tailwind CSS v4.1.18 + custom SCSS |
| 배포 | GitHub Pages (기존 deploy.yml + build.yml 워크플로우) |
| 도메인 | hyeongjunlee.me (Cloudflare DNS → GitHub Pages) |

---

## 3. 핵심 파일 구조

```
junlee.github.io/
├── config/_default/
│   ├── hugo.yaml          # baseURL, title
│   ├── params.yaml        # 테마, 컬러, 폰트, 레이아웃 설정 (Hugo Blox v2 schema)
│   └── menus.yaml         # 네비게이션 메뉴
├── content/
│   ├── _index.md          # 홈페이지 랜딩 (4개 섹션)
│   ├── project/           # 프로젝트 카드 5개
│   │   ├── ppg-fluid-loading/
│   │   ├── easycheck/
│   │   ├── pino-coronary/
│   │   ├── deeponet-cardiovascular/
│   │   └── cardios-cad/
│   └── publication/       # 논문 3편
│       ├── ppg-blood-viscosity-2025/   # ★ featured, 1저자
│       ├── ffr-gray-zone-2022/         # 1저자
│       └── tricuspid-membrane-2022/    # 공저자
├── data/authors/
│   └── me.yaml            # ★ 프로필 데이터 (Hugo Blox v2는 이걸 사용!)
├── assets/
│   ├── media/authors/me.png  # ★ 프로필 사진 (이 경로여야 함!)
│   └── scss/custom.scss      # 커스텀 CSS
├── static/
│   └── CNAME              # hyeongjunlee.me
└── .github/workflows/
    ├── deploy.yml         # ★ 활성 배포 워크플로우 (기존 템플릿)
    ├── build.yml          # ★ 활성 빌드 워크플로우
    └── hugo.yaml          # 비활성 (workflow_dispatch만, 사용 안 함)
```

---

## 4. 주의사항 (삽질 방지)

### Hugo Blox v2 프로필 시스템
- **프로필 데이터**: `data/authors/me.yaml` ← 이게 실제 사용됨
- **프로필 사진**: `assets/media/authors/me.png` ← 이 경로에 넣어야 함
- `content/authors/admin/_index.md`는 v2에서 주 프로필 소스가 **아님**
- `_index.md`에서 `username: me`로 참조

### 블록 타입
- `contact` 블록은 이 Hugo Blox 버전에 **존재하지 않음** → `markdown` 블록으로 대체
- `resume-biography-3`가 about 섹션에 사용됨

### 배포 워크플로우
- `deploy.yml` + `build.yml`이 실제 배포에 사용됨 (기존 템플릿 것)
- `.github/workflows/hugo.yaml`은 비활성화됨 (충돌 방지)
- push to main → 자동 빌드 & 배포

### 저자 이름
- 논문 파일에서 저자명은 반드시 `Hyeong Jun Lee`로 (절대 `admin` 아님)

---

## 5. 완료된 커스터마이징 ("양산형 탈피")

### 컬러 & 테마
- Primary: `#0F4C81` (딥 블루, 연세 블루 계열)
- Secondary: `#2DD4BF` (teal, 의료 AI 포인트)
- Neutral: `slate`
- 다크 모드: `system` (OS 따름)
- 폰트: `serif` (Roboto Slab), 사이즈: `md`, 라운딩: `sm`

### 커스텀 CSS (`assets/scss/custom.scss`)
- 섹션 제목 밑줄 포인트 데코 (primary color)
- 네비게이션 바 backdrop-blur + 하단 보더
- 프로필 사진 원형 + 그림자 + hover 확대
- 모바일 아바타 최대 150px (얼빡 방지)
- 카드 hover: translateY(-4px) + 그림자 확대
- Featured 논문: 좌측 보더 포인트
- 푸터 상단 구분선
- 섹션 순차 fadeInUp 애니메이션
- 다크 모드: teal 섹션 제목, 깊은 카드 그림자

### 콘텐츠
- About 텍스트: 연구 분야 요약 (성능 수치 제외, 임상 협력 강조)
- Bio: PPG 기반 비침습 바이오마커 예측, CFD + DL 결합, CMPB 2025 논문 언급
- Education: PhD Candidate (Yonsei) + BS (Pusan National, 2016-2020)
- Experience: Center for Hemodynamic Precision Medical Platform
- 프로젝트 뷰: showcase (설명 + 태그 표시)

---

## 6. 논문 정보

| # | 제목 | 저널 | DOI | 역할 |
|---|------|------|-----|------|
| 1 | PPG Blood Viscosity (2025) | CMPB, Vol. 265, 108740 | (추가 필요) | 1저자, featured |
| 2 | FFR Gray Zone (2022) | CMPB, Vol. 220, 106827 | 10.1016/j.cmpb.2022.106827 | 1저자 |
| 3 | Tricuspid Membrane (2022) | EACFM, 16(1), 1587-1600 | 10.1080/19942060.2022.2104929 | 공저자 |

---

## 7. 도메인 & DNS 설정

- **도메인**: `hyeongjunlee.me` (Cloudflare에서 구매)
- **DNS 설정** (Cloudflare):
  - A 레코드: `@` → `185.199.108.153` (DNS only)
  - A 레코드: `@` → `185.199.109.153` (DNS only)
  - A 레코드: `@` → `185.199.110.153` (DNS only)
  - A 레코드: `@` → `185.199.111.153` (DNS only)
  - CNAME: `www` → `Good-day-commander.github.io` (DNS only)
- **GitHub Pages 설정**: Settings → Pages → Custom domain: `hyeongjunlee.me`, Enforce HTTPS ✓
- **static/CNAME**: `hyeongjunlee.me`
- **baseURL**: `https://hyeongjunlee.me/`

---

## 8. Windows 환경 세팅 가이드

### 필수 설치
1. **Git**: https://git-scm.com/download/win
2. **Go**: https://go.dev/dl/ (최신 버전)
3. **Hugo Extended**: https://gohugo.io/installation/windows/ (`choco install hugo-extended` 또는 직접 다운로드)
4. **Node.js**: https://nodejs.org/ (v20 LTS)
5. **pnpm**: `npm install -g pnpm`

### 레포 클론 & 로컬 실행
```bash
git clone https://github.com/Good-day-commander/junlee.github.io.git
cd junlee.github.io
hugo mod get
hugo mod npm pack
pnpm install
hugo server
```
→ http://localhost:1313 에서 확인

### 수정 → 배포
```bash
git add <수정한 파일들>
git commit -m "커밋 메시지"
git push origin main
```
→ push 하면 GitHub Actions가 자동 빌드 & 배포

---

## 9. 향후 작업 아이디어

- 프로젝트 카드에 대표 이미지 추가 (`featured.jpg`)
- News/Timeline 섹션 추가
- Google Analytics 연동 (`params.yaml` → analytics.google.measurement_id)
- CV PDF 업데이트 (`static/uploads/resume.pdf`)
- PPG Blood Viscosity 2025 논문에 DOI 추가
- 추가 논문/프로젝트 게시
