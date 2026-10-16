/*
  /cv.json: the CV in JSON Resume (v1.0.0) form, generated at build time
  from content.ts (see lib/schema.ts). meta.canonical names this URL.
*/
import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import portrait from '@/assets/photos/profile-main.jpg';
import { SITE, cvJson } from '@/lib/schema';

export const prerender = true;

export const GET: APIRoute = async () => {
  const img = await getImage({ src: portrait, format: 'jpg', width: portrait.width });
  const body = JSON.stringify(cvJson(new URL(img.src, `${SITE}/`).href), null, 2);
  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
