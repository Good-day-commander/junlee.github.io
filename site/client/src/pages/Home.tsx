/*
  Design reminder for this file:
  Institutional Editorial Modernism.
  카드형 포트폴리오보다 연구 리포트 첫 페이지처럼 보이게 만들고,
  큰 헤드라인과 긴 문단, 연구 브리프 중심 구성을 유지한다.
  사진은 인물 브랜딩을 보조하는 밀도 있는 편집 요소처럼 다룬다.

  Content lives in @/data/content (derived from the CV). This file only
  arranges that content; edit the dataset first, prose second. Every count in
  the prose is computed from the dataset, and the hero, profile card and
  snapshot cards read names, dates, titles and funders from it. The remaining
  sentences (brief focus text, ongoing notes, section intros) are editorial.
*/
import { ArrowUpRight, FileText, Linkedin, Mail, MoveRight } from "lucide-react";
import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  awards,
  education,
  experience,
  fellowships,
  patents,
  profile,
  projects,
  publications,
  skills,
  talks,
  teaching,
  type AuthorRole,
  type Patent,
  type PatentJurisdiction,
  type Project,
  type Publication,
  type Talk,
} from "@/data/content";

// ---------------------------------------------------------------------------
// Dataset helpers
// ---------------------------------------------------------------------------

/** Looks a publication up by id. Returns undefined (instead of throwing) so a
 *  renamed id drops one brief rather than blanking the whole page. */
function findPublication(id: string): Publication | undefined {
  return publications.find((item) => item.id === id);
}

function doiUrl(publication: Publication | undefined): string {
  return publication?.doi ? `https://doi.org/${publication.doi}` : "";
}

const AUTHOR_BADGE: Record<AuthorRole, string> = {
  first: "First author",
  "co-first": "Co-first author",
  "co-author": "Co-author",
};

function yearOf(dateLabel: string): string {
  const match = dateLabel.match(/\d{4}/);
  return match ? match[0] : dateLabel;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Expands the CV's "Aug. 2026" to "August 2026" for running prose; other labels pass through unchanged. */
function longDate(label: string): string {
  const match = label.match(/^([A-Za-z]{3})\.?\s+(\d{4})$/);
  if (!match) return label;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  return month >= 0 ? `${MONTH_NAMES[month]} ${match[2]}` : label;
}

/** Sortable key for labels such as "Jun. 2022", "May 2022", "2021" or "Present". */
function dateKey(label: string, fallbackMonth: number): number {
  if (/present/i.test(label)) return Number.MAX_SAFE_INTEGER;
  const yearMatch = label.match(/\d{4}/);
  if (!yearMatch) return 0;
  const monthMatch = label.match(/[A-Za-z]{3}/);
  const month = monthMatch ? MONTHS.indexOf(monthMatch[0].toLowerCase()) : -1;
  return Number(yearMatch[0]) * 12 + (month >= 0 ? month : fallbackMonth);
}

/** Splits "2022 – 2025" / "Mar. 2020 – Dec. 2020" / "2021" into sortable start and end keys. */
function periodKeys(period: string): { start: number; end: number } {
  const parts = period.split(/\s*[–-]\s*/);
  const start = dateKey(parts[0], 0);
  const end = dateKey(parts[parts.length - 1], 11);
  return { start, end };
}

function byEndThenStartDesc(a: { start: number; end: number }, b: { start: number; end: number }): number {
  if (a.end !== b.end) return b.end - a.end;
  return b.start - a.start;
}

/** Funder or program acronym for prose: "NRF", "KHIDI", "KMDF", "TIPS". */
function funderAcronym(project: Project): string {
  const funder = project.funder;
  if (funder.includes("Korea Medical Device Development Fund")) return "KMDF";
  if (funder.includes("KHIDI")) return "KHIDI";
  if (funder.includes("SMEs and Startups")) return "TIPS";
  if (funder.includes("NRF") || funder.includes("National Research Foundation")) return "NRF";
  return funder;
}

/** Row tag; TIPS is a program, so its tag also names the ministry. */
function funderTag(project: Project): string {
  const acronym = funderAcronym(project);
  return acronym === "TIPS" ? "MSS · TIPS" : acronym;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

function numberWord(count: number): string {
  return NUMBER_WORDS[count] ?? String(count);
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

/** "a, b, and c" (Oxford comma), "a and b", or "a". */
function listWords(items: string[]): string {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** The CV cites its own entries as "[J2]" or "[J1, C2]"; the page never shows those keys. */
function stripCitationKeys(text: string): string {
  return text.replace(/\s*\[[A-Z]\d+(?:,\s*[A-Z]\d+)*\]/g, "");
}

// ---------------------------------------------------------------------------
// Public subsets and counts (everything in prose below derives from these)
// ---------------------------------------------------------------------------

/** Patents marked "withdrawn" stay in the dataset for the record but never reach the page. */
const publicPatents: Patent[] = patents.filter((patent) => patent.status !== "withdrawn");

const journalCount = publications.filter((item) => item.type === "journal").length;
const proceedingsCount = publications.filter((item) => item.type === "proceedings").length;
const peerReviewedCount = journalCount + proceedingsCount;
const leadAuthorCount = publications.filter(
  (item) => item.type !== "under-review" && (item.myRole === "first" || item.myRole === "co-first"),
).length;
const underReviewCount = publications.filter((item) => item.type === "under-review").length;

const registeredPatents = publicPatents.filter((patent) => patent.status === "registered");
const patentCountBy = (jurisdiction: PatentJurisdiction) =>
  publicPatents.filter((patent) => patent.jurisdiction === jurisdiction).length;
const registeredYears = Array.from(
  new Set(registeredPatents.map((patent) => yearOf(patent.registrationDate ?? patent.year))),
).sort();
const registeredLabel = registeredPatents.every((patent) => patent.jurisdiction === "KR")
  ? "registered Korean patents"
  : "registered patents";

const internationalTalkCount = talks.filter((talk) => talk.category === "International").length;
const domesticTalkCount = talks.filter((talk) => talk.category === "Domestic").length;

const firstProjectYear = Math.min(...projects.map((project) => Number(yearOf(project.start))));

/** Funders in dataset (CV) order, e.g. "NRF, KHIDI, TIPS, and KMDF". */
const funderList = listWords(Array.from(new Set(projects.map(funderAcronym))));

/** The open-ended appointment in the CV ("Sep. 2026 – Present") supplies the "since" date on the profile card. */
const currentAppointment = experience.find((item) => /present/i.test(item.end)) ?? experience[0];

/** The CV never abbreviates the lab; "(MFDL)" is the owner's editorial addition (see the dataset's maintainer notes). */
const labWithAcronym = `${profile.lab} (MFDL)`;

/** Venues called out in the Presentations card. The pick is editorial; counts, formats and years come from the talks. */
const TALK_HIGHLIGHTS: { venueMatch: string; shortName: string }[] = [
  { venueMatch: "Asian Congress of Fluid Mechanics", shortName: "ACFM" },
  { venueMatch: "DMD2026", shortName: "DMD" },
];

/** "one oral talk at ACFM 2025", "two posters at DMD 2026"; undefined when no talk matches. */
function talkHighlight({ venueMatch, shortName }: { venueMatch: string; shortName: string }): string | undefined {
  const matches = talks.filter((talk) => talk.venue.includes(venueMatch));
  if (matches.length === 0) return undefined;
  const formats = new Set(matches.map((talk) => talk.format));
  const format = formats.size === 1 ? matches[0].format : "presentation";
  const noun = format === "oral" ? "oral talk" : format;
  const years = Array.from(new Set(matches.map((talk) => talk.year))).sort().join("/");
  return `${numberWord(matches.length)} ${plural(matches.length, noun)} at ${shortName} ${years}`;
}

const talkHighlightText = listWords(TALK_HIGHLIGHTS.map(talkHighlight).filter((text): text is string => Boolean(text)));

// ---------------------------------------------------------------------------
// Snapshot cards (values and copy computed from the dataset)
// ---------------------------------------------------------------------------

const snapshots = [
  {
    label: "Peer-reviewed papers",
    value: String(peerReviewedCount),
    copy: [
      `${capitalize(numberWord(journalCount))} SCIE journal ${plural(journalCount, "article")} and ${numberWord(proceedingsCount)} peer-reviewed conference ${plural(proceedingsCount, "proceedings paper")}; ${numberWord(leadAuthorCount)} as first or co-first author.`,
      underReviewCount > 0
        ? `${capitalize(numberWord(underReviewCount))} more ${plural(underReviewCount, "manuscript")} under revision.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  },
  {
    label: "Patents",
    value: String(publicPatents.length),
    copy: `${capitalize(numberWord(publicPatents.length))} ${plural(publicPatents.length, "application")} in total (${patentCountBy("KR")} Korea, ${patentCountBy("US")} US, ${patentCountBy("PCT")} PCT); ${numberWord(registeredPatents.length)} ${registeredLabel} (${registeredYears.join(", ")}).`,
  },
  {
    label: "Funded projects",
    value: String(projects.length),
    copy: `Participating researcher on ${funderList} programs since ${firstProjectYear}, including the 4D CT-FFR translational project.`,
  },
  {
    label: "Conference contributions",
    value: String(talks.length),
    copy: `${capitalize(numberWord(internationalTalkCount))} international and ${numberWord(domesticTalkCount)} domestic conference presentations, ${numberWord(talks.filter((talk) => talk.role === "presenter").length)} of them presented in person${talkHighlightText ? `, including ${talkHighlightText}` : ""}.`,
  },
];

// ---------------------------------------------------------------------------
// Research briefs: dataset metadata + editorial prose
// ---------------------------------------------------------------------------

type BriefLink = { label: string; href: string };

/** Editorial half of a brief; the bibliographic half comes from the publication with the same id. */
type BriefSpec = {
  id: string;
  focus: string;
  points: string[];
  image: string;
  alt: string;
  figureBg?: CSSProperties;
  extraLinks?: BriefLink[];
};

type Brief = BriefSpec & {
  status: string;
  authorBadge: string;
  title: string;
  journal: string;
  year: string;
  doi: string;
  doiLabel: string;
};

const C1 = findPublication("C1");
const C2 = findPublication("C2");
const M1 = findPublication("M1");
const P3 = patents.find((patent) => patent.id === "P3");

const briefSpecs: BriefSpec[] = [
  {
    id: "J2",
    focus:
      "A non-invasive pipeline that estimates patient-specific, shear-rate-dependent blood viscosity from wearable PPG. The network is constrained by the Carreau–Yasuda rheological model, keeping its predictions physically admissible across varying flow conditions.",
    points: [
      "Reframes viscosity estimation as a patient-specific inverse problem rather than population-level screening.",
      "Couples a 1D CNN-LSTM backbone with Carreau–Yasuda priors so the output respects non-Newtonian physics.",
      "Positions consumer-grade wearables as a credible entry point for circulatory assessment.",
    ],
    image: "/media/papers/extracted/viscosity-000.png",
    alt: "Figure from the 2025 PPG-based blood viscosity paper showing the physics-integrated modeling workflow.",
  },
  {
    id: "C1",
    focus:
      "A physics-informed neural operator that predicts full 3D pressure and velocity fields on unseen patient-specific coronary geometries. A PointNet++ branch encodes the vessel geometry and a Fourier-feature trunk encodes query coordinates, composed as a DeepONet and regularized with Navier–Stokes residuals, so that a CFD-grade flow field is recovered in seconds instead of hours.",
    points: [
      "Replaces hours of patient-specific CFD with a seconds-scale surrogate that still honors the governing equations.",
      "Generalizes across coronary geometries rather than fitting one vessel at a time.",
      P3
        ? `Underpins the journal manuscript now in preparation and the PINO patent application (KR ${P3.applicationNo}).`
        : "Underpins the journal manuscript now in preparation and the PINO patent application.",
    ],
    image: "/media/papers/extracted/pino-dmd2026.png",
    alt: "Pressure and velocity fields on a coronary artery: CFD ground truth next to the PINO prediction, from the DMD 2026 paper.",
  },
  {
    id: "J4",
    focus:
      "Coronary \"gray-zone\" lesions (FFR ≈ 0.75–0.80) are where diagnostic decisions are hardest. Combining CTA-derived morphology, CFD-derived hemodynamic descriptors, and patient biometrics improves prediction stability precisely in this ambiguous band.",
    points: [
      "Treats gray-zone classification as physics-informed feature design rather than pure black-box learning.",
      "Integrates synthetic vessel models with patient biometric data for robustness.",
    ],
    image: "/media/papers/extracted/ffr-000.png",
    alt: "Visualization from the 2022 coronary gray-zone FFR prediction study.",
  },
  {
    id: "J1",
    focus:
      "A denoising diffusion pipeline that synthesizes physiologically consistent, full-cycle 4D coronary CT from two acquired CT phases, enabling time-resolved FFR analysis across the cardiac cycle. First-authored by T.H. Han; I contributed to the diffusion deformable model that generates the 4D sequence used for the time-resolved FFR analysis.",
    points: [
      "Couples a diffusion deformable model with downstream CFD to recover time-resolved coronary physiology.",
      "Bridges static coronary CTA and invasive pressure-wire measurement in a single workflow.",
      "Moves dynamic FFR from research-only toward clinically realistic imaging workflows.",
    ],
    image: "/media/papers/extracted/4dct-figure1.png",
    alt: "Figure 1 from the 4D coronary CT diffusion paper, showing the diffusion-deformation framework for dynamic FFR derivation.",
    figureBg: {
      background: "rgba(255, 255, 255, 0.98)",
      boxShadow: "inset 0 0 0 1px rgba(16, 24, 40, 0.03)",
    },
    extraLinks: C2
      ? [
          {
            label: "Companion proceedings (ASME DMD 2026)",
            href: doiUrl(C2),
          },
        ]
      : undefined,
  },
  {
    id: "J3",
    focus:
      "CFD work on valvular hemodynamics that ran in parallel with the coronary flow modeling line. This study examines how tricuspid membrane geometry changes the balance between regurgitation control and long-term leaflet durability, turning device and procedural design into a measurable flow optimization problem.",
    points: [
      "Quantifies how membrane geometry reshapes flow separation, regurgitation control, and mechanical burden in tandem.",
      "Frames valvular intervention design as a hemodynamic optimization problem rather than a purely geometric one.",
    ],
    image: "/media/papers/extracted/tricuspid-000.png",
    alt: "Hemodynamic visualization from the 2022 tricuspid membrane optimization study.",
  },
];

const STATUS_LABEL: Record<Publication["type"], string> = {
  journal: "Published",
  proceedings: "Peer-reviewed proceedings",
  "under-review": "Under revision",
};

/** A spec whose publication id is missing from the dataset is skipped, not fatal. */
const briefs: Brief[] = briefSpecs.flatMap((spec) => {
  const publication = findPublication(spec.id);
  if (!publication) return [];
  return [
    {
      ...spec,
      status: STATUS_LABEL[publication.type],
      authorBadge: AUTHOR_BADGE[publication.myRole],
      title: publication.title,
      journal: publication.venueShort ?? publication.venue,
      year: publication.year,
      doi: doiUrl(publication),
      doiLabel: "View DOI",
    },
  ];
});

function briefAnchor(publicationId: string): string {
  return `brief-${publicationId}`;
}

function briefChip(brief: Brief): string {
  return brief.journal.includes(brief.year) ? brief.journal : `${brief.journal} · ${brief.year}`;
}

// ---------------------------------------------------------------------------
// Ongoing work (titles and statuses from the dataset; notes are editorial)
// ---------------------------------------------------------------------------

type OngoingCard = { label: string; title: string; note: string };

const ongoingProjects: OngoingCard[] = [
  ...(C1
    ? [
        {
          label: "Coronary PINO · journal manuscript in preparation",
          // Working title taken from the CV's research-experience bullet, so the card does not repeat the C1 brief's title verbatim.
          title: "Physics-informed neural operators for real-time, patient-specific prediction of coronary flow fields",
          note: "Journal extension of the DMD 2026 proceedings paper summarized in the research briefs above; the same neural operator and its evaluation are being extended for a full-length journal article.",
        },
      ]
    : []),
  ...(M1
    ? [
        {
          label: `Fluid-loading AI · ${STATUS_LABEL[M1.type].toLowerCase()} (${M1.venueShort ?? M1.venue})`,
          title: M1.title,
          note: `A multi-model deep-learning ensemble that predicts fluid-bolus needs over the following 24 hours from continuous smartwatch (Galaxy Watch) PPG spectrograms, flagging emergency-department patients who may later require a fluid bolus despite an initially stable presentation. Validated with GroupKFold splits and bias-corrected ensemble aggregation. ${M1.status} at ${M1.venue}.`,
        },
      ]
    : []),
  {
    label: "Wearable biomarkers · multi-study program",
    title: "PPG-Derived Biomarkers: Blood Pressure, Viscosity, Hydration, and Glaucoma-Relevant Signals",
    note: "Extends wearable PPG modeling into a broader biomarker program: blood pressure, non-Newtonian viscosity, hydration index, and glaucoma-relevant ocular perfusion markers. Multi-institutional collaborations across Severance, Korea University Ansan, and Gangnam Severance. Deployed as EASYCHECK (see Applied Work below).",
  },
];

// ---------------------------------------------------------------------------
// Gallery and translational work (site-only material; not in the CV)
// ---------------------------------------------------------------------------

const galleryMoments = [
  {
    label: "Research Talk · 2024",
    title: "Yonsei department symposium",
    note: "Lab presentation on ongoing cardiovascular AI work.",
    image: "/media/profile/gallery-talk-yonsei.jpg",
    alt: "Hyeong Jun Lee presenting cardiovascular AI research at a Yonsei department symposium.",
  },
  {
    label: "Conference Talk · 2025",
    title: "18th Asian Congress of Fluid Mechanics",
    note: "Oral presentation on patient-specific coronary flow field prediction using physics-informed neural operators at ACFM 2025, Seoul, Korea.",
    image: "/media/profile/gallery-acfm-2025.jpg",
    alt: "Conference photograph from ACFM 2025 where the coronary PINO work was presented.",
  },
  {
    label: "Conference · 2026",
    title: "ASME Design of Medical Devices Conference (DMD 2026)",
    note: "Two posters at DMD 2026, Minneapolis, MN, USA: PINO-based coronary flow field prediction, and dynamic FFR from 4D coronary CT synthesized by a diffusion model.",
    image: "/media/profile/gallery-dmd-2026.jpg",
    alt: "Conference image associated with DMD 2026 presentations on PINO and 4D CT diffusion research.",
  },
  {
    label: "Product & Startup · 2025",
    title: "CARDIOS and product discussion",
    note: "Translation-facing discussion around CARDIOS, connecting the coronary CT-FFR research pipeline to clinical workflow design.",
    image: "/media/profile/gallery-translation-summit.jpg",
    alt: "Discussion scene around CARDIOS and its connection to clinical workflow design.",
  },
];

const translationalProducts = [
  {
    name: "CARDIOS",
    label: "Coronary CT diagnostics",
    summary:
      "A CT-based coronary decision-support system that estimates whether a coronary lesion is functionally significant — without requiring invasive pressure-wire measurement. By combining coronary anatomy with CFD-informed hemodynamics and deep learning, it is designed to reduce unnecessary catheterization and support faster, more confident triage in ambiguous coronary disease. Within my portfolio, CARDIOS is the translational outlet of my CT-FFR and coronary flow modeling work.",
    detail: "",
    support: "CTA × AI × CFD × clinical triage",
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
  note: "A short external overview for visitors who want product context without interrupting the reading flow of the portfolio.",
  href: "https://www.youtube.com/watch?v=oSsvH7LRp7E",
  thumbnail: "https://i.ytimg.com/vi/oSsvH7LRp7E/hqdefault.jpg",
  alt: "YouTube thumbnail for the CARDIOS product overview video.",
};

// ---------------------------------------------------------------------------
// Achievements: talks, patents, funded projects, awards (all from the dataset)
// ---------------------------------------------------------------------------

const ACHIEVEMENT_PREVIEW_COUNT = 4;
const TALK_LIST_ID = "achievement-talk-list";
const PATENT_LIST_ID = "achievement-patent-list";

const CATEGORY_ORDER: Record<Talk["category"], number> = { International: 0, Domestic: 1 };

const sortedTalks: Talk[] = [...talks].sort((a, b) => {
  const yearDiff = Number(b.year) - Number(a.year);
  if (yearDiff !== 0) return yearDiff;
  return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
});

/** One row per patent family: filings that share a title (KR/US/PCT counterparts) are shown together. */
type PatentFamily = {
  /** Id of the leading filing; unique across families, used as the React key. */
  key: string;
  title: string;
  /** Registered filings first, then newest first. */
  members: Patent[];
  jurisdictions: PatentJurisdiction[];
  registered: boolean;
  /** "2023–2024" when the filings span years, otherwise a single year. */
  yearLabel: string;
  latestYear: number;
};

function groupPatentFamilies(list: Patent[]): PatentFamily[] {
  const byTitle = new Map<string, Patent[]>();
  for (const patent of list) {
    const group = byTitle.get(patent.title);
    if (group) group.push(patent);
    else byTitle.set(patent.title, [patent]);
  }
  return Array.from(byTitle.values()).map((group) => {
    const members = [...group].sort((a, b) => {
      if (a.status !== b.status) return a.status === "registered" ? -1 : 1;
      return Number(b.year) - Number(a.year);
    });
    const years = members.map((patent) => Number(patent.year));
    const earliest = Math.min(...years);
    const latest = Math.max(...years);
    return {
      key: members[0].id,
      title: members[0].title,
      members,
      jurisdictions: Array.from(new Set(members.map((patent) => patent.jurisdiction))),
      registered: members.some((patent) => patent.status === "registered"),
      yearLabel: earliest === latest ? String(latest) : `${earliest}–${latest}`,
      latestYear: latest,
    };
  });
}

/** Families with a registered filing first, then by most recent filing year (ties keep CV order). */
const patentFamilies: PatentFamily[] = groupPatentFamilies(publicPatents).sort((a, b) => {
  if (a.registered !== b.registered) return a.registered ? -1 : 1;
  return b.latestYear - a.latestYear;
});

const sortedProjects: Project[] = [...projects].sort((a, b) =>
  byEndThenStartDesc({ start: dateKey(a.start, 0), end: dateKey(a.end, 11) }, { start: dateKey(b.start, 0), end: dateKey(b.end, 11) }),
);

const PATENT_NUMBER_PREFIX: Record<PatentJurisdiction, string> = {
  KR: "Korean Patent No.",
  US: "US Patent No.",
  PCT: "Patent No.",
};

/** One filing in the CV's wording: "Korean Patent No. 10-2882193 (registered Nov. 2025; KR Appl. No. 10-2022-0030019)" or "US Appl. No. 17/820,819". */
function patentFilingDetail(patent: Patent): string {
  const application =
    patent.jurisdiction === "PCT" ? `Appl. No. ${patent.applicationNo}` : `${patent.jurisdiction} Appl. No. ${patent.applicationNo}`;
  if (patent.status === "registered" && patent.registrationNo) {
    const registered = patent.registrationDate ? `registered ${patent.registrationDate}` : "registered";
    return `${PATENT_NUMBER_PREFIX[patent.jurisdiction]} ${patent.registrationNo} (${registered}; ${application})`;
  }
  return application;
}

function patentFamilyDetail(family: PatentFamily): string {
  return family.members.map(patentFilingDetail).join(" · ");
}

/** "Registered" when every filing in the family is registered, "Registered (KR)" when only some are. */
function registrationTag(family: PatentFamily): string | undefined {
  const registered = family.members.filter((patent) => patent.status === "registered");
  if (registered.length === 0) return undefined;
  if (registered.length === family.members.length) return "Registered";
  return `Registered (${Array.from(new Set(registered.map((patent) => patent.jurisdiction))).join(", ")})`;
}

function projectDetail(project: Project): string {
  return project.program ? `${project.program} · ${project.grantNo}` : project.grantNo;
}

type HonorRow = {
  key: string;
  period: string;
  tag: "Award" | "Fellowship" | "Teaching";
  title: string;
  detail: string;
  /** Optional qualifier, linked to a research brief when the dataset names one. */
  note?: { text: string; href?: string };
};

function sortRows<T extends { period: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => byEndThenStartDesc(periodKeys(a.period), periodKeys(b.period)));
}

const honorRows: HonorRow[] = [
  ...sortRows(
    awards.map<HonorRow>((item, index) => {
      const linkedBrief = item.forPublication && briefs.some((brief) => brief.id === item.forPublication);
      return {
        key: `award-${index}`,
        period: item.year,
        tag: "Award",
        title: item.title,
        detail: item.org,
        note: item.note
          ? { text: item.note, href: linkedBrief ? `#${briefAnchor(item.forPublication as string)}` : undefined }
          : undefined,
      };
    }),
  ),
  ...sortRows(
    fellowships.map<HonorRow>((item, index) => ({
      key: `fellowship-${index}`,
      period: item.period,
      tag: "Fellowship",
      title: item.title,
      detail: item.org,
    })),
  ),
  ...sortRows(
    teaching.map<HonorRow>((item, index) => ({
      key: `teaching-${index}`,
      period: item.period,
      tag: "Teaching",
      title: item.role,
      detail: item.org,
    })),
  ),
];

// ---------------------------------------------------------------------------
// Background: education, research experience, skills (from the dataset)
// ---------------------------------------------------------------------------

const skillRows: { label: string; items: string[] }[] = [
  { label: "Computational modeling", items: skills.computational },
  { label: "Machine learning", items: skills.ml },
  { label: "Biomedical data", items: skills.data },
  { label: "Languages", items: skills.languages },
];

// ---------------------------------------------------------------------------
// Contact (from profile)
// ---------------------------------------------------------------------------

const contactLinks = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "Google Scholar", href: profile.links.scholar },
  { label: "LinkedIn", href: profile.links.linkedin },
  { label: "ORCID", href: profile.links.orcid },
];

// ---------------------------------------------------------------------------
// Shared row typography (achievement columns and background rows)
// ---------------------------------------------------------------------------

const COLUMN_HEADING_CLASS =
  "font-display mt-2 text-[1.42rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--ink)] md:text-[1.72rem]";
const ROW_TITLE_CLASS =
  "font-display text-[1.08rem] font-semibold leading-[1.18] tracking-[-0.03em] text-[var(--ink)] md:text-[1.26rem]";
const ROW_VENUE_CLASS = "text-sm font-semibold uppercase tracking-[0.14em] text-[var(--blue)]";
const ROW_DETAIL_CLASS = "text-sm leading-7 text-[color:var(--ink-soft)]";

/** Collapsing a 16-row list leaves the reader deep in the next section; this scrolls the column head back into view. */
function useScrollBackOnCollapse(expanded: boolean, headRef: RefObject<HTMLElement | null>): void {
  const wasExpanded = useRef(expanded);
  useLayoutEffect(() => {
    if (wasExpanded.current && !expanded) headRef.current?.scrollIntoView({ block: "nearest" });
    wasExpanded.current = expanded;
  }, [expanded, headRef]);
}

export default function Home() {
  const [showAllTalks, setShowAllTalks] = useState(false);
  const [showAllPatents, setShowAllPatents] = useState(false);
  const talkHeadRef = useRef<HTMLDivElement>(null);
  const patentHeadRef = useRef<HTMLDivElement>(null);
  useScrollBackOnCollapse(showAllTalks, talkHeadRef);
  useScrollBackOnCollapse(showAllPatents, patentHeadRef);

  const visibleTalks = showAllTalks ? sortedTalks : sortedTalks.slice(0, ACHIEVEMENT_PREVIEW_COUNT);
  const visiblePatentFamilies = showAllPatents ? patentFamilies : patentFamilies.slice(0, ACHIEVEMENT_PREVIEW_COUNT);

  return (
    <div className="editorial-shell site-frame">
      <header className="editorial-nav">
        <div className="container flex items-center justify-between gap-6 py-4">
          <a href="#top" className="font-display text-lg font-semibold tracking-[-0.05em] whitespace-nowrap text-[var(--ink)]">
            {profile.name}
          </a>
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            <a className="nav-link" href="#research">
              Research
            </a>
            <a className="nav-link" href="#ongoing">
              Ongoing
            </a>
            <a className="nav-link" href="#gallery">
              Gallery
            </a>
            <a className="nav-link" href="#translation">
              Applied Work
            </a>
            <a className="nav-link" href="#achievements">
              Achievements
            </a>
            <a className="nav-link" href="#background">
              Background
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
                  <h1 className="hero-title max-w-[13ch]">Modeling the heart — in flow, in imaging, and on the wrist.</h1>
                </div>
                <div className="hero-meta-rule max-w-5xl" />
                <div className="space-y-6">
                  <p className="lede max-w-3xl">
                    I am a {profile.role.toLowerCase()} at the <strong>{labWithAcronym}</strong>, {profile.department},{" "}
                    <strong>{profile.university}</strong> (PI: <strong>{profile.pi}</strong>), and concurrently a{" "}
                    {profile.concurrent.role.toLowerCase()} on the {profile.concurrent.project} at <strong>{profile.concurrent.org}</strong>{" "}
                    (PI: {profile.concurrent.pi}). I completed my Ph.D. in mechanical engineering at Yonsei in {longDate(profile.phdCompleted)}{" "}
                    with the dissertation &ldquo;{profile.phdDissertation}&rdquo;.
                    My work spans three connected fronts: physics-informed neural operators for coronary flow, diffusion-based 4D CT
                    synthesis for dynamic FFR, and wearable PPG analytics for non-invasive biomarkers. The goal is to make fluid mechanics
                    and physiological signals interpretable enough for real clinical decisions: the point where a model stops being an
                    abstraction and starts carrying information a clinician can actually use.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a className="capsule-link" href="#research">
                      Explore research briefs <MoveRight className="size-4" />
                    </a>
                    <a className="capsule-link" href="/uploads/resume.pdf" target="_blank" rel="noreferrer">
                      View CV (PDF) <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </div>
              </div>

              <aside className="hero-profile-wrap">
                <div className="portrait-card">
                  <div className="micro-label w-fit">Profile</div>
                  <div className="portrait-frame hero-portrait-frame mt-4">
                    <img
                      src="/media/profile/profile-main.jpg"
                      alt="Portrait of Hyeong Jun Lee, postdoctoral researcher in mechanical engineering at Yonsei University"
                    />
                  </div>
                  <div className="hero-profile-meta mt-5 text-sm text-[color:var(--ink-soft)]">
                    <div className="hero-profile-item">
                      <div className="eyebrow">Affiliation</div>
                      <p className="hero-profile-copy">
                        {labWithAcronym}, {profile.department}, {profile.university}
                      </p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Principal investigator</div>
                      <p className="hero-profile-copy">{profile.pi}</p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Role</div>
                      <p className="hero-profile-copy">
                        {profile.role} (since {currentAppointment.start}) · Ph.D., Mechanical Engineering, {yearOf(profile.phdCompleted)}
                      </p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Concurrent</div>
                      <p className="hero-profile-copy">
                        {profile.concurrent.role}, {profile.concurrent.org} — {profile.concurrent.project}
                      </p>
                    </div>
                    <div className="hero-profile-item">
                      <div className="eyebrow">Current scope</div>
                      <p className="hero-profile-copy">Coronary hemodynamics · 4D CT synthesis · Wearable PPG</p>
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
                <article key={brief.id} id={briefAnchor(brief.id)} className="research-card scroll-mt-24">
                  <div className="research-grid">
                    <div className="research-figure" style={brief.figureBg}>
                      <img src={brief.image} alt={brief.alt} />
                    </div>
                    <div className="research-card-copy">
                      <div className="research-meta-row">
                        <div className="micro-label w-fit">{brief.status}</div>
                        <div className="micro-label w-fit">{brief.authorBadge}</div>
                        <span className="year-chip">{briefChip(brief)}</span>
                      </div>
                      <div className="space-y-4">
                        <h3 className="research-title">{brief.title}</h3>
                        <p className="research-focus">{brief.focus}</p>
                      </div>
                      <ul className="bullet-list research-bullet-list">
                        {brief.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                      <div className="research-card-footer">
                        <div className="flex flex-wrap items-center gap-3">
                          {brief.doi ? (
                            <a className="capsule-link" href={brief.doi} target="_blank" rel="noreferrer">
                              {brief.doiLabel} <ArrowUpRight className="size-4" />
                            </a>
                          ) : (
                            <span className="capsule-link capsule-link-quiet">{brief.doiLabel}</span>
                          )}
                          {brief.extraLinks?.map((link) =>
                            link.href ? (
                              <a
                                key={link.label}
                                className="capsule-link capsule-link-quiet"
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {link.label} <ArrowUpRight className="size-4" />
                              </a>
                            ) : (
                              <span key={link.label} className="capsule-link capsule-link-quiet">
                                {link.label}
                              </span>
                            ),
                          )}
                        </div>
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
                  {capitalize(numberWord(ongoingProjects.length))} active {plural(ongoingProjects.length, "line")} moving toward journal
                  papers and translational output. Each extends one of the research briefs above.
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
                    <img src={moment.image} alt={moment.alt} />
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
                Part of my work is translated into clinical software through <strong>The M.E.N.D. BioSimulator</strong>, a startup building SaMD products grounded in the same coronary CFD, CT-FFR, and wearable PPG research shown above.
              </p>
            </div>

            <div className="mt-10 max-w-4xl">
              <a className="translation-media-card" href={translationalMedia.href} target="_blank" rel="noreferrer">
                <div className="translation-media-thumb">
                  <img src={translationalMedia.thumbnail} alt={translationalMedia.alt} />
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

        <section id="achievements" className="section-band section-band-achievements">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Record</div>
              <h2 className="section-title max-w-[16ch]">Talks, patents, funded projects, and awards.</h2>
              <p className="body-copy max-w-3xl">
                The full record behind the briefs: {numberWord(talks.length)} conference presentations, {numberWord(publicPatents.length)}{" "}
                patent applications, {numberWord(projects.length)} funded research projects, and the awards and fellowships that supported
                the work.
              </p>
            </div>

            <div className="achievement-grid mt-10">
              <div className="achievement-column">
                <div ref={talkHeadRef} className="achievement-column-head scroll-mt-24">
                  <div>
                    <div className="eyebrow">Talks</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Conference presentations</h3>
                  </div>
                  <span className="year-chip">
                    {showAllTalks ? `${sortedTalks.length} total` : `${visibleTalks.length} of ${sortedTalks.length} shown`}
                  </span>
                </div>
                <div id={TALK_LIST_ID} className="achievement-list">
                  {visibleTalks.map((item) => (
                    <article key={item.id} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">{item.year}</span>
                        <span className="achievement-tag">{item.category}</span>
                        <span className="achievement-tag">{item.role === "presenter" ? "Presenter" : "Co-author"}</span>
                      </div>
                      <h4 className={ROW_TITLE_CLASS}>{item.title}</h4>
                      <p className={ROW_VENUE_CLASS}>{item.venue}</p>
                      <p className={ROW_DETAIL_CLASS}>
                        {item.location} · {capitalize(item.format)}
                      </p>
                    </article>
                  ))}
                </div>
                {sortedTalks.length > ACHIEVEMENT_PREVIEW_COUNT ? (
                  <div className="mt-5">
                    <button
                      className="capsule-link capsule-link-quiet"
                      type="button"
                      aria-expanded={showAllTalks}
                      aria-controls={TALK_LIST_ID}
                      onClick={() => setShowAllTalks((value) => !value)}
                    >
                      {showAllTalks ? "Show fewer talks" : `View full conference record (${sortedTalks.length})`}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="achievement-column">
                <div ref={patentHeadRef} className="achievement-column-head scroll-mt-24">
                  <div>
                    <div className="eyebrow">Patents</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Patent record</h3>
                  </div>
                  <span className="year-chip">
                    {showAllPatents
                      ? `${patentFamilies.length} families · ${publicPatents.length} applications`
                      : `${visiblePatentFamilies.length} of ${patentFamilies.length} families shown`}
                  </span>
                </div>
                <div id={PATENT_LIST_ID} className="achievement-list">
                  {visiblePatentFamilies.map((family) => {
                    const registeredTag = registrationTag(family);
                    return (
                      <article key={family.key} className="achievement-row">
                        <div className="achievement-meta">
                          <span className="year-chip">{family.yearLabel}</span>
                          {family.jurisdictions.map((jurisdiction) => (
                            <span key={jurisdiction} className="achievement-tag">
                              {jurisdiction}
                            </span>
                          ))}
                          {registeredTag ? <span className="achievement-tag">{registeredTag}</span> : null}
                        </div>
                        <h4 className={ROW_TITLE_CLASS}>{family.title}</h4>
                        <p className={ROW_DETAIL_CLASS}>{patentFamilyDetail(family)}</p>
                      </article>
                    );
                  })}
                </div>
                {patentFamilies.length > ACHIEVEMENT_PREVIEW_COUNT ? (
                  <div className="mt-5">
                    <button
                      className="capsule-link capsule-link-quiet"
                      type="button"
                      aria-expanded={showAllPatents}
                      aria-controls={PATENT_LIST_ID}
                      onClick={() => setShowAllPatents((value) => !value)}
                    >
                      {showAllPatents ? "Show fewer patents" : `View full patent record (${publicPatents.length} applications)`}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="achievement-grid mt-10">
              <div className="achievement-column">
                <div className="achievement-column-head">
                  <div>
                    <div className="eyebrow">Funded research projects</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Participating researcher</h3>
                  </div>
                  <span className="year-chip">{sortedProjects.length} projects</span>
                </div>
                <div className="achievement-list">
                  {sortedProjects.map((project) => (
                    <article key={project.id} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">
                          {yearOf(project.start)}–{yearOf(project.end)}
                        </span>
                        <span className="achievement-tag">{funderTag(project)}</span>
                      </div>
                      <h4 className={ROW_TITLE_CLASS}>{project.title}</h4>
                      <p className={ROW_DETAIL_CLASS}>{projectDetail(project)}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="achievement-column">
                <div className="achievement-column-head">
                  <div>
                    <div className="eyebrow">Awards and fellowships</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Recognition and support</h3>
                  </div>
                  <span className="year-chip">{honorRows.length} entries</span>
                </div>
                <div className="achievement-list">
                  {honorRows.map((row) => (
                    <article key={row.key} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">{row.period}</span>
                        <span className="achievement-tag">{row.tag}</span>
                      </div>
                      <h4 className={ROW_TITLE_CLASS}>{row.title}</h4>
                      <p className={ROW_DETAIL_CLASS}>
                        {row.detail}
                        {row.note ? (
                          <>
                            {" · "}
                            {row.note.href ? (
                              <a className="underline decoration-[rgba(16,24,40,0.25)] underline-offset-4 hover:text-[var(--blue)]" href={row.note.href}>
                                {row.note.text}
                              </a>
                            ) : (
                              row.note.text
                            )}
                          </>
                        ) : null}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="background" className="section-layer section-layer-publications">
          <div className="container py-16 md:py-24">
            <div className="max-w-5xl space-y-5">
              <div className="eyebrow">Background</div>
              <h2 className="section-title max-w-[16ch]">Education, research appointments, and skills.</h2>
              <p className="body-copy max-w-3xl">
                The training and appointments behind the work above, as listed in my CV: an integrated M.S.–Ph.D. at Yonsei, an
                undergraduate degree at Pusan National University, and research roles in the Multiscale Fluid Dynamics Lab.
              </p>
            </div>

            <div className="achievement-grid mt-10">
              <div className="achievement-column">
                <div className="achievement-column-head">
                  <div>
                    <div className="eyebrow">Education</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Degrees</h3>
                  </div>
                  <span className="year-chip">{education.length} entries</span>
                </div>
                <div className="achievement-list">
                  {education.map((item) => (
                    <article key={`${item.degree}-${item.institution}`} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">
                          {item.start} – {item.end}
                        </span>
                      </div>
                      <h4 className={ROW_TITLE_CLASS}>{item.degree}</h4>
                      <p className={ROW_VENUE_CLASS}>
                        {item.institution} · {item.location}
                      </p>
                      {item.note ? <p className={ROW_DETAIL_CLASS}>{item.note}</p> : null}
                    </article>
                  ))}
                </div>

                <div className="achievement-column-head mt-10">
                  <div>
                    <div className="eyebrow">Skills</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Methods and data</h3>
                  </div>
                </div>
                <div className="achievement-list">
                  {skillRows.map((row) => (
                    <div key={row.label} className="achievement-row">
                      <p className="achievement-tag">{row.label}</p>
                      <p className={`${ROW_DETAIL_CLASS} mt-2`}>{row.items.join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="achievement-column">
                <div className="achievement-column-head">
                  <div>
                    <div className="eyebrow">Research experience</div>
                    <h3 className={COLUMN_HEADING_CLASS}>Appointments</h3>
                  </div>
                  <span className="year-chip">{experience.length} entries</span>
                </div>
                <div className="achievement-list">
                  {experience.map((item) => (
                    <article key={`${item.role}-${item.start}`} className="achievement-row">
                      <div className="achievement-meta">
                        <span className="year-chip">
                          {item.start} – {item.end}
                        </span>
                      </div>
                      <h4 className={ROW_TITLE_CLASS}>{item.role}</h4>
                      <p className={ROW_VENUE_CLASS}>
                        {item.org} · {item.location}
                      </p>
                      {item.notes?.map((note) => (
                        <p key={note} className={ROW_DETAIL_CLASS}>
                          {note}
                        </p>
                      ))}
                      <ul className="bullet-list mt-3 text-sm">
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>{stripCitationKeys(bullet)}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
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
                    ) : link.label === "LinkedIn" ? (
                      <Linkedin className="size-5 text-[var(--blue)]" />
                    ) : (
                      <FileText className="size-5 text-[var(--blue)]" />
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
