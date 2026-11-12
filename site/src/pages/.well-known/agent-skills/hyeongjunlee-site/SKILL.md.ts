/* The site's one agent skill (see lib/agents.ts). */
import type { APIRoute } from 'astro';
import { skillMd } from '@/lib/agents';

export const prerender = true;

export const GET: APIRoute = () => new Response(skillMd(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
