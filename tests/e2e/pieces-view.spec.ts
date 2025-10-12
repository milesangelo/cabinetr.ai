import { test, expect } from "@playwright/test";
import { CabinetHelpers } from "../helpers/cabinet-helpers";
import { twoDoorConfig, threeDrawerConfig } from "../fixtures/test-data";

test.describe("Pieces View Interactions", () => {
  let helpers: CabinetHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CabinetHelpers(page);
    await helpers.goto();
  });

  test("should display all three piece types", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify all pieces are visible
    await expect(page.getByText("Stile (Vertical)").first()).toBeVisible();
    await expect(page.getByText("Rail (Horizontal)").first()).toBeVisible();
    await expect(page.getByText("Center Panel").first()).toBeVisible();
  });

  test("should show quantity for each piece type", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify quantities are displayed
    const pieces = await page.locator('[class*="cursor-pointer"]').all();

    // Should show quantity for each piece
    for (const piece of pieces) {
      await expect(piece.getByText(/Qty:/)).toBeVisible();
    }
  });

  test("should expand piece details when clicked", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Click on stile to expand
    await helpers.expandPiece("Stile (Vertical)");

    // Verify expanded details are visible
    await expect(page.getByText("Width")).toBeVisible();
    await expect(page.getByText("Length")).toBeVisible();
    await expect(page.getByText("Notes")).toBeVisible();
    await expect(page.getByText("Full height of panel")).toBeVisible();
  });

  test("should collapse piece details when clicked again", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand stile
    const stileContainer = page.getByText("Stile (Vertical)").first();
    await stileContainer.click();

    // Verify it's expanded
    await expect(page.getByText("Full height of panel")).toBeVisible();

    // Click again to collapse
    await stileContainer.click();

    // Verify details are hidden
    await expect(page.getByText("Full height of panel")).not.toBeVisible();
  });

  test("should show correct dimensions for stile piece", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand stile piece
    await helpers.expandPiece("Stile (Vertical)");

    // Get and verify dimensions
    const details = await helpers.getPieceDetails("Stile (Vertical)");

    expect(details.width).toBeCloseTo(1.0, 3);
    expect(details.length).toBeCloseTo(31.0, 3); // Individual height
    expect(details.quantity).toBe(4); // 2 per door * 2 doors
  });

  test("should show correct dimensions for rail piece", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand rail piece
    await helpers.expandPiece("Rail (Horizontal)");

    // Get and verify dimensions
    const details = await helpers.getPieceDetails("Rail (Horizontal)");

    expect(details.width).toBeCloseTo(1.0, 3);
    expect(details.length).toBeCloseTo(11.1875, 3); // Calculated based on width
    expect(details.quantity).toBe(4); // 2 per door * 2 doors
  });

  test("should show correct dimensions for center panel piece", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand center panel piece
    await helpers.expandPiece("Center Panel");

    // Get and verify dimensions
    const details = await helpers.getPieceDetails("Center Panel");

    expect(details.width).toBeCloseTo(11.1875, 3);
    expect(details.length).toBeCloseTo(29.75, 3);
    expect(details.quantity).toBe(2); // 1 per door
  });

  test("should update piece quantities when changing door quantity", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify initial quantity
    await helpers.expandPiece("Stile (Vertical)");
    let details = await helpers.getPieceDetails("Stile (Vertical)");
    expect(details.quantity).toBe(4); // 2 per door * 2 doors

    // Change to 3 doors
    await page.getByLabel("Quantity").fill("3");
    await helpers.waitForCalculation();

    // Collapse and re-expand to refresh
    await page.getByText("Stile (Vertical)").first().click();
    await helpers.expandPiece("Stile (Vertical)");

    // Verify updated quantity
    details = await helpers.getPieceDetails("Stile (Vertical)");
    expect(details.quantity).toBe(6); // 2 per door * 3 doors
  });

  test("should update piece quantities when switching to drawers", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Change to 3 drawers
    await page.getByLabel("Drawers (Stacked)").click();
    await page.getByLabel("Quantity").fill("3");
    await helpers.waitForCalculation();

    // Check center panel quantity
    await helpers.expandPiece("Center Panel");
    const details = await helpers.getPieceDetails("Center Panel");
    expect(details.quantity).toBe(3); // 1 per drawer
  });

  test("should display notes for each piece type", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand and verify stile notes
    await helpers.expandPiece("Stile (Vertical)");
    await expect(page.getByText("Full height of panel")).toBeVisible();

    // Collapse stile and expand rail
    await page.getByText("Stile (Vertical)").first().click();
    await helpers.expandPiece("Rail (Horizontal)");
    await expect(page.getByText(/for tongues/)).toBeVisible();

    // Collapse rail and expand center panel
    await page.getByText("Rail (Horizontal)").first().click();
    await helpers.expandPiece("Center Panel");
    await expect(page.getByText(/Fits in grooves/)).toBeVisible();
  });

  test("should show router depth in notes", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand center panel to see router depth note
    await helpers.expandPiece("Center Panel");
    await expect(page.getByText(/0.375/)).toBeVisible(); // Router depth
  });

  test("should highlight selected piece", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    const stileContainer = page
      .locator("div")
      .filter({ hasText: /^Stile \(Vertical\)/ })
      .first();

    // Check initial state (not highlighted)
    await expect(stileContainer).not.toHaveClass(/border-primary bg-primary/);

    // Click to select
    await stileContainer.click();

    // Verify it's highlighted
    await expect(stileContainer).toHaveClass(/border-primary/);
  });

  test("should show help text at the bottom", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify help text is visible
    await expect(page.getByText("💡 Click on any piece to view detailed dimensions")).toBeVisible();
  });

  test("should display download CSV button in pieces view", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify download button is visible
    await expect(page.getByRole("button", { name: /Download CSV/i })).toBeVisible();
  });

  test("should support custom drawer ratios 1/6 and 5/6", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "drawer" });
    await helpers.waitForCalculation();

    // Switch to custom split and enter ratios
    await page.getByLabel("Custom").click();
    await page.getByLabel("Drawer 1 Ratio").fill("1/6");
    await page.getByLabel("Drawer 2 Ratio").fill("5/6");
    await helpers.waitForCalculation();

    const availableHeight = 30 + 0.5 + 0.5 - 0.125; // 30.875
    const topExpected = availableHeight * (1 / 6);

    // Expand first stile and check length ~ top drawer height
    await helpers.expandPiece("Stile (Vertical)");
    const stile = await helpers.getPieceDetails("Stile (Vertical)");
    expect(stile.length).toBeCloseTo(topExpected, 2);

    // CSV should be enabled (sum = 100%)
    await expect(page.getByRole("button", { name: /CSV/i })).toBeEnabled();
  });

  test("should validate invalid custom ratios and disable CSV", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "drawer" });
    await helpers.waitForCalculation();

    await page.getByLabel("Custom").click();
    await page.getByLabel("Drawer 1 Ratio").fill("30");
    await page.getByLabel("Drawer 2 Ratio").fill("60");
    await helpers.waitForCalculation();

    await expect(page.getByRole("button", { name: /CSV/i })).toBeDisabled();
  });

  test("should update piece dimensions when input changes", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Expand center panel
    await helpers.expandPiece("Center Panel");
    let details = await helpers.getPieceDetails("Center Panel");
    const initialWidth = details.width;

    // Change opening width
    await page.getByLabel("Width (inches)").fill("30");
    await helpers.waitForCalculation();

    // Collapse and re-expand
    await page.getByText("Center Panel").first().click();
    await helpers.expandPiece("Center Panel");

    // Verify dimensions updated
    details = await helpers.getPieceDetails("Center Panel");
    expect(details.width).not.toBeCloseTo(initialWidth, 1);
  });

  test("should handle single door/drawer correctly", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 18, openingHeight: 24 });
    await helpers.fillConfiguration({ quantity: 1, type: "door" });
    await helpers.waitForCalculation();

    // Verify quantities for single door
    await helpers.expandPiece("Stile (Vertical)");
    const stileDetails = await helpers.getPieceDetails("Stile (Vertical)");
    expect(stileDetails.quantity).toBe(2); // 2 stiles per door

    await page.getByText("Stile (Vertical)").first().click();
    await helpers.expandPiece("Center Panel");
    const panelDetails = await helpers.getPieceDetails("Center Panel");
    expect(panelDetails.quantity).toBe(1); // 1 panel per door
  });

  test("should maintain correct piece order", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Get all piece headers in order
    const pieces = await page
      .locator('[class*="cursor-pointer"]')
      .locator("h3")
      .allTextContents();

    // Verify order: Stile, Rail, Center Panel
    expect(pieces[0]).toContain("Stile (Vertical)");
    expect(pieces[1]).toContain("Rail (Horizontal)");
    expect(pieces[2]).toContain("Center Panel");
  });
});
