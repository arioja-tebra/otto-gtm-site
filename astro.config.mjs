import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');
const site = process.env.SITE_URL || 'https://otto.tebra.com';
const url = new URL(site);
if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('SITE_URL must be an absolute origin without a path, query, or fragment.');
}

export default defineConfig({
  site: url.origin,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
