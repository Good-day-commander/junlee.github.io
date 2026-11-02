# hyeongjunlee.me 인계 문서

> 작성 2026-11-02. 이전 세션(Claude Code, Fable 5.1 오케스트레이션 + Opus 작업 에이전트)이 다음 에이전트(Hermes)에게 넘기는 문서.
> 저장소: `Good-day-commander/junlee.github.io`, 브랜치 `main`, 작업 폴더 `C:\Users\user\Documents\hyeongjunlee.me`, 사이트 코드는 `site/`.
> 라이브: https://hyeongjunlee.me (GitHub Pages). 이 문서를 쓰는 시점의 라이브 = `3871e25` (2026-10-26 배포), 작업 트리 깨끗함.

이 문서는 저장소 안의 문서가 담지 못하는 것만 적는다. 규칙은 `CLAUDE.md`, 제품 결정은 `PRODUCT.md`, 디자인 시스템은 `DESIGN.md`와 `.impeccable/design.json`, 디자인 컨트랙트는 `.impeccable/surfaces/site-src-pages-index-astro.md`(Revision 2 ~ 2g), 반복 작업 레시피는 `MAINTENANCE.md`에 있다. 그 다섯 개를 먼저 읽고 이 문서를 읽는다.

같은 폴더의 `cowork-handoff.md`, `portfolio-final-guide.md`, `README.md`는 2026년 2~3월 Hugo Blox 시절 문서다. 지금 사이트와 무관하니 읽지 말고, 소유자가 허락하면 지워도 된다.

---

## 1. 지금 사이트가 무엇인지 (30초 요약)

- Astro 5 정적 사이트, React 아일랜드 4개(three.js 혈관 뷰어 `VesselViewer`, Pd/Pa 곡선 `FfrCurve`, 스펙트로그램 `SpectrogramDevelop`, 4D CT 스크러버 `PhaseScrubber`). 페이지는 `/`, `/research/`, `/cv/` 셋뿐이고 `/publications`, `/record`는 `/cv/` 앵커로 리다이렉트.
- 모든 사실은 `site/src/data/content.ts` 한 곳에서 나온다(2026년 10월 CV 기준). 페이지·마크다운 트윈(`/index.md`, `/research.md`, `/cv.md`)·`/cv.json`·`/llms.txt`·`/llms-full.txt`·JSON-LD가 전부 `site/src/lib/schema.ts`를 거쳐 같은 데이터로 생성된다. 숫자·이름·날짜를 컴포넌트에 직접 적는 일은 없다.
- 테마는 시스템을 따른다(라이트 박스 기본, 다크에서 필름). 플레이트(데이터 화면)는 항상 필름. 한 컬럼, 좌우 모서리 하나씩.
- 폰(640px 이하)은 "공개 범위를 줄인 같은 사이트"다: 접기와 숨김만 쓰고 HTML은 전부 그대로다.
- 빌드 게이트가 세다: `pnpm build`가 단어 수·mailto 수·h1·JSON-LD·에이전트 파일을 검사하고, `pnpm smoke`(Playwright, 57개 검사)가 CI에서 배포 전에 돈다. 게이트를 피해 가지 말 것.

## 2. 소유자와 일하는 법 (저장소에 없는 것)

소유자 이형준(Hyeong Jun Lee)은 연세대 MFDL 박사후연구원이다. 한국어로 쓰고, 영어 기술 용어는 편하게 쓴다. 사이트는 영어만.

- **짧고 결정 중심으로.** 긴 설명, 선택지 나열, 되묻기를 싫어한다. 기본값을 정해서 진행하고 결과를 보여 주는 쪽을 선호한다.
- **우려는 한 번만.** 데이터 공개 범위(환자 녹음, 미발표 결과 등)에 대해 한 번 말하면 충분하다. 소유자가 "괜찮아"라고 하면 한 절로 확인하고 넘어간다. 두 번 묻지 않는다.
- **"적용해 줘" = 커밋까지.** 2026-10-31 소유자 지시: 적용을 요청하면 따로 말하지 않아도 커밋한다(`CLAUDE.md`의 "Commit only when asked"보다 우선). 커밋 메시지는 짧은 명령문 + `Co-Authored-By: Claude <model> <noreply@anthropic.com>`.
- **푸시·배포는 Hermes `web`이 직접.** 2026-11-02 소유자 결정으로 10-31 메모("푸시는 소유자 호출")를 대체한다. 게이트(check·build·smoke)와 캡처 비교를 통과하면 커밋·푸시하고, 배포 후 Actions 성공과 라이브 화면을 확인해 바뀐 내용을 보고한다. 문제가 생기면 `git revert` 후 푸시(force-push 금지).
- **모델 비용.** "멀티에이전트는 fable 최대한 쓰지 마, 최종 오케스트레이션만 fable 써." 서브에이전트·워크플로는 Opus(기계적 단계는 Sonnet), 오케스트레이션만 상위 모델.
- **보고 전에 전체 화면을 비교한다.** 정렬 수치만 보고 "괜찮다"고 했다가 "갑자기 확 퀄리티 떨어졌는데"라는 반응을 받은 적이 있다. 새 캡처를 이전 운영 캡처와 나란히 놓고 위계·글 양·서체 조합을 먼저 판단한 뒤 보고한다.
- **글을 줄이는 쪽이 항상 이긴다.** 소유자가 반복해서 지적한 것: 텍스트가 많다, AI 느낌이 난다, 장식 문장·결과 설명 문장·식별자·모노 읽기줄을 넣지 마라. `CLAUDE.md` 끝의 "rejected" 목록이 그 역사다.
- **"따라 하기"가 아니라 "배우기".** 레퍼런스 사이트(hyewon.me 등)를 보여 주면 거기서 배울 점을 고르라는 뜻이지 모방하라는 뜻이 아니다. 디자인 전공자의 사이트와 공학 연구자의 사이트는 다르다는 점을 소유자가 명시했다.
- 소유자 이메일은 `hjunlee96@gmail.com` 하나. 전화번호·심사위원 정보는 절대 공개하지 않는다.

## 3. 검증 루틴 (매 변경마다)

`site/`에서:

```bash
pnpm check                 # 0 errors
pnpm build                 # budget gate 포함; research 단어 수가 여기 찍힌다 (현재 657/1000, 홈 227/250)
pnpm smoke                 # 57 checks, 약 3분
```

그 다음 Playwright 캡처(크로뮴만 설치돼 있음; WebKit·Firefox 다운로드는 소유자 허락 필요)로 1440×900과 iPhone 13(390px), 라이트·다크를 직접 본다. 임시 스크립트는 세션 scratchpad에 두었고 지금은 없다. 패턴은 단순하다: `pnpm exec astro preview --port 4401`(압축 포함, wire 측정용) 또는 정적 서버로 `dist/public`을 띄우고, `createRequire('.../site/package.json')`로 `playwright`를 가져와 `devices['iPhone 13']`과 `{width:1440,height:900}` 컨텍스트에서 스크린샷·측정을 한다.

- 홈 첫 로드 한도 450 KB(현재 약 444.5 KB). 압축된 응답 크기를 자산별로 더한다(`curl --compressed -w '%{size_download}'`).
- Impeccable detector: 저장소 루트에서 `~/.claude/skills/impeccable/scripts/impeccable detect --json site/src/styles site/src/components site/src/layouts site/src/islands site/src/pages site/src/lib` → `[]`.
- 푸시 뒤: `https://api.github.com/repos/Good-day-commander/junlee.github.io/actions/runs?head_sha=<sha>`를 15초 간격으로 폴링해 `completed:success`를 확인하고, 라이브 HTML을 `curl`로 받아 바뀐 요소가 있는지 본다. 보통 4~6분.

Windows 환경 메모: 긴 인라인 명령은 깨지니 스크립트를 파일로 써서 실행한다. Python은 `python -X utf8`. Git이 CRLF 경고를 내지만 무시해도 된다. ffmpeg는 `imageio_ffmpeg`가 들고 있는 바이너리를 쓴다(`a4dct-mask.py` 참고). 포트 4321은 `pnpm preview`, 4401~4403은 임시 서버로 써 왔다.

## 4. 비공개 자산 위치 (커밋 금지 폴더)

`website_assets/`는 `.gitignore`에 있다. 안에:

- `pino/` 혈관 메시·CFD/PINO 필드 원본(vtp, npz). 사이트는 양자화된 `site/public/data/pino/`를 쓴다(`scripts/quantize-vessel.mjs`).
- `fluid_bolus/` 환자 PPG 스펙트로그램 npz와 파이프라인 JSON(소유자가 공개 승인).
- `a4dct-original/` A⁺4DCT 영상·포스터 원본(발표자료에서 추출, 구워진 "FFR x.xx" 캡션 포함). `site/public/media/a4dct/`는 `scripts/a4dct-mask.py`가 캡션을 지운 결과다. `a4dct/provenance.json`은 원본 발표자료 파일명(병원명 포함)과 슬라이드 매핑. 공개 폴더에 두지 말 것.
- `photos/icloud-2026-10/` iCloud 앨범에서 받은 학회 사진 3장 원본, `photos/processed/` 웹용 크롭. 현재 CV에 쓰인 5장을 소유자는 "별로"라고 했고, 사진은 본인이 다시 제안하겠다고 했다. 그때까지 CV 사진 행은 건드리지 않는다.
- 그 밖에 `Desktop/junlee.github.io/학회/`, `patent/`에 포스터·특허 자료, 원본 CV는 `Documents/대학원혁신 우수 학위 논문/CV_HyeongJunLee.pdf`(이메일만 고친 사본 `CV_HyeongJunLee_2026-10-26.pdf`가 옆에 있음). 웹용 `site/public/uploads/resume.pdf`는 전화번호·심사위원을 지운 판이며 `MAINTENANCE.md` 레시피로만 갱신한다.

## 5. 소유자 답을 기다리는 결정 (물어보지 말고, 답이 오면 처리)

1. **사진.** 프로필 사진 교체(자연광 상반신 한 장이면 충분), 발표 사진 교체 또는 제거. 소유자가 직접 제안하기로 함.
2. **취향 레퍼런스.** 좋아하는 사이트 3~5개 링크와 한 줄 이유. 오면 Taste Skill·design-extract로 취향 노트를 만들어 컨트랙트 Revision 3으로 적기로 했다.
3. **4D CT 플레이트 스테이지.** 프레임 20장이 흰 배경이 구워진 이미지라 필름 플레이트 안에 종이색 패널로 보인다(규칙 위반이지만 보류 중). 선택지: 심장 영역 투명도를 추정해 필름에 합성(픽셀 추정) 또는 저자(T.H. Han)에게 배경 없는 원본 요청.
4. **A⁺4DCT 공개 범위.** 미발표 5례 결과를 상태 문장과 함께 공개 중. 공동연구자 쪽 허락 여부는 한 번 물었고 답이 없다. 다시 묻지 않는다.
5. 태그라인 최종 문장(현재 `profile.tagline`은 소유자가 "그나마 낫다"고 한 후보), 스킬 목록(4줄 축약안 제안됨), CFD 35분이 솔버만인지 파이프라인인지, "parts ship in CARDIOS and EASYCHECK" 문구 정확성, CV에 없는 프로젝트 추가, 논문 PDF·코드 링크, 포스터 공개 허락.
6. WebKit·Firefox 다운로드 허락(실기기 iPhone Safari 검증이 없다), Cloudflare Web Analytics 토큰, 마크다운 협상용 무료 Worker, Scholar·ORCID·LinkedIn·Search Console 역링크.

## 6. 알려진 결함과 부채 (리뷰에서 나왔고 아직 안 고친 것)

화면에 보이는 것:
- 4D CT 플레이트의 종이색 스테이지(5-3 참고).
- 200% 확대(195px)에서 Pd/Pa 곡선의 SVG 라벨이 겹친다(`FfrCurve.tsx`); 180px 이하에서는 소폭 가로 넘침이 남는다.
- bolus 스펙트로그램 현상이 첫 노출에 4초 걸린다. 의도된 연출이지만 리뷰어는 느리다고 봤다.
- A⁺4DCT 플레이트: "Calcium score"가 셀렉트 라벨과 축 라벨로 두 번 나온다; 축 캡션 "10-phase mean Pd/Pa; invasive FFR as reference"는 라벨 더미에 가깝다; 영상 배경이 순검정이라 필름 위에 희미한 사각형이 보인다; 차트 글자가 폭에 비례해 커진다(1440에서 축 라벨이 제목보다 크다).
- bolus 스펙트로그램 두 장이 컬럼보다 1px 안쪽에서 시작한다.
- Windows 크로뮴에는 영어 하이픈 사전이 없어 195px에서 "Hemodynam/ic"처럼 끊긴다(실기기는 괜찮다).

코드·문서 부채(documenter가 기록):
- `VesselViewer.tsx` 헤더 주석은 아직 "quiet 모드는 드리프트 없음"이라고 한다(실제는 켜져 있음). `--drift-period` 토큰은 선언만 있고 `scene.ts`는 자체 상수 60000ms를 쓴다.
- `Identity.astro` 헤더 주석은 철회된 런인 리드를 설명한다. `Frame.astro`와 `SpectrogramDevelop.tsx`에 은퇴한 what/result/consequence 스택 코드가 남아 있다.
- 안 쓰는 것: `Section.astro`, `.wrap--text`, `.link-icon`, `--section-pad`, `--width-text`, `--size-display`. `tokens.css` 주석의 "68rem"(실제 64rem), `Base.astro`의 고정 폭 설명, `Nav.astro`·`Footer.astro` 주석, `cv.astro`의 "사진 세 장" 주석.
- 혈관 캡 마스크가 옛 bone-3(oklch 0.56)를 쓴다.
- `smoke.mjs`의 정렬 검사는 시작 연도만 보고 "같은 해 안에서 데모 먼저"는 안 본다.
- `records.ts`에 "워크플로 그림(J2, J4)은 플레이트로 쓰지 않는다"는 주석이 있는데 지금 J4 그림이 research에 이미지로 들어갔다(플레이트는 아니다). 주석을 맞출 것.
- CV PDF의 Research Interests는 아직 관상동맥·CT 중심 문장이다(사이트는 조직 중립). 소유자의 원본 Word에서 고쳐야 한다.
- `.impeccable/design.json`과 `DESIGN.md`는 10-26에 코드 기준으로 재작성했다. 컨트랙트 파일의 스모크 개수(53)는 `MAINTENANCE.md`(57)보다 뒤처져 있다.

## 7. 10월에 무엇이 바뀌었나 (커밋 단위 요약)

| 날짜 | 커밋 | 내용 |
|---|---|---|
| 10-17 | `bfcb307` | 라운드 3: 정체성 우선 홈, 3페이지, 시스템 테마, 에이전트 레이어, 빌드 게이트 |
| 10-17~19 | `744e5df`~`571268c` | 한 컬럼 유동 폭, 모노 읽기줄 제거, 이메일을 텍스트로, 사진 라이트박스, research를 실제 프로젝트 14개 평면 목록으로 |
| 10-19 | `69cb3af` | 이름 옆 한글 이름(Pretendard 서브셋), 홈 Updates 한 줄(데이터에서 파생) |
| 10-19 | `ddec465`, `1ba5551` | CV 정렬 수정 4건, 발표 사진 5장(소유자가 나중에 "별로"라 함) |
| 10-20 | `ea73511` | 폰 레이어(Work 숨김, DOI 축약, outputs 접기, CV 섹션 접기 + 점프 줄), 데스크톱 픽셀 동일 |
| 10-21 | `764b5d1`~`b79f4ce` | research A+(접힌 Method and metrics, 인용 줄 제거, PINO 곡선 유지), 모션 패스, harden 패스(실패 문장·포스터·인쇄·고대비), 리뷰 수정 |
| 10-26 | `0532a32`~`3871e25` | A⁺4DCT 항목과 논문 그림 2장(다른 세션 작업을 정리), 195px 넘침 0, CWT 사전 완성, OG 재생성, 식별자 주석 제거, DESIGN.md 재작성, 구워진 캡션 제거 |

리뷰에서 소유자가 거부했거나 철회된 것(다시 제안하지 말 것): 이름·한글·태그라인을 한 덩어리 헤드라인으로, 시스템 고딕 폴백, "+N" 칩(배지처럼 보임), 이름만 남긴 Work 목록(라벨 더미), GSAP(용량 예산 초과·톤 불일치), React Bits(장식), 페이지 간 크로스페이드, 스케일·바운스·스태거, 픽셀 포트레이트·사이드바·이모지·"Hi, I'm" 인사.

## 8. 다음 라운드 추천 순서

1. 소유자 답이 온 항목부터(사진, 4D CT 스테이지, 레퍼런스 링크). 사진이 오면 `scripts/`에 있는 패턴대로 웹 크기 JPEG/WebP로 줄이고 `src/assets/photos/`에 넣는다.
2. 6절의 "화면에 보이는 것"을 한 커밋으로: A⁺4DCT 플레이트의 중복 라벨·축 캡션·차트 글자 크기, 곡선 라벨 충돌.
3. 6절의 코드·문서 부채를 한 커밋으로(보이는 변화 없음).
4. 라운드 크기는 30~40분 안에 끝나는 묶음으로. 소유자가 "2시간 동안 뭐 한 거냐"고 물은 적이 있다. 겹치지 않는 묶음은 worktree로 병렬, 중간에는 빠른 게이트(check·build·관련 스모크)만, 전체 스모크는 마지막 한 번.

## 9. 에이전트 운영에서 배운 것

- `impeccable-documenter` 에이전트 타입은 Workflow의 구조화 응답(StructuredOutput)을 못 낸다. Workflow 안에 넣지 말고 Agent 도구로 따로 띄운다. 30턴 제한에 걸리면 이어서 하라고 메시지를 보내면 된다.
- Workflow에서 `isolation: 'worktree'`를 쓰면 `.claude/worktrees/`에 worktree와 `worktree-…` 브랜치가 남는다. 끝나면 `git worktree remove --force`와 브랜치 삭제까지 해야 한다.
- 에이전트에게 파일 집합을 분리해 주면 병합 충돌이 거의 없다(A: content/schema/research, B: 스타일·CV·아일랜드 CSS 식으로).
- 리뷰 렌즈 둘(규칙 렌즈, 처음 읽는 해외 엔지니어 렌즈)이 서로 다른 것을 잡는다. 둘 다 돌리고, "fix-then-ship"이면 블로커·should-fix만 고치고 nit은 이 문서 6절 같은 목록에 남긴다.
- 캡션·포스터처럼 "데이터처럼 보이는 그림"은 반드시 숫자와 대조한다. 발표자료에서 가져온 렌더에 표와 다른 값이 구워져 있었다.
- 소유자가 올린 Instagram 링크는 로그인 없이도 built-in 브라우저로 캐러셀을 넘기며 읽을 수 있었다(가입 안내창은 X로 닫는다). iCloud 공유 앨범도 브라우저에서 열어 다운로드 버튼으로 받을 수 있다(다운로드는 소유자 허락 후).

## 10. 연락 규칙 요약

사이트의 모든 페이지는 프로필·CV·LinkedIn·이메일로 이어져야 한다(소유자 지시). 네비의 Email 버튼, 본문에 글자로 보이는 주소, 푸터 주소. mailto는 페이지당 최대 3개.
