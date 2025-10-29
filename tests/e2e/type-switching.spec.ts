import { test, expect } from "@playwright/test";
import { CabinetHelpers } from "../helpers/cabinet-helpers";
import { twoDoorConfig, threeDrawerConfig } from "../fixtures/test-data";

test.describe("Type Switching (Door vs Drawer)", () => {
  let helpers: CabinetHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CabinetHelpers(page);
    await helpers.goto();
  });

  test("should switch from door to drawer and recalculate dimensions", async ({ page }) => {
    // Start with door configuration
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 24 });
    await helpers.fillOverlaps({
      topOverlap: 0.5,
      bottomOverlap: 0.5,
      leftOverlap: 0.5,
      rightOverlap: 0.5,
    });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // For doors (side by side): width is divided, height stays same
    // Width: (24 + 0.5 + 0.5 - 0.125) / 2 = 12.4375
    // Height: 24 + 0.5 + 0.5 = 25.0
    await helpers.verifyCalculatedDimensions({
      individualWidth: 12.4375,
      individualHeight: 25.0,
    });

    // Switch to drawers
    await page.getByLabel("Drawers (Stacked)").click();
    await helpers.waitForCalculation();

    // For drawers (stacked): height is divided, width stays same
    // Width: 24 + 0.5 + 0.5 = 25.0
    // Height: (24 + 0.5 + 0.5 - 0.125) / 2 = 12.4375
    await helpers.verifyCalculatedDimensions({
      individualWidth: 25.0,
      individualHeight: 12.4375,
    });
  });

  test("should switch from drawer to door and recalculate dimensions", async ({ page }) => {
    // Start with drawer configuration
    await helpers.configureCabinet(threeDrawerConfig);
    await helpers.waitForCalculation();

    // For 3 drawers stacked:
    // Width: 18 + 0.5 + 0.5 = 19.0
    // Height: (24 + 0.5 + 0.5 - 0.125*2) / 3 = 8.25
    await helpers.verifyCalculatedDimensions({
      individualWidth: 19.0,
      individualHeight: 8.25,
    });

    // Switch to doors and change quantity to 2
    await page.getByLabel("Doors (Side by Side)").click();
    await page.getByLabel("Quantity").fill("2");
    await helpers.waitForCalculation();

    // For 2 doors side by side:
    // Width: (18 + 0.5 + 0.5 - 0.125) / 2 = 9.4375
    // Height: 24 + 0.5 + 0.5 = 25.0
    await helpers.verifyCalculatedDimensions({
      individualWidth: 9.4375,
      individualHeight: 25.0,
    });
  });

  test("should handle quantity changes for doors", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 30, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // 2 doors: (30 + 0.5 + 0.5 - 0.125) / 2 = 15.4375
    let width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(15.4375, 3);

    // Change to 3 doors
    await page.getByLabel("Quantity").fill("3");
    await helpers.waitForCalculation();

    // 3 doors: (30 + 0.5 + 0.5 - 0.125*2) / 3 = 10.25
    width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(10.25, 3);

    // Change to 1 door
    await page.getByLabel("Quantity").fill("1");
    await helpers.waitForCalculation();

    // 1 door: 30 + 0.5 + 0.5 = 31.0 (no gap)
    width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(31.0, 3);
  });

  test("should handle quantity changes for drawers", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "drawer" });
    await helpers.waitForCalculation();

    // 2 drawers: (30 + 0.5 + 0.5 - 0.125) / 2 = 15.4375
    let height = await helpers.getCalculatedDimension("Individual Height");
    expect(height).toBeCloseTo(15.4375, 3);

    // Change to 4 drawers
    await page.getByLabel("Quantity").fill("4");
    await helpers.waitForCalculation();

    // 4 drawers: (30 + 0.5 + 0.5 - 0.125*3) / 4 = 7.65625
    height = await helpers.getCalculatedDimension("Individual Height");
    expect(height).toBeCloseTo(7.65625, 3);

    // Change to 1 drawer
    await page.getByLabel("Quantity").fill("1");
    await helpers.waitForCalculation();

    // 1 drawer: 30 + 0.5 + 0.5 = 31.0 (no gap)
    height = await helpers.getCalculatedDimension("Individual Height");
    expect(height).toBeCloseTo(31.0, 3);
  });

  test("should maintain correct calculations when toggling between types multiple times", async ({
    page,
  }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 20, openingHeight: 20 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // Door → Drawer → Door → Drawer cycle
    for (let i = 0; i < 3; i++) {
      // Switch to drawer
      await page.getByLabel("Drawers (Stacked)").click();
      await helpers.waitForCalculation();

      await helpers.verifyCalculatedDimensions({
        individualWidth: 21.0, // 20 + 0.5 + 0.5
        individualHeight: 10.4375, // (20 + 0.5 + 0.5 - 0.125) / 2
      });

      // Switch back to door
      await page.getByLabel("Doors (Side by Side)").click();
      await helpers.waitForCalculation();

      await helpers.verifyCalculatedDimensions({
        individualWidth: 10.4375, // (20 + 0.5 + 0.5 - 0.125) / 2
        individualHeight: 21.0, // 20 + 0.5 + 0.5
      });
    }
  });

  test("should correctly handle gap calculation for different quantities", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 24 });
    await helpers.fillConfiguration({ gap: 0.25, quantity: 4, type: "door" });
    await helpers.waitForCalculation();

    // 4 doors with 0.25" gap means 3 gaps total (quantity - 1)
    // Width: (24 + 0.5 + 0.5 - 0.25*3) / 4 = 6.0625
    await helpers.verifyCalculatedDimensions({
      individualWidth: 6.0625,
    });

    // Switch to 6 doors
    await page.getByLabel("Quantity").fill("6");
    await helpers.waitForCalculation();

    // 6 doors with 0.25" gap means 5 gaps total
    // Width: (24 + 0.5 + 0.5 - 0.25*5) / 6 = 3.9583333
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(3.958333, 3);
  });

  test("should maintain stile and rail dimensions when switching types", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify initial stile/rail dimensions
    await helpers.verifyCalculatedDimensions({
      stileWidth: 1.0,
      railWidth: 1.0,
    });

    // Switch to drawer
    await page.getByLabel("Drawers (Stacked)").click();
    await helpers.waitForCalculation();

    // Verify stile/rail dimensions remain the same
    await helpers.verifyCalculatedDimensions({
      stileWidth: 1.0,
      railWidth: 1.0,
    });
  });
});
