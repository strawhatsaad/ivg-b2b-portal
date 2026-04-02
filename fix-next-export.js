/**
 * fix-next-export.js
 *
 * Transforms the Next.js static export (`out/`) so it can be uploaded
 * to Microsoft Power Pages via PAC CLI without hitting the Dataverse
 * underscore-prefix firewall.
 *
 * Strategy:
 *   1. Move  out/_next/static/  →  out/static/     (drops the "_next" prefix)
 *   2. Rewrite every reference from "/_next/static/" to "/static/"
 *   3. Patch webpack runtime: set a.p from "/_next/" to "/"
 *      (so dynamic chunk loads use "/static/chunks/..." directly)
 *   4. Clean up the empty _next folder
 */

const fs = require('fs');
const path = require('path');

const outDir = path.resolve('./out');

// ── Helpers ──

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, cb);
    else cb(full);
  }
}

// ── 1. Sanity checks ──

if (!fs.existsSync(outDir)) {
  console.log('fix-next-export: no out/ directory, nothing to do.');
  process.exit(0);
}

const nextDir = path.join(outDir, '_next');
if (!fs.existsSync(nextDir)) {
  console.log('fix-next-export: no _next/ directory, nothing to do.');
  process.exit(0);
}

// ── 2. Clean up export artifacts that crash PAC CLI ──

const notFound = path.join(outDir, '_not-found');
if (fs.existsSync(notFound)) fs.rmSync(notFound, { recursive: true, force: true });

walk(outDir, (fp) => { if (fp.endsWith('.txt')) fs.unlinkSync(fp); });

// ── 3. Move _next/static → static  (rename the folder) ──

const srcStatic = path.join(outDir, '_next', 'static');
const dstStatic = path.join(outDir, 'static');

if (fs.existsSync(dstStatic)) fs.rmSync(dstStatic, { recursive: true, force: true });
fs.renameSync(srcStatic, dstStatic);

// Remove the now-empty _next directory
fs.rmSync(nextDir, { recursive: true, force: true });

// ── 4. Rewrite all references in HTML/JS/CSS ──
//
// Two kinds of references to fix:
//   a) Literal paths:  "/_next/static/..."  →  "/static/..."
//   b) Webpack runtime: a.p="/_next/"       →  a.p="/"

let filesPatched = 0;

walk(outDir, (filePath) => {
  if (!/\.(html|js|css)$/.test(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 4a. Replace all literal "/_next/static/" references
  content = content.split('/_next/static/').join('/static/');
  content = content.split('_next/static/').join('static/');

  // 4b. Replace ALL remaining "/_next/" references.
  //     This catches the webpack runtime (a.p="/_next/" → a.p="/")
  //     AND main.js's __next_set_public_path__(""+t+"/_next/") override
  //     which otherwise resets the public path back to "/_next/" at runtime.
  content = content.split('/_next/').join('/');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesPatched++;
  }
});

console.log(`fix-next-export: moved _next/static → static, patched ${filesPatched} files.`);
