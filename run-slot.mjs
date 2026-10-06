// One slot (midday|evening): render cards, then post each lane with a headless browser logged in via secrets.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { bluesky } from "./lane-bluesky.mjs";
import { tumblr } from "./lane-tumblr.mjs";
import { pinterest } from "./lane-pinterest.mjs";
import { instagram } from "./lane-instagram.mjs";
import { tiktok } from "./lane-tiktok.mjs";

const SLOTS = { midday: 12 * 60, evening: 19 * 60 };
const LANES = { bluesky, tumblr, pinterest, instagram, tiktok };
const dry = process.env.DRY_RUN === "true";
const slot = process.env.SLOT || (process.env.CRON?.startsWith("0 14") ? "midday" : "evening");
const want = (process.env.LANES || "bluesky,tumblr,pinterest,instagram,tiktok").split(",").map(s => s.trim());
const parts = (d = new Date()) => Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map(p => [p.type, p.value]));
const nowMin = () => { const t = parts(); return +t.hour * 60 + +t.minute; };
const date = (() => { const t = parts(); return `${t.year}-${t.month}-${t.day}`; })();
fs.mkdirSync("out", { recursive: true }); fs.mkdirSync(".session", { recursive: true });

// 1. wait for the slot time (skip when dry), skip if far too late
if (!dry) {
  const wait = SLOTS[slot] - nowMin();
  if (wait > 0) { console.log(`waiting ${wait} min for ${slot} ET`); await new Promise(r => setTimeout(r, wait * 60000)); }
  if (nowMin() - SLOTS[slot] > 90) { console.log(`::warning::${slot} more than 90 min late, skipping`); process.exit(0); }
}

// 2. content: content/<date>.json -> { midday:{cards:[{quote,book,caption:{bluesky,tumblr,pinterest}, title, tags}], clip?}, evening:{...} }
const file = `content/${date}.json`;
if (!fs.existsSync(file)) { console.log(`::error::missing ${file}`); process.exit(1); }
const item = JSON.parse(fs.readFileSync(file, "utf8"))[slot];
if (!item) { console.log(`::error::no ${slot} entry in ${file}`); process.exit(1); }
item.cards.forEach((c, i) => {
  execFileSync("python3", ["hdl_card.py", `out/${slot}-${i}-sq.jpg`, "1080", "1080", c.quote, c.book]);
  execFileSync("python3", ["hdl_card.py", `out/${slot}-${i}-pin.jpg`, "1000", "1500", c.quote, c.book]);
});
const clip = item.clip && item.clip.file && fs.existsSync(item.clip.file) && item.clip.seconds >= 60 && item.clip.seconds <= 180 ? item.clip : null;

// 3. lanes, with per-lane done markers so a retry never double-posts
const state = `.session/done-${date}-${slot}.json`;
const done = fs.existsSync(state) ? JSON.parse(fs.readFileSync(state, "utf8")) : {};
const browser = await chromium.launch();
let failed = false;
for (const lane of want) {
  if (done[lane] && !dry) continue;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: fs.existsSync(`.session/${lane}.json`) ? `.session/${lane}.json` : undefined });
  const page = await ctx.newPage();
  try {
    try { await LANES[lane]({ page, item, clip, slot, dry }); } finally {
      const body = (await page.locator("body").innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 400);
      console.log(`[${lane}] url=${page.url()} title=${await page.title().catch(() => "")} text=${body}`);
    }
    await ctx.storageState({ path: `.session/${lane}.json` });
    if (!dry) { done[lane] = new Date().toISOString(); fs.writeFileSync(state, JSON.stringify(done)); }
    console.log(`${lane}: ${dry ? "dry ok" : "posted"}`);
  } catch (e) {
    failed = true; console.log(`::error::${lane}: ${e.message}`);
    await page.screenshot({ path: `out/${lane}-error.png` }).catch(() => {});
  }
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0); // failed run -> GitHub failure email; success is silent
