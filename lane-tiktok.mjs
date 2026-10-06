// TikTok web upload is video-only; cards are skipped. Posts the clip when present. Expect captcha / email-code walls.
export async function tiktok({ page, clip, slot, dry }) {
  await page.goto("https://www.tiktok.com/login/phone-or-email/email");
  if (await page.locator('input[name="username"]').isVisible().catch(() => false)) {
    await page.locator('input[name="username"]').fill(process.env.TIKTOK_USER);
    await page.locator('input[type="password"]').fill(process.env.TIKTOK_PASS);
    await page.getByRole("button", { name: /log in/i }).first().click();
    await page.waitForTimeout(8000);
  }
  await page.screenshot({ path: `out/tiktok-${slot}-home.png` });
  if (await page.locator('[id*="captcha"], .captcha_verify_container, text=/verify it|drag the slider|enter the code/i').first().isVisible().catch(() => false)) throw new Error("tiktok blocked: captcha or code challenge");
  if (/login/.test(page.url())) throw new Error(`tiktok not logged in: ${page.url()}`);
  if (dry || !clip) return;
  await page.goto("https://www.tiktok.com/tiktokstudio/upload");
  await page.locator('input[type="file"]').first().setInputFiles(clip.file);
  await page.locator('[contenteditable="true"]').first().fill(clip.caption);
  await page.getByRole("button", { name: /^post$/i }).click();
  await page.waitForTimeout(15000);
}
