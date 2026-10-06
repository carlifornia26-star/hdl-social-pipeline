import { login } from "./login.mjs";
export async function tumblr({ page, item, slot, dry }) {
  await page.goto("https://www.tumblr.com/dashboard", { waitUntil: "domcontentloaded" });
  if (new URL(page.url()).pathname !== "/dashboard") {
    await login(page, { url: "https://www.tumblr.com/login", user: process.env.TUMBLR_USER, pass: process.env.TUMBLR_PASS });
    await page.goto("https://www.tumblr.com/dashboard", { waitUntil: "domcontentloaded" });
  }
  if (new URL(page.url()).pathname !== "/dashboard") throw new Error(`tumblr not logged in: ${page.url()}`);
  await page.screenshot({ path: `out/tumblr-${slot}-home.png` });
  if (dry) return;
  for (const [i, c] of item.cards.entries()) {
    await page.goto("https://www.tumblr.com/new/photo");
    await page.locator('input[type="file"]').first().setInputFiles(`out/${slot}-${i}-sq.jpg`);
    await page.getByRole("textbox").first().fill(c.caption.tumblr);
    const tags = page.getByPlaceholder(/#tags/i);
    for (const t of c.tags || ["ebooks", "HDL Group"]) { await tags.fill(t); await page.keyboard.press("Enter"); }
    await page.getByRole("button", { name: /^post$/i }).click();
    await page.waitForTimeout(4000);
  }
}
