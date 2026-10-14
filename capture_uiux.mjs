/**
 * Capture screenshot + audit untuk Laporan Desain UI/UX.
 * Output: docs/uiux-shots/*.png  dan uiux-audit.json
 */
import puppeteer from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3111";
const OUT = "..\\docs\\uiux-shots";
const KEY = process.env.KOSKEMBALI_COORDINATOR_KEY;
if (!KEY) {
  console.error("KOSKEMBALI_COORDINATOR_KEY belum diatur. Set dulu sebelum menjalankan skrip ini.");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { id: "01-landing", path: "/", name: "Landing Page" },
  { id: "02-katalog", path: "/katalog", name: "Katalog Barang" },
  { id: "03-detail", path: "/katalog/5", name: "Detail Barang" },
  { id: "04-daftar", path: "/daftar", name: "Form Penjualan" },
  { id: "05-status", path: "/daftar/status", name: "Status Request" },
  { id: "06-booking", path: "/booking/BK-2026-0004", name: "Detail Booking" },
  { id: "07-koordinator", path: "/koordinator", name: "Dashboard Koordinator", auth: true },
  ];

const VIEWPORTS = [
  { id: "mobile", label: "Mobile", w: 390, h: 844, dsf: 2 },
  { id: "tablet", label: "Tablet", w: 768, h: 1024, dsf: 2 },
  { id: "desktop", label: "Desktop", w: 1440, h: 900, dsf: 1 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

const audit = { viewport: {}, pages: [], tokens: null, components: [], contrast: [] };

// ---------- Token & komponen ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + "/katalog", { waitUntil: "networkidle0" });

  audit.tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    const body = getComputedStyle(document.body);
    return {
      primary: v("--color-primary"),
      primaryLight: v("--color-primary-light"),
      primaryDark: v("--color-primary-dark"),
      secondary: v("--color-secondary"),
      background: v("--color-background"),
      card: v("--color-card"),
      accent: v("--color-accent"),
      textPrimary: v("--color-text-primary"),
      textSecondary: v("--color-text-secondary"),
      border: v("--color-border"),
      success: v("--color-success"),
      warning: v("--color-warning"),
      error: v("--color-error"),
      successText: v("--color-success-text"),
      warningText: v("--color-warning-text"),
      errorText: v("--color-error-text"),
      accentText: v("--color-accent-text"),
      successSolid: v("--color-success-solid"),
      accentSolid: v("--color-accent-solid"),
      fontFamily: body.fontFamily,
    };
  });

  // `@theme inline` membuat Tailwind meny-inline nilainya ke utility sehingga
  // variabelnya tidak selalu muncul di :root. Isi yang kosong diambil dari
  // file sumber globals.css supaya tabel token di laporan tidak pernah kosong.
  {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile(new URL("./src/app/globals.css", import.meta.url), "utf8");
    const keyOf = (n) => n.replace(/^--color-/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    for (const m of css.matchAll(/--color-([a-z-]+):\s*([^;]+);/g)) {
      const k = keyOf(m[1]);
      if (audit.tokens[k] === "" || audit.tokens[k] == null) audit.tokens[k] = m[2].trim();
    }
  }

  // ukuran komponen nyata
  const measure = async (label, selector, note) => {
    const r = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(b.width),
        h: Math.round(b.height),
        radius: s.borderRadius,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        bg: s.backgroundColor,
        color: s.color,
      };
    }, selector);
    if (r) audit.components.push({ label, note, ...r });
    return r;
  };

  await measure("Header (navigasi)", "header", "Sticky, tinggi 65px, container terpusat max-w-6xl");
  await measure("Logo KosKembali", "header a", "Wordmark + ikon, tinggi 44px");
  await measure("Tombol Primer", "header a[href='/daftar']", "CTA daftar barang, 36px desktop");
  await measure("Kartu Item", "main a[href^='/katalog/']", "Card katalog, radius 12px, shadow halus");
  await measure("Badge Status", "[class*='rounded-full']", "Status pill, radius penuh (pill)");
  await page.close();
}

// ---------- Halaman x viewport ----------
for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: vp.dsf });

  for (const p of PAGES) {
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    if (p.auth) {
      // Login harus lewat fetch supaya cookie httpOnly ikut tersimpan di jar Puppeteer.
      const logged = await page.evaluate(async (key) => {
        const r = await fetch("/api/koordinator/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });
        return r.status;
      }, KEY);
      if (logged !== 200) console.log(`  (login koordinator gagal: HTTP ${logged})`);
    }

    await page.goto(BASE + p.path, { waitUntil: "networkidle0", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      let tiny = 0;
      let interactive = 0;
      for (const el of document.querySelectorAll("a,button,input,select,textarea")) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (el.classList.contains("sr-only")) continue;
        interactive++;
        if (r.height < 32) tiny++;
      }
      let noLabel = 0;
      for (const el of document.querySelectorAll("input,select,textarea")) {
        if (el.type === "hidden") continue;
        const id = el.getAttribute("id");
        const ok =
          (id && document.querySelector(`label[for="${id}"]`)) ||
          el.closest("label") ||
          el.getAttribute("aria-label") ||
          el.placeholder;
        if (!ok) noLabel++;
      }
      const imgs = [...document.querySelectorAll("img")];
      const broken = imgs.filter((i) => !i.complete || i.naturalWidth === 0).length;
      return {
        docW: de.scrollWidth,
        clientW: de.clientWidth,
        overflow,
        interactive,
        tinyTap: tiny,
        noLabel,
        imgTotal: imgs.length,
        imgBroken: broken,
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        h3: document.querySelectorAll("h3").length,
        title: document.title,
        desc:
          document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content") || "",
        lang: document.documentElement.lang,
        textLen: document.body.innerText.trim().length,
        pageH: document.body.scrollHeight,
      };
    });

    await page.screenshot({
      path: `${OUT}/${p.id}-${vp.id}.png`,
      fullPage: true,
    });
    // Varian "fold": hanya area di atas lipatan, dipakai sebagai device frame di DOCX.
    await page.screenshot({
      path: `${OUT}/${p.id}-${vp.id}-fold.png`,
      fullPage: false,
    });

    // audit hanya sekali per halaman (desktop = acuan)
    if (vp.id === "desktop") {
      audit.pages.push({ ...p, viewport: vp.label, errors: [...errors], ...data });
    }
    audit.viewport[`${p.id}-${vp.id}`] = {
      docW: data.docW,
      clientW: data.clientW,
      overflow: data.overflow,
      interactive: data.interactive,
      tinyTap: data.tinyTap,
      noLabel: data.noLabel,
    };

    const bad = [];
    if (data.overflow > 1) bad.push(`OVERFLOW ${data.overflow}px`);
    if (data.tinyTap) bad.push(`TAP<32px ${data.tinyTap}`);
    if (data.noLabel) bad.push(`NO-LABEL ${data.noLabel}`);
    if (data.imgBroken) bad.push(`IMG-BROKEN ${data.imgBroken}`);
    if (data.h1 !== 1) bad.push(`H1=${data.h1}`);
    if (errors.length) bad.push(`CONSOLE ${errors.length}`);
    console.log(
      `${bad.length ? "FAIL" : "OK  "} ${vp.label.padEnd(7)} ${p.id.padEnd(16)} ` +
        `${String(data.pageH).padStart(5)}px teks=${String(data.textLen).padStart(5)} ` +
        `el=${String(data.interactive).padStart(3)} img=${data.imgTotal} ${bad.join(" ")}`,
    );
  }
  await page.close();
}

// ---------- Screenshot komponen individual ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  const clipShot = async (file, selector, path = "/katalog") => {
    await page.goto(BASE + path, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 300));
    const el = await page.$(selector);
    if (!el) return console.log("  (komponen tidak ada:", selector, ")");
    await el.screenshot({ path: `${OUT}/${file}.png` });
    console.log("  komponen:", file);
  };
  await clipShot("c01-header", "header");
  await clipShot("c02-kartu-item", "main a[href^='/katalog/']");
  await clipShot("c03-form", "main form", "/daftar");
  await clipShot("c04-tombol", "main button, main a[class*='bg-primary'], main a[class*='bg-accent']");
  await clipShot("c05-footer", "footer");
  await clipShot("c06-badge", "[class*='rounded-full']");
  await clipShot("c08-filter", "main form, main section", "/katalog");

  // Varian mobile untuk komponen: nav & grid katalog pada lebar 390.
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await clipShot("c07-nav-mobile", "header", "/");
  await clipShot("c09-grid-mobile", "main", "/katalog");
  await clipShot("c10-form-mobile", "main form", "/daftar");
  await page.close();
}

// ---------- Halaman 404 (diambil terpisah: response 404 memang diharapkan) ----------
{
  const page = await browser.newPage();
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: vp.dsf });
    await page.goto(BASE + "/halaman-tidak-ada", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${OUT}/08-notfound-${vp.id}.png`, fullPage: true });
  }
  audit.viewport["08-notfound"] = { note: "status 400/404 diharapkan" };
  console.log("OK   404      08-notfound      (3 viewport)");
  await page.close();
}

await browser.close();
writeFileSync("../docs/uiux-audit.json", JSON.stringify(audit, null, 2), "utf8");
console.log("\naudit -> ..\\docs\\uiux-audit.json");
console.log("shots -> " + OUT);