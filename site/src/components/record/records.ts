/*
  Derived views of content.ts for the CV page (/cv), which now holds the
  whole record. Nothing here adds a fact; every value is a filter, a format
  or a lookup of the dataset, so the page never types a number twice.
  (Counts shared with the home page and the agent files live in
  lib/schema.ts.)
*/
import { patents, publications, type Patent, type Publication } from '@/data/content';

/* ---------- dates ---------- */

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

/** First- or co-first-authored work. */
export function leads(p: Publication): boolean {
  return p.myRole === 'first' || p.myRole === 'co-first';
}

/**
  Result figures that belong to a publication (C1's CFD against PINO
  fields), linked from its CV row. Workflow flowcharts (J2, J4) are not
  plates anywhere on the site (DESIGN.md, plate policy). Alt text names the
  figure, not the claim.
*/
export const PLATES: Record<string, { src: string; width: number; height: number; alt: string }> = {
  C1: {
    src: '/media/papers/extracted/pino-dmd2026.png',
    width: 578,
    height: 1125,
    alt: 'Figure from the DMD 2026 proceedings: coronary pressure and velocity fields, CFD ground truth beside the physics-informed neural operator prediction.',
  },
};

/** The publication an award cites, when the dataset links one. */
export function awardPublication(forPublication?: string): Publication | undefined {
  return forPublication ? publications.find((p) => p.id === forPublication) : undefined;
}

/* ---------- patents ---------- */

/** Withdrawn rows stay in the dataset for the record but never render or count. */
export const publicPatents: Patent[] = patents.filter((p) => p.status !== 'withdrawn');

/** "KR 10-2022-0030019" / "US 17/820,819" / "PCT/KR2025/002462" (PCT numbers already carry the prefix). */
export function applicationLabel(p: Patent): string {
  return p.jurisdiction === 'PCT' ? p.applicationNo : `${p.jurisdiction} ${p.applicationNo}`;
}
