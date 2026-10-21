import type { APIRoute } from "astro";
import { indexingEnabled } from "../lib/seo";

export const GET: APIRoute = ({ site }) =>
  new Response(
    indexingEnabled
      ? `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", site).href}\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
