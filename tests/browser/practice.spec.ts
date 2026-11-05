import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.route(
    /^https:\/\/(?:[^/]+\.)?(?:googletagmanager|google-analytics)\.com\//,
    (route) => route.abort(),
  );
});

test("practice funnel reaches the demo waitlist and preserves preferences", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("/your-practice/");
  await page.getByRole("link", { name: "See how it works" }).nth(1).click();
  await page.getByRole("link", { name: "See this for my practice" }).click();
  await page.getByLabel("Give your preview a name").fill("Willow Therapy");
  await page.getByRole("radio", { name: "A team" }).check();
  await page.getByLabel("How do you see clients?").selectOption("Online");
  await page.getByRole("button", { name: "Choose my priorities" }).click();
  await expect(page.locator("[name=feature][value=notes]")).toBeChecked();
  await page.getByRole("button", { name: "Preview my waitlist spot" }).click();
  await expect(page.locator("h1")).toHaveText("Preview your waitlist spot.");
  await expect(page.locator(".queue-intro")).toContainText("2027");
  await expect(page.locator("#queue-number")).toHaveText("234");
  await expect(page.locator(".queue-demo-tag")).toHaveText(
    "Demo waitlist preview",
  );
  const invite = new URL("/your-practice/?ref=demo234", page.url()).href;
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Invite link copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    invite,
  );
  const email = new URL(
    (await page.locator("#email-referral").getAttribute("href"))!,
  );
  expect(email.searchParams.get("body")).toContain(invite);
  await page
    .getByRole("button", { name: "Preview a referral moving you up" })
    .click();
  await expect(page.locator("#queue-number")).toHaveText("233");
  await expect(page.locator("#queue-referrals")).toHaveText("1");
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

test("priorities require a choice and a failed clipboard offers a selectable invite", async ({
  page,
}) => {
  await page.goto("/your-practice/build/");
  await page.getByRole("button", { name: "Choose my priorities" }).click();
  await page.locator("[name=feature][value=personalized]").uncheck();
  await page.getByRole("button", { name: "Preview my waitlist spot" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Choose at least one workflow for your tour.",
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("No clipboard");
        },
      },
      configurable: true,
    });
  });
  await page.goto(
    "/your-practice/preview/?practice=%3Cscript%3E&feature=unknown",
  );
  await expect(page.locator("#queue-number")).toHaveText("234");
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.getByLabel("Your invite link")).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(
    "Select and copy your invite link above.",
  );
  await expect(page.getByLabel("Your invite link")).not.toHaveValue(/script/);
});

test("hero shows one overview video and plays from its poster", async ({
  page,
}) => {
  await page.goto("/your-practice/");
  const video = page.locator("video");
  await expect(video).toHaveCount(1);
  await expect(page.locator(".video-card-heading")).toHaveCount(0);
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).toHaveAttribute("poster", /overview-poster\.jpg$/);
  await video.evaluate((element: HTMLVideoElement) => {
    element.muted = true;
  });
  await page.getByRole("button", { name: "Play the Otto overview" }).click();
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  await expect(video).toHaveAttribute("controls", "");
  await expect(
    page.getByRole("button", { name: "Play the Otto overview" }),
  ).toBeHidden();
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.duration),
  ).toBeGreaterThan(150);
});

test("billing walkthrough remains available on its feature page", async ({
  page,
}) => {
  await page.goto("/your-practice/front-desk/");
  const video = page.locator("video");
  await expect(video).toHaveCount(1);
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
  ).toBeGreaterThan(210);
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
