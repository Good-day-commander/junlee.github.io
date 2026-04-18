/*
  Design reminder for this file:
  Institutional Editorial Modernism.
  카드형 포트폴리오보다 연구 리포트 첫 페이지처럼 보이게 만들고,
  큰 헤드라인과 긴 문단, 연구 브리프 중심 구성을 유지한다.
  사진은 인물 브랜딩을 보조하는 밀도 있는 편집 요소처럼 다룬다.
*/
import { ArrowUpRight, FileText, Linkedin, Mail, MoveRight } from "lucide-react";
import { useState } from "react";

const snapshots = [
  {
    label: "Published Papers",
    value: "3",
    copy: "Peer-reviewed papers that best represent my current research direction.",
  },
  {
    label: "Research Domain",
    value: "Coronary Flow · Wearable PPG",
    copy: "Coronary diagnosis, CT-derived physiology, and wearable biosignal interpretation.",
  },
  {
    label: "Core Method",
    value: "CFD · PINO · ML",
    copy: "Fluid simulation, physics-informed learning, and data-driven prediction.",
  },
  {
    label: "Current Work",
    value: "PINO · 4D CT · PPG",
    copy: "Current studies in coronary flow prediction, dynamic CT-derived FFR, and wearable biomarkers.",
  },
];

const briefs = [
  {
    status: "Featured Paper · 2025",
    title:
      "A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment Using PPG",
    journal: "Computer Methods and Programs in Biomedicine",
    year: "2025",
    focus:
      "A non-invasive pipeline that estimates patient-specific, shear-rate-dependent blood viscosity from wearable PPG. The network is constrained by the Carreau–Yasuda rheological model, keeping its predictions physically admissible across varying flow conditions.",
    points: [
      "Reframes viscosity estimation as a patient-specific inverse problem rather than population-level screening.",
      "Couples a 1D CNN-LSTM backbone with Carreau–Yasuda priors so the output respects non-Newtonian physics.",
      "Positions consumer-grade wearables as a credible entry point for circulatory assessment.",
    ],
    image: "/media/papers/extracted/viscosity-000.png",
    doi: "https://doi.org/10.1016/j.cmpb.2025.108740",
    doiLabel: "View DOI",
  },
  {
    status: "Accepted · 2026",
    title: "A Diffusion Deformable Model for Coronary 4D CT Synthesis and Dynamic FFR Derivation",
    journal: "Computer Methods and Programs in Biomedicine",
    year: "accepted 2026",
    focus:
      "A diffusion-based generative pipeline that synthesizes physiologically consistent 4D coronary CT from limited-phase acquisitions, enabling dynamic FFR analysis across the cardiac cycle. Developed on a dataset approved under Severance Hospital IRB (4-2024-0685).",
    points: [
      "Couples a deformable diffusion model with downstream CFD to recover time-resolved coronary physiology.",
      "Bridges static coronary CTA and invasive pressure-wire measurement in a single workflow.",
      "Moves dynamic FFR from research-only toward clinically realistic imaging workflows.",
    ],
    image: "/media/papers/extracted/4dct-000.png",
    doi: "",
    doiLabel: "DOI pending — link upon publication",
  },
  {
    status: "Published · 2022",
    title: "Optimization of FFR Prediction Algorithm for the Coronary Gray Zone",
    journal: "Computer Methods and Programs in Biomedicine",
    year: "2022",
    focus:
      "Coronary \"gray-zone\" lesions (FFR ≈ 0.75–0.80) are where diagnostic decisions are hardest. Combining CTA-derived morphology, CFD-derived hemodynamic descriptors, and patient biometrics improves prediction stability precisely in this ambiguous band.",
    points: [
      "Treats gray-zone classification as physics-informed feature design rather than pure black-box learning.",
      "Integrates synthetic vessel models with patient biometric data for robustness.",
    ],
    image: "/media/papers/extracted/ffr-000.png",
    doi: "https://doi.org/10.1016/j.cmpb.2022.106827",
    doiLabel: "View DOI",
  },
  {
    status: "Published · 2022",
    title: "Optimization of Tricuspid Membrane Mechanism Through Hemodynamic Analysis",
    journal: "Engineering Applications of Computational Fluid Mechanics",
    year: "2022",
    focus:
      "A CFD study that examines how tricuspid membrane geometry changes the balance between regurgitation control and long-term leaflet durability, turning device and procedural design into a measurable flow optimization problem.",
    points: [],
    image: "/media/papers/extracted/tricuspid-000.png",
    doi: "https://doi.org/10.1080/19942060.2022.2104929",
    doiLabel: "View DOI",
  },
];

const ongoingProjects = [
  {
    label: "Coronary PINO · in preparation",
    title: "Patient-Specific Coronary Flow Field Prediction with Physics-Informed Neural Operators",
    note:
      "A PointNet++ branch with a Fourier-feature trunk composed as a DeepONet, trained on CFD flow fields and regularized by Navier–Stokes residuals. Predicts 3D pressure and velocity on unseen coronary geometries in seconds rather than hours. Presented at the 18th ACFM (2025); targeting Physics of Fluids.",
  },
  {
    label: "Fluid-loading AI · in preparation",
    title: "Fluid-Bolus Prediction from Continuous PPG Spectrograms",
    note:
      "A multi-model ensemble for identifying emergency-department patients who may later require fluid bolus despite initially stable presentation. Uses Galaxy Watch PPG spectrograms and GroupKFold validation with bias-corrected ensemble aggregation.",
  },
  {
    label: "Wearable biomarkers · multi-study program",
    title: "PPG-Derived Biomarkers: Blood Pressure, Viscosity, Hydration, and Glaucoma-Relevant Signals",
    note:
      "Extends wearable PPG modeling into a broader biomarker program: blood pressure, non-Newtonian viscosity, hydration index, and glaucoma-relevant ocular perfusion markers. Multi-institutional collaborations across Severance, Korea University Ansan, and Gangnam Severance. Deployed as EASYCHECK.",
  },
];

const galleryMoments = [
  {
    label: "Research Talk · 2024",
    title: "Yonsei department symposium",
    note: "Lab presentation on ongoing cardiovascular AI work.",
    image: "/media/profile/gallery-talk-yonsei.jpg",
  },
  {
    label: "Conference Talk · 2025",
    title: "18th Asian Congress of Fluid Mechanics",
    note: "Oral presentation on patient-specific coronary flow field prediction using physics-informed neural operators at ACFM 2025, Seoul, Korea.",
    image: "/media/profile/gallery-acfm-2025.jpg",
  },
  {
    label: "Conference · 2026",
    title: "Design of Medical Devices Conference (DMD 2026) — University of Minnesota",
    note: "Two posters at DMD 2026 (April 20–22, 2026): PINO-based coronary flow field prediction, and a diffusion-based 4D CT synthesis pipeline for dynamic FFR.",
    image: "/media/profile/gallery-dmd-2026.jpg",
  },
  {
    label: "Product & Startup · 2025",
    title: "CARDIOS and product discussion",
    note: "Translation-facing discussion around CARDIOS, during preparation of the U.S. FDA Pre-Submission (Q253736) and the 510(k) strategy for a coronary CT-FFR device.",
    image: "/media/profile/gallery-translation-summit.jpg",
  },
];

const translationalProducts = [
  {
    name: "CARDIOS",
    label: "Coronary CT diagnostics",
    summary:
      "A CT-based coronary decision-support system that estimates the functional significance of coronary artery disease non-invasively, combining coronary anatomy, CFD-informed hemodynamics, and deep learning. Currently in the U.S. FDA Pre-Submission process (Q253736), pursuing a 510(k) pathway under 21 CFR 870.1415 with DEEPVESSEL FFR (K213657) as predicate. Within my portfolio, CARDIOS is the translational outlet of my CT-FFR and coronary flow modeling work.",
    detail: "",
    support: "CTA × AI × CFD × regulatory translation",
  },
  {
    name: "EASYCHECK",
    label: "Wearable biomarker monitoring",
    summary:
      "A smartwatch-based biomarker app that interprets PPG and derived biosignals in real time to estimate blood pressure, non-Newtonian blood viscosity, hydration status, and early hemodynamic vulnerability indicators. EASYCHECK is the productized extension of the same PPG research line used in the CMPB 2025 viscosity paper.",
    detail: "",
    support: "Wearable PPG × biomarkers × real-time monitoring",
  },
];

const translationalMedia = {
  label: "External overview",
  title: "CARDIOS product overview on YouTube",
  note:
    "A short external overview for visitors who want product context without interrupting the reading flow of the portfolio.",
  href: "https://www.youtube.com/watch?v=oSsvH7LRp7E",
  thumbnail: "https://i.ytimg.com/vi/oSsvH7LRp7E/hqdefault.jpg",
};

const publications = [
  {
    year: "2025",
    title:
      "A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment using PPG",
    venue: "Computer Methods and Programs in Biomedicine",
    note: "Physics-guided deep learning for patient-specific viscosity estimation from wearable PPG.",
    doi: "https://doi.org/10.1016/j.cmpb.2025.108740",
  },
  {
    year: "2022",
    title:
      "Optimization of Tricuspid Membrane Mechanism for Effectiveness and Leaflet Longevity through Hemodynamic Analysis",
    venue: "Engineering Applications of Computational Fluid Mechanics",
    note: "CFD analysis of tricuspid membrane design trade-offs between efficacy and leaflet longevity.",
    doi: "https://doi.org/10.1080/19942060.2022.2104929",
  },
  {
    year: "2022",
    title:
      "Optimization of FFR Prediction Algorithm for Gray Zone by Hemodynamic Features with Synthetic Model and Biometric Data",
    venue: "Computer Methods and Programs in Biomedicine",
    note: "Hemodynamics-informed FFR prediction for diagnostically ambiguous coronary gray-zone cases.",
    doi: "https://doi.org/10.1016/j.cmpb.2022.106827",
  },
];

const conferenceActivities = [
  {
    year: "2026",
    category: "International",
    title: "PINO-Based Patient-Specific Coronary Flow Field Prediction",
    venue: "DMD 2026",
    location: "Minneapolis, MN",
    format: "Poster",
  },
  {
    year: "2026",
    category: "International",
    title: "Diffusion-Based 4D CT Synthesis for Dynamic Coronary FFR",
    venue: "DMD 2026",
    location: "Minneapolis, MN",
    format: "Poster",
  },
  {
    year: "2025",
    category: "International",
    title: "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators",
    venue: "The 18th Asian Congress of Fluid Mechanics (ACFM)",
    location: "Seoul, Korea",
    format: "Oral",
  },
  {
    year: "2024",
    category: "International",
    title: "AI-based Hemorheology Prediction with Patient-Specific Biometric Boundary Conditions",
    venue: "2024 ICTAM",
    location: "Daegu, Korea",
    format: "Short oral & poster",
  },
  {
    year: "2023",
    category: "Domestic",
    title: "Unlocking Predictive Health Outcomes with Biometric Data",
    venue: "KSME Conference 2023",
    location: "Song-do, Korea",
    format: "Oral",
  },
  {
    year: "2023",
    category: "Domestic",
    title: "Modeling Coronary Artery Hemodynamics: Exploring DCNN Surrogate Models in Preliminary Research",
    venue: "Biomedical Engineering Society for Circulation (2023 BESCO summer meeting)",
    location: "Daegu, Korea",
    format: "Oral",
  },
  {
    year: "2022",
    category: "International",
    title: "Optimization of Artificial Intelligence Algorithms for FFR Prediction in Gray Zone",
    venue: "2022 ICTME",
    location: "Gyeonggi-do, Korea",
    format: "Oral",
  },
  {
    year: "2022",
    category: "Domestic",
    title: "Artificial Intelligence Algorithms for FFR Prediction in Gray Zone by Single-view Angiography",
    venue: "Biomedical Engineering Society for Circulation (2022 BESCO winter meeting)",
    location: "Seoul, Korea",
    format: "Short oral & poster · Best Paper Award nominee",
  },
  {
    year: "2021",
    category: "International",
    title: "Estimating CFD-based CT FFR using lattice Boltzmann method – 3D geometry auto segmentation and novel patient specific computation",
    venue: "ESCHM-ISCH-ISB 2021 FUKUOKA",
    location: "Fukuoka, Japan",
    format: "Oral",
  },
  {
    year: "2021",
    category: "Domestic",
    title: "Optimization of Artificial Intelligence Algorithms for FFR Prediction in Gray Zone",
    venue: "Biomedical Engineering Society for Circulation (2021 BESCO winter meeting)",
    location: "Gangwon, Korea",
    format: "Oral",
  },
];

const patents = [
  {
    year: "2024",
    title: "Non-Newtonian fluid viscosity modeling of patient blood using wearable device-based PPG and biometric information",
    jurisdiction: "Korea",
    application: "10-2024-0026709",
  },
  {
    year: "2024",
    title: "An algorithm that collects PPG and biometric information from wearable devices and analyzes it to predict systolic and diastolic viscosity",
    jurisdiction: "Korea",
    application: "10-2024-0028201",
  },
  {
    year: "2023",
    title: "Glucose and diabetes prediction algorithm using wearable device-based PPG and biometric information",
    jurisdiction: "Korea",
    application: "10-2023-0144347",
  },
  {
    year: "2023",
    title: "A wearable device for monitoring glaucoma suspect and a method for monitoring glaucoma suspect",
    jurisdiction: "Korea",
    application: "Application No. to be confirmed",
  },
  {
    year: "2023",
    title: "Glaucoma Diagnosis Method and System Based on Contactless Biosignals",
    jurisdiction: "Korea",
    application: "10-2023-0078883",
  },
  {
    year: "2022",
    title: "Noninvasive Urodynamics Test Method and Apparatus Based on Artificial Intelligence",
    jurisdiction: "Korea",
    application: "10-2022-0085583",
  },
  {
    year: "2022",
    title: "Optimization system and method of AI algorithm for prediction coronary artery lesions based on FFR",
    jurisdiction: "Korea / US",
    application: "10-2022-0030019 / 17/820,819",
  },
];

const ACHIEVEMENT_PREVIEW_COUNT = 4;

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
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hyeong-jun-lee-389435247/",
  },
];

export default function Home() {
  const [showAllTalks, setShowAllTalks] = useState(false);
  const [showAllPatents, setShowAllPatents] = useState(false);

  const visibleConferenceActivities = showAllTalks
    ? conferenceActivities
    : conferenceActivities.slice(0, ACHIEVEMENT_PREVIEW_COUNT);
  const visiblePatents = showAllPatents ? patents : patents.slice(0, ACHIEVEMENT_PREVIEW_COUNT);

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
            <a className="nav-link" href="#translation">
              Applied Work
            </a>
            <a className="nav-link" href="#publication-list">
              Publications
            </a>
            <a className="nav-link" href="#achievements">
              Achievements
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
                    <div className="eyebrow">Coronary Hemodynamics · Physics-Informed AI · Wearable Biosignals</div>

                  <h1 className="hero-title max-w-[11ch]">Patient-specific cardiovascular modeling, through physics-informed AI.</h1>
                </div>
                <div className="hero-meta-rule max-w-5xl" />
                <div className="hero-narrative-grid">
                  <div className="space-y-6">
                    <p className="lede max-w-3xl">
                      I am a PhD candidate at the <strong>Multi-scale Fluid Dynamics Lab (MFDL BIOS Lab)</strong>, Department of
                      Mechanical Engineering, <strong>Yonsei University</strong>, advised by <strong>Prof. Joon Sang Lee</strong>. My work
                      spans three connected fronts: physics-informed neural operators for coronary flow, diffusion-based 4D CT synthesis for
                      dynamic FFR, and wearable PPG analytics for non-invasive biomarkers. The goal is to make fluid mechanics and
                      physiological signals interpretable enough for real clinical decisions.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a className="capsule-link" href="#research">
                        Explore research briefs <MoveRight className="size-4" />
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
                          From hemodynamics to decision support.
                        </h2>
                      </div>
                      <p className="body-copy">
                        This homepage is organized as a compact research report. The three research fronts — coronary hemodynamics, dynamic CT imaging, and wearable PPG — are shown as one connected pipeline rather than isolated projects.
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
                    <div className="hero-profile-item">
                      <div className="eyebrow">Affiliation</div>
                      <p className="hero-profile-copy">MFDL BIOS Lab, Dept. of Mechanical Engineering, Yonsei University</p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Advisor</div>
                      <p className="hero-profile-copy">Prof. Joon Sang Lee (이준상)</p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Role</div>
                      <p className="hero-profile-copy">PhD Candidate (Mechanical Engineering)</p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Current scope</div>
                      <p className="hero-profile-copy">PINO · 4D CT synthesis · Wearable PPG · CT-FFR</p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Research domain</div>
                      <p className="hero-profile-copy">Coronary flow · Wearable PPG · Clinical decision support</p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Core methods</div>
                      <p className="hero-profile-copy">CFD · Physics-informed operators · Diffusion models</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="container py-10 md:py-14">
          <div className="section-rule mb-8" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {snapshots.map((item) => (
              <article key={item.label} className="metric-card">
                <p className="eyebrow mb-6">{item.label}</p>
                <div className="metric-value">{item.value}</div>
                <p className="mt-5 text-sm leading-7 text-[color:var(--ink-soft)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="research" className="section-layer section-layer-research">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Research Briefs</div>
              <h2 className="section-title max-w-[15.5ch]">Studies that define my current research agenda.</h2>
              <p className="body-copy max-w-3xl">
                These briefs summarize the questions I have worked on, the models I built, and the clinical value each study was designed to unlock.
              </p>
            </div>

            <div className="mt-10 space-y-6">
              {briefs.map((brief) => (
                <article key={brief.title} className="research-card">
                  <div className="research-grid">
                    <div className="research-figure">
                      <img src={brief.image} alt={brief.title} />
                    </div>
                    <div className="research-card-copy">
                      <div className="research-meta-row">
                        <div className="micro-label w-fit">{brief.status}</div>
                        <span className="year-chip">
                          {brief.journal} · {brief.year}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <h3 className="research-title">{brief.title}</h3>
                        <p className="research-focus">{brief.focus}</p>
                      </div>
                      {brief.points.length ? (
                        <ul className="bullet-list research-bullet-list">
                          {brief.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="research-card-footer">
                        {brief.doi ? (
                          <a className="capsule-link" href={brief.doi} target="_blank" rel="noreferrer">
                            {brief.doiLabel} <ArrowUpRight className="size-4" />
                          </a>
                        ) : (
                          <span className="capsule-link capsule-link-quiet">{brief.doiLabel}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="ongoing" className="section-layer section-layer-ongoing">
          <div className="container py-16 md:py-24">
            <div className="border-y py-10" style={{ borderColor: "rgba(16,24,40,0.1)" }}>
              <div className="max-w-5xl space-y-4">
                <div className="eyebrow">Ongoing Research</div>
                <h2 className="section-title max-w-[15.5ch]">Current studies organized as one working pipeline.</h2>
              <p className="body-copy max-w-3xl">
                These three active lines show what is currently moving toward papers and translational output. The accepted 4D CT study is now promoted above as a research brief rather than kept as a one-line ongoing item.
              </p>
              </div>
              <div className="ongoing-grid mt-10">
                {ongoingProjects.map((project) => (
                  <article key={project.title} className="ongoing-card">
                    <div className="eyebrow mb-3">{project.label}</div>
                    <h3 className="ongoing-title">{project.title}</h3>
                    <p className="ongoing-copy mt-3">{project.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="section-band section-band-gallery">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Field Notes</div>
              <h2 className="section-title max-w-[15.5ch]">Where the work gets presented, discussed, and translated.</h2>
              <p className="body-copy max-w-3xl">
                A short visual record of lab presentations, conference talks, and product-facing discussion around the same research line.
              </p>
            </div>

            <div className="gallery-grid mt-10">
              {galleryMoments.map((moment) => (
                <article key={moment.title} className="gallery-card">
                  <div className="gallery-media">
                    <img src={moment.image} alt={moment.title} />
                  </div>
                  <div className="space-y-3 p-5 md:p-6">
                    <div className="eyebrow">{moment.label}</div>
                    <h3 className="font-display text-[1.42rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--ink)] md:text-[1.75rem]">
                      {moment.title}
                    </h3>
                    <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{moment.note}</p>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        <section id="translation" className="section-band section-band-gallery">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">The M.E.N.D. BioSimulator</div>
              <h2 className="section-title max-w-[15ch]">Research connected to software and product development.</h2>
              <p className="body-copy max-w-3xl">
                Part of my work is translated into clinical software through <strong>The M.E.N.D. BioSimulator (더멘드바이오시뮬레이터)</strong>, a startup building SaMD products grounded in the same coronary CFD, CT-FFR, and wearable PPG research shown above.
              </p>
            </div>

            <div className="translation-grid mt-10">
              <article className="translation-overview-panel">
                <div className="space-y-4">
                  <div className="micro-label w-fit">Applied research context</div>
                  <h3 className="translation-panel-title">This section shows where the research connects beyond papers.</h3>
                </div>
                <div className="space-y-5">
                  <p className="body-copy">
                    I include this layer because some of the modeling and biosignal pipelines are also relevant to software design, product planning, and clinical workflow integration.
                  </p>
                  <p className="body-copy">
                    The product video stays as a compact external link so visitors can open it when needed without breaking the reading flow of the portfolio.
                  </p>
                </div>
              </article>

              <a className="translation-media-card" href={translationalMedia.href} target="_blank" rel="noreferrer">
                <div className="translation-media-thumb">
                  <img src={translationalMedia.thumbnail} alt={translationalMedia.title} />
                </div>
                <div className="space-y-3 p-5 md:p-6">
                  <div className="eyebrow">{translationalMedia.label}</div>
                  <h3 className="translation-media-title">{translationalMedia.title}</h3>
                  <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{translationalMedia.note}</p>
                  <span className="capsule-link">
                    Watch on YouTube <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </a>
            </div>

            <div className="translation-product-grid mt-6">
              {translationalProducts.map((product) => (
                <article key={product.name} className="translation-product-card">
                  <div className="space-y-3">
                    <div className="eyebrow">{product.label}</div>
                    <h3 className="translation-product-title">{product.name}</h3>
                  </div>
                  <p className="translation-product-summary">{product.summary}</p>
                  {product.detail ? <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{product.detail}</p> : null}
                  <div>
                    <span className="year-chip">{product.support}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="publication-list" className="section-layer section-layer-publications">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Publication Index</div>
              <h2 className="section-title max-w-[15ch]">Selected papers that map my current research direction.</h2>
              <p className="body-copy max-w-3xl">
                A compact citation view of the peer-reviewed papers that anchor my current work on coronary hemodynamics, wearable PPG inference, and physics-informed clinical AI.
              </p>
            </div>

            <div className="mt-10 border-b" style={{ borderColor: "rgba(16,24,40,0.1)" }}>
              {publications.map((paper) => (
                <article key={paper.title} className="publication-row">
                  <div>
                    <span className="year-chip">{paper.year}</span>
                  </div>
                  <div className="publication-copy">
                    <p className="publication-venue">{paper.venue}</p>
                    <h3 className="publication-title">{paper.title}</h3>
                    <p className="publication-note">{paper.note}</p>
                  </div>
                  <div className="publication-row-action">
                    <a className="capsule-link" href={paper.doi} target="_blank" rel="noreferrer">
                      DOI <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="achievements" className="section-band section-band-achievements">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Conference Activity and Patents</div>
              <h2 className="section-title max-w-[16ch]">Talks, patents, and applied outputs across the same research arc.</h2>
              <p className="body-copy max-w-3xl">
                Together, these records show how I have presented the work, discussed it with research communities, and extended it beyond journal publication—from conference talks to patent filings and applied projects.
              </p>
            </div>

            <div className="achievement-grid mt-10">
              <div className="achievement-column">
                <div className="achievement-column-head">
                  <div>
                    <div className="eyebrow">Talks</div>
                    <h3 className="font-display mt-2 text-[1.42rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--ink)] md:text-[1.72rem]">
                      Selected conference presentations
                    </h3>
                  </div>
                  <span className="year-chip">{showAllTalks ? `${conferenceActivities.length} total` : `${visibleConferenceActivities.length} of ${conferenceActivities.length} shown`}</span>
                </div>
                <div className="achievement-list">
                  {visibleConferenceActivities.map((item) => (
                    <article key={`${item.year}-${item.title}`} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">{item.year}</span>
                        <span className="achievement-tag">{item.category}</span>
                      </div>
                      <h3 className="font-display text-[1.08rem] font-semibold leading-[1.18] tracking-[-0.03em] text-[var(--ink)] md:text-[1.26rem]">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--blue)]">{item.venue}</p>
                      <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{item.location} · {item.format}</p>
                    </article>
                  ))}
                </div>
                {conferenceActivities.length > ACHIEVEMENT_PREVIEW_COUNT ? (
                  <div className="mt-5">
                    <button className="capsule-link capsule-link-quiet" type="button" onClick={() => setShowAllTalks((value) => !value)}>
                      {showAllTalks ? "Show fewer talks" : `View full conference record (${conferenceActivities.length})`}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="achievement-column">
                <div className="achievement-column-head">
                  <div>
                    <div className="eyebrow">Patents</div>
                    <h3 className="font-display mt-2 text-[1.42rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--ink)] md:text-[1.72rem]">
                      Selected patent record
                    </h3>
                  </div>
                  <span className="year-chip">{showAllPatents ? `${patents.length} total` : `${visiblePatents.length} of ${patents.length} shown`}</span>
                </div>
                <div className="achievement-list">
                  {visiblePatents.map((patent) => (
                    <article key={`${patent.application}-${patent.title}`} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">{patent.year}</span>
                        <span className="achievement-tag">{patent.jurisdiction}</span>
                      </div>
                      <h3 className="font-display text-[1.08rem] font-semibold leading-[1.18] tracking-[-0.03em] text-[var(--ink)] md:text-[1.26rem]">
                        {patent.title}
                      </h3>
                      <p className="text-sm leading-7 text-[color:var(--ink-soft)]">Application No. {patent.application}</p>
                    </article>
                  ))}
                </div>
                {patents.length > ACHIEVEMENT_PREVIEW_COUNT ? (
                  <div className="mt-5">
                    <button className="capsule-link capsule-link-quiet" type="button" onClick={() => setShowAllPatents((value) => !value)}>
                      {showAllPatents ? "Show fewer patents" : `View full patent record (${patents.length})`}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="footer-panel mt-10">
          <div className="container py-16 md:py-20">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Contact and Links</div>
              <h2 className="section-title max-w-[17.5ch]">Open to collaboration on coronary hemodynamics, medical AI, and wearable biosignal analysis.</h2>
              <p className="body-copy max-w-2xl">
                Open to discussion around patient-specific cardiovascular modeling, CT-FFR pipelines, physics-informed learning for biomedical problems, wearable PPG analytics, and clinical translation of SaMD products.
              </p>
            </div>
            <div className="contact-grid mt-10">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  className="metric-card contact-card flex items-center justify-between gap-3 p-5"
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
                      <Linkedin className="size-5 text-[var(--blue)]" />
                    )}
                    <span className="font-semibold text-[var(--ink)]">{link.label}</span>
                  </div>
                  <ArrowUpRight className="size-4 text-[var(--blue)]" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
