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
  await page.getByRole("link", { name: "See how it works" }).nth(1).click();
  await expect(page.locator("h1")).toHaveText(
    "Stay with the conversation. Otto can start the note.",
  );
  await page.getByRole("link", { name: "See this for my practice" }).click();
  await page.getByLabel("Give your preview a name").fill("Willow Therapy");
  await page.getByRole("radio", { name: "A team" }).check();
  await page.getByLabel("How do you see clients?").selectOption("Online");
  await page.getByRole("button", { name: "Choose my priorities" }).click();
  await expect(page.locator("[name=feature][value=notes]")).toBeChecked();
  await expect(
    page.locator("[name=feature][value=personalized]"),
  ).not.toBeChecked();
  await page.locator("[name=feature][value=front-desk]").check();
  await page.getByRole("button", { name: "Show me Otto" }).click();
  await expect(page.locator("h1")).toHaveText("See Otto for Willow Therapy");
  await expect(page.locator("#result-size")).toHaveText("Group practice");
  await expect(page.locator("#result-setting")).toHaveText("Online");
  await expect(page.locator("[data-result-feature=personalized]")).toBeHidden();
  await expect(page.locator("[data-result-feature=notes]")).toBeVisible();
  await page.locator("[data-interest=notes]").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#interest-feature-name")).toHaveText(
    "Let Otto draft the note",
  );
  await page.getByRole("button", { name: "Preview waitlist signup" }).click();
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
  await page.getByRole("button", { name: "Show me Otto" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Choose at least one workflow for your tour.",
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
  await page.getByRole("button", { name: "Take a closer look" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("both supplied videos play with native controls and poster images", async ({
  page,
}) => {
  await page.goto("/your-practice/");
  const videos = page.locator("video");
  await expect(videos).toHaveCount(2);
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).toHaveAttribute("poster", /poster\.jpg$/);
    await video.evaluate(async (element: HTMLVideoElement) => {
      element.muted = true;
      element.load();
      await element.play();
    });
    await expect
      .poll(() =>
        video.evaluate((element: HTMLVideoElement) => element.currentTime),
      )
      .toBeGreaterThan(0);
    expect(
      await video.evaluate((element: HTMLVideoElement) => element.duration),
    ).toBeGreaterThan(150);
    await video.evaluate((element: HTMLVideoElement) => element.pause());
  }
});

test("tour waits for its script before allowing the first step", async ({
  page,
}) => {
  let releaseScript!: () => void;
  const scriptReady = new Promise<void>((resolve) => {
    releaseScript = resolve;
  });
  await page.route("**/assets/practice.js", async (route) => {
    await scriptReady;
    await route.continue();
  });
  await page.goto("/your-practice/build/", { waitUntil: "commit" });
  const next = page.getByRole("button", { name: "Choose my priorities" });
  await expect(next).toBeDisabled();
  releaseScript();
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.locator('[data-builder-step="2"]')).toBeVisible();
});
