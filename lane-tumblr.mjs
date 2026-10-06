export async function tumblr({ page, item, slot, dry }) {
  await page.goto("https://www.tumblr.com/dashboard");
  if (/login|logout|\/$/.test(new URL(page.url()).pathname) && !page.url().includes("dashboard")) {
    await page.goto("https://www.tumblr.com/login");
    await page.getByRole("button", { name: /continue with email|email/i }).first().click().catch(() => {});
    await page.locator('input[name="email"]').fill(process.env.TUMBLR_USER);
    await page.getByRole("button", { name: /next|continue/i }).first().click();
    await page.locator('input[type="password"]').fill(process.env.TUMBLR_PASS);
    await page.getByRole("button", { name: /log in/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });
  }
  if (!/dashboard/.test(page.url())) throw new Error(`tumblr not logged in: ${page.url()}`);
  await page.screenshot({ path: `out/tumblr-${slot}-home.png` });
  if (dry) return;
  for (const [i, c] of item.cards.entries()) {
    await page.goto("https://www.tumblr.com/new/photo");
    await page.locator('input[type="file"]').first().setInputFiles(`out/${slot}-${i}-sq.jpg`);
    await page.getByRole("textbox").first().fill(c.caption.tumblr);
    // tags
    const tags = page.getByPlaceholder(/#tags/i);
    for (const t of c.tags || ["ebooks", "HDL Group"]) { await tags.fill(t); await page.keyboard.press("Enter"); }
    await page.getByRole("button", { name: /^post$/i }).click();
    await page.waitForTimeout(4000);
  }
}
