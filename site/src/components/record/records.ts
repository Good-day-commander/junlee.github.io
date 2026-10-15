/*
  Derived views of content.ts for the Read surfaces (/publications, /record, /cv).
  Nothing here adds a fact; every list is a sort, a grouping or a count of the
  dataset, so the pages never type a number twice.
*/
import {
  awards,
  fellowships,
  patents,
  projects,
  publications,
  talks,
  teaching,
  type Patent,
  type PatentJurisdiction,
  type Project,
  type Publication,
  type PublicationType,
  type Talk,
} from '@/data/content';

/* ---------- dates ---------- */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** "Jun. 2022" → 2022*12+5; "Present" → far future; a bare year uses `fallbackMonth`. */
export function dateKey(label: string, fallbackMonth: number): number {
  if (/present/i.test(label)) return Number.MAX_SAFE_INTEGER;
  const year = Number((label.match(/\d{4}/) ?? ['0'])[0]);
  const mon = label.trim().slice(0, 3).toLowerCase();
  const month = mon in MONTHS ? MONTHS[mon] : fallbackMonth;
  return year * 12 + month;
}

/*
  One range rule for the whole site: an en dash, spaced only when an end
  itself contains a space ("Mar. 2020 – Feb. 2022"), closed when both ends
  are single tokens ("2022–2025", "2023–2024"). The en dash is never used as
  a clause separator.
*/
export function range(a: string, b: string): string {
  return /\s/.test(a) || /\s/.test(b) ? `${a} – ${b}` : `${a}–${b}`;
}

/** Re-set a range string from content.ts ("2022 – 2025") by the same rule. */
export function normRange(label: string): string {
  const parts = label.split(/\s*–\s*/);
  return parts.length === 2 ? range(parts[0].trim(), parts[1].trim()) : label;
}

/** "Jun. 2022 – Feb. 2029", collapsing to one label when both ends are the same. */
export function period(start: string, end: string): string {
  return start === end ? start : range(start, end);
}

/** Sentence-case a lowercase field from content.ts ("poster" → "Poster"). */
export function capitalize(s: string): string {
  return s ? `${s.charAt(0).toUpperCase()}${s.slice(1)}` : s;
}

/* ---------- publications ---------- */

export const PUBLICATION_GROUPS: { type: PublicationType; heading: string; note: string }[] = [
  { type: 'journal', heading: 'Journal articles', note: 'SCIE-indexed' },
  { type: 'proceedings', heading: 'Peer-reviewed proceedings', note: '' },
  { type: 'under-review', heading: 'Under review', note: '' },
];

export function publicationsOf(type: PublicationType): Publication[] {
  return publications.filter((p) => p.type === type);
}

export function doiUrl(p: Publication): string | undefined {
  return p.doi ? `https://doi.org/${p.doi}` : undefined;
}

/** "Computer Methods and Programs in Biomedicine · 265, 108740 · 2025" */
export function citationLine(p: Publication, { shortVenue = false } = {}): string {
  const parts: string[] = [shortVenue && p.venueShort ? p.venueShort : p.venue];
  const where = [p.volume, p.article ?? p.pages].filter(Boolean).join(', ');
  if (where) parts.push(where);
  if (p.year) parts.push(p.year);
  return parts.join(' · ');
}

/** Leading role = the larger frame on /publications. */
export function leads(p: Publication): boolean {
  return p.myRole === 'first' || p.myRole === 'co-first';
}

/**
  Figure plate per publication: only where the figure is a result (C1's CFD
  against PINO fields). Workflow flowcharts (J2, J4) are not plates anywhere
  on the site (DESIGN.md, plate policy). Alt text names the figure, not the
  claim.
*/
export const PLATES: Record<string, { src: string; width: number; height: number; alt: string }> = {
  C1: {
    src: '/media/papers/extracted/pino-dmd2026.png',
    width: 578,
    height: 1125,
    alt: 'Figure from the DMD 2026 proceedings: coronary pressure and velocity fields, CFD ground truth beside the physics-informed neural operator prediction.',
  },
};

export const publicationCounts = {
  journal: publicationsOf('journal').length,
  proceedings: publicationsOf('proceedings').length,
  underReview: publicationsOf('under-review').length,
  lead: publications.filter(leads).length,
};

/* ---------- talks ---------- */

export type TalkYear = { year: string; items: Talk[] };

/**
  Newest year first; inside a year International precedes Domestic, otherwise
  CV order. Pass a role to keep only the talks I presented ('presenter') or
  only those I co-authored.
*/
export function talksByYear(role?: Talk['role']): TalkYear[] {
  const order: Record<Talk['category'], number> = { International: 0, Domestic: 1 };
  const pool = role ? talks.filter((t) => t.role === role) : talks;
  const sorted = [...pool].sort((a, b) => {
    const dy = Number(b.year) - Number(a.year);
    return dy !== 0 ? dy : order[a.category] - order[b.category];
  });
  const groups: TalkYear[] = [];
  for (const t of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.year === t.year) last.items.push(t);
    else groups.push({ year: t.year, items: [t] });
  }
  return groups;
}

export const talkCounts = {
  total: talks.length,
  presented: talks.filter((t) => t.role === 'presenter').length,
  international: talks.filter((t) => t.category === 'International').length,
  domestic: talks.filter((t) => t.category === 'Domestic').length,
};

/* ---------- patents ---------- */

/** Withdrawn rows stay in the dataset for the record but never render or count. */
export const publicPatents: Patent[] = patents.filter((p) => p.status !== 'withdrawn');

export type PatentFamily = {
  key: string;
  title: string;
  /** Registered filings first, then newest first. */
  members: Patent[];
  jurisdictions: PatentJurisdiction[];
  registered: boolean;
  yearLabel: string;
  latestYear: number;
};

/** Filings that share a title (KR / US / PCT counterparts) form one family. */
export function patentFamilies(list: Patent[] = publicPatents): PatentFamily[] {
  const byTitle = new Map<string, Patent[]>();
  for (const p of list) {
    const g = byTitle.get(p.title);
    if (g) g.push(p);
    else byTitle.set(p.title, [p]);
  }
  const families = Array.from(byTitle.values()).map((group) => {
    const members = [...group].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'registered' ? -1 : 1;
      return Number(b.year) - Number(a.year);
    });
    const years = members.map((p) => Number(p.year));
    const earliest = Math.min(...years);
    const latest = Math.max(...years);
    return {
      key: members[0].id,
      title: members[0].title,
      members,
      jurisdictions: Array.from(new Set(members.map((p) => p.jurisdiction))),
      registered: members.some((p) => p.status === 'registered'),
      yearLabel: earliest === latest ? String(latest) : range(String(earliest), String(latest)),
      latestYear: latest,
    };
  });
  // Families with a registered filing first, then by most recent filing year; ties keep CV order.
  return families.sort((a, b) => {
    if (a.registered !== b.registered) return a.registered ? -1 : 1;
    return b.latestYear - a.latestYear;
  });
}

/** "KR 10-2022-0030019" / "US 17/820,819" / "PCT/KR2025/002462" (PCT numbers already carry the prefix). */
export function applicationLabel(p: Patent): string {
  return p.jurisdiction === 'PCT' ? p.applicationNo : `${p.jurisdiction} ${p.applicationNo}`;
}

export const patentCounts = {
  filings: publicPatents.length,
  registered: publicPatents.filter((p) => p.status === 'registered').length,
  pending: publicPatents.filter((p) => p.status === 'pending').length,
  families: patentFamilies().length,
  byJurisdiction: (['KR', 'US', 'PCT'] as PatentJurisdiction[]).map((j) => ({
    jurisdiction: j,
    count: publicPatents.filter((p) => p.jurisdiction === j).length,
  })),
};

/* ---------- projects ---------- */

/** Latest end date first, then latest start; open ends sort first. */
export const projectsByEnd: Project[] = [...projects].sort((a, b) => {
  const de = dateKey(b.end, 11) - dateKey(a.end, 11);
  return de !== 0 ? de : dateKey(b.start, 0) - dateKey(a.start, 0);
});

export const projectSpan = (() => {
  const starts = projects.map((p) => Number(p.start.match(/\d{4}/)?.[0] ?? 0));
  const ends = projects.map((p) => Number(p.end.match(/\d{4}/)?.[0] ?? 0));
  return { from: Math.min(...starts), to: Math.max(...ends), count: projects.length };
})();

/* ---------- honours ---------- */

export const honourCounts = {
  awards: awards.length,
  fellowships: fellowships.length,
  teaching: teaching.length,
};

/** The publication an award cites, when the dataset links one. */
export function awardPublication(forPublication?: string): Publication | undefined {
  return forPublication ? publications.find((p) => p.id === forPublication) : undefined;
}
