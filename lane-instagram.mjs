// Instagram web: log in, post feed image via the create flow. Expect checkpoints from datacenter IPs.
export async function instagram({ page, item, slot, dry }) {
  await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(5000);
  if (await page.locator('input[name="username"]').isVisible().catch(() => false)) {
    await page.locator('input[name="username"]').fill(process.env.INSTAGRAM_USER);
    await page.locator('input[name="password"]').fill(process.env.INSTAGRAM_PASS);
    await page.getByRole("button", { name: /log in/i }).first().click();
    await page.waitForTimeout(8000);
  }
  await page.screenshot({ path: `out/instagram-${slot}-home.png` });
  if (/challenge|checkpoint|suspended|two_factor/.test(page.url())) throw new Error(`instagram blocked: ${page.url()}`);
  if (!(await page.getByRole("link", { name: /new post|create/i }).first().isVisible().catch(() => false))) throw new Error("instagram not logged in");
  if (dry) return;
  for (const [i, c] of item.cards.entries()) {
    await page.getByRole("link", { name: /new post|create/i }).first().click();
    await page.locator('input[type="file"]').first().setInputFiles(`out/${slot}-${i}-sq.jpg`);
    for (let n = 0; n < 2; n++) await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("textbox", { name: /caption/i }).fill(c.caption.instagram);
    await page.getByRole("button", { name: /^share$/i }).click();
    await page.getByText(/shared/i).first().waitFor({ timeout: 60000 });
    await page.keyboard.press("Escape");
  }
}
