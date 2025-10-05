#!/usr/bin/env -S node --enable-source-maps
import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const tmp = path.resolve('scripts/wp-to-sanity/redirects.tmp.json');
  let mappings: Array<{ oldUrl: string; newUrl: string }> = [];
  try {
    const raw = await fs.readFile(tmp, 'utf8');
    mappings = JSON.parse(raw);
  } catch {}

  const redirects = [
    ...mappings.map(({ oldUrl, newUrl }) => ({
      from: new URL(oldUrl).pathname,
      to: newUrl,
      status: 301,
    })),
    { from: '/quidditch/*', to: '/quadball/$1', status: 301 },
    { from: '/category/*', to: '/news/category/$1', status: 301 },
  ];

  process.stdout.write(JSON.stringify(redirects, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

