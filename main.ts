// Leonida Trophy Guide — hand-in program (Node 22, standard library only).
//
// The entry is the static guide in app/ (index.html, style.css, app.js and
// data/trophies.json) plus the screenshots/ renders of it. This program copies
// both folders next to this file into the output directory and writes
// dossier.json there: the summary the judge reads (the screenshots, the
// first load's files and bytes, and the source outline), built with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts untouched:
// the scorer rebuilds the dossier with its own copy and the two must match
// byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root: the folder this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader hands us /output; anywhere else, MAKEFUN_OUTPUT_DIR says where.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });

  // The whole guide, exactly as it is served: plain static files only.
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

  // The screenshots, when they exist. The dossier refuses more than four,
  // or any one over 256 KiB, so keep screenshots/ inside those caps.
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }

  // The judge's summary, built by the vendored library from what we copied.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);

  // A one-line receipt on stdout so a local run shows what it handed in.
  console.log(`handed in ${outputDir} (dossier.json ${dossier.length} bytes)`);
}

handIn();
