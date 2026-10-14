import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const CJK = /[\u2E80-\u9FFF\uFF00-\uFFEF]/g;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|css)$/.test(name)) out.push(p);
  }
  return out;
}

let hits = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  src.split(/\r?\n/).forEach((line, i) => {
    const bad = line.match(CJK);
    if (bad) {
      hits++;
      console.log(`CJK ${file}:${i + 1} ${JSON.stringify(bad.join(""))} | ${line.trim().slice(0, 110)}`);
    }
    // campur huruf non-ASCII yang tidak lazim dalam teks Indonesia/EN
    const weird = line.match(/[\u00C0-\u024F]/g);
    if (weird && !/[éèêàçïôûéäöüß]/i.test(line)) {
      hits++;
      console.log(`ACC ${file}:${i + 1} ${JSON.stringify(weird.join(""))} | ${line.trim().slice(0, 110)}`);
    }
  });
}
console.log(hits === 0 ? "CLEAN: tidak ada CJK / aksen asing" : `TOTAL ${hits} temuan`);