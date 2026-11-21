// main.ts — Twin Lanterns entrypoint for make.fun.
// Copies game/ and screenshots/ from this repository into the output
// directory, then writes dossier.json via the vendored buildDossier.
// Node 22 standard library only; runs as-is with `node main.ts`.

import { cpSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function copyEntryTree(name: string): void {
  const from = join(repoDir, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) {
    throw new Error(`main.ts: expected ${name}/ next to main.ts, not found at ${from}`);
  }
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function main(): void {
  mkdirSync(outputDir, { recursive: true });
  copyEntryTree("game");
  copyEntryTree("screenshots");

  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, "dossier.json"), dossier);
  console.log(`main.ts: game/ + screenshots/ copied, dossier.json (${dossier.byteLength} bytes) written to ${outputDir}`);
}

main();
