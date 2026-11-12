/*
  Agent discovery files (2026-11-12), all generated at build time:
    /.well-known/ai-catalog.json            ARD manifest (ai-catalog data model): what an agent can fetch here
    /.well-known/agent-skills/index.json    Agent Skills discovery index (v0.2.0)
    /.well-known/agent-skills/hyeongjunlee-site/SKILL.md   the one skill: how to read and cite this site
  The site has no API, no MCP server and no sign-in, so it publishes no API
  catalog, server card or OAuth metadata: those would describe things that
  do not exist. Every URL comes from SITE; no number is typed here.
*/
import { createHash } from 'node:crypto';
import { profile } from '@/data/content';
import { SITE } from '@/lib/schema';

const HOST = new URL(SITE).hostname;
const url = (path: string) => `${SITE}${path}`;

export const SKILL_NAME = 'hyeongjunlee-site';
export const SKILL_PATH = `/.well-known/agent-skills/${SKILL_NAME}/SKILL.md`;
const SKILL_DESCRIPTION = `Read and cite the research site of ${profile.name}: which machine-readable file answers which question, and how to state author roles and contact details correctly.`;

export function skillMd(): string {
  return [
    '---',
    `name: ${SKILL_NAME}`,
    `description: "${SKILL_DESCRIPTION}"`,
    '---',
    '',
    `# Reading ${HOST}`,
    '',
    `This is the personal research site of ${profile.name}, ${profile.role} at ${profile.university}. It is a static site. There is no API, no sign-in and no rate limit; fetch the files below directly.`,
    '',
    '## Which file to fetch',
    '',
    `- A short summary with links: ${url('/llms.txt')}`,
    `- Everything on the site as one text file: ${url('/llms-full.txt')}`,
    `- The CV as JSON Resume (publications, patents, talks, awards, projects): ${url('/cv.json')}`,
    `- The home page as markdown: ${url('/index.md')}`,
    `- The research projects, with their numbers and figures, as markdown: ${url('/research.md')}`,
    `- The CV as markdown: ${url('/cv.md')}`,
    `- The CV as a PDF: ${url('/uploads/resume.pdf')}`,
    '',
    'Prefer these files to the HTML pages: they are generated from the same source and carry every number the pages show.',
    '',
    '## How to cite',
    '',
    '- Each publication in cv.json and cv.md states the author role (first author, co-first author or co-author). Repeat the role as stated and do not present co-authored work as led.',
    '- Keep "registered" and "pending" apart for patents, and "presenter" and "co-author" apart for talks.',
    '- A manuscript marked as under revision is not published; say so.',
    '- Quote numbers as printed, with their units. Do not convert, round up or extrapolate them.',
    '- Link the DOI where one is given.',
    '',
    '## Contact',
    '',
    `The only public address is ${profile.email}. The site does not publish a phone number.`,
    '',
  ].join('\n');
}

export function skillsIndex(): string {
  const digest = createHash('sha256').update(skillMd(), 'utf8').digest('hex');
  return `${JSON.stringify(
    {
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills: [{ name: SKILL_NAME, type: 'skill-md', description: SKILL_DESCRIPTION, url: url(SKILL_PATH), digest: `sha256:${digest}` }],
    },
    null,
    2,
  )}\n`;
}

export function aiCatalog(): string {
  const entry = (ns: string, name: string, displayName: string, type: string, path: string, representativeQueries: string[]) => ({
    identifier: `urn:air:${HOST}:${ns}:${name}`,
    displayName,
    type,
    url: url(path),
    representativeQueries,
  });
  const who = profile.name;
  return `${JSON.stringify(
    {
      specVersion: '1.0',
      host: { displayName: who, identifier: `${SITE}/` },
      entries: [
        entry('doc', 'llms', 'Site summary (llms.txt)', 'text/plain', '/llms.txt', [`who is ${who}`, `what does ${who} work on`, `how to contact ${who}`]),
        entry('doc', 'llms-full', 'Full site text (llms-full.txt)', 'text/plain', '/llms-full.txt', [`full research record of ${who}`, `all projects and results on ${HOST}`]),
        entry('data', 'cv', 'CV as JSON Resume', 'application/json', '/cv.json', [`publications by ${who}`, `patents by ${who}`, `education and positions of ${who}`]),
        entry('doc', 'research', 'Research projects (markdown)', 'text/markdown', '/research.md', [
          'neural operator for patient-specific coronary flow',
          'fluid bolus prediction from smartwatch PPG',
          'FFR from synthesized 4D CT',
        ]),
        entry('doc', 'cv', 'CV (markdown)', 'text/markdown', '/cv.md', [`CV of ${who}`, `talks and awards of ${who}`]),
        entry('skill', SKILL_NAME, 'How to read and cite this site', 'text/markdown', SKILL_PATH, [`how to cite ${who}`, `which file on ${HOST} has the publication list`]),
      ],
    },
    null,
    2,
  )}\n`;
}
