import type { APIRoute } from "astro";
import pages from "../data/pages.json";
import { indexingEnabled } from "../lib/seo";

export const GET: APIRoute = ({ site }) => {
  const urls = indexingEnabled
    ? Object.entries(pages)
        .filter(([, page]) => !page.noindex)
        .map(([path]) => `<url><loc>${new URL(path, site).href}</loc></url>`)
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
