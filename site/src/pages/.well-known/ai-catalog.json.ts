/* /.well-known/ai-catalog.json: the ARD manifest (see lib/agents.ts). */
import type { APIRoute } from 'astro';
import { aiCatalog } from '@/lib/agents';

export const prerender = true;

export const GET: APIRoute = () => new Response(aiCatalog(), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
