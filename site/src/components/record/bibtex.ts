/*
  BibTeX generated at build time from content.ts, one entry per publication.
  Author marks († first author, * corresponding) are stripped; names are
  written "Surname, I. J." so BibTeX styles can abbreviate them consistently.
*/
import type { Publication } from '@/data/content';

function bibAuthor(token: string): string {
  const clean = token.replace(/[†*]/g, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length < 2) return clean;
  const surname = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .join(' ')
    .replace(/\.(?=\S)/g, '. ')
    .trim();
  return `${surname}, ${initials}`;
}

function bibAuthors(authors: string): string {
  return authors.split(/,\s*/).map(bibAuthor).join(' and ');
}

function firstSurname(authors: string): string {
  const first = authors.split(/,\s*/)[0].replace(/[†*]/g, '').trim();
  return first.split(/\s+/).pop() ?? 'Lee';
}

function escapeField(value: string): string {
  return value.replace(/[{}]/g, '').replace(/&/g, '\\&').replace(/–/g, '--').replace(/—/g, '---');
}

function field(name: string, value: string | undefined, wrap = false): string | null {
  if (!value) return null;
  const v = escapeField(value);
  return `  ${name} = {${wrap ? `{${v}}` : v}}`;
}

/** "16(1)" → { volume: "16", number: "1" }; anything else stays the volume. */
function splitVolume(volume?: string): { volume?: string; number?: string } {
  if (!volume) return {};
  const m = volume.match(/^(\d+)\((\d+)\)$/);
  return m ? { volume: m[1], number: m[2] } : { volume };
}

/** Everything after the short venue, when the full venue adds a location: "Minneapolis, MN, USA". */
function addressOf(p: Publication): string | undefined {
  if (!p.venueShort || !p.venue.startsWith(p.venueShort)) return undefined;
  return p.venue.slice(p.venueShort.length).replace(/^,\s*/, '') || undefined;
}

export function bibtexKey(p: Publication): string {
  return `${firstSurname(p.authors)}${p.year}${p.id.toLowerCase()}`;
}

export function bibtex(p: Publication): string {
  const { volume, number } = splitVolume(p.volume);
  const common = [field('author', bibAuthors(p.authors)), field('title', p.title, true)];
  let kind: string;
  let rest: (string | null)[];
  switch (p.type) {
    case 'journal':
      kind = 'article';
      rest = [
        field('journal', p.venue),
        field('volume', volume),
        field('number', number),
        field('pages', p.pages ?? p.article),
        field('year', p.year),
        field('doi', p.doi),
      ];
      break;
    case 'proceedings':
      kind = 'inproceedings';
      rest = [
        field('booktitle', p.venueShort ?? p.venue),
        field('address', addressOf(p)),
        field('pages', p.article),
        field('year', p.year),
        field('doi', p.doi),
      ];
      break;
    default:
      kind = 'unpublished';
      rest = [field('note', `${p.status}, ${p.venue}`), field('year', p.year)];
  }
  const lines = [...common, ...rest].filter((l): l is string => l !== null);
  return `@${kind}{${bibtexKey(p)},\n${lines.join(',\n')}\n}`;
}
