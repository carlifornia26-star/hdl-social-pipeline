export async function pinterest({ page, item, slot, dry }) {
  await page.goto("https://www.pinterest.com/pin-creation-tool/");
  if (page.url().includes("login") || await page.locator('input[name="id"]').isVisible().catch(() => false)) {
    await page.goto("https://www.pinterest.com/login/");
    await page.locator('input[name="id"]').fill(process.env.PINTEREST_USER);
    await page.locator('input[name="password"]').fill(process.env.PINTEREST_PASS);
    await page.getByRole("button", { name: /log in/i }).first().click();
    await page.waitForURL(u => !u.pathname.startsWith("/login"), { timeout: 30000 });
    await page.goto("https://www.pinterest.com/pin-creation-tool/");
  }
  await page.screenshot({ path: `out/pinterest-${slot}-home.png` });
  if (dry) return;
  for (const [i, c] of item.cards.entries()) {
    await page.goto("https://www.pinterest.com/pin-creation-tool/");
    await page.locator('input[type="file"]').first().setInputFiles(`out/${slot}-${i}-pin.jpg`);
    await page.getByPlaceholder(/add a title/i).fill(c.title);
    await page.locator('[contenteditable="true"]').nth(1).fill(c.caption.pinterest);
    await page.getByPlaceholder(/add a destination link/i).fill("https://highdefinitionlearning.pages.dev");
    // board by niche: c.board
    await page.getByTestId("board-dropdown-select-button").click();
    await page.getByText(c.board, { exact: true }).first().click();
    await page.getByTestId("board-dropdown-save-button").click();
    await page.waitForTimeout(5000);
  }
}
