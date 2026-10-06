// Shared login helper: fill identifier, advance if the password box is not on the same step, fill password, submit.
const ID = 'input[type="email"], input[name="email"], input[name="id"], input[name="username"], input#email, input[autocomplete="username"], input[type="text"]';
export async function login(page, { url, user, pass }) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const id = page.locator(ID).first();
  await id.waitFor({ state: "visible", timeout: 20000 });
  await id.fill(user);
  const pw = page.locator('input[type="password"]').first();
  if (!(await pw.isVisible().catch(() => false))) { await id.press("Enter"); await pw.waitFor({ state: "visible", timeout: 20000 }); }
  await pw.fill(pass);
  await pw.press("Enter");
  await page.waitForTimeout(8000);
}
