/*
  Design reminder for this file:
  Institutional Editorial Modernism.
  카드형 포트폴리오보다 연구 리포트 첫 페이지처럼 보이게 만들고,
  큰 헤드라인과 긴 문단, 연구 브리프 중심 구성을 유지한다.
  사진은 인물 브랜딩을 보조하는 밀도 있는 편집 요소처럼 다룬다.
*/
import { ArrowUpRight, FileText, FlaskConical, Mail, MoveRight } from "lucide-react";

const snapshots = [
  {
    label: "Published Papers",
    value: "3",
    copy: "Selected publications currently foregrounded in the homepage narrative.",
  },
  {
    label: "Clinical Direction",
    value: "PPG",
    copy: "Wearable hemodynamics, patient-specific physiology, and decision support.",
  },
  {
    label: "Core Method",
    value: "CFD × AI",
    copy: "Computational flow modeling connected to machine learning pipelines.",
  },
  {
    label: "Current Status",
    value: "1 Ongoing",
    copy: "Submission-stage manuscript on early fluid intervention prediction.",
  },
];

const briefs = [
  {
    status: "Featured Paper · 2025",
    title:
      "A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment using PPG",
    journal: "Computer Methods and Programs in Biomedicine",
    year: "2025",
    focus:
      "Wearable PPG signals are translated into patient-specific blood viscosity estimates by fusing rheological priors with a hybrid deep-learning pipeline.",
    points: [
      "Builds a patient-level viscosity estimation workflow rather than relying on a single surrogate marker.",
      "Connects Carreau–Yasuda rheology to a 1D CNN-LSTM architecture for clinically meaningful inference.",
      "Frames wearable sensing as a route toward broader non-invasive circulatory assessment.",
    ],
    image: "/media/papers/extracted/viscosity-000.png",
    doi: "https://doi.org/10.1016/j.cmpb.2025.108740",
  },
  {
    status: "Published · 2022",
    title: "Optimization of FFR Prediction in the Gray Zone",
    journal: "Computer Methods and Programs in Biomedicine",
    year: "2022",
    focus:
      "A coronary decision-support study combining CTA-derived morphology, hemodynamic variables, and biometric data to improve FFR prediction where diagnosis is most ambiguous.",
    points: [
      "Reframes the gray-zone problem as a feature-engineering challenge grounded in coronary flow physics.",
      "Combines synthetic vessel models and patient biomarkers for more robust prediction.",
      "Positions CFD-derived descriptors as clinically useful variables rather than purely simulation outputs.",
    ],
    image: "/media/papers/extracted/ffr-000.png",
    doi: "https://doi.org/10.1016/j.cmpb.2022.106827",
  },
  {
    status: "Published · 2022",
    title: "Optimization of Tricuspid Membrane Mechanism through Hemodynamic Analysis",
    journal: "Engineering Applications of Computational Fluid Mechanics",
    year: "2022",
    focus:
      "This work studies how tricuspid membrane geometry changes the balance between treatment effectiveness and leaflet durability through CFD-based hemodynamic analysis.",
    points: [
      "Turns valve intervention design into a measurable flow optimization problem.",
      "Explores trade-offs between regurgitation reduction and long-term leaflet preservation.",
      "Demonstrates how simulation can directly support procedural design choices.",
    ],
    image: "/media/papers/extracted/tricuspid-000.png",
    doi: "https://doi.org/10.1080/19942060.2022.2104929",
  },
];

const galleryMoments = [
  {
    label: "Research Talk · 2024",
    title: "Department symposium presentation at Yonsei University",
    note:
      "A close in-room presentation image that gives the homepage a sense of the researcher in action without overpowering the editorial layout.",
    image: "/media/profile/gallery-talk-yonsei.jpg",
  },
  {
    label: "Conference Talk · 2025",
    title: "18th Asian Congress of Fluid Mechanics",
    note:
      "A conference-facing moment that connects the publication record to active participation in the broader fluid mechanics community.",
    image: "/media/profile/gallery-acfm-2025.jpg",
  },
  {
    label: "Translation · 2025",
    title: "Startup-facing and translational research context",
    note:
      "A more translational scene showing how academic work is also extending toward products, collaboration, and early innovation settings.",
    image: "/media/profile/gallery-translation-summit.jpg",
  },
];

const publications = [
  {
    year: "2025",
    title:
      "A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment using PPG",
    venue: "Computer Methods and Programs in Biomedicine",
    note: "Hybrid rheology-aware deep learning for patient-specific viscosity assessment.",
    doi: "https://doi.org/10.1016/j.cmpb.2025.108740",
  },
  {
    year: "2022",
    title:
      "Optimization of Tricuspid Membrane Mechanism for Effectiveness and Leaflet Longevity through Hemodynamic Analysis",
    venue: "Engineering Applications of Computational Fluid Mechanics",
    note: "CFD-guided optimization of tricuspid intervention mechanics.",
    doi: "https://doi.org/10.1080/19942060.2022.2104929",
  },
  {
    year: "2022",
    title:
      "Optimization of FFR Prediction Algorithm for Gray Zone by Hemodynamic Features with Synthetic Model and Biometric Data",
    venue: "Computer Methods and Programs in Biomedicine",
    note: "Patient-specific coronary diagnosis supported by hemodynamics and biometrics.",
    doi: "https://doi.org/10.1016/j.cmpb.2022.106827",
  },
];

const contactLinks = [
  {
    label: "Email",
    href: "mailto:kochujam369@gmail.com",
  },
  {
    label: "Google Scholar",
    href: "https://scholar.google.com/citations?user=1NxM3T0AAAAJ&hl=ko",
  },
  {
    label: "GitHub",
    href: "https://github.com/Good-day-commander",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hyeong-jun-lee-389435247/",
  },
];

export default function Home() {
  return (
    <div className="editorial-shell site-frame">
      <header className="editorial-nav">
        <div className="container flex items-center justify-between gap-6 py-4">
          <a href="#top" className="font-display text-lg font-semibold tracking-[-0.05em] text-[var(--ink)]">
            Hyeong Jun Lee
          </a>
          <nav className="hidden items-center gap-6 lg:flex">
            <a className="nav-link" href="#research">
              Research
            </a>
            <a className="nav-link" href="#gallery">
              Gallery
            </a>
            <a className="nav-link" href="#publication-list">
              Publications
            </a>
            <a className="nav-link" href="#ongoing">
              Ongoing
            </a>
            <a className="nav-link" href="#contact">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero-band">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-main space-y-8">
                <div className="space-y-4">
                  <div className="eyebrow">Fluid Dynamics · Clinical AI · Wearable Hemodynamics</div>
                  <h1 className="hero-title max-w-[11ch]">Translating flow physics into clinically useful intelligence.</h1>
                </div>
                <div className="hero-meta-rule max-w-5xl" />
                <div className="hero-narrative-grid">
                  <div className="space-y-6">
                    <p className="lede max-w-3xl">
                      I build patient-specific computational and learning systems that connect
                      <strong> hemodynamic structure</strong>, <strong> wearable physiological signals</strong>, and
                      <strong> clinical decision-making</strong>. My work sits at the intersection of computational fluid dynamics,
                      physics-informed modeling, and translational medical AI.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a className="capsule-link" href="#research">
                        Explore selected research <MoveRight className="size-4" />
                      </a>
                      <a className="capsule-link" href="/uploads/resume.pdf" target="_blank" rel="noreferrer">
                        View resume <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </div>

                  <aside className="hero-panel hero-framing-panel p-6 md:p-7">
                    <div className="space-y-4">
                      <div>
                        <div className="eyebrow">Current framing</div>
                        <h2 className="font-display mt-3 text-[1.95rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[var(--ink)] md:text-[2.2rem]">
                          Research as brief, not archive.
                        </h2>
                      </div>
                      <p className="body-copy">
                        The homepage reads as a compact report on how fluid-mechanical understanding becomes actionable diagnostic insight.
                      </p>
                    </div>
                  </aside>
                </div>
              </div>

              <aside className="hero-profile-wrap">
                <div className="portrait-card">
                  <div className="micro-label w-fit">Profile</div>
                  <div className="portrait-frame hero-portrait-frame mt-4">
                    <img src="/media/profile/profile-main.jpg" alt="Portrait of Hyeong Jun Lee" />
                  </div>
                  <div className="hero-profile-meta mt-5 text-sm text-[color:var(--ink-soft)]">
                    <div>
                      <div className="eyebrow mb-2">Affiliation</div>
                      <p>MFDL, Yonsei University</p>
                    </div>
                    <div>
                      <div className="eyebrow mb-2">Role</div>
                      <p>PhD Candidate in Mechanical Engineering</p>
                    </div>
                    <div>
                      <div className="eyebrow mb-2">Current scope</div>
                      <p>PINO, clinical AI, and wearable hemodynamics</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="container py-8 md:py-12">
          <div className="section-rule mb-8" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {snapshots.map((item) => (
              <article key={item.label} className="metric-card">
                <p className="eyebrow mb-6">{item.label}</p>
                <div className="metric-value">{item.value}</div>
                <p className="mt-5 text-sm leading-7 text-[color:var(--ink-soft)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="research" className="container py-16 md:py-24">
          <div className="max-w-4xl space-y-5">
            <div className="eyebrow">Selected Research Briefs</div>
            <h2 className="section-title max-w-[12ch]">A closer reading of the studies shaping the research agenda.</h2>
            <p className="body-copy max-w-3xl">
              The selected papers below are presented as research briefs rather than a conventional publication list. Each brief identifies the clinical problem, the computational logic, and the translational value that emerged from the work.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {briefs.map((brief) => (
              <article key={brief.title} className="research-card">
                <div className="research-grid">
                  <div className="research-figure">
                    <img src={brief.image} alt={brief.title} />
                  </div>
                  <div className="flex flex-col gap-5 p-1 md:p-3">
                    <div className="micro-label w-fit">{brief.status}</div>
                    <div className="space-y-4">
                      <h3 className="font-display text-[1.95rem] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--ink)] md:text-[2.4rem]">
                        {brief.title}
                      </h3>
                      <p className="text-base leading-8 text-[color:var(--ink-soft)]">{brief.focus}</p>
                    </div>
                    <ul className="bullet-list">
                      {brief.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <span className="year-chip">
                        {brief.journal} · {brief.year}
                      </span>
                      <a className="capsule-link" href={brief.doi} target="_blank" rel="noreferrer">
                        View DOI <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="ongoing" className="container py-16 md:py-24">
          <div className="grid gap-8 border-y py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]" style={{ borderColor: "rgba(16,24,40,0.1)" }}>
            <div className="space-y-4">
              <div className="eyebrow">Ongoing Clinical AI</div>
              <h2 className="section-title max-w-[11ch]">Submission-stage manuscript focused on earlier fluid intervention.</h2>
            </div>
            <div className="space-y-6">
              <div className="micro-label w-fit">In Submission</div>
              <h3 className="font-display text-[1.9rem] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--ink)] md:text-[2.6rem]">
                Multi-Model Deep-Learning Ensemble for Predicting 24 h Fluid Bolus Administration from Continuous PPG Spectrograms
              </h3>
              <p className="body-copy">
                This manuscript asks whether continuous smartwatch-derived PPG can identify apparently stable emergency department patients who may later require fluid bolus administration. The study combines multi-window spectrogram analysis, diverse CNN backbones, and weighted ensemble learning to detect hemodynamic vulnerability before overt instability emerges.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="metric-card p-5">
                  <div className="eyebrow mb-4">Setting</div>
                  <p className="text-sm leading-7 text-[color:var(--ink-soft)]">Prospective emergency care cohort with continuous wearable PPG monitoring.</p>
                </article>
                <article className="metric-card p-5">
                  <div className="eyebrow mb-4">Method</div>
                  <p className="text-sm leading-7 text-[color:var(--ink-soft)]">Ensemble learning across STFT and CWT spectrogram representations.</p>
                </article>
                <article className="metric-card p-5">
                  <div className="eyebrow mb-4">Goal</div>
                  <p className="text-sm leading-7 text-[color:var(--ink-soft)]">Support earlier fluid intervention decisions in clinically ambiguous cases.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="section-band">
          <div className="container py-16 md:py-24">
            <div className="max-w-4xl space-y-5">
              <div className="eyebrow">Field Notes</div>
              <h2 className="section-title max-w-[12ch]">A compact gallery of talks, conference rooms, and translational moments.</h2>
              <p className="body-copy max-w-3xl">
                Instead of building a separate photo gallery page, the site keeps a restrained visual record of how the research is presented in rooms, conferences, and adjacent translational settings.
              </p>
            </div>

            <div className="gallery-grid mt-10">
              {galleryMoments.map((moment, index) => (
                <article
                  key={moment.title}
                  className={index === 0 ? "gallery-card gallery-card-featured" : "gallery-card"}
                >
                  <div className="gallery-media">
                    <img src={moment.image} alt={moment.title} />
                  </div>
                  <div className="space-y-3 p-5 md:p-6">
                    <div className="eyebrow">{moment.label}</div>
                    <h3 className="font-display text-[1.5rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--ink)] md:text-[1.9rem]">
                      {moment.title}
                    </h3>
                    <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{moment.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="publication-list" className="container py-16 md:py-24">
          <div className="max-w-4xl space-y-5">
            <div className="eyebrow">Publication Index</div>
            <h2 className="section-title max-w-[12ch]">A concise record of the publications currently foregrounded on the site.</h2>
          </div>

          <div className="mt-10 border-b" style={{ borderColor: "rgba(16,24,40,0.1)" }}>
            {publications.map((paper) => (
              <article key={paper.title} className="publication-row">
                <div>
                  <span className="year-chip">{paper.year}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[var(--ink)] md:text-[1.7rem]">
                    {paper.title}
                  </h3>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{paper.venue}</p>
                  <p className="text-base leading-8 text-[color:var(--ink-soft)]">{paper.note}</p>
                </div>
                <div>
                  <a className="capsule-link" href={paper.doi} target="_blank" rel="noreferrer">
                    DOI <ArrowUpRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="footer-panel mt-10">
          <div className="container py-16 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
              <div className="space-y-5">
                <div className="eyebrow">Contact and Links</div>
                <h2 className="section-title max-w-[10ch]">Open to academic, translational, and clinical collaboration.</h2>
                <p className="body-copy max-w-2xl">
                  The site will next expand with a broader project layer. For now, it concentrates on the papers, activity moments, and research direction most essential to understanding the current trajectory of the work.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    className="metric-card flex items-center justify-between gap-3 p-5"
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {link.label === "Email" ? (
                        <Mail className="size-5 text-[var(--blue)]" />
                      ) : link.label === "Google Scholar" ? (
                        <FileText className="size-5 text-[var(--blue)]" />
                      ) : (
                        <FlaskConical className="size-5 text-[var(--blue)]" />
                      )}
                      <span className="font-semibold text-[var(--ink)]">{link.label}</span>
                    </div>
                    <ArrowUpRight className="size-4 text-[var(--blue)]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
