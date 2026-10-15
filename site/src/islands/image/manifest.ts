/*
  The 4D CT phase data: types and pure helpers shared by the PhaseScrubber
  island (browser) and the pages that print numbers from it (build time).
  Nothing here imports the JSON, so the island bundle stays free of it; the
  pages read the file through ./data.ts.

  Source: site/public/data/image/manifest.json (J1, CMPB 282, 109382, 2026,
  Fig. 8, Case 1). Every phase label, range and unit below is parsed from
  that file, never typed.
*/

export type ImageField = 'pressure' | 'wss';

export interface ImageFieldSpec {
  label: string;
  unit: string;
  range: [number, number];
  colormap: string;
  frames: string[];
}

export interface ImageManifest {
  source: {
    paper_id: string;
    title: string;
    venue: string;
    doi: string;
    figure: string;
    frames_from?: string;
  };
  case: string;
  phases: number;
  width: number;
  height: number;
  fields: Record<ImageField, ImageFieldSpec>;
  notes: string[];
  supporting: { fig9: string };
}

export interface AcquiredPhase {
  phase: number;
  /** "end-diastole" / "end-systole" when the note names them, in order. */
  name: string | null;
}

/**
 * "Phase 0 and Phase 5 are the two acquired CT phases (end-diastole and
 * end-systole); …" → [{0, end-diastole}, {5, end-systole}]. Empty when the
 * note is missing; data.ts asserts it at build time so a page never ships
 * with every phase marked synthesized.
 */
export function acquiredPhases(m: ImageManifest): AcquiredPhase[] {
  for (const note of m.notes) {
    const hit = /Phase\s+(\d+)\s+and\s+Phase\s+(\d+)\s+are the two acquired/i.exec(note);
    if (!hit) continue;
    const names = /\(([a-z-]+)\s+and\s+([a-z-]+)\)/i.exec(note);
    return [
      { phase: Number(hit[1]), name: names ? names[1] : null },
      { phase: Number(hit[2]), name: names ? names[2] : null },
    ];
  }
  return [];
}

/** The note that explains acquired against synthesized phases, for a caption. */
export function phaseNote(m: ImageManifest): string | null {
  return m.notes.find((n) => /acquired/i.test(n)) ?? null;
}

export interface ReportedMetrics {
  psnr: string;
  ssim: string;
  dice: string;
  /** "90.5" (percent). */
  ffrAccuracy: string;
}

/** "Reported in the paper: PSNR 32.01, SSIM 0.937, Dice 0.973, 4D CT-FFR accuracy 90.5 % …" */
export function reportedMetrics(m: ImageManifest): ReportedMetrics | null {
  const note = m.notes.find((n) => /Reported in the paper/i.test(n));
  if (!note) return null;
  const grab = (re: RegExp) => re.exec(note)?.[1] ?? null;
  const psnr = grab(/PSNR\s+([\d.]+)/);
  const ssim = grab(/SSIM\s+([\d.]+)/);
  const dice = grab(/Dice\s+([\d.]+)/);
  const ffrAccuracy = grab(/CT-FFR accuracy\s+([\d.]+)\s*%/);
  if (!psnr || !ssim || !dice || !ffrAccuracy) return null;
  return { psnr, ssim, dice, ffrAccuracy };
}

/** "Fig. 8. Visualized CFD results …" → "Fig. 8" */
export function figureLabel(m: ImageManifest): string {
  return /^Fig\.\s*\d+/.exec(m.source.figure)?.[0] ?? 'Figure';
}

/** Journal initials: "Computer Methods and Programs in Biomedicine" → "CMPB". */
export function venueInitials(venue: string): string {
  return venue
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('');
}

/** Directory of the manifest URL, so frame files resolve next to it. */
export function baseOf(manifestUrl: string): string {
  const i = manifestUrl.lastIndexOf('/');
  return i >= 0 ? manifestUrl.slice(0, i + 1) : '';
}

/** mmHg → kPa, for the second unit on the pressure legend. */
export const KPA_PER_MMHG = 0.133322;
