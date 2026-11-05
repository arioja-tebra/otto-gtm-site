import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Publish only the current Astro build at the repository Pages URL.
const repositoryPath = '/otto-gtm-site';
const editorialPath = repositoryPath;
const origin = new URL(process.env.SITE_URL || 'https://arioja-tebra.github.io').origin;
const output = `.pages${repositoryPath}`;
rmSync('.pages', { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync('dist', output, { recursive: true });

// Astro source intentionally uses origin-relative URLs for the Cloudflare build.
// Prefix only paths owned by this build, including URLs in inline scripts and CSS.
const directories = readdirSync('dist', { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => entry.name);
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const localPath = new RegExp(`(["'\u0060(=])/(?!/)(${directories.map(escape).join('|')})(?=/)`, 'g');
function rewrite(text) {
  return text
    .replace(localPath, `$1${editorialPath}/$2`)
    .replace(/(["'`=])\/(["'`])/g, `$1${editorialPath}/$2`)
    .replaceAll(`${origin}/`, `${origin}${editorialPath}/`);
}
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (/\.(html|css|js|xml)$/.test(path)) writeFileSync(path, rewrite(readFileSync(path, 'utf8')));
  }
}
visit(output);
console.log(`Pages artifact: ${output}; current Astro site: ${editorialPath}/`);
