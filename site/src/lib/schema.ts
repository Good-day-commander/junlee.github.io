/*
  The machine layer: JSON-LD graphs, the markdown twins of the three pages,
  /llms.txt, /llms-full.txt and /cv.json, all built from content.ts and the
  data manifests under public/data. Nothing here is scraped from a page and
  no fact is retyped: every number is computed from the same sources the
  pages read and formatted with lib/format.ts, so the human layer and the
  machine layer cannot drift apart.

  Build-time only (Astro frontmatter and endpoints); never imported by an
  island, so none of this ships to the browser.
*/
import {
  awards,
  cfdReference,
  education,
  experience,
  fellowships,
  patents,
  profile,
  projectRole,
  projects,
  publications,
  skills,
  talks,
  teaching,
  type AuthorRole,
  type Patent,
  type Publication,
  type Talk,
} from '@/data/content';
import { pino, pulse, parseCohortN, parseFolds, parseNetworkCount, parseRank } from '@/components/research/data';
import imageJson from '../../public/data/image/manifest.json';
import { formatDecimal, formatInt, formatMm, formatPaRange, formatSeconds, numberWord, numberWordCap, THIN } from '@/lib/format';
import { fieldNote, legendFor, type Legend } from '@/islands/vessel/colors';
import { KPA_PER_MMHG } from '@/islands/image/manifest';

/* ---------- site constants ---------- */

export const SITE = profile.links.site.replace(/\/$/, '');
export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;
export const CV_PDF = '/uploads/resume.pdf';

/** Build date, ISO (YYYY-MM-DD); SOURCE_DATE overrides it for reproducible builds. */
export const BUILD_DATE = process.env.SOURCE_DATE ?? new Date().toISOString().slice(0, 10);

const abs = (path: string) => new URL(path, `${SITE}/`).href;

/** The three pages and their twins. */
export const PAGES = [
  { path: '/', md: '/index.md', name: 'Home', line: 'Who I am, the live CFD | PINO vessel plate, four rows on what I work on, and three selected papers.' },
  { path: '/research/', md: '/research.md', name: 'Research', line: 'Three worked examples with data (Flow, Image, Pulse), each with one artifact, one paragraph, a metrics table and the citation.' },
  { path: '/cv/', md: '/cv.md', name: 'CV', line: 'The whole record: education, appointments, every publication, talks, patents, funded projects, awards, teaching and skills.' },
] as const;

/** Markdown twin for a page path; pages that moved into the CV point at the CV twin. */
export function markdownTwin(pathname: string): string | null {
  const p = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  if (p === '/') return '/index.md';
  if (p === '/research') return '/research.md';
  if (p === '/cv' || p === '/publications' || p === '/record') return '/cv.md';
  return null;
}

/* ---------- labels and small helpers ---------- */

export const ROLE_LABEL: Record<AuthorRole, string> = {
  first: 'First author',
  'co-first': 'Co-first author',
  'co-author': 'Co-author',
};

/** The owner's one-line self-description (content.ts, profile.tagline). */
const tagline: string = profile.tagline;

/** "a, b, c and d" */
export const listAnd = (items: readonly string[]) =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

const doiUrl = (p: Publication) => (p.doi ? `https://doi.org/${p.doi}` : undefined);

function pub(id: string): Publication {
  const p = publications.find((x) => x.id === id);
  if (!p) throw new Error(`lib/schema.ts: publication ${id} missing from content.ts`);
  return p;
}

/** "Computer Methods and Programs in Biomedicine" → "CMPB" (same rule as the research page). */
function venueInitials(venue: string): string {
  return venue
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('');
}

/** "Computer Methods and Programs in Biomedicine · 265, 108740 · 2025" (same rule as the CV page). */
function citationLine(p: Publication): string {
  const parts: string[] = [p.venue];
  const where = [p.volume, p.article ?? p.pages].filter(Boolean).join(', ');
  if (where) parts.push(where);
  if (p.year) parts.push(p.year);
  return parts.join(' · ');
}

/** One range rule for the site: spaced en dash when an end has a space, closed otherwise. */
function range(a: string, b: string): string {
  return /\s/.test(a) || /\s/.test(b) ? `${a} – ${b}` : `${a}–${b}`;
}
const normRange = (label: string) => {
  const parts = label.split(/\s*–\s*/);
  return parts.length === 2 ? range(parts[0].trim(), parts[1].trim()) : label;
};
const period = (start: string, end: string) => (start === end ? start : range(start, end));

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};
/** "Sep. 2026" → "2026-09", "2024" → "2024", "Present" → undefined. */
export function isoMonth(label: string): string | undefined {
  if (/present/i.test(label)) return undefined;
  const year = label.match(/\d{4}/)?.[0];
  if (!year) return undefined;
  const mon = MONTHS[label.trim().slice(0, 3).toLowerCase()];
  return mon ? `${year}-${mon}` : year;
}

/** "H.J. Lee†" → "H.J. Lee" */
const cleanAuthor = (a: string) => a.replace(/[†*]/g, '').trim();
const authorList = (authors: string) => authors.split(/,\s*/).map(cleanAuthor);
/** The owner's byline in the CV's author lists. */
const SELF_BYLINE = 'H.J. Lee';

const applicationLabel = (p: Patent) => (p.jurisdiction === 'PCT' ? p.applicationNo : `${p.jurisdiction} ${p.applicationNo}`);

/** Sentences joined with ". ", each ending in exactly one period (no ".." where a note already ends in one). */
export const joinSentences = (items: readonly string[]) =>
  items.length ? `${items.map((n) => n.trim().replace(/\.+$/, '')).join('. ')}.` : '';
/** One note as a sentence: trimmed, one closing period. */
const sentence = (n: string) => joinSentences([n]);

/** Escape the characters that would break a markdown table cell. */
const cell = (s: string) => s.replace(/\|/g, '\\|');

/* ---------- derived facts (the numbers every surface shares) ---------- */

const publicPatents = patents.filter((p) => p.status !== 'withdrawn');

export const counts = {
  journal: publications.filter((p) => p.type === 'journal').length,
  proceedings: publications.filter((p) => p.type === 'proceedings').length,
  underReview: publications.filter((p) => p.type === 'under-review').length,
  talks: talks.length,
  talksInternational: talks.filter((t) => t.category === 'International').length,
  talksDomestic: talks.filter((t) => t.category === 'Domestic').length,
  patents: publicPatents.length,
  patentsRegistered: publicPatents.filter((p) => p.status === 'registered').length,
  patentsPending: publicPatents.filter((p) => p.status !== 'registered').length,
  talksPresented: talks.filter((t) => t.role === 'presenter').length,
  projects: projects.length,
  awards: awards.length,
  fellowships: fellowships.length,
};

/** "4 journal articles · 2 proceedings · 16 talks · 16 patents (2 registered) · 7 funded projects (participating researcher) · 4 awards" */
export const countsLine = [
  `${counts.journal} journal articles`,
  `${counts.proceedings} proceedings`,
  `${counts.talks} talks`,
  `${counts.patents} patents (${counts.patentsRegistered} registered)`,
  `${counts.projects} funded projects (${projectRole})`,
  `${counts.awards} awards`,
].join(' · ');

/** The CV section heading for the funded projects, with his role; cv.astro, cv.md and llms-full.txt print it. */
export const projectsHeading = `Funded projects (${projectRole})`;

/* Flow: the PINO manifest */
const pc = pino.metrics.case;
const pk = pino.metrics.cohort;
const gpuShort = pino.timing.pino.gpu.replace(/^NVIDIA\s+/i, '');
const rank = parseRank(pino.selection.case_rank_by_R2_pressure);

export const flow = {
  caseId: pino.case_id,
  nodes: formatInt(pino.vertexCount),
  triangles: formatInt(pino.triangleCount),
  streamlines: formatInt(pino.mesh.streamlines),
  probes: `${formatMm(pino.geometry.ffr_probes.proximal.s_mm)} and ${formatMm(pino.geometry.ffr_probes.distal.s_mm)}`,
  ffrDelta: formatDecimal(Math.abs(pc.ffr.cfd - pc.ffr.pino), 3),
  volumeNodes: pino.timing.pino.query_points,
  inference: formatSeconds(pino.timing.pino.inference_ms_median / 1000),
  gpu: pino.timing.pino.gpu,
  gpuShort,
  ffrCfd2: formatDecimal(pc.ffr.cfd, 2),
  ffrPino2: formatDecimal(pc.ffr.pino, 2),
  ffrCfd3: formatDecimal(pc.ffr.cfd, 3),
  ffrPino3: formatDecimal(pc.ffr.pino, 3),
  cohortN: formatInt(pk.n_cases),
  /** Reference CFD solve (owner, 2026-10-16): an upper bound, in whole minutes. */
  cfdMaxMin: Math.round(cfdReference.wall_time_max_s / 60),
  cfdCores: cfdReference.cpu_cores,
  /** Label convention for every PINO metric (packet §11). */
  label: `current model, ${formatInt(pk.n_cases)} cases, 10-fold CV`,
  rank: `${formatInt(rank.rank)} of ${formatInt(rank.of)}`,
  rows: [
    ['Pressure R²', formatDecimal(pc.pressure_Pa.R2, 3), formatDecimal(pk.pressure_R2.median, 3)],
    ['Pressure MAE', `${formatDecimal(pc.pressure_Pa.MAE / 1000, 1)} kPa`, `${formatDecimal(pk.pressure_MAE_Pa.median / 1000, 1)} kPa`],
    ['Speed R²', formatDecimal(pc.velocity_mps.R2, 3), formatDecimal(pk.velocity_R2.median, 3)],
    ['FFR, Pd/Pa', `CFD ${formatDecimal(pc.ffr.cfd, 3)} · PINO ${formatDecimal(pc.ffr.pino, 3)}`, `MAE vs CFD ${formatDecimal(pk.ffr_MAE_vs_cfd, 4)}`],
  ] as [string, string, string][],
};

/*
  The vessel colorbars as the plates print them (legendFor, the same code
  the viewer runs): range, the five ticks, and the error field's note.
*/
const ticksOf = (l: Legend) => l.ticks.filter((t) => !t.over).map((t) => t.text).join(' / ');
const legendP = legendFor('pressure', pino);
const legendE = legendFor('error', pino);
const legendS = legendFor('speed', pino);
export const flowLegends = {
  pressureRange: formatPaRange(pino.ranges.p[0], pino.ranges.p[1]),
  pressureTicks: `${ticksOf(legendP)}${THIN}kPa`,
  errorScale: legendE.unit,
  errorTicks: `${ticksOf(legendE)}${THIN}kPa`,
  errorOver: legendE.ticks.find((t) => t.over)?.text ?? null,
  errorNote: fieldNote('error', pino),
  speedRange: `0–${formatDecimal(pino.ranges.vmag_wall_max, 2)}${THIN}m/s`,
  speedTicks: `${ticksOf(legendS)}${THIN}m/s`,
  speedNote: fieldNote('speed', pino),
};

/*
  One source for the CFD bound: content.ts cfdReference. The PINO manifest
  mirrors it under timing.cfd.reference_pipeline; a drift fails the build.
*/
{
  const mirror = pino.timing.cfd?.reference_pipeline;
  if (
    !mirror ||
    mirror.cpu_cores !== cfdReference.cpu_cores ||
    mirror.wall_time_max_s !== cfdReference.wall_time_max_s ||
    mirror.source !== cfdReference.source ||
    mirror.note !== cfdReference.note
  ) {
    throw new Error('lib/schema.ts: manifest timing.cfd.reference_pipeline no longer mirrors content.ts cfdReference');
  }
}

/** The plate caption on the home page (two mono lines), in the same order and formatting. */
export const plateCaptionItems = [flow.caseId, `${flow.nodes} nodes`, `FFR CFD ${flow.ffrCfd2} · PINO ${flow.ffrPino2}`];
export const plateCaption = plateCaptionItems.join(' · ');
/** CFD against PINO time: a measured bound beside a measured median; no speed-up factor is printed. */
export const timingItems = [`CFD up to ${flow.cfdMaxMin} min on ${flow.cfdCores} CPU cores`, `PINO ${flow.inference} on one ${flow.gpuShort}`];
export const timingLine = timingItems.join(' · ');

/** The home plate's STIX line (device-agnostic: phones show a toggle, not a handle). */
export const plateSentence = `One artery, solved twice: CFD on one side of the line, the neural operator on the other. FFR ${flow.ffrCfd2} and ${flow.ffrPino2}; ${flow.cfdMaxMin} minutes on ${flow.cfdCores} cores against ${formatDecimal(pino.timing.pino.inference_ms_median / 1000, 2)} seconds.`;

/*
  The identity block's three mono proof lines (home, index.md, llms.txt):
  first-author papers and the paper award; the PINO cohort and the CFD
  against PINO time; the patent, project and award counts, the project and
  award counts linked to their CV anchors (the patent count is plain: the
  Devices row is the home's one link to /cv/#patents). Each item stays whole (the page sets it nowrap); a line wraps
  only between items.
*/
export interface ProofItem {
  text: string;
  href?: string;
  /** The wording the machine layer prints when it needs more than the page (the project role). */
  md?: string;
}
const shortVenueYear = (p: Publication): string => {
  const tag = /\(([A-Z][A-Za-z0-9-]*)\)\s*$/.exec(p.venueShort ?? p.venue)?.[1];
  if (tag) return tag.includes(p.year) ? tag.replace(p.year, ` ${p.year}`) : `${tag} ${p.year}`;
  return `${p.venueShort && !/\s/.test(p.venueShort) ? p.venueShort : venueInitials(p.venue)} ${p.year}`;
};
const ledPapers = publications
  .filter((p) => (p.myRole === 'first' || p.myRole === 'co-first') && p.type !== 'under-review' && p.year)
  .sort((a, b) => Number(b.year) - Number(a.year));
const paperAward = awards.find((a) => a.forPublication && ledPapers.some((p) => p.id === a.forPublication));
const pinoFolds = parseFolds(pino.model.protocol);

export const proofLines: ProofItem[][] = [
  [
    { text: 'First author' },
    ...ledPapers.map((p) => ({ text: `${shortVenueYear(p)}${p.myRole === 'co-first' ? ' (co-first)' : ''}` })),
    ...(paperAward ? [{ text: `${paperAward.title} ${paperAward.year}` }] : []),
  ],
  [
    { text: 'PINO' },
    { text: `${flow.cohortN} patients, ${pinoFolds}-fold cross-validation` },
    { text: `CFD up to ${flow.cfdMaxMin} min on ${flow.cfdCores} CPU cores` },
    { text: `${flow.inference} on one GPU` },
  ],
  [
    /* Plain text (Revision 2b): the counts are read, not clicked; the nav CV reaches every section. */
    { text: `${counts.patents} patents (${counts.patentsRegistered} registered)` },
    { text: `${counts.projects} funded projects`, md: `${counts.projects} funded projects (${projectRole})` },
    { text: `${counts.awards} awards` },
  ],
];
/** The proof lines as plain text, " · " between items. */
export const proofText = proofLines.map((line) => line.map((i) => i.md ?? i.text).join(' · '));

/* Image: the 4D CT phase manifest (J1, Fig. 8, Case 1) */
interface ImageManifest {
  source: { paper_id: string; figure: string };
  case: string;
  phases: number;
  fields: Record<string, { label: string; unit: string; range: [number, number] }>;
  notes: string[];
}
const im = imageJson as unknown as ImageManifest;
const imageNote = im.notes.find((n) => /Reported in the paper/i.test(n)) ?? '';
const grab = (re: RegExp) => {
  const v = re.exec(imageNote)?.[1];
  if (!v) throw new Error(`lib/schema.ts: image manifest note no longer carries ${re}`);
  return v;
};
const acquiredNote = im.notes.find((n) => /acquired CT phases/i.test(n)) ?? '';
const acquired = Array.from(acquiredNote.matchAll(/Phase\s+(\d+)/g)).map((m) => Number(m[1]));
if (acquired.length < 2) throw new Error('lib/schema.ts: image manifest notes no longer name the acquired phases');

export const image = {
  caseLabel: im.case,
  phases: im.phases,
  acquired: acquired.slice(0, 2),
  acquiredList: acquired.slice(0, 2).map((p) => `P${p}`).join(' and '),
  synthesized: im.phases - 2,
  psnr: grab(/PSNR\s+([\d.]+)/),
  ssim: grab(/SSIM\s+([\d.]+)/),
  dice: grab(/Dice\s+([\d.]+)/),
  ffrAccuracy: grab(/CT-FFR accuracy\s+([\d.]+)\s*%/),
  figure: /^Fig\.\s*\d+/.exec(im.source.figure)?.[0] ?? 'Figure',
  /** The scrubber legends: "Pressure 70–130 mmHg (9.3–17.3 kPa); Wall shear stress 0–5 Pa". */
  legends: Object.values(im.fields)
    .map((f) => {
      const [lo, hi] = f.range;
      const kpa = f.unit === 'mmHg' ? ` (${formatDecimal(lo * KPA_PER_MMHG, 1)}–${formatDecimal(hi * KPA_PER_MMHG, 1)}${THIN}kPa)` : '';
      return `${f.label} ${formatInt(lo)}–${formatInt(hi)}${THIN}${f.unit}${kpa}`;
    })
    .join('; '),
};

/* Pulse: the fluid-bolus manifest (M1) */
const pipe = pulse.pipeline;
const dev = pipe.metrics.development_oof;
const temporal = pipe.metrics.additional_same_center_temporal;
const ci = (r: [number, number]) => `${formatDecimal(r[0], 3)}–${formatDecimal(r[1], 3)}`;
const M1 = pub('M1');

export const pulseFacts = {
  status: `manuscript under revision (${M1.venueShort ?? venueInitials(M1.venue)})`,
  networks: parseNetworkCount(pipe.ensemble),
  folds: parseFolds(pipe.cross_validation),
  fs: pulse.stft.method.fs_hz,
  durationS: Math.round(pulse.cwt.t_s[pulse.cwt.t_s.length - 1]),
  crop: pulse.stft.recommended_crop_hz,
  stftSize: `${formatInt(pulse.stft.rows)} × ${formatInt(pulse.stft.cols)}`,
  cwtSize: `${formatInt(pulse.cwt.rows)} × ${formatInt(pulse.cwt.cols)}`,
  devAuc: formatDecimal(dev.AUC, 3),
  devCi: ci(dev.AUC_95CI),
  devN: formatInt(parseCohortN(dev.cohort)),
  tempAuc: formatDecimal(temporal.AUC, 3),
  tempCi: ci(temporal.AUC_95CI),
  tempN: formatInt(parseCohortN(temporal.cohort)),
};

/* ---------- identity lines ---------- */

export const roleLine = `${profile.role}, ${profile.lab}, ${profile.department}, ${profile.university}`;
export const concurrentLine = `${profile.concurrent.role}, ${profile.concurrent.org}, ${profile.concurrent.project}`;
/** The four fields of the practice, organ-agnostic (content.ts, profile.fields). */
export const focusLine = profile.fields.join(' · ');
/** The CV's one-line research interests. */
export const interestsLine = `I work across ${listAnd(profile.fields)}.`;

export const links = [
  { label: 'Email', href: `mailto:${profile.email}`, text: profile.email },
  { label: 'CV (PDF)', href: abs(CV_PDF), text: abs(CV_PDF) },
  { label: 'LinkedIn', href: profile.links.linkedin, text: profile.links.linkedin },
  { label: 'Google Scholar', href: profile.links.scholar, text: profile.links.scholar },
  { label: 'ORCID', href: profile.links.orcid, text: profile.links.orcid },
];

const linkRowMd = links.map((l) => `[${l.label}](${l.href})`).join(' · ');

/** The three research fronts as one row each (home), and as a chapter header (research). */
export const fronts = [
  {
    id: 'flow',
    name: 'Flow',
    row: `A neural operator returns the coronary pressure field; FFR ${flow.ffrCfd2} CFD, ${flow.ffrPino2} PINO.`,
    timing: timingLine,
  },
  {
    id: 'image',
    name: 'Image',
    row: `${numberWordCap(image.acquired.length)} acquired CT phases become ${numberWord(image.phases)}; 4D CT-FFR accuracy ${image.ffrAccuracy} % against invasive FFR.`,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    row: `Smartwatch PPG predicts a fluid bolus within 24 h at AUC ${pulseFacts.devAuc}; ${pulseFacts.status}.`,
  },
];

/*
  What I work on, by capability rather than organ (home rows, index.md,
  llms.txt). One clause each with one number, every number computed; each
  row links to its own target, once (no other home link points there).
*/
const firstYear = Math.min(...experience.map((x) => Number(x.start.match(/\d{4}/)?.[0] ?? 9999)));
export const capabilities: { id: string; name: string; href: string; row: string; inline?: { text: string; href: string } }[] = [
  {
    id: 'simulation',
    name: 'Simulation',
    href: '/research/#flow',
    row: `CFD of a patient's own vessels from CT, read out as FFR and wall shear stress; also applied to a tricuspid valve device.`,
  },
  {
    id: 'ai',
    name: 'Physics-informed AI',
    href: '/research/#image',
    row: `Neural operators trained on CFD return an unseen vessel's pressure field in ${flow.inference}, not ${flow.cfdMaxMin} minutes; diffusion-synthesized 4D CT gives FFR across the cardiac cycle.`,
  },
  {
    id: 'biosignals',
    name: 'Wearable biosignals',
    href: '/research/#pulse',
    row: `Smartwatch PPG, read by deep learning, gives blood viscosity and predicts a fluid bolus within 24 h (AUC ${pulseFacts.devAuc}, ${pulseFacts.status}); patents cover blood pressure, glucose and glaucoma.`,
  },
  {
    id: 'devices',
    name: 'Devices and translation',
    href: '/cv/#patents',
    row: `A point-of-care FFR simulator, an implantable tricuspid device, a negative-pressure tunnel and AI urodynamics; ${counts.patents} patents, ${counts.patentsRegistered} registered; CARDIOS and EASYCHECK carry parts of this work.`,
  },
];

/** The research page's one-line header and its closing row (page and research.md). */
export const researchLine = `Three worked examples with public data, from a practice that spans ${listAnd(profile.fields)}.`;
export const researchClosing = 'The valve, infection-control, urodynamics and glaucoma work has no public data yet.';

/** Home "Selected": the first-author journal paper, the first-author DMD 2026 proceedings paper, the co-first journal paper; newest first. */
export const SELECTED = ['J2', 'C1', 'J4'].map(pub).sort((a, b) => Number(b.year) - Number(a.year));

/* ---------- JSON-LD ---------- */

export type JsonLdNode = Record<string, unknown>;

export function personNode(imageUrl?: string): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    jobTitle: profile.role,
    affiliation: {
      '@type': 'Organization',
      name: `${profile.lab}, ${profile.university}`,
      parentOrganization: { '@type': 'CollegeOrUniversity', name: profile.university },
    },
    alumniOf: Array.from(new Set(education.map((e) => e.institution))).map((name) => ({
      '@type': 'CollegeOrUniversity',
      name,
    })),
    email: `mailto:${profile.email}`,
    url: `${SITE}/`,
    ...(imageUrl ? { image: imageUrl } : {}),
    sameAs: [profile.links.orcid, profile.links.scholar, profile.links.linkedin],
    knowsAbout: [...profile.fields, ...skills.computational, ...skills.ml, ...skills.data],
    description: tagline,
  };
}

export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE}/`,
    name: profile.name,
    inLanguage: 'en',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
}

function profilePageNode(path: string): JsonLdNode {
  return {
    '@type': 'ProfilePage',
    '@id': `${abs(path)}#profilepage`,
    url: abs(path),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
    about: { '@id': PERSON_ID },
    dateModified: BUILD_DATE,
    inLanguage: 'en',
  };
}

export function scholarlyArticleNode(p: Publication): JsonLdNode {
  return {
    '@type': 'ScholarlyArticle',
    '@id': p.doi ? `https://doi.org/${p.doi}` : `${abs('/cv/')}#${p.id}`,
    headline: p.title,
    name: p.title,
    author: authorList(p.authors).map((name) =>
      /* The owner's byline is a reference to the site's Person node, so the articles are machine-linked to him. */
      name === SELF_BYLINE ? { '@id': PERSON_ID } : { '@type': 'Person', name },
    ),
    ...(p.year ? { datePublished: p.year } : {}),
    isPartOf: { '@type': 'Periodical', name: p.venueShort ?? p.venue },
    ...(p.doi
      ? {
          identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: p.doi },
          url: doiUrl(p),
        }
      : {}),
  };
}

/** Person + WebSite: the default graph on every page. */
export function baseGraph(imageUrl?: string): JsonLdNode[] {
  return [personNode(imageUrl), websiteNode()];
}

export function homeGraph(imageUrl?: string): JsonLdNode[] {
  return [...baseGraph(imageUrl), profilePageNode('/')];
}

export function cvGraph(imageUrl?: string): JsonLdNode[] {
  const articles = publications.filter((p) => p.type === 'journal' || p.type === 'proceedings').map(scholarlyArticleNode);
  return [...baseGraph(imageUrl), profilePageNode('/cv/'), ...articles];
}

export function researchGraph(imageUrl?: string): JsonLdNode[] {
  const chapter = (id: string, name: string, description: string, cites: Publication[]) => ({
    '@type': 'CreativeWork',
    '@id': `${abs('/research/')}#${id}`,
    url: `${abs('/research/')}#${id}`,
    name,
    description,
    author: { '@id': PERSON_ID },
    citation: cites.filter((p) => p.doi).map((p) => ({ '@id': `https://doi.org/${p.doi}` , '@type': 'ScholarlyArticle', name: p.title })),
  });
  return [
    ...baseGraph(imageUrl),
    {
      '@type': 'WebPage',
      '@id': `${abs('/research/')}#webpage`,
      url: abs('/research/'),
      name: `Research · ${profile.name}`,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      author: { '@id': PERSON_ID },
      dateModified: BUILD_DATE,
      inLanguage: 'en',
      hasPart: [
        chapter('flow', 'Flow', fronts[0].row, [pub('C1'), pub('J4')]),
        chapter('image', 'Image', fronts[1].row, [pub('J1'), pub('C2')]),
        chapter('pulse', 'Pulse', fronts[2].row, [pub('M1'), pub('J2')]),
      ],
    },
  ];
}

/** The graph a page gets when it passes none: chosen by path, Person + WebSite elsewhere. */
export function graphFor(pathname: string, imageUrl?: string): JsonLdNode[] {
  const p = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  if (p === '/') return homeGraph(imageUrl);
  if (p === '/cv') return cvGraph(imageUrl);
  if (p === '/research') return researchGraph(imageUrl);
  return baseGraph(imageUrl);
}

export function jsonLdDocument(graph: JsonLdNode[]): JsonLdNode {
  return { '@context': 'https://schema.org', '@graph': graph };
}

/* ---------- markdown blocks ---------- */

const footerMd = [
  '---',
  '',
  'Open to collaboration, positions and paper requests.',
  '',
  linkRowMd,
  '',
  `Updated ${BUILD_DATE} · ${SITE.replace(/^https?:\/\//, '')}`,
  '',
].join('\n');

function pubCitationMd(p: Publication): string {
  const bits = [citationLine(p), ROLE_LABEL[p.myRole]];
  if (p.type === 'under-review') bits.push(p.status);
  if (p.doi) bits.push(`doi:[${p.doi}](${doiUrl(p)})`);
  return bits.join(' · ');
}

function pubEntryMd(p: Publication): string {
  return [`- **${p.title}** [${p.id}]`, `  ${p.authors}`, `  ${pubCitationMd(p)}`].join('\n');
}

function flowTableMd(): string {
  return [
    `| Metric | This case | Cohort median, n = ${flow.cohortN} |`,
    '| --- | --- | --- |',
    ...flow.rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
  ].join('\n');
}

const proofMd = (line: ProofItem[]) =>
  line.map((i) => (i.href ? `[${i.md ?? i.text}](${abs(i.href)})` : (i.md ?? i.text))).join(' · ');

function identityMd(): string[] {
  return [
    `# ${profile.name}`,
    '',
    `${profile.role} · ${profile.lab}, ${profile.university} · ${focusLine}`,
    '',
    tagline,
    '',
    ...proofLines.map((line) => `- ${proofMd(line)}`),
    '',
    `${concurrentLine}.`,
    '',
    linkRowMd,
    '',
  ];
}

export function homeMarkdown(): string {
  return [
    ...identityMd(),
    '## The plate',
    '',
    plateSentence,
    '',
    '## What I work on',
    '',
    ...capabilities.map((c) => {
      const row = c.inline ? c.row.replace(c.inline.text, `[${c.inline.text}](${abs(c.inline.href)})`) : c.row;
      return `- **[${c.name}](${abs(c.href)})**: ${row}`;
    }),
    '',
    '## Selected',
    '',
    ...SELECTED.map((p) => `- ${p.year} · **${p.title}** · ${(p.venueShort ?? p.venue).replace(/\s?\d{4}$/, '')} · ${ROLE_LABEL[p.myRole]}${p.doi ? ` · doi:[${p.doi}](${doiUrl(p)})` : ''}`),
    '',
    `Full record: [CV](${abs('/cv/')}).`,
    '',
    footerMd,
  ].join('\n');
}

function researchChapters(): string[] {
  const C1 = pub('C1');
  const C2 = pub('C2');
  const J1 = pub('J1');
  const J2 = pub('J2');
  const J4 = pub('J4');
  const p = pulseFacts;
  return [
    '## Flow',
    '',
    `${fronts[0].row}`,
    '',
    `\`${timingLine}\``,
    '',
    `Artifact: a real patient vessel (${flow.caseId}, ${flow.nodes} surface nodes, ${flow.triangles} triangles, ${flow.streamlines} streamlines) painted with its CFD pressure field and the field the PINO returned for the same geometry, with a CFD | PINO wipe, a Pressure | Error | Speed toggle and the Pd/Pa curve along the vessel. FFR is read on the probe planes at s = ${flow.probes}; the CFD and PINO readings are ${flow.ffrDelta} apart.`,
    '',
    `Colorbars: pressure ${flowLegends.pressureRange}, one range for CFD and PINO (ticks ${flowLegends.pressureTicks}); error PINO − CFD on a fixed symmetric scale of ${flowLegends.errorScale} (ticks ${flowLegends.errorTicks}${flowLegends.errorOver ? `, above-range band ${flowLegends.errorOver}${THIN}kPa` : ''}); near-wall speed ${flowLegends.speedRange} (ticks ${flowLegends.speedTicks}). Plate notes: error, “${flowLegends.errorNote}”; speed, “${flowLegends.speedNote}”`,
    '',
    `The current PINO is a geometry-informed neural operator (GINO backbone) that takes the vessel surface and returns pressure and velocity at every volume node. Its loss carries a pressure-only Navier–Stokes residual at the prescribed and at counterfactual inlet flows. It was trained and evaluated by 10-fold cross-validation over ${flow.cohortN} patients; this case is predicted by the fold model that never saw it. Inference over ${flow.volumeNodes} volume nodes takes ${flow.inference} on one ${flow.gpu}; the reference CFD solve takes up to ${flow.cfdMaxMin} min on ${flow.cfdCores} CPU cores (${cfdReference.source}, an upper bound).`,
    '',
    `Metrics: ${flow.label}, all volume nodes of each case.`,
    '',
    flowTableMd(),
    '',
    `A well-predicted case, not a typical one: its pressure R² ranks ${flow.rank} in the cohort.`,
    '',
    `Citation: ${C1.title}. ${pubCitationMd(C1)}. Related: ${J4.title}. ${pubCitationMd(J4)}.`,
    '',
    '## Image',
    '',
    `${fronts[1].row}`,
    '',
    `Artifact: ${image.caseLabel} from the 4D CT paper (${J1.id}, ${image.figure}) through one cardiac cycle, pressure and wall shear stress at each of ${image.phases} phases; ${image.acquiredList} were acquired by CT, the other ${image.synthesized} synthesized, and CFD solved every one.`,
    '',
    `Colour scales (the paper's renders): ${image.legends}.`,
    '',
    `A denoising diffusion deformable model synthesizes a full-cycle 4D coronary CT from two acquired phases; the sequence is then meshed and solved, so FFR can be followed across the cardiac cycle instead of read from one static phase. The diffusion model is T.H. Han's work; mine is the CFD and FFR analysis on the synthesized frames.`,
    '',
    '| Metric (reported in the paper) | Value |',
    '| --- | --- |',
    `| Phases | ${image.phases} (${image.acquiredList} acquired) |`,
    `| 4D CT-FFR accuracy against invasive FFR | ${image.ffrAccuracy} % |`,
    `| Synthesis PSNR | ${image.psnr} |`,
    `| Synthesis SSIM | ${image.ssim} |`,
    `| Synthesis Dice | ${image.dice} |`,
    '',
    `Citation: ${J1.title}. ${pubCitationMd(J1)}. Companion: ${C2.title}. ${pubCitationMd(C2)}.`,
    '',
    '## Pulse',
    '',
    `${fronts[2].row}`,
    '',
    `Artifact: a ${p.durationS} s smartwatch PPG recording as the network sees it, an STFT spectrogram (${p.stftSize}, ${p.crop[0]}–${p.crop[1]} Hz shown) and a CWT strip (${p.cwtSize}), from the development cohort, taken before the first bolus.`,
    '',
    `Green-channel PPG at ${p.fs} Hz is band-passed, normalized in short windows and cut into overlapping segments; each segment becomes an STFT or CWT image. Six CNN configurations across four backbones, each kept as five fold checkpoints, make ${p.networks} networks. Segment scores are averaged per patient, rank-normalized within each fold and combined by a non-negative weighted average. Validation is ${p.folds}-fold stratified cross-validation with out-of-fold, patient-level scores.`,
    '',
    `Fluid-bolus prediction at patient level, from ${M1.id}, ${p.status}.`,
    '',
    '| Set | AUC [95 % CI] | n |',
    '| --- | --- | --- |',
    `| Development, out-of-fold | ${p.devAuc} [${p.devCi}] | ${p.devN} |`,
    `| Same-center temporal set | ${p.tempAuc} [${p.tempCi}] | ${p.tempN} |`,
    '',
    'The development figure is internally selected (ensemble weights and cutoff were chosen on those predictions); the temporal set was scored with the model, weights and cutoff unchanged.',
    '',
    `Citation: ${M1.title}. ${pubCitationMd(M1)}. Earlier on the same signal: ${J2.title}. ${pubCitationMd(J2)}.`,
    '',
  ];
}

export function researchMarkdown(): string {
  return [
    '# Research',
    '',
    researchLine,
    '',
    ...researchChapters(),
    `${researchClosing} It is listed on the [CV](${abs('/cv/#patents')}).`,
    '',
    footerMd,
  ].join('\n');
}

function talkRowMd(t: Talk): string {
  const role = t.role === 'presenter' ? 'presenter' : 'co-author';
  return `| ${t.year} | ${cell(t.title)} | ${cell(`${t.venue}, ${t.location}`)} | ${cell(t.format)} | ${role} |`;
}

function cvSections(): string[] {
  const groups: [string, Publication['type']][] = [
    ['Journal articles (SCIE)', 'journal'],
    ['Peer-reviewed proceedings', 'proceedings'],
    ['Manuscript under revision', 'under-review'],
  ];
  const skillGroups: [string, string[]][] = [
    ['Computational', skills.computational],
    ['Machine learning', skills.ml],
    ['Data', skills.data],
    ['Languages', skills.languages],
  ];
  return [
    `## Research interests {#interests}`,
    '',
    interestsLine,
    '',
    '## Education {#education}',
    '',
    ...education.map(
      (e) => `- **${e.degree}**, ${e.institution}, ${e.location} · ${period(e.start, e.end)}${e.note ? `\n  ${e.note}` : ''}`,
    ),
    '',
    '## Appointments {#appointments}',
    '',
    ...experience.flatMap((x) => [
      `- **${x.role}**, ${x.org}, ${x.location} · ${period(x.start, x.end)}`,
      ...(x.notes ?? []).map((n) => `  ${sentence(n)}`),
      ...x.bullets.map((b) => `  - ${b}`),
    ]),
    '',
    '## Publications {#publications}',
    '',
    `${counts.journal} journal articles · ${counts.proceedings} proceedings · ${counts.underReview} under revision. † first author, * corresponding author.`,
    '',
    ...groups.flatMap(([heading, type]) => [
      `### ${heading}`,
      '',
      ...publications.filter((p) => p.type === type).map(pubEntryMd),
      '',
    ]),
    '## Talks {#talks}',
    '',
    `${counts.talks} talks: ${counts.talksInternational} international, ${counts.talksDomestic} domestic, ${counts.talksPresented} presented by me.`,
    '',
    '| Year | Title | Venue | Format | Role |',
    '| --- | --- | --- | --- | --- |',
    ...talks.map(talkRowMd),
    '',
    '## Patents {#patents}',
    '',
    `${counts.patents} filings, ${counts.patentsRegistered} registered, ${counts.patentsPending} pending.`,
    '',
    '| Title | Status | Number |',
    '| --- | --- | --- |',
    ...publicPatents.map((p) => {
      const status = p.status === 'registered' ? `registered ${p.registrationDate ?? ''}`.trim() : p.status;
      const number = p.registrationNo ? `${applicationLabel(p)} (reg. ${p.registrationNo})` : applicationLabel(p);
      return `| ${cell(p.title)} | ${status} | ${cell(number)} |`;
    }),
    '',
    `## ${projectsHeading} {#projects}`,
    '',
    `Role on every project: ${projectRole}.`,
    '',
    ...projects.map(
      (r) => `- **${r.title}** · ${r.funder}${r.program ? `, ${r.program}` : ''} · ${r.grantNo} · ${period(r.start, r.end)}`,
    ),
    '',
    '## Awards and fellowships {#awards}',
    '',
    ...awards.map((a) => `- ${a.year} · **${a.title}**, ${a.org}${a.note ? ` (${a.note})` : ''}`),
    ...fellowships.map((f) => `- ${normRange(f.period)} · **${f.title}**, ${f.org}`),
    '',
    '## Teaching {#teaching}',
    '',
    ...teaching.map((t) => `- ${t.role}, ${t.org} · ${normRange(t.period)}`),
    '',
    '## Skills {#skills}',
    '',
    ...skillGroups.map(([label, items]) => `- **${label}**: ${items.join('; ')}`),
    '',
  ];
}

export function cvMarkdown(): string {
  return [
    `# ${profile.name}, CV`,
    '',
    `${roleLine}`,
    '',
    `${concurrentLine}`,
    '',
    `${profile.appointmentNote}`,
    '',
    `PDF: [${abs(CV_PDF)}](${abs(CV_PDF)}) · Machine-readable: [${abs('/cv.json')}](${abs('/cv.json')})`,
    '',
    linkRowMd,
    '',
    ...cvSections(),
    footerMd,
  ].join('\n');
}

/* ---------- llms.txt ---------- */

export function llmsTxt(): string {
  return [
    `# ${profile.name}`,
    '',
    `> ${profile.role} at the ${profile.lab}, ${profile.department}, ${profile.university} (Seoul). ${tagline}`,
    '',
    `- Role: ${roleLine}; concurrently ${concurrentLine} (PI: ${profile.concurrent.pi}).`,
    `- Ph.D. in Mechanical Engineering, ${education[0].institution}, completed ${profile.phdCompleted}.`,
    `- Fields: ${listAnd(profile.fields)}.`,
    ...capabilities.map((c) => `  - ${c.name}: ${c.row}`),
    `- Worked examples with data (/research): ${fronts.map((f) => f.name).join(', ')}.`,
    ...fronts.map((f) => `  - ${f.name}: ${f.row}${'timing' in f ? ` ${f.timing}.` : ''}`),
    `- In brief:`,
    ...proofText.map((t) => `  - ${t}`),
    `- Record: ${countsLine}.`,
    `- Contact: ${profile.email}. Open to collaboration, positions and paper requests.`,
    '',
    '## Links',
    '',
    ...links.map((l) => `- [${l.label}](${l.href})`),
    '',
    '## Pages',
    '',
    ...PAGES.map((p) => `- [${p.name}](${abs(p.path)}): ${p.line} Markdown twin: [${abs(p.md)}](${abs(p.md)})`),
    '',
    '## Machine-readable',
    '',
    `- [llms-full.txt](${abs('/llms-full.txt')}): the full CV and the three research chapters with their metrics, in one markdown file.`,
    `- [cv.json](${abs('/cv.json')}): the CV in JSON Resume format.`,
    `- [CV (PDF)](${abs(CV_PDF)}): the printable CV.`,
    '',
    '## Notes for agents',
    '',
    `- PINO metrics are the current model's (${flow.label}), not the DMD 2026 proceedings' numbers. The demo case is well predicted (pressure R² rank ${flow.rank}); cohort medians are given beside it.`,
    `- Fluid-bolus numbers come from ${M1.id}, ${pulseFacts.status}.`,
    `- Author roles are stated per entry (first, co-first, co-author); please keep them when citing.`,
    '',
    `Updated ${BUILD_DATE}`,
    '',
  ].join('\n');
}

export function llmsFullTxt(): string {
  return [
    `# ${profile.name}`,
    '',
    `> ${profile.role} at the ${profile.lab}, ${profile.university}. ${tagline}`,
    '',
    `Fields: ${listAnd(profile.fields)}.`,
    '',
    `Source: ${SITE}/ (generated from the same data as the pages, ${BUILD_DATE}). Pages: ${PAGES.map((p) => abs(p.path)).join(', ')}.`,
    '',
    linkRowMd,
    '',
    '## In brief',
    '',
    ...proofText.map((t) => `- ${t}`),
    `- Record: ${countsLine}.`,
    '',
    '# Part 1. Research',
    '',
    ...researchChapters(),
    '# Part 2. Curriculum vitae',
    '',
    `${roleLine}`,
    '',
    `${concurrentLine} (PI: ${profile.concurrent.pi})`,
    '',
    `${profile.appointmentNote}`,
    '',
    ...cvSections(),
    footerMd,
  ].join('\n');
}

/* ---------- cv.json (JSON Resume) ---------- */

function locationOf(label: string) {
  const [city, ...rest] = label.split(/,\s*/);
  const country = rest.join(', ');
  return {
    city,
    ...(country ? { region: country } : {}),
    ...(/Korea/.test(country) ? { countryCode: 'KR' } : /USA/.test(country) ? { countryCode: 'US' } : {}),
  };
}

const compact = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))) as T;

export function cvJson(imageUrl?: string): Record<string, unknown> {
  const degree = (d: string) => {
    const m = /^(.+?) in (.+?)(?: \((.+)\))?$/.exec(d);
    return m ? { studyType: m[1], area: m[2], program: m[3] } : { studyType: d };
  };
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: compact({
      name: profile.name,
      label: `${profile.role}, ${profile.lab}, ${profile.university}`,
      image: imageUrl,
      email: profile.email,
      url: `${SITE}/`,
      summary: `${tagline} ${roleLine}. ${concurrentLine}. Fields: ${listAnd(profile.fields)}.`,
      location: locationOf(experience[0].location),
      profiles: [
        { network: 'ORCID', username: profile.links.orcid.split('/').pop(), url: profile.links.orcid },
        { network: 'Google Scholar', username: new URL(profile.links.scholar).searchParams.get('user') ?? undefined, url: profile.links.scholar },
        { network: 'LinkedIn', username: profile.links.linkedin.replace(/\/$/, '').split('/').pop(), url: profile.links.linkedin },
      ],
    }),
    work: [
      ...experience.map((x) =>
        compact({
          name: x.org,
          position: x.role,
          location: x.location,
          startDate: isoMonth(x.start),
          endDate: isoMonth(x.end),
          summary: x.notes ? joinSentences(x.notes) : undefined,
          highlights: x.bullets,
        }),
      ),
    ],
    education: education.map((e) =>
      compact({
        institution: e.institution,
        ...degree(e.degree),
        location: e.location,
        startDate: isoMonth(e.start),
        endDate: isoMonth(e.end),
        summary: e.note,
      }),
    ),
    publications: publications.map((p) =>
      compact({
        id: p.id,
        name: p.title,
        publisher: p.venue,
        releaseDate: p.year || undefined,
        url: doiUrl(p),
        doi: p.doi,
        type: p.type,
        authors: authorList(p.authors),
        role: ROLE_LABEL[p.myRole],
        status: p.status,
        summary: `${p.authors}. ${citationLine(p)}. ${ROLE_LABEL[p.myRole]}. ${p.status}.`,
      }),
    ),
    awards: [
      ...awards.map((a) => compact({ title: a.title, date: a.year, awarder: a.org, summary: a.note })),
      ...fellowships.map((f) =>
        compact({ title: f.title, date: f.period.match(/\d{4}/)?.[0], awarder: f.org, summary: `Fellowship, ${normRange(f.period)}` }),
      ),
    ],
    skills: [
      { name: 'Computational', keywords: skills.computational },
      { name: 'Machine learning', keywords: skills.ml },
      { name: 'Data', keywords: skills.data },
    ],
    languages: skills.languages.map((l) => {
      const m = /^(.+?) \((.+)\)$/.exec(l);
      return m ? { language: m[1], fluency: m[2] } : { language: l };
    }),
    interests: capabilities.map((c) => ({ name: c.name, keywords: [c.row] })),
    projects: projects.map((r) =>
      compact({
        name: r.title,
        description: `${r.funder}${r.program ? `, ${r.program}` : ''}; grant ${r.grantNo}`,
        entity: r.funder,
        startDate: isoMonth(r.start),
        endDate: isoMonth(r.end),
        type: 'funded research project',
        roles: [projectRole],
      }),
    ),
    /* Extensions beyond JSON Resume v1.0.0 (additional properties are allowed). */
    patents: publicPatents.map((p) =>
      compact({
        id: p.id,
        title: p.title,
        jurisdiction: p.jurisdiction,
        applicationNo: p.applicationNo,
        registrationNo: p.registrationNo,
        registrationDate: p.registrationDate,
        year: p.year,
        status: p.status,
        inventors: p.inventors,
      }),
    ),
    talks: talks.map((t) => compact({ ...t })),
    teaching: teaching.map((t) => ({ ...t })),
    research: {
      flow: { caption: plateCaption, timing: timingLine, cfdReference, metricsLabel: flow.label, rank: flow.rank, table: flow.rows.map(([metric, kase, cohort]) => ({ metric, case: kase, cohortMedian: cohort })) },
      flowColorbars: flowLegends,
      image: { phases: image.phases, acquired: image.acquiredList, legends: image.legends, ffrAccuracyPercent: image.ffrAccuracy, psnr: image.psnr, ssim: image.ssim, dice: image.dice },
      pulse: { status: pulseFacts.status, development: { auc: pulseFacts.devAuc, ci95: pulseFacts.devCi, n: pulseFacts.devN }, temporal: { auc: pulseFacts.tempAuc, ci95: pulseFacts.tempCi, n: pulseFacts.tempN } },
      counts,
    },
    meta: {
      canonical: abs('/cv.json'),
      version: 'v1.0.0',
      lastModified: BUILD_DATE,
      html: abs('/cv/'),
      markdown: abs('/cv.md'),
      pdf: abs(CV_PDF),
    },
  };
}
