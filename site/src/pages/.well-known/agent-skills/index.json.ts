/* /.well-known/agent-skills/index.json: the Agent Skills discovery index (see lib/agents.ts). */
import type { APIRoute } from 'astro';
import { skillsIndex } from '@/lib/agents';

export const prerender = true;

export const GET: APIRoute = () => new Response(skillsIndex(), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
