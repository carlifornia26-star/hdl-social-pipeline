import { login } from "./login.mjs";
const loggedOut = (page) => page.getByRole("button", { name: /^log in$/i }).first().isVisible().catch(() => false);
export async function pinterest({ page, item, slot, dry }) {
  await page.goto("https://www.pinterest.com/pin-creation-tool/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  if (await loggedOut(page) || page.url().includes("login") || !page.url().includes("pin-creation-tool")) {
    await login(page, { url: "https://www.pinterest.com/login/", user: process.env.PINTEREST_USER, pass: process.env.PINTEREST_PASS });
    await page.goto("https://www.pinterest.com/pin-creation-tool/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
  }
  if (await loggedOut(page) || !page.url().includes("pin-creation-tool")) throw new Error(`pinterest not logged in: ${page.url()}`);
  await page.screenshot({ path: `out/pinterest-${slot}-home.png` });
  if (dry) return;
  for (const [i, c] of item.cards.entries()) {
    await page.goto("https://www.pinterest.com/pin-creation-tool/");
    await page.locator('input[type="file"]').first().setInputFiles(`out/${slot}-${i}-pin.jpg`);
    await page.getByPlaceholder(/add a title/i).fill(c.title);
    await page.locator('[contenteditable="true"]').nth(1).fill(c.caption.pinterest);
    await page.getByPlaceholder(/add a destination link/i).fill("https://highdefinitionlearning.pages.dev");
    await page.getByTestId("board-dropdown-select-button").click();
    await page.getByText(c.board, { exact: true }).first().click();
    await page.getByTestId("board-dropdown-save-button").click();
    await page.waitForTimeout(5000);
  }
}
