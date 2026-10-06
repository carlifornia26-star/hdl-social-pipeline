export async function bluesky({ page, item, slot, dry }) {
  await page.goto("https://bsky.app/");
  if (await page.getByRole("button", { name: /sign in/i }).first().isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.getByTestId("loginUsernameInput").fill(process.env.BSKY_USER);
    await page.getByTestId("loginPasswordInput").fill(process.env.BSKY_PASS);
    await page.getByTestId("loginNextButton").click();
    await page.getByRole("button", { name: /compose|new post/i }).first().waitFor({ timeout: 30000 });
  }
  await page.getByRole("button", { name: /compose|new post/i }).first().waitFor({ timeout: 20000 }).catch(() => { throw new Error("bluesky not logged in"); });
  await page.screenshot({ path: `out/bluesky-${slot}-home.png` });
  if (dry) return;
  for (const [i, c] of item.cards.entries()) {
    await page.getByRole("button", { name: /compose|new post/i }).first().click();
    await page.getByRole("textbox").first().fill(c.caption.bluesky);
    await page.locator('input[type="file"]').first().setInputFiles(`out/${slot}-${i}-sq.jpg`);
    await page.waitForTimeout(3000);
    await page.getByTestId("composerPublishBtn").click();
    await page.waitForTimeout(4000);
  }
}
