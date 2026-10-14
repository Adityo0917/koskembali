/** Mengukur kontras warna teks nyata di DOM terhadap latar efektifnya. */
import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3111";
const KEY = process.env.KOSKEMBALI_COORDINATOR_KEY;
if (!KEY) {
  console.error("KOSKEMBALI_COORDINATOR_KEY belum diatur. Set dulu sebelum menjalankan skrip ini.");
  process.exit(1);
}

const PAGES = ["/", "/katalog", "/katalog/5", "/daftar", "/daftar/status", "/booking/BK-2026-0004", "/koordinator"];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

const out = [];
const seen = new Set();

for (const path of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  if (path === "/koordinator") {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate(async (k) => {
      await fetch("/api/koordinator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });
    }, KEY);
  }
  await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 300));

  const rows = await page.evaluate(() => {
    const gamma = (v) =>
      v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
    const clamp255 = (v) => Math.max(0, Math.min(255, v * 255));
    // Bradford D50 -> D65, lalu D65 -> linear sRGB (CSS Color 4).
    const D50D65 = [
      [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
      [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
      [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008],
    ];
    const XYZ2S = [
      [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
      [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
      [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
    ];
    const mat = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
    // lab() memakai titik putih D50, jadi harus diadaptasi dulu ke D65.
    const encLab = ([L, A, B], a) => {
      const y = (L + 16) / 116, x = y + A / 500, z = y - B / 200;
      const d65 = mat(D50D65, [0.95047 * x ** 3, y ** 3, 1.08883 * z ** 3]);
      return mat(XYZ2S, d65).map((v) => clamp255(gamma(v))).concat([a]);
    };
    // oklab() sudah berbasis D65 sehingga memakai matriks langsung.
    const encOklab = ([L, A, B], a) => {
      const l_ = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
      const m_ = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
      const s_ = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
      return XYZ2S.map((row) => clamp255(gamma(row[0] * l_ + row[1] * m_ + row[2] * s_))).concat([a]);
    };
    const parseRGB = (s) => {
      if (!s) return null;
      let m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
      // Tailwind v4 menuliskan warna sebagai color-mix(); browser menghitungnya
      // menjadi color(srgb ...) atau lab(...). Kedua bentuk harus diurai.
      m = s.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
      if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255, m[4] === undefined ? 1 : +m[4]];
      m = s.match(/oklab\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
      if (m) return encOklab([+m[1], +m[2], +m[3]], m[4] === undefined ? 1 : +m[4]);
      m = s.match(/lab\(\s*([\d.]+)\s+([\d.]+)\s+([\d.-]+)(?:\s*\/\s*([\d.]+))?\)/);
      if (m) return encLab([+m[1], +m[2], +m[3]], m[4] === undefined ? 1 : +m[4]);
      return null;
    };
    const over = (fg, bg) => fg[3] >= 0.999 ? fg : [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
    const effBg = (el) => {
      let n = el;
      const stack = [];
      while (n && n !== document.documentElement) {
        const c = parseRGB(getComputedStyle(n).backgroundColor);
        if (c && c[3] > 0) { stack.push(c); if (c[3] >= 0.999) break; }
        n = n.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    };
    const res = [];
    for (const el of document.querySelectorAll("body *")) {
      const txt = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3 && n.textContent.trim())
        .map((n) => n.textContent.trim())
        .join(" ");
      if (!txt) continue;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (el.classList.contains("sr-only")) continue;
      const fg = over(parseRGB(s.color) || [0, 0, 0, 1], effBg(el));
      const px = parseFloat(s.fontSize);
      const w = parseInt(s.fontWeight, 10) || 400;
      res.push({
        cls: String(el.className || "").slice(0, 46),
        text: txt.slice(0, 26),
        fg,
        bg: effBg(el),
        px,
        w,
      });
    }
    return res;
  });

  for (const r of rows) {
    const key = r.cls + "|" + r.fg.join(",") + "|" + r.bg.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ page: path, ...r });
  }
  await page.close();
}

await browser.close();

function lum([r, g, b]) {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

let gagal = 0;
const baris = [];
for (const r of out) {
  const l1 = lum(r.fg), l2 = lum(r.bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const besar = r.px >= 24 || (r.px >= 18.66 && r.w >= 700);
  const need = besar ? 3 : 4.5;
  const ok = ratio >= need;
  if (!ok) gagal++;
  baris.push({
    page: r.page,
    cls: r.cls,
    text: r.text,
    fg: hex(r.fg),
    bg: hex(r.bg),
    px: r.px,
    w: r.w,
    ratio: +ratio.toFixed(2),
    need,
    ok,
  });
}

baris.sort((a, b) => a.ratio - b.ratio);
console.log("kombinasi teks unik diukur :", baris.length);
console.log("gagal ambang WCAG AA       :", gagal);
console.log("\n10 rasio terendah:");
for (const b of baris.slice(0, 10)) {
  console.log(
    `  ${b.ok ? "LULUS" : "GAGAL"} ${String(b.ratio).padStart(6)} (butuh ${b.need}) ${b.fg} di ${b.bg}  ${b.px}px w${b.w}  "${b.text}"`,
  );
}
writeFileSync("../docs/uiux-contrast.json", JSON.stringify(baris, null, 2), "utf8");
console.log("\n-> ..\\docs\\uiux-contrast.json");
