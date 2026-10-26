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
  researchProjects,
  skills,
  talks,
  teaching,
  type AuthorRole,
  type Patent,
  type Project,
  type Publication,
  type ResearchProject,
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
  { path: '/research/', md: '/research.md', name: 'Research', line: 'Every research project, newest first, each with one sentence and its papers, patents, funded projects and talks; three carry a live demo with its method and a metrics table.' },
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

/**
  The one status label of a manuscript under revision, "manuscript under
  revision (EAAI)", built from venueShort. Every list prints it once per
  entry in place of the venue and the raw `status` string (the CV row, the
  research outputs line, research.md, cv.md, llms-full.txt); only cv.json
  keeps `status` as data.
*/
export function revisionLabel(p: Publication): string {
  return `manuscript under revision (${p.venueShort && !/\s/.test(p.venueShort) ? p.venueShort : venueInitials(p.venue)})`;
}

/** A calcium score as the A⁺4DCT plate prints it: whole scores without decimals, the others to one ("99.5", "1 278"). */
export const calciumScore = (score: number): string => formatDecimal(score, Number.isInteger(score) ? 0 : 1);

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
    ['FFR, Pd/Pa', `CFD ${formatDecimal(pc.ffr.cfd, 3)} · PINO ${formatDecimal(pc.ffr.pino, 3)}`, `MAE vs CFD ${formatDecimal(pk.ffr_MAE_vs_cfd, 3)}`],
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
export const plateSentence = `CFD: FFR ${flow.ffrCfd2}, up to ${flow.cfdMaxMin} minutes on ${flow.cfdCores} CPU cores. PINO: FFR ${flow.ffrPino2}, ${formatDecimal(pino.timing.pino.inference_ms_median / 1000, 2)} seconds on one GPU.`;

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
  status: revisionLabel(M1),
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

/*
  What I work on, by capability rather than organ (home rows, index.md,
  llms.txt). One clause each with one number, every number computed; each
  row links to one research project that shows the field (its /research
  anchor), once (no other home link points there).
*/
const firstYear = Math.min(...experience.map((x) => Number(x.start.match(/\d{4}/)?.[0] ?? 9999)));
export const capabilities: { id: string; name: string; href: string; row: string; inline?: { text: string; href: string } }[] = [
  {
    id: 'simulation',
    name: 'Simulation',
    href: '/research/#lbm-ctffr',
    row: `Patient-specific CFD from CT, read out as FFR and wall shear stress; also a tricuspid valve device.`,
  },
  {
    id: 'ai',
    name: 'Physics-informed AI',
    href: '/research/#pino',
    row: `Neural operators give a vessel's pressure field in ${flow.inference} instead of ${flow.cfdMaxMin} minutes; synthesized 4D CT gives FFR across the cycle.`,
  },
  {
    id: 'biosignals',
    name: 'Wearable biosignals',
    href: '/research/#viscosity',
    row: `Smartwatch PPG gives blood viscosity and predicts a fluid bolus within 24 h (AUC ${pulseFacts.devAuc}, under revision); patents cover blood pressure, glucose and glaucoma.`,
  },
  {
    id: 'devices',
    name: 'Devices and translation',
    href: '/research/#ffr-simulator',
    row: `FFR simulator, tricuspid implant, negative-pressure tunnel, AI urodynamics; ${counts.patents} patents, ${counts.patentsRegistered} registered; parts ship in CARDIOS and EASYCHECK.`,
  },
];

/* ---------- updates (home, index.md, llms.txt, llms-full.txt) ---------- */

/*
  The home Updates row and its twins: dated events taken from the record,
  newest first, at most UPDATES_MAX. Sources: the current appointment, the
  completed Ph.D., publications with a year, awards, registered patents and
  funded projects. Talks and pending patents are not updates; a publication
  without a year (the manuscript under revision) has no date to place it.
  `when` is the sort key: "YYYY-MM" when the month is known, "YYYY-00" when
  only the year is, so a year-only item follows every dated item of its
  year. Ties keep UPDATE_KINDS order, then content.ts order.
*/
export interface UpdateItem {
  when: string;
  label: string;
  text: string;
}
export const UPDATES_MAX = 8;

const UPDATE_KINDS = ['appointment', 'degree', 'publication', 'award', 'patent', 'project'] as const;
type UpdateKind = (typeof UPDATE_KINDS)[number];

/** "09" → "Sep" (from MONTHS, so the month names live in one table). */
const MONTH_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(MONTHS).map(([abbr, mm]) => [mm, abbr.charAt(0).toUpperCase() + abbr.slice(1)]),
);

/** "Sep. 2026", "2026-09" or "2026-09-14" → "2026-09"; "2026" → "2026-00"; "Present" or no year → undefined. */
function updateWhen(label: string | undefined): string | undefined {
  if (!label) return undefined;
  const iso = /^(\d{4})-(\d{2})/.exec(label.trim());
  if (iso) return `${iso[1]}-${iso[2]}`;
  const m = isoMonth(label);
  if (!m) return undefined;
  return m.length === 4 ? `${m}-00` : m;
}

/** "2026-09" → "Sep 2026"; "2026-00" → "2026". */
function updateLabel(when: string): string {
  const [year, mm] = when.split('-');
  return mm === '00' ? year : `${MONTH_ABBR[mm]} ${year}`;
}

/** The author role as the update sentence's adjective: "A first-author paper appeared in DMD." */
const UPDATE_ROLE: Record<AuthorRole, string> = { first: 'first-author', 'co-first': 'co-first-author', 'co-author': 'co-authored' };
/** "CMPB 2025" → "CMPB": the date column already carries the year. */
const shortVenue = (p: Publication) => shortVenueYear(p).replace(new RegExp(`\\s*${p.year}$`), '');

export const updates: UpdateItem[] = (() => {
  const pool: { when: string; kind: UpdateKind; order: number; text: string }[] = [];
  const add = (kind: UpdateKind, date: string | undefined, text: string) => {
    const when = updateWhen(date);
    if (when) pool.push({ when, kind, order: pool.length, text });
  };
  for (const x of experience.filter((e) => e.end === 'Present')) {
    add('appointment', x.start, `Started as a ${profile.role.toLowerCase()} at ${profile.university}.`);
  }
  for (const e of education.filter((d) => /^Ph\.D\./.test(d.degree))) {
    add('degree', e.end, `Completed the ${e.degree.replace(/\s*\([^)]*\)/g, '').trim()} at ${e.institution}.`);
  }
  for (const p of publications.filter((x) => x.year)) {
    add('publication', p.year, `A ${UPDATE_ROLE[p.myRole]} paper appeared in ${shortVenue(p)}.`);
  }
  for (const a of awards) {
    add('award', a.year, `Received the ${a.title} from the ${a.org}.`);
  }
  for (const p of publicPatents.filter((x) => x.status === 'registered')) {
    add('patent', p.registrationDate ?? p.year, `The patent “${p.title}” was registered.`);
  }
  for (const r of projects) {
    add('project', r.start, `Joined the ${r.funder} project “${r.title}” as ${projectRole}.`);
  }
  const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  pool.sort(
    (a, b) => cmp(b.when, a.when) || UPDATE_KINDS.indexOf(a.kind) - UPDATE_KINDS.indexOf(b.kind) || a.order - b.order,
  );
  return pool.slice(0, UPDATES_MAX).map(({ when, text }) => ({ when, label: updateLabel(when), text }));
})();

/** The updates as markdown list lines: "- Sep 2026: Started as …". */
const updatesMd = (indent = '') => updates.map((u) => `${indent}- ${u.label}: ${u.text}`);

/* ---------- research projects (/research, research.md, llms*.txt, cv.json, JSON-LD) ---------- */

/*
  content.ts researchProjects, resolved: every output id looked up (a
  missing id throws, so the build fails instead of rendering a hole), every
  {token} in a summary filled from the manifests, the years set by the
  site's range rule, and the outputs line composed for the page.
*/
const yearOf = (label: string) => label.match(/\d{4}/)?.[0] ?? '';
const projectR1 = projects.find((r) => r.id === 'R1');

const researchTokens: Record<string, string> = {
  'pino.inference': flow.inference,
  'cfd.minutes': String(flow.cfdMaxMin),
  'pino.patients': flow.cohortN,
  'pino.folds': String(pinoFolds),
  'image.acquired': numberWordCap(image.acquired.length),
  'image.ffrAccuracy': `${image.ffrAccuracy}${THIN}%`,
  'pulse.networks': numberWordCap(pulseFacts.networks),
  'pulse.auc': pulseFacts.devAuc,
  'pulse.status': pulseFacts.status,
  ...(paperAward?.forPublication ? { [`award.${paperAward.forPublication}`]: `${paperAward.title} ${paperAward.year}` } : {}),
  ...(projectR1 ? { 'project.R1.years': numberWord(Number(yearOf(projectR1.end)) - Number(yearOf(projectR1.start))) } : {}),
};

function fillTokens(text: string, owner: string): string {
  return text.replace(/\{([\w.]+)\}/g, (_, key: string) => {
    const v = researchTokens[key];
    if (v === undefined) throw new Error(`lib/schema.ts: research project "${owner}" uses the unknown token {${key}}`);
    return v;
  });
}

function lookup<T extends { id: string }>(list: readonly T[], kind: string, owner: string) {
  return (id: string): T => {
    const x = list.find((item) => item.id === id);
    if (!x) throw new Error(`lib/schema.ts: research project "${owner}" names ${kind} ${id}, which is not in content.ts`);
    return x;
  };
}

/** A link into the CV on a project's outputs line. */
export interface OutputItem {
  text: string;
  href: string;
}

export interface ResearchEntry {
  id: string;
  title: string;
  /** "2024–2026", "2024 –" (ongoing) or "2022". */
  years: string;
  /** ISO 8601 interval for JSON-LD: "2024/2026", "2024/..", "2022". */
  temporal: string;
  start: string;
  end?: string;
  summary: string;
  readonly results?: ResearchProject['results'];
  readonly figure?: ResearchProject['figure'];
  pubs: Publication[];
  patents: Patent[];
  projects: Project[];
  talks: Talk[];
  outputs: OutputItem[];
  demo?: ResearchProject['demo'];
}

const ROLE_WORD: Record<AuthorRole, string> = { first: 'first author', 'co-first': 'co-first author', 'co-author': 'co-author' };
/** "patent" for one, "3 patents" for more. */
const counted = (n: number, word: string) => (n === 1 ? word : `${n} ${word}s`);

/** "DMD 2026" from "(DMD2026)", "ACFM 2025" from "(ACFM)" and the year, else the venue (which may carry its year). */
function talkVenueYear(t: Talk): string {
  const tag = /\(([A-Z][A-Za-z0-9-]*)\)/.exec(t.venue)?.[1];
  if (tag) return tag.includes(t.year) ? tag.replace(t.year, ` ${t.year}`) : `${tag} ${t.year}`;
  return t.venue.includes(t.year) ? t.venue : `${t.venue} ${t.year}`;
}

/** The CV talk row's short venue: the acronym the record carries ("DMD2026", "ACFM"), else the venue without its year. */
export const talkShortVenue = (venue: string): string =>
  venue.match(/\(([A-Z][A-Za-z0-9-]+)\)/)?.[1] ?? venue.replace(/\s+\d{4}$/, '');

/*
  Short venues print in nowrap cells: the CV talk column (talkShortVenue)
  and the research outputs line (talkVenueYear, shortVenueYear). A venue
  with no acronym would print in full and run the row past the column, so a
  printed short venue over VENUE_MAX characters fails the build: give the
  venue a parenthesised acronym, or the paper a venueShort.
*/
const VENUE_MAX = 14;
{
  const withoutYear = (v: string, year: string) => (year ? v.replace(new RegExp(`\\s*${year}$`), '') : v);
  const printed: Array<[string, string]> = [
    ...talks.map((t): [string, string] => [t.id, talkShortVenue(t.venue)]),
    ...talks.map((t): [string, string] => [t.id, withoutYear(talkVenueYear(t), t.year)]),
    ...publications.map((p): [string, string] => [
      p.id,
      p.year ? withoutYear(shortVenueYear(p), p.year) : p.venueShort && !/\s/.test(p.venueShort) ? p.venueShort : venueInitials(p.venue),
    ]),
  ];
  const long = [...new Set(printed.filter(([, v]) => v.length > VENUE_MAX).map(([id, v]) => `${id} "${v}"`))];
  if (long.length) {
    throw new Error(
      `lib/schema.ts: a short venue runs over ${VENUE_MAX} characters (${long.join(', ')}); give the venue a parenthesised acronym or the paper a venueShort`,
    );
  }
}

/*
  The outputs line: papers (short venue and year, role), registered patents
  one by one, pending patents as one item, funded projects (short funder,
  years), then up to two talks and a count of the rest. Each item links to
  its row on the CV.
*/
function outputItems(e: Pick<ResearchEntry, 'pubs' | 'patents' | 'projects' | 'talks'>): OutputItem[] {
  const items: OutputItem[] = [];
  for (const p of e.pubs) {
    const where = p.year ? shortVenueYear(p) : revisionLabel(p);
    items.push({ text: `${where}, ${ROLE_WORD[p.myRole]}`, href: `/cv/#${p.id}` });
  }
  for (const p of e.patents.filter((x) => x.status === 'registered')) {
    items.push({ text: `patent, registered ${yearOf(p.registrationDate ?? '') || p.year}`, href: `/cv/#${p.id}` });
  }
  const pending = e.patents.filter((x) => x.status === 'pending');
  if (pending.length) {
    const years = pending.map((p) => Number(p.year));
    const span = period(String(Math.min(...years)), String(Math.max(...years)));
    items.push({ text: `${counted(pending.length, 'patent')}, pending ${span}`, href: `/cv/#${pending[0].id}` });
  }
  for (const r of e.projects) {
    items.push({ text: `${r.short} project ${period(yearOf(r.start), yearOf(r.end))}`, href: `/cv/#${r.id}` });
  }
  for (const t of e.talks.slice(0, 2)) items.push({ text: `talk, ${talkVenueYear(t)}`, href: `/cv/#${t.id}` });
  const rest = e.talks.length - 2;
  if (rest > 0) items.push({ text: `+${rest} ${rest === 1 ? 'talk' : 'talks'}`, href: `/cv/#${e.talks[2].id}` });
  return items;
}

/** The old chapter anchors, kept as empty spans inside the demo projects. */
export const LEGACY_ANCHORS: Record<NonNullable<ResearchProject['demo']>, string> = { flow: 'flow', image: 'image', pulse: 'pulse' };

export const researchEntries: ResearchEntry[] = (() => {
  const seen = new Set<string>();
  const legacy = Object.values(LEGACY_ANCHORS);
  const resolved = researchProjects.map((rp, index) => {
    if (seen.has(rp.id) || legacy.includes(rp.id)) {
      throw new Error(`lib/schema.ts: research project id "${rp.id}" is repeated or collides with an old anchor`);
    }
    seen.add(rp.id);
    if (!/^\d{4}$/.test(rp.start) || (rp.end !== undefined && !/^\d{4}$/.test(rp.end))) {
      throw new Error(`lib/schema.ts: research project "${rp.id}" years must be YYYY`);
    }
    const entry: ResearchEntry = {
      id: rp.id,
      title: rp.title,
      years: rp.end === undefined ? `${rp.start} –` : period(rp.start, rp.end),
      temporal: rp.end === undefined ? `${rp.start}/..` : rp.start === rp.end ? rp.start : `${rp.start}/${rp.end}`,
      start: rp.start,
      end: rp.end,
      summary: fillTokens(rp.summary, rp.id),
      results: rp.results,
      figure: rp.figure,
      pubs: (rp.pubs ?? []).map(lookup(publications, 'publication', rp.id)),
      patents: (rp.patents ?? []).map(lookup(patents, 'patent', rp.id)).filter((p) => p.status !== 'withdrawn'),
      projects: (rp.projects ?? []).map(lookup(projects, 'project', rp.id)),
      talks: (rp.talks ?? []).map(lookup(talks, 'talk', rp.id)),
      outputs: [],
      demo: rp.demo,
    };
    entry.outputs = outputItems(entry);
    return { entry, index };
  });
  /* Newest first by start year; within a year the demo projects first, then content.ts order. */
  resolved.sort(
    (a, b) =>
      Number(b.entry.start) - Number(a.entry.start) ||
      Number(Boolean(b.entry.demo)) - Number(Boolean(a.entry.demo)) ||
      a.index - b.index,
  );
  const demos = resolved.flatMap((x) => (x.entry.demo ? [x.entry.demo] : []));
  for (const d of Object.keys(LEGACY_ANCHORS)) {
    if (demos.filter((x) => x === d).length !== 1) throw new Error(`lib/schema.ts: the ${d} demo must belong to exactly one research project`);
  }
  return resolved.map((x) => x.entry);
})();

/** The project a demo belongs to (the research page mounts each demo inside it). */
export function researchEntryFor(demo: NonNullable<ResearchProject['demo']>): ResearchEntry {
  const e = researchEntries.find((x) => x.demo === demo);
  if (!e) throw new Error(`lib/schema.ts: no research project carries the ${demo} demo`);
  return e;
}

/** The research page's one-line header and its closing row (page and research.md). */
export const researchLine = '';
export const researchClosing = '';

/** Home "Selected": the first-author journal paper, the first-author DMD 2026 proceedings paper, the co-first journal paper; newest first. */
export const SELECTED = ['J2', 'C1', 'J4'].map(pub).sort((a, b) => Number(b.year) - Number(a.year));

/* ---------- JSON-LD ---------- */

export type JsonLdNode = Record<string, unknown>;

export function personNode(imageUrl?: string): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    alternateName: profile.nameKo,
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
  const pageId = `${abs('/research/')}#webpage`;
  /* One CreativeWork per research project; papers are cited by their DOI URL where they have one. */
  const part = (e: ResearchEntry): JsonLdNode => ({
    '@type': 'CreativeWork',
    '@id': `${abs('/research/')}#${e.id}`,
    url: `${abs('/research/')}#${e.id}`,
    name: e.title,
    description: e.summary,
    ...(e.figure ? { image: abs(e.figure.src) } : e.results ? { image: e.results.cases.map((c) => abs(c.poster)) } : {}),
    temporalCoverage: e.temporal,
    author: { '@id': PERSON_ID },
    isPartOf: { '@id': pageId },
    ...(e.pubs.length
      ? {
          citation: e.pubs.map((p) =>
            p.doi
              ? { '@type': 'ScholarlyArticle', '@id': doiUrl(p), url: doiUrl(p), name: p.title }
              : { '@type': 'ScholarlyArticle', name: p.title },
          ),
        }
      : {}),
  });
  return [
    ...baseGraph(imageUrl),
    {
      '@type': 'WebPage',
      '@id': pageId,
      url: abs('/research/'),
      name: `Research · ${profile.name}`,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      author: { '@id': PERSON_ID },
      dateModified: BUILD_DATE,
      inLanguage: 'en',
      hasPart: researchEntries.map(part),
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

/** A paper's citation line in markdown; a manuscript prints its one status label in place of the venue and the raw status. */
function pubCitationMd(p: Publication): string {
  const bits = [p.type === 'under-review' ? revisionLabel(p) : citationLine(p), ROLE_LABEL[p.myRole]];
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

/** "# Hyeong Jun Lee (이형준)": the agent files' heading, the English name with the Korean one. */
const headingMd = `# ${profile.name} (${profile.nameKo})`;

function identityMd(): string[] {
  return [
    headingMd,
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
    '## Recent',
    '',
    ...updatesMd(),
    '',
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

/* The demo blocks under their projects in research.md and llms-full.txt (artifact, colorbars, method, metrics). */
function flowDemoMd(): string[] {
  return [
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
  ];
}

function imageDemoMd(): string[] {
  const J1 = pub('J1');
  return [
    `Artifact: ${image.caseLabel} from the 4D CT paper (${J1.id}, ${image.figure}) through one cardiac cycle, pressure and wall shear stress at each of ${image.phases} phases; ${image.acquiredList} were acquired by CT, the other ${image.synthesized} synthesized, and CFD solved every one.`,
    '',
    `Colour scales (the paper's renders): ${image.legends}.`,
    '',
    `A denoising diffusion deformable model synthesizes a full-cycle 4D coronary CT from two acquired phases; the sequence is then meshed and solved, so FFR can be followed across the cardiac cycle instead of read from one static phase.`,
    '',
    '| Metric (reported in the paper) | Value |',
    '| --- | --- |',
    `| Phases | ${image.phases} (${image.acquiredList} acquired) |`,
    `| 4D CT-FFR accuracy against invasive FFR | ${image.ffrAccuracy} % |`,
    `| Synthesis PSNR | ${image.psnr} |`,
    `| Synthesis SSIM | ${image.ssim} |`,
    `| Synthesis Dice | ${image.dice} |`,
  ];
}

function pulseDemoMd(): string[] {
  const p = pulseFacts;
  return [
    `Artifact: a ${p.durationS} s smartwatch PPG recording as the network sees it, an STFT spectrogram (${p.stftSize}, ${p.crop[0]}–${p.crop[1]} Hz shown) and a CWT strip (${p.cwtSize}), from the development cohort, taken before the first bolus.`,
    '',
    `Green-channel PPG at ${p.fs} Hz is band-passed, normalized in short windows and cut into overlapping segments; each segment becomes an STFT or CWT image. Six CNN configurations across four backbones, each kept as five fold checkpoints, make ${p.networks} networks. Segment scores are averaged per patient, rank-normalized within each fold and combined by a non-negative weighted average. Validation is ${p.folds}-fold stratified cross-validation with out-of-fold, patient-level scores.`,
    '',
    /* The status label is printed once per entry, in the outputs list above this block. */
    `Fluid-bolus prediction at patient level, from ${M1.id}.`,
    '',
    '| Set | AUC [95 % CI] | n |',
    '| --- | --- | --- |',
    `| Development, out-of-fold | ${p.devAuc} [${p.devCi}] | ${p.devN} |`,
    `| Same-center temporal set | ${p.tempAuc} [${p.tempCi}] | ${p.tempN} |`,
    '',
    'The development figure is internally selected (ensemble weights and cutoff were chosen on those predictions); the temporal set was scored with the model, weights and cutoff unchanged.',
  ];
}

const DEMO_MD: Record<NonNullable<ResearchProject['demo']>, () => string[]> = {
  flow: flowDemoMd,
  image: imageDemoMd,
  pulse: pulseDemoMd,
};

function patentStatusMd(p: Patent): string {
  const status = p.status === 'registered' ? `Registered ${p.registrationDate ?? ''}`.trim() : `Pending, filed ${p.year}`;
  const number = p.registrationNo ? `${applicationLabel(p)} (reg. ${p.registrationNo})` : applicationLabel(p);
  return `${status} · ${number}`;
}

/** A project's outputs in full: paper titles with citations, patent titles with status and number, funded projects, talks. */
function outputsMd(e: ResearchEntry): string[] {
  const lines = [
    ...e.pubs.map((p) => `- Paper: ${p.title}. ${pubCitationMd(p)}`),
    ...e.patents.map((p) => `- Patent: ${p.title}. ${patentStatusMd(p)}`),
    ...e.projects.map(
      (r) => `- Funded project: ${r.title}. ${r.funder}${r.program ? `, ${r.program}` : ''} · ${period(r.start, r.end)} (${projectRole})`,
    ),
    ...e.talks.map((t) => `- Talk: ${t.title}. ${t.venue}, ${t.location}, ${t.year} · ${t.format} · ${t.role === 'presenter' ? 'presenter' : 'co-author'}`),
  ];
  return lines.length ? ['Outputs:', '', ...lines] : [];
}

/**
  The A⁺4DCT results plate in markdown: the caption sentences, what the
  numbers are, the comparison table (FFR to three decimals, as in every
  metrics table) and each case's poster and video.
*/
function coronaryResultsMd(results: NonNullable<ResearchProject['results']>): string[] {
  return [
    `${numberWordCap(results.cases.length)} cases, ordered by calcium score. ${results.status}`,
    '',
    `${formatInt(results.phaseCount)}-phase mean Pd/Pa with and without angio enhancement; invasive FFR is the clinical reference. The vessel videos show instantaneous Pd(t)/Pa(t).`,
    '',
    '| Calcium score | 4DCT | A⁺4DCT | Invasive FFR |',
    '| --- | --- | --- | --- |',
    ...results.cases.map((c) => `| ${calciumScore(c.calcium)} | ${formatDecimal(c.beforeFfr, 3)} | ${formatDecimal(c.afterFfr, 3)} | ${formatDecimal(c.clinicalFfr, 3)} |`),
    '',
    ...results.cases.flatMap((c) => [`![Coronary pressure-ratio field, calcium score ${calciumScore(c.calcium)}](${abs(c.poster)})`, '', `[Play the cardiac cycle, calcium score ${calciumScore(c.calcium)}](${abs(c.video)})`, '']),
  ];
}

/** One section per research project, in page order: heading with years, the sentence, the results plate or paper figure where there is one, the outputs, and the demo blocks where there is one. */
function researchProjectsMd(): string[] {
  return researchEntries.flatMap((e) => {
    const outputs = outputsMd(e);
    const demo = e.demo ? DEMO_MD[e.demo]() : [];
    return [
      `## ${e.title} (${e.years})`,
      '',
      `Page: ${abs(`/research/#${e.id}`)}`,
      '',
      e.summary,
      '',
      ...(e.results ? coronaryResultsMd(e.results) : []),
      ...(e.figure ? [`![${e.figure.alt}](${abs(e.figure.src)})`, '', e.figure.caption, ''] : []),
      ...(outputs.length ? [...outputs, ''] : []),
      ...(demo.length ? [...demo, ''] : []),
    ];
  });
}

export function researchMarkdown(): string {
  return [
    '# Research',
    '',
    ...researchProjectsMd(),
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
    headingMd,
    '',
    `> ${profile.role} at the ${profile.lab}, ${profile.department}, ${profile.university} (Seoul). ${tagline}`,
    '',
    `- Role: ${roleLine}; concurrently ${concurrentLine} (PI: ${profile.concurrent.pi}).`,
    `- Ph.D. in Mechanical Engineering, ${education[0].institution}, completed ${profile.phdCompleted}.`,
    `- Fields: ${listAnd(profile.fields)}.`,
    ...capabilities.map((c) => `  - ${c.name}: ${c.row}`),
    `- Research projects (/research), newest first:`,
    ...researchEntries.map((e) => `  - ${e.title} (${e.years})`),
    `- Recent:`,
    ...updatesMd('  '),
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
    `- [llms-full.txt](${abs('/llms-full.txt')}): the full CV and every research project with its outputs (the three demos with their metrics), in one markdown file.`,
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
    headingMd,
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
    '## Recent',
    '',
    ...updatesMd(),
    '',
    '# Part 1. Research',
    '',
    ...researchProjectsMd(),
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

/* The demo numbers cv.json carries under each demo project (the old research.flow / image / pulse objects). */
const researchDemoJson: Record<NonNullable<ResearchProject['demo']>, Record<string, unknown>> = {
  flow: {
    caption: plateCaption,
    timing: timingLine,
    cfdReference,
    metricsLabel: flow.label,
    rank: flow.rank,
    table: flow.rows.map(([metric, kase, cohort]) => ({ metric, case: kase, cohortMedian: cohort })),
    colorbars: flowLegends,
  },
  image: { phases: image.phases, acquired: image.acquiredList, legends: image.legends, ffrAccuracyPercent: image.ffrAccuracy, psnr: image.psnr, ssim: image.ssim, dice: image.dice },
  pulse: {
    status: pulseFacts.status,
    development: { auc: pulseFacts.devAuc, ci95: pulseFacts.devCi, n: pulseFacts.devN },
    temporal: { auc: pulseFacts.tempAuc, ci95: pulseFacts.tempCi, n: pulseFacts.tempN },
  },
};

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
    /* Every research project as /research lists it; the three demo projects carry their demo's numbers. */
    research: researchEntries.map((e) =>
      compact({
        id: e.id,
        name: e.title,
        startDate: e.start,
        endDate: e.end,
        ongoing: e.end === undefined ? true : undefined,
        summary: e.summary,
        /* FFR to three decimals, as in the markdown table: the means are differences of chart values and carry float noise past that. */
        results: e.results
          ? {
              ...e.results,
              cases: e.results.cases.map((c) => ({
                ...c,
                beforeFfr: Number(c.beforeFfr.toFixed(3)),
                afterFfr: Number(c.afterFfr.toFixed(3)),
                poster: abs(c.poster),
                video: abs(c.video),
              })),
            }
          : undefined,
        figure: e.figure ? { ...e.figure, src: abs(e.figure.src) } : undefined,
        url: abs(`/research/#${e.id}`),
        publications: e.pubs.map((x) => x.id),
        patents: e.patents.map((x) => x.id),
        projects: e.projects.map((x) => x.id),
        talks: e.talks.map((x) => x.id),
        demo: e.demo ? { name: e.demo, ...researchDemoJson[e.demo] } : undefined,
      }),
    ),
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
