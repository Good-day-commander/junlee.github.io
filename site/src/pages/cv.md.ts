/*
  /cv.md: generated at build time from content.ts and the data manifests
  (see lib/schema.ts); never scraped from the rendered page.
*/
import type { APIRoute } from 'astro';
import { cvMarkdown } from '@/lib/schema';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(cvMarkdown(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
