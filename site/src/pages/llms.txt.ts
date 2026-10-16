/*
  /llms.txt: generated at build time from content.ts and the data manifests
  (see lib/schema.ts); never scraped from the rendered page.
*/
import type { APIRoute } from 'astro';
import { llmsTxt } from '@/lib/schema';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
