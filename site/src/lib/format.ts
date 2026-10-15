/*
  Number and unit formatting shared by pages and islands.
  Every number on a page is computed from content.ts or the data manifests
  and formatted here, never typed twice.
*/

/** U+202F narrow no-break space: thin, and never a line-break opportunity. */
export const THIN = ' ';

/** Integer with thin-space thousands separators: 8649 → "8 649". */
export function formatInt(n: number): string {
  const v = Math.round(Math.abs(n));
  const digits = String(v);
  let out = '';
  for (let i = 0; i < digits.length; i += 1) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += THIN;
  }
  return (n < 0 ? '−' : '') + out;
}

/** Fixed decimals with a true minus sign and thin-space thousands. */
export function formatDecimal(n: number, digits = 2): string {
  const abs = Math.abs(n).toFixed(digits);
  const [intPart, fracPart] = abs.split('.');
  const intFormatted = formatInt(Number(intPart));
  return (n < 0 ? '−' : '') + (fracPart ? `${intFormatted}.${fracPart}` : intFormatted);
}

/** Pascals → kilopascals with unit: 12988.7 → "13.0 kPa" (digits default 1). */
export function formatPa(pa: number, digits = 1): string {
  return `${formatDecimal(pa / 1000, digits)}${THIN}kPa`;
}

/** Pascals → number only in kPa, for ticks that share one unit label. */
export function formatKpa(pa: number, digits = 1): string {
  return formatDecimal(pa / 1000, digits);
}

/** A pressure range in kPa: "10.7–13.0 kPa". */
export function formatPaRange(minPa: number, maxPa: number, digits = 1): string {
  return `${formatKpa(minPa, digits)}–${formatKpa(maxPa, digits)}${THIN}kPa`;
}

/** Seconds with unit: 1.78 → "1.78 s". */
export function formatSeconds(s: number, digits = 2): string {
  return `${formatDecimal(s, digits)}${THIN}s`;
}

/** Millimetres with unit. */
export function formatMm(mm: number, digits = 1): string {
  return `${formatDecimal(mm, digits)}${THIN}mm`;
}

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/**
 * Number as an English word for prose: 7 → "seven", 16 → "sixteen",
 * 42 → "forty-two". Beyond 99 (or non-integers) falls back to formatInt.
 */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return formatInt(n);
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
}

/** Capitalised number word for sentence starts. */
export function numberWordCap(n: number): string {
  const w = numberWord(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Singular/plural helper: plural(1, 'patent') → "1 patent"; (2) → "2 patents". */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatInt(n)} ${n === 1 ? singular : pluralForm}`;
}
