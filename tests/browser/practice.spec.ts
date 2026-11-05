import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.route(
    /^https:\/\/(?:[^/]+\.)?(?:googletagmanager|google-analytics)\.com\//,
    (route) => route.abort(),
  );
});

test("personalized practice funnel preserves choices and completes the demo without submitting", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("/your-practice/");
  await page.getByRole("link", { name: "Explore this idea" }).nth(1).click();
  await expect(page.locator("h1")).toHaveText(
    "Your notes should sound like you.",
  );
  await page.getByRole("link", { name: "I’d use this" }).click();
  await page.getByLabel("Give your preview a name").fill("Willow Therapy");
  await page.getByRole("radio", { name: "A team" }).check();
  await page.getByLabel("How do you see clients?").selectOption("Online");
  await page.getByRole("button", { name: "Choose my priorities" }).click();
  await expect(page.locator("[name=feature][value=notes]")).toBeChecked();
  await expect(
    page.locator("[name=feature][value=personalized]"),
  ).not.toBeChecked();
  await page.locator("[name=feature][value=front-desk]").check();
  await page.getByRole("button", { name: "Show my practice" }).click();
  await expect(page.locator("h1")).toHaveText("Welcome to Willow Therapy");
  await expect(page.locator("#result-size")).toHaveText("Group practice");
  await expect(page.locator("#result-setting")).toHaveText("Online");
  await expect(page.locator("[data-result-feature=personalized]")).toBeHidden();
  await expect(page.locator("[data-result-feature=notes]")).toBeVisible();
  await page.locator("[data-interest=notes]").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#interest-feature-name")).toHaveText(
    "Notes in your style",
  );
  await page
    .getByRole("button", { name: "Preview early-access signup" })
    .click();
  await expect(page.locator("#interest-complete")).toContainText(
    "Nothing was submitted or saved.",
  );
  await page.getByRole("button", { name: "Back to my practice" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("link", { name: "Edit my preferences" }).click();
  await expect(page.getByLabel("Give your preview a name")).toHaveValue(
    "Willow Therapy",
  );
  await expect(page.getByRole("radio", { name: "A team" })).toBeChecked();
  await expect(page.getByLabel("How do you see clients?")).toHaveValue(
    "Online",
  );
  expect(posts).toEqual([]);
});

test("priorities require a choice, back preserves edits, and concept dialog supports Escape", async ({
  page,
}) => {
  await page.goto("/your-practice/build/");
  await page.getByRole("button", { name: "Choose my priorities" }).click();
  await page.locator("[name=feature][value=personalized]").uncheck();
  await page.getByRole("button", { name: "Show my practice" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Choose at least one idea for your preview.",
  );
  await page.getByRole("button", { name: "Back", exact: false }).click();
  await expect(page.locator('[data-builder-step="1"]')).toBeVisible();
  await page.goto(
    "/your-practice/preview/?practice=%3Cscript%3E&feature=unknown",
  );
  await expect(page.locator("#result-practice-name")).toHaveText("<script>");
  await expect(
    page.locator("[data-result-feature=personalized]"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try this idea" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
