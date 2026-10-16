/*
  The few manifest values the viewer prints before (and without) fetching
  the manifest: case id, node count and the colorbar ranges. They let the
  server render carry the colorbar ticks, the loading line and the
  screen-reader summary, so no number on the plate exists only after
  hydration.

  Pages may pass their own `summary` prop (computed from the manifest they
  read at build). When they do not, and the viewer points at the shipped
  manifest, this build-time copy is used: named imports of three top-level
  keys, so the bundle carries these values and not the whole manifest.
*/
import { case_id, ranges, vertexCount } from '../../../public/data/pino/manifest.json';
import type { LegendRanges } from './colors';

export interface ViewerSummary {
  case_id: string;
  vertexCount: number;
  ranges: LegendRanges;
}

/** Where the shipped manifest is served; the build-time copy only stands in for this URL. */
export const DEFAULT_MANIFEST_URL = '/data/pino/manifest.json';

export const DEFAULT_SUMMARY: ViewerSummary = {
  case_id,
  vertexCount,
  ranges: {
    p: [ranges.p[0], ranges.p[1]],
    p_err_abs_max: ranges.p_err_abs_max,
    p_err_min: ranges.p_err_min,
    p_err_max: ranges.p_err_max,
    vmag_wall_max: ranges.vmag_wall_max,
  },
};

/** The summary for a manifest URL: the build-time copy for the shipped manifest, else none. */
export function summaryFor(manifestUrl: string): ViewerSummary | undefined {
  const path = manifestUrl.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
  return path === DEFAULT_MANIFEST_URL ? DEFAULT_SUMMARY : undefined;
}

/** The summary from a loaded manifest (the runtime source of truth). */
export function summaryOf(m: { case_id: string; vertexCount: number; ranges: LegendRanges }): ViewerSummary {
  return {
    case_id: m.case_id,
    vertexCount: m.vertexCount,
    ranges: {
      p: [m.ranges.p[0], m.ranges.p[1]],
      p_err_abs_max: m.ranges.p_err_abs_max,
      p_err_min: m.ranges.p_err_min,
      p_err_max: m.ranges.p_err_max,
      vmag_wall_max: m.ranges.vmag_wall_max,
    },
  };
}
