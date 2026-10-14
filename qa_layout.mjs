import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3111";
const OUT = process.env.SHOT_DIR || "qa-shots";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["home", "/"],
  ["katalog", "/katalog"],
  ["detail", "/katalog/5"],
  ["daftar", "/daftar"],
  ["status", "/daftar/status"],
  ["booking", "/booking/BK-2026-0004"],
];

const VIEWPORTS = [
  ["360", 360, 780],
  ["768", 768, 1024],
  ["1280", 1280, 900],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

let problems = 0;

for (const [label, w, h] of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

  for (const [name, path] of PAGES) {
    consoleErrors.length = 0;
    await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 250));

    const audit = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      const wide = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > de.clientWidth + 1) {
          wide.push(
            `${el.tagName.toLowerCase()}.${String(el.className || "").slice(0, 40)} right=${Math.round(r.right)}`,
          );
        }
      }
      const tinyTap = [];
      for (const el of document.querySelectorAll("a, button, input, select, textarea")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (el.classList.contains("sr-only")) continue;
        if (r.height < 32) {
          tinyTap.push(`${el.tagName.toLowerCase()} h=${Math.round(r.height)} "${(el.textContent || "").trim().slice(0, 24)}"`);
        }
      }
      const noLabel = [...document.querySelectorAll("input, select, textarea")]
        .filter((el) => {
          if (el.type === "hidden") return false;
          const id = el.getAttribute("id");
          const hasFor = id && document.querySelector(`label[for="${id}"]`);
          const wrapped = el.closest("label");
          const hasAria =
            el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
          return !hasFor && !wrapped && !hasAria && !el.placeholder;
        })
        .map((el) => el.outerHTML.slice(0, 60));
      const h1 = document.querySelectorAll("h1").length;
      return {
        overflow,
        wide: wide.slice(0, 4),
        tinyTap: tinyTap.slice(0, 4),
        noLabel: noLabel.slice(0, 3),
        h1,
        title: document.title,
        textLen: document.body.innerText.trim().length,
      };
    });

    const flags = [];
    if (audit.overflow > 1) flags.push(`OVERFLOW ${audit.overflow}px`);
    if (audit.wide.length) flags.push(`WIDE ${audit.wide.join(" | ")}`);
    if (audit.tinyTap.length) flags.push(`TAP<32px ${audit.tinyTap.length} (${audit.tinyTap[0]})`);
    if (audit.noLabel.length) flags.push(`NO-LABEL ${audit.noLabel[0]}`);
    if (audit.h1 !== 1) flags.push(`H1=${audit.h1}`);
    if (audit.textLen < 200) flags.push(`TEKS KOSONG (${audit.textLen})`);
    if (consoleErrors.length) flags.push(`CONSOLE ${consoleErrors[0].slice(0, 90)}`);

    if (flags.length) {
      problems++;
      console.log(`FAIL ${label}px ${name.padEnd(8)} ${flags.join(" ; ")}`);
    } else {
      console.log(`OK   ${label}px ${name.padEnd(8)} teks=${audit.textLen} judul="${audit.title}"`);
    }

    await page.screenshot({
      path: `${OUT}/${name}-${label}.png`,
      fullPage: false,
    });
  }

  await page.close();
}

await browser.close();
console.log(problems === 0 ? "\nSEMUA LAYOUT BERSIH" : `\n${problems} temuan layout`);