/*
  Site content dataset — single source of truth for Home.tsx.
  Derived from CV_HyeongJunLee.pdf (CV wins over older site copy).

  Everything exported from this file ships in the public JavaScript bundle
  (bundlers cannot drop unused object properties), so only renderable,
  public-facing fields belong in the exported objects. Maintainer-only
  information stays in comments, which the minifier strips.

  MAINTAINER NOTES / KNOWN DISCREPANCIES (not exported, not rendered):
  Each line below records where the previous site copy, the CV, and the
  patent sheet disagreed, and which value this dataset follows.
*/
// - Lab name: site said "Multi-scale Fluid Dynamics Lab (MFDL BIOS Lab)" and "MFDL BIOS Lab"; CV spells it "Multiscale Fluid Dynamics Lab" with no "BIOS". The acronym "MFDL" never appears in the CV, so profile.lab reads "Multiscale Fluid Dynamics Lab" without the parenthetical; the page copy adds "(MFDL)" per the owner's editorial decision.
// - Role: site hero and profile card said "PhD candidate"; CV says Ph.D. completed Aug. 2026 and Postdoctoral Researcher since Sep. 2026 (Technical Research Personnel through Aug. 2027), plus concurrent Project Researcher at Yonsei University Health System (PI: Prof. Jung-Sun Kim).
// - Portrait alt text and profile-card Affiliation line previously carried the old role/lab/department strings; CV: "Postdoctoral Researcher", "Multiscale Fluid Dynamics Lab", "School of Mechanical Engineering, Yonsei University".
// - Department wording: site said "Department of Mechanical Engineering"; CV uses "School of Mechanical Engineering, Yonsei University".
// - LinkedIn URL: CV prints linkedin.com/in/hyeongjunlee; the live site's contact card has used https://www.linkedin.com/in/hyeong-jun-lee-389435247/. Neither slug can be verified automatically (LinkedIn answers scripted requests with HTTP 999 whether or not a profile exists), so profile.links.linkedin keeps the URL the live site has been serving rather than risk a dead contact link. Owner action: open linkedin.com/in/hyeongjunlee in a browser; if it is your profile, switch profile.links.linkedin to it, otherwise correct the CV.
// - Google Scholar and ORCID URLs are not printed in the CV (only link labels); taken from the site's contact links. The Scholar URL used hl=ko; it now uses hl=en because the site is English-only and its audience is overseas.
// - CV header also lists a phone number; deliberately omitted because the site is public.
// - CV RESEARCH INTERESTS (4 bullets) has no schema field: (1) Patient-specific computational hemodynamics: image-based coronary CFD (incl. lattice Boltzmann method) and FFR assessment; (2) Physics-informed machine learning: neural operators and physics-informed surrogates for real-time cardiovascular flow prediction; (3) Image-based cardiovascular physiology: CT-FFR and diffusion-based 4D coronary CT synthesis for dynamic FFR; (4) Wearable hemodynamic diagnostics: PPG-based estimation of non-Newtonian blood viscosity, blood pressure and fluid status.
// - CV REFERENCES section (Prof. Joon Sang Lee, joonlee@yonsei.ac.kr; others on request) intentionally excluded from the public dataset.
// - CV labels J1-J4 "Journal Articles (SCIE)"; the type "journal" carries no indexing qualifier, so page copy says SCIE explicitly.
// - CV header for R1-R7 is "RESEARCH PROJECTS (PARTICIPATING RESEARCHER)"; the schema has no role field, so the page labels the whole section as participating researcher.
// - J1 title: site used "A Diffusion Deformable Model for Coronary 4D CT Synthesis and Dynamic FFR Derivation"; CV official title is "Synthesis of coronary 4D CT image by denoising diffusion probabilistic model" (CMPB 282, 109382, 2026), doi:10.1016/j.cmpb.2026.109382. Site previously marked the DOI as pending and the paper as "Featured" although H.J. Lee is a co-author (T.H. Han first). Site text cited Severance Hospital IRB 4-2024-0685, which is not in the CV. The brief's contribution sentence now follows the CV research-experience bullet (diffusion deformable model, two CT phases, time-resolved FFR).
// - J2 title: site capitalized "Using PPG"; CV has "using PPG". CV confirms H.J. Lee is sole first author. The 2026 Merit Academic Paper Award is linked to J2 through awards[].forPublication.
// - J3 title: site shortened it; CV full title is "Optimization of tricuspid membrane mechanism for effectiveness and leaflet longevity through hemodynamic analysis". H.J. Lee is second (co-)author, Y.W. Kim first. CV gives "vol. 16, no. 1, pp. 1587-1600"; issue folded into volume as "16(1)" because the schema has no issue field.
// - J4 title: site used "Optimization of FFR Prediction Algorithm for the Coronary Gray Zone"; CV official title is "Optimization of FFR prediction algorithm for gray zone by hemodynamic features with synthetic model and biometric data". H.J. Lee and Y.W. Kim are co-first authors.
// - M1: CV heading is "Manuscript Under Revision" (first revision under review); schema type is "under-review". Site previously listed this as "in preparation" with Galaxy Watch / GroupKFold / emergency-department details not in the CV; those details were cut and the ongoing card now renders the CV title and status.
// - Snapshot "Published Papers: 4" counted journal articles only; CV also lists 2 peer-reviewed proceedings (C1, C2) and 1 manuscript under revision (M1). All snapshot copy is now computed from this dataset.
// - C1/C2 venueShort drops the location from the CV venue string for the brief chip; the full CV form stays in venue.
// - Coronary PINO ongoing item: CV says journal manuscript in preparation but names no target journal (site named one); the proceedings version C1 (DMD2026-1091) is published. The ongoing card uses the CV research-experience wording ("Physics-informed neural operators for real-time, patient-specific prediction of coronary flow fields") as its working title and points readers to the C1 brief instead of repeating its method text.
// - Ongoing "PPG-Derived Biomarkers" item previously named Korea University Ansan, Gangnam Severance and EASYCHECK deployment; none appear in the CV. Trimmed to the CV wording "multi-institutional clinical collaborations", with a cross-reference to the site's own Applied Work section.
// - Site talk "2021 Domestic, Optimization of AI Algorithms for FFR Prediction in Gray Zone, 2021 BESCO winter meeting, Gangwon" is absent from the CV and was dropped.
// - Site venue "2022 ICTME" was a typo; CV: 10th International Conference of Manufacturing Technology Engineers (ICMTE) [I5].
// - DMD 2026 talk titles on the site were descriptive; CV titles are used (I1, I2). I2 is T.H. Han et al. (co-author), not presented by H.J. Lee. Venue/location strings follow the CV ("ASME Design of Medical Devices Conference (DMD2026)", "Minneapolis, MN, USA"). The gallery DMD card previously added "University of Minnesota" and April 20–22 dates not in the CV; both were removed.
// - Other venue strings normalized to CV form (ICTAM, ESCHM-ISCH-ISB 2021, KSME Conference Songdo, 18th ACFM, BESCO meetings). I6 title uses "patient-specific" (hyphenated) per CV.
// - Site talk list had 10 entries; CV has 16 (I1-I6, D1-D10). D1-D6 and D10 were missing from the site.
// - Site gallery items "Yonsei department symposium (2024)" and "CARDIOS and product discussion (2025)" have no counterpart in the CV.
// - Site translational section (The M.E.N.D. BioSimulator, CARDIOS, EASYCHECK, YouTube overview) is not in the CV; closest CV item is R4 (TIPS).
// - Site patent list had 7 rows; CV has 16 (12 KR, 2 US, 2 PCT; 2 registered). Site merged KR 10-2022-0030019 and US 17/820,819 into one row; CV lists them as P2 (registered No. 10-2882193, Nov. 2025) and P16 (US, pending). P1 registered as No. 10-2902500 (Dec. 2025).
// - Patent titles normalized to CV wording (P1, P12, P14, P15). P14 application number was previously unconfirmed on the site; CV gives KR 10-2023-0118582.
// - Patent sheet vs CV: the internal patent sheet records P7 (KR 10-2025-0021284) and P12 (KR 10-2024-0028201) as no longer active, while the CV lists both as pending; it also marks P1/P2 as transfer targets although the CV (and the sheet's own registration numbers) show them registered. The dataset follows the CV. Per-patent sheet workflow states were removed from this file because every exported field ships in the public bundle; the sheet itself remains the record. If the TLO confirms P7/P12 are inactive, set their status to "withdrawn": Home.tsx filters that status out of the public list and recomputes every count.
// - Inventor lists: P1 sheet omits M.Y. Yoon; P2 sheet orders Y.W. Kim before H.J. Lee; P16 sheet lists J.S. Lee, Y.W. Kim, H.J. Lee. Dataset follows the CV.
// - P3: CV gives KR 10-2026-0003225; the sheet row (DP-2025-1887) has no application number yet. Sheet lists co-applicants Korea Veterans Health Service and Hanyang University.
// - P4 (US 19/397,163): CV title says "system and method"; sheet's Korean title says method only. Filing date per sheet 2025-11-21.
// - R5 program: CV gives only funder + grant number, so program is left empty.
// - Education, research experience, skills, research projects, awards, fellowships and teaching are now rendered (Background and Achievements sections). Fellowships and projects are kept in CV order here; Home.tsx sorts them by end date.
// - Resume link points to /uploads/resume.pdf; md5-identical to CV_HyeongJunLee.pdf (4 pages) as of this revision. Re-copy it whenever the CV changes.
// - D9 (BESCO Winter Meeting, Seoul, 2022) is printed in the CV as "short oral & poster; Best Paper Award nominee", while AWARDS AND HONORS lists "Best Paper Award, BESCO, 2022". Both lines are reproduced as the CV prints them. If that award was given for D9, change D9.format to "short oral & poster; Best Paper Award" so the talk row does not understate it.

/** A research appointment split into the parts the page composes prose from. */
export type Appointment = {
  role: string;
  org: string;
  /** Project or unit the appointment is attached to, as the CV words it. */
  project: string;
  /** Principal investigator, with the department the CV prints after the name. */
  pi: string;
};

/** The CV's one-line form of an appointment: "Role, Org – project (PI: …)". */
export function appointmentLine(appointment: Appointment): string {
  return `${appointment.role}, ${appointment.org} – ${appointment.project} (PI: ${appointment.pi})`;
}

export type Profile = {
  name: string;
  role: string;
  lab: string;
  department: string;
  university: string;
  pi: string;
  /** Concurrent appointment; experience[] prints it with appointmentLine(). */
  concurrent: Appointment;
  email: string;
  links: {
    scholar: string;
    linkedin: string;
    orcid: string;
    site: string;
  };
  phdDissertation: string;
  phdCompleted: string;
  appointmentNote: string;
};

export type Education = {
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  note?: string;
};

export type Experience = {
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  /** Appointment lines printed under the entry heading in the CV (e.g. "Appointment: …", "Concurrent: …"). */
  notes?: string[];
  bullets: string[];
};

export type PublicationType = "journal" | "proceedings" | "under-review";
export type AuthorRole = "first" | "co-first" | "co-author";

export type Publication = {
  id: string;
  type: PublicationType;
  authors: string;
  title: string;
  /** Venue exactly as the CV prints it (proceedings include the location). */
  venue: string;
  /** Shorter venue label for chips; falls back to venue when absent. */
  venueShort?: string;
  volume?: string;
  article?: string;
  pages?: string;
  year: string;
  doi?: string;
  myRole: AuthorRole;
  status: string;
};

export type TalkCategory = "International" | "Domestic";
export type TalkRole = "presenter" | "co-author";

export type Talk = {
  id: string;
  year: string;
  category: TalkCategory;
  title: string;
  venue: string;
  location: string;
  format: string;
  role: TalkRole;
  note: string;
};

export type PatentJurisdiction = "KR" | "US" | "PCT";
/** "withdrawn" rows are kept for the record but never rendered or counted. */
export type PatentStatus = "registered" | "pending" | "withdrawn";

export type Patent = {
  id: string;
  title: string;
  jurisdiction: PatentJurisdiction;
  applicationNo: string;
  registrationNo?: string;
  registrationDate?: string;
  year: string;
  status: PatentStatus;
  inventors: string;
};

export type Project = {
  id: string;
  title: string;
  funder: string;
  program: string;
  grantNo: string;
  start: string;
  end: string;
};

export type Award = {
  title: string;
  org: string;
  year: string;
  /** Human-readable qualifier shown after the organisation. */
  note?: string;
  /** Publication id the award was given for; Home.tsx links it to the matching research brief. */
  forPublication?: string;
};

export type Fellowship = {
  title: string;
  org: string;
  period: string;
};

export type Teaching = {
  role: string;
  org: string;
  period: string;
};

export type Skills = {
  computational: string[];
  ml: string[];
  data: string[];
  languages: string[];
};

export const profile: Profile = {
  name: "Hyeong Jun Lee",
  role: "Postdoctoral Researcher",
  lab: "Multiscale Fluid Dynamics Lab",
  department: "School of Mechanical Engineering",
  university: "Yonsei University",
  pi: "Prof. Joon Sang Lee",
  concurrent: {
    role: "Project Researcher",
    org: "Yonsei University Health System",
    project: "4D CT-FFR project",
    pi: "Prof. Jung-Sun Kim, Department of Internal Medicine, College of Medicine",
  },
  email: "kochujam369@gmail.com",
  links: {
    scholar: "https://scholar.google.com/citations?user=1NxM3T0AAAAJ&hl=en",
    // The live site's slug; read the LinkedIn maintainer note above before switching to the CV's linkedin.com/in/hyeongjunlee.
    linkedin: "https://www.linkedin.com/in/hyeong-jun-lee-389435247/",
    orcid: "https://orcid.org/0009-0001-5691-3787",
    site: "https://hyeongjunlee.me",
  },
  phdDissertation: "Patient-Specific Computational Hemodynamics: Flow Field Analysis for Cardiovascular Assessment",
  phdCompleted: "Aug. 2026",
  appointmentNote:
    "Technical Research Personnel (alternative military service, through Aug. 2027), Engineering Research Institute, Yonsei University",
};

export const education: Education[] = [
  {
    degree: "Ph.D. in Mechanical Engineering (Integrated M.S.–Ph.D. Program)",
    institution: "Yonsei University",
    location: "Seoul, Republic of Korea",
    start: "Mar. 2020",
    end: "Aug. 2026",
    note:
      'Dissertation: "Patient-Specific Computational Hemodynamics: Flow Field Analysis for Cardiovascular Assessment"; Advisor: Prof. Joon Sang Lee',
  },
  {
    degree: "B.Eng. in Mechanical Engineering",
    institution: "Pusan National University",
    location: "Busan, Republic of Korea",
    start: "Mar. 2016",
    end: "Feb. 2020",
  },
];

export const experience: Experience[] = [
  {
    role: "Postdoctoral Researcher, Multiscale Fluid Dynamics Lab (PI: Prof. Joon Sang Lee)",
    org: "Yonsei University",
    location: "Seoul, Republic of Korea",
    start: "Sep. 2026",
    end: "Present",
    notes: [`Appointment: ${profile.appointmentNote}`, `Concurrent: ${appointmentLine(profile.concurrent)}`],
    bullets: [
      "Physics-informed neural operators for real-time, patient-specific prediction of coronary flow fields (journal manuscript in preparation).",
      "Wearable PPG biomarkers: deep-learning ensemble that predicts fluid-bolus needs from smartwatch PPG spectrograms [M1]; blood pressure, viscosity and hydration estimation.",
      "Dynamic 4D CT-FFR and 4D flow-based coronary risk assessment in government-funded projects (KHIDI, NRF).",
    ],
  },
  {
    role: "Graduate Research Assistant, Multiscale Fluid Dynamics Lab (Advisor: Prof. Joon Sang Lee)",
    org: "Yonsei University",
    location: "Seoul, Republic of Korea",
    start: "Mar. 2020",
    end: "Aug. 2026",
    bullets: [
      "Coronary CT-FFR: built image-based, patient-specific CFD pipelines (incl. lattice Boltzmann method) and a gray-zone FFR prediction algorithm combining hemodynamic features, synthetic vessel models and biometric data [J4].",
      "Physics-informed neural operators: developed a PINO surrogate (PointNet++ branch, Fourier-feature trunk, Navier–Stokes residual regularization) that predicts 3D coronary pressure and velocity fields on unseen geometries in seconds [C1].",
      "Dynamic 4D CT-FFR: contributed to a diffusion deformable model that synthesizes full-cycle 4D coronary CT from two CT phases for time-resolved FFR analysis [J1, C2].",
      "Wearable hemodynamics: designed a physics-constrained CNN-LSTM with a Carreau–Yasuda prior to estimate patient-specific non-Newtonian blood viscosity from smartwatch PPG [J2].",
      "Cardiac device hemodynamics: CFD-based optimization of a tricuspid regurgitation membrane device [J3].",
    ],
  },
  {
    role: "Research Intern",
    org: "E8 (E8IGHT Co., Ltd.)",
    location: "Seoul, Republic of Korea",
    start: "Jan. 2021",
    end: "Jun. 2021",
    bullets: ["Performed lattice Boltzmann method (LBM)-based computational fluid dynamics simulations."],
  },
];

export const publications: Publication[] = [
  {
    id: "J1",
    type: "journal",
    authors: "T.H. Han†, Y.W. Kim, H.J. Lee, J.S. Kim, S.G. Lee, D.H. Yang, H.M. Oh, D.S. Kim, S.Y. Shin, S. Song, J.S. Lee*",
    title: "Synthesis of coronary 4D CT image by denoising diffusion probabilistic model",
    venue: "Computer Methods and Programs in Biomedicine",
    volume: "282",
    article: "109382",
    year: "2026",
    doi: "10.1016/j.cmpb.2026.109382",
    myRole: "co-author",
    status: "Published",
  },
  {
    id: "J2",
    type: "journal",
    authors: "H.J. Lee†, Y.W. Kim, S.Y. Shin, S.L. Lee, C.H. Kim, K.S. Chung*, J.S. Lee*",
    title: "A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment using PPG",
    venue: "Computer Methods and Programs in Biomedicine",
    volume: "265",
    article: "108740",
    year: "2025",
    doi: "10.1016/j.cmpb.2025.108740",
    myRole: "first",
    status: "Published",
  },
  {
    id: "J3",
    type: "journal",
    authors: "Y.W. Kim†, H.J. Lee, S.J. Jung, J.H. Kim*, J.S. Lee*",
    title: "Optimization of tricuspid membrane mechanism for effectiveness and leaflet longevity through hemodynamic analysis",
    venue: "Engineering Applications of Computational Fluid Mechanics",
    // CV: vol. 16, no. 1 (issue folded into volume; no article ID).
    volume: "16(1)",
    pages: "1587–1600",
    year: "2022",
    doi: "10.1080/19942060.2022.2104929",
    myRole: "co-author",
    status: "Published",
  },
  {
    id: "J4",
    type: "journal",
    authors: "H.J. Lee†, Y.W. Kim†, J.H. Kim, Y.J. Lee, J.S. Moon, P. Jeong, J.H. Jeong, J.S. Kim*, J.S. Lee*",
    title: "Optimization of FFR prediction algorithm for gray zone by hemodynamic features with synthetic model and biometric data",
    venue: "Computer Methods and Programs in Biomedicine",
    volume: "220",
    article: "106827",
    year: "2022",
    doi: "10.1016/j.cmpb.2022.106827",
    myRole: "co-first",
    status: "Published",
  },
  {
    // CV section heading: "Manuscript Under Revision".
    id: "M1",
    type: "under-review",
    authors: "H.J. Lee†, J. Myung, J.Y. Hong*, J.S. Lee*",
    title:
      "Multi-Model Deep-Learning Ensemble for Predicting 24-Hour Fluid Bolus Administration from Continuous Photoplethysmography Spectrogram Analysis",
    venue: "Engineering Applications of Artificial Intelligence",
    venueShort: "EAAI",
    year: "",
    myRole: "first",
    status: "First revision under review",
  },
  {
    id: "C1",
    type: "proceedings",
    authors: "H.J. Lee†, T.H. Han, J.S. Kim, S.G. Lee, J.S. Lee*",
    title: "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators",
    venue: "Proc. ASME 2026 Design of Medical Devices Conference (DMD2026), Minneapolis, MN, USA",
    venueShort: "Proc. ASME 2026 Design of Medical Devices Conference (DMD2026)",
    article: "V001T02A010",
    year: "2026",
    doi: "10.1115/DMD2026-1091",
    myRole: "first",
    status: "Published (proceedings)",
  },
  {
    id: "C2",
    type: "proceedings",
    authors: "T.H. Han†, Y.W. Kim, H.J. Lee, J.S. Kim, S.G. Lee, D.H. Yang, H.M. Oh, J.S. Lee*",
    title: "Deriving Dynamic Fractional Flow Reserve From 4D Coronary CT Synthesized by a Diffusion Model",
    venue: "Proc. ASME 2026 Design of Medical Devices Conference (DMD2026), Minneapolis, MN, USA",
    venueShort: "Proc. ASME 2026 Design of Medical Devices Conference (DMD2026)",
    article: "V001T02A011",
    year: "2026",
    doi: "10.1115/DMD2026-1092",
    myRole: "co-author",
    status: "Published (proceedings)",
  },
];

export const talks: Talk[] = [
  {
    id: "I1",
    year: "2026",
    category: "International",
    title: "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators",
    venue: "ASME Design of Medical Devices Conference (DMD2026)",
    location: "Minneapolis, MN, USA",
    format: "poster",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "I2",
    year: "2026",
    category: "International",
    title: "Dynamic Fractional Flow Reserve from 4D Coronary CT Synthesized by a Diffusion Model",
    venue: "ASME Design of Medical Devices Conference (DMD2026)",
    location: "Minneapolis, MN, USA",
    format: "poster",
    role: "co-author",
    note: "T.H. Han et al. (incl. H.J. Lee)",
  },
  {
    id: "I3",
    year: "2025",
    category: "International",
    title: "Patient-Specific Coronary Flow Field Prediction Using Physics-Informed Neural Operators",
    venue: "18th Asian Congress of Fluid Mechanics (ACFM)",
    location: "Seoul, Korea",
    format: "oral",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "I4",
    year: "2024",
    category: "International",
    title: "AI-based Hemorheology Prediction with Patient-Specific Biometric Boundary Conditions",
    venue: "26th International Congress of Theoretical and Applied Mechanics (ICTAM)",
    location: "Daegu, Korea",
    format: "short oral & poster",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "I5",
    year: "2022",
    category: "International",
    title: "Optimization of Artificial Intelligence Algorithms for FFR Prediction in Gray Zone",
    venue: "10th International Conference of Manufacturing Technology Engineers (ICMTE)",
    location: "Gyeonggi-do, Korea",
    format: "oral",
    role: "presenter",
    note: "H.J. Lee, J.S. Lee",
  },
  {
    id: "I6",
    year: "2021",
    category: "International",
    title:
      "Estimating CFD-based CT FFR using lattice Boltzmann method – 3D geometry auto segmentation and novel patient-specific computation",
    venue: "ESCHM-ISCH-ISB 2021",
    location: "Fukuoka, Japan",
    format: "oral",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "D1",
    year: "2025",
    category: "Domestic",
    title: "A Physics-Integrated Deep Learning Approach for Patient-Specific Non-Newtonian Blood Viscosity Assessment using PPG",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Summer Meeting",
    location: "Gwangmyeong",
    format: "poster",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "D2",
    year: "2025",
    category: "Domestic",
    title: "Time-resolved Coronary Flow Visualization from Single-phase CT",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Summer Meeting",
    location: "Gwangmyeong",
    format: "poster",
    role: "co-author",
    note: "T.H. Han et al. (incl. H.J. Lee)",
  },
  {
    id: "D3",
    year: "2024",
    category: "Domestic",
    title: "Arterial Blood Pressure and Blood Viscosity Estimation from AI-based PPG Analysis",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Winter Meeting",
    location: "Seongnam",
    format: "poster",
    role: "co-author",
    note: "D.Y. Lee et al. (incl. H.J. Lee)",
  },
  {
    id: "D4",
    year: "2024",
    category: "Domestic",
    title: "FFR Prediction with Quantum Machine Learning: Accurate and Non-invasive Diagnosis with Limited Features",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Winter Meeting",
    location: "Seongnam",
    format: "poster",
    role: "co-author",
    note: "S.W. Kwon et al. (incl. H.J. Lee)",
  },
  {
    id: "D5",
    year: "2024",
    category: "Domestic",
    title: "Blood viscosity estimation from wearable device using AI-based PPG analysis",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Summer Meeting",
    location: "Daejeon",
    format: "poster",
    role: "co-author",
    note: "D.Y. Lee et al. (incl. H.J. Lee)",
  },
  {
    id: "D6",
    year: "2024",
    category: "Domestic",
    title: "Carved membrane design for tricuspid valve regurgitation treatment",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Summer Meeting",
    location: "Daejeon",
    format: "poster",
    role: "co-author",
    note: "S.E. Kim et al. (incl. H.J. Lee)",
  },
  {
    id: "D7",
    year: "2023",
    category: "Domestic",
    title: "Unlocking Predictive Health Outcomes with Biometric Data",
    venue: "Korean Society of Mechanical Engineers (KSME) Conference",
    location: "Songdo",
    format: "oral",
    role: "presenter",
    note: "H.J. Lee, J.S. Lee",
  },
  {
    id: "D8",
    year: "2023",
    category: "Domestic",
    title: "Modeling Coronary Artery Hemodynamics: Exploring DCNN Surrogate Models in Preliminary Research",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Summer Meeting",
    location: "Daegu",
    format: "oral",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "D9",
    year: "2022",
    category: "Domestic",
    title: "Artificial Intelligence Algorithms for FFR Prediction in Gray Zone by Single-view Angiography",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Winter Meeting",
    location: "Seoul",
    format: "short oral & poster; Best Paper Award nominee",
    role: "presenter",
    note: "H.J. Lee et al.",
  },
  {
    id: "D10",
    year: "2021",
    category: "Domestic",
    title:
      "Autonomous Cardiovascular Hemodynamics Analysis using Patient-Specific CFD Simulation with Unsupervised Learning-based Coronary Artery Segmentation",
    venue: "Biomedical Engineering Society for Circulation (BESCO) Summer Meeting",
    location: "Seoul",
    format: "oral",
    role: "co-author",
    note: "J.H. Kim et al. (incl. H.J. Lee)",
  },
];

export const patents: Patent[] = [
  {
    id: "P1",
    title: "AI-based noninvasive urodynamics test method and apparatus",
    jurisdiction: "KR",
    applicationNo: "10-2022-0085583",
    registrationNo: "10-2902500",
    registrationDate: "Dec. 2025",
    year: "2022",
    status: "registered",
    inventors: "J.S. Lee, M.Y. Yoon, S.C. Ko, H.J. Lee",
  },
  {
    id: "P2",
    title: "Optimization system and method of AI algorithm for prediction coronary artery lesions based on FFR",
    jurisdiction: "KR",
    applicationNo: "10-2022-0030019",
    registrationNo: "10-2882193",
    registrationDate: "Nov. 2025",
    year: "2022",
    status: "registered",
    inventors: "J.S. Lee, H.J. Lee, Y.W. Kim",
  },
  {
    id: "P3",
    title: "Patient-specific coronary flow prediction method based on physics-informed neural operators",
    jurisdiction: "KR",
    applicationNo: "10-2026-0003225",
    year: "2026",
    status: "pending",
    inventors: "J.S. Lee, J.S. Kim, H.J. Lee, S.G. Lee",
  },
  {
    id: "P4",
    title: "Deep learning-based multiphase coronary CT interpolation system and method",
    jurisdiction: "US",
    applicationNo: "19/397,163",
    year: "2025",
    status: "pending",
    inventors: "J.S. Lee, J.S. Kim, S.G. Lee, J.H. Kim, Y.W. Kim, H.J. Lee",
  },
  {
    id: "P5",
    title: "Deep learning-based multiphase coronary CT interpolation system and method",
    jurisdiction: "KR",
    applicationNo: "10-2025-0149607",
    year: "2025",
    status: "pending",
    inventors: "J.S. Lee, J.S. Kim, S.G. Lee, J.H. Kim, Y.W. Kim, H.J. Lee",
  },
  {
    id: "P6",
    title: "Device and method for predicting viscosity using AI in a viscosity prediction system",
    jurisdiction: "PCT",
    applicationNo: "PCT/KR2025/002462",
    year: "2025",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    // Status per CV; the internal sheet disagrees (see header note). Set to "withdrawn" once confirmed.
    id: "P7",
    title: "Device and method for predicting viscosity using AI in a viscosity prediction system",
    jurisdiction: "KR",
    applicationNo: "10-2025-0021284",
    year: "2025",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    id: "P8",
    title: "Deep learning-based multiphase coronary CT interpolation method",
    jurisdiction: "KR",
    applicationNo: "10-2024-0168733",
    year: "2024",
    status: "pending",
    inventors: "J.S. Lee, J.S. Kim, S.G. Lee, J.H. Kim, Y.W. Kim, H.J. Lee",
  },
  {
    id: "P9",
    title: "Method for predicting blood glucose and diabetes using PPG signals and biometric information",
    jurisdiction: "KR",
    applicationNo: "10-2024-0147541",
    year: "2024",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    id: "P10",
    title: "Wearable device for monitoring glaucoma suspect and method for monitoring glaucoma suspect",
    jurisdiction: "PCT",
    applicationNo: "PCT/KR2024/012365",
    year: "2024",
    status: "pending",
    inventors: "J.S. Lee, W.R. Choi, H.J. Lee",
  },
  {
    id: "P11",
    title: "Non-Newtonian fluid viscosity modeling of patient blood using wearable device-based PPG and biometric information",
    jurisdiction: "KR",
    applicationNo: "10-2024-0026709",
    year: "2024",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    // Status per CV; the internal sheet disagrees (see header note). Set to "withdrawn" once confirmed.
    id: "P12",
    title: "Systolic and diastolic viscosity prediction algorithm using wearable device-based PPG and biometric information",
    jurisdiction: "KR",
    applicationNo: "10-2024-0028201",
    year: "2024",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    id: "P13",
    title: "Glucose and diabetes prediction algorithm using wearable device-based PPG and biometric information",
    jurisdiction: "KR",
    applicationNo: "10-2023-0144347",
    year: "2023",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    id: "P14",
    title: "Wearable device for monitoring glaucoma suspect and method for monitoring glaucoma suspect",
    jurisdiction: "KR",
    applicationNo: "10-2023-0118582",
    year: "2023",
    status: "pending",
    inventors: "J.S. Lee, W.R. Choi, H.J. Lee",
  },
  {
    id: "P15",
    title: "Glaucoma diagnosis method and system based on contactless biosignals",
    jurisdiction: "KR",
    applicationNo: "10-2023-0078883",
    year: "2023",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
  {
    id: "P16",
    title: "Optimization system and method of AI algorithm for prediction coronary artery lesions based on FFR",
    jurisdiction: "US",
    applicationNo: "17/820,819",
    year: "2022",
    status: "pending",
    inventors: "J.S. Lee, H.J. Lee",
  },
];

export const projects: Project[] = [
  {
    id: "R1",
    title: "Real-Time Precision Medicine Platform Based on Smart Hemodynamic Indices",
    funder: "National Research Foundation of Korea (NRF)",
    program: "Leading Research Center Program",
    grantNo: "NRF-2022R1A5A1022977",
    start: "Jun. 2022",
    end: "Feb. 2029",
  },
  {
    id: "R2",
    title: "4D Coronary Flow Visualization from CT in Real Time (4D CT-FFR)",
    funder: "Ministry of Health and Welfare / KHIDI",
    program: "Clinical-Needs Translational Research",
    grantNo: "RS-2024-00406717",
    start: "Apr. 2024",
    end: "Dec. 2026",
  },
  {
    id: "R3",
    title:
      "4D Flow-Based Diagnostic Device for Dynamic Risk Assessment of Anomalous Origin of the Coronary Artery in Children and Adolescents",
    funder: "Ministry of Health and Welfare / KHIDI",
    program: "Pediatric Disease R&D Program",
    grantNo: "RS-2025-02263580",
    start: "Apr. 2025",
    end: "Dec. 2028",
  },
  {
    id: "R4",
    title: "Patient-Specific Coronary Artery Disease Risk Analysis Software",
    funder: "Ministry of SMEs and Startups",
    program: "Startup Growth Technology Development Program (TIPS)",
    grantNo: "RS-2024-00441761",
    start: "Jul. 2024",
    end: "Jun. 2026",
  },
  {
    id: "R5",
    title: "Patient-Specific Implantable Device for Tricuspid Regurgitation Using 3D Heart Printing and 4D-CFD Simulation",
    funder: "Ministry of Health and Welfare / Korea Medical Device Development Fund",
    program: "",
    grantNo: "KMDF_PR_20200901_0104",
    start: "Sep. 2020",
    end: "Dec. 2025",
  },
  {
    id: "R6",
    title: "Variable Negative-Pressure Tunnel for Respiratory Infection Control",
    funder: "Ministry of Health and Welfare / KHIDI",
    program: "Infectious Disease Medical Safety Technology Program",
    grantNo: "HG22C0001",
    start: "Apr. 2022",
    end: "Dec. 2024",
  },
  {
    id: "R7",
    title: "High-Speed Point-of-Care FFR Simulator for Cardiovascular Diagnosis and Treatment",
    funder: "NRF",
    program: "Bio & Medical Technology Development Program",
    grantNo: "2017M3A9E907337122",
    start: "Feb. 2020",
    end: "May 2022",
  },
];

export const awards: Award[] = [
  {
    title: "Merit Academic Paper Award",
    org: "School of Mechanical Engineering, Yonsei University",
    year: "2026",
    // CV: "(for [J2])".
    note: "for the 2025 CMPB paper on PPG-based non-Newtonian blood viscosity assessment",
    forPublication: "J2",
  },
  {
    title: "Best Paper Award",
    org: "Biomedical Engineering Society for Circulation (BESCO)",
    year: "2022",
  },
  {
    title: "Merit Academic Paper Award",
    org: "Yonsei University",
    year: "2022",
  },
  {
    title: "Best Paper Award",
    org: "School of Mechanical Engineering, Yonsei University",
    year: "2022",
  },
];

export const fellowships: Fellowship[] = [
  {
    title: "BK21 FOUR Graduate Research Scholarship (7 semesters)",
    org: "Ministry of Education / NRF",
    period: "2022 – 2025",
  },
  {
    title: "BK21 PLUS Scholarship",
    org: "Ministry of Education / NRF",
    period: "2020 – 2021",
  },
  {
    title: "Academic Research Fellowship (ARF)",
    org: "Yonsei University",
    period: "2021",
  },
];

export const teaching: Teaching[] = [
  {
    role: "Teaching Assistant",
    org: "School of Mechanical Engineering, Yonsei University",
    period: "Mar. 2020 – Dec. 2020",
  },
];

export const skills: Skills = {
  computational: [
    "image-based, patient-specific coronary CFD",
    "lattice Boltzmann method",
    "hemodynamic indices (FFR, wall shear stress)",
    "non-Newtonian blood rheology",
  ],
  ml: [
    "physics-informed neural networks and neural operators (DeepONet/PINO)",
    "surrogate modeling",
    "diffusion models",
    "CNN/LSTM",
    "ensemble learning",
  ],
  data: [
    "coronary CT angiography (incl. 4D CT)",
    "invasive FFR",
    "smartwatch PPG signals",
    "multi-institutional clinical collaborations",
  ],
  languages: ["Korean (native)", "English (professional working proficiency)"],
};
