import { test, expect } from "@playwright/test";
import { CabinetHelpers } from "../helpers/cabinet-helpers";

test.describe("Input Validation and Edge Cases", () => {
  let helpers: CabinetHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CabinetHelpers(page);
    await helpers.goto();
  });

  test("should handle 1/16 inch precision (0.0625)", async ({ page }) => {
    // 1/16 inch = 0.0625
    await helpers.fillCabinetDimensions({ openingWidth: 24.0625, openingHeight: 30.0625 });
    await helpers.waitForCalculation();

    const width = await helpers.getCalculatedDimension("Individual Width");
    const height = await helpers.getCalculatedDimension("Individual Height");

    // Verify precision is maintained
    expect(width).toBeCloseTo(12.46875, 4); // (24.0625 + 1 - 0.125) / 2
    expect(height).toBeCloseTo(31.0625, 4); // 30.0625 + 1
  });

  test("should handle 1/8 inch precision (0.125)", async ({ page }) => {
    // Common gap size: 1/8 inch = 0.125
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "door" });
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.waitForCalculation();

    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(12.4375, 4);
  });

  test("should handle 1/32 inch precision (0.03125)", async ({ page }) => {
    // Test very precise measurements
    await helpers.fillOverlaps({
      topOverlap: 0.53125, // 17/32
      bottomOverlap: 0.46875, // 15/32
    });
    await helpers.fillCabinetDimensions({ openingHeight: 30 });
    await helpers.waitForCalculation();

    const height = await helpers.getCalculatedDimension("Individual Height");
    expect(height).toBeCloseTo(31.0, 4); // 30 + 0.53125 + 0.46875
  });

  test("should handle very small dimensions", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 6, openingHeight: 6 });
    await helpers.fillConfiguration({ quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    const width = await helpers.getCalculatedDimension("Individual Width");
    const height = await helpers.getCalculatedDimension("Individual Height");

    expect(width).toBeCloseTo(3.4375, 3); // (6 + 1 - 0.125) / 2
    expect(height).toBeCloseTo(7.0, 3); // 6 + 1
  });

  test("should handle very large dimensions", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 96, openingHeight: 84 });
    await helpers.fillConfiguration({ quantity: 4, type: "door" });
    await helpers.waitForCalculation();

    const width = await helpers.getCalculatedDimension("Individual Width");
    const height = await helpers.getCalculatedDimension("Individual Height");

    // (96 + 1 - 0.375) / 4 = 24.15625
    expect(width).toBeCloseTo(24.15625, 3);
    expect(height).toBeCloseTo(85.0, 3); // 84 + 1
  });

  test("should handle maximum quantity (6 doors)", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 60, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 6, type: "door" });
    await helpers.waitForCalculation();

    // (60 + 1 - 0.125*5) / 6 = 10.0625
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(10.0625, 3);

    // Verify pieces have correct quantities
    await helpers.expandPiece("Stile (Vertical)");
    const details = await helpers.getPieceDetails("Stile (Vertical)");
    expect(details.quantity).toBe(12); // 2 per door * 6 doors
  });

  test("should handle no gap (0 gap)", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // With no gap: (24 + 1 - 0) / 2 = 12.5
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(12.5, 3);
  });

  test("should handle large gap", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillConfiguration({ gap: 0.5, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // With 0.5" gap: (24 + 1 - 0.5) / 2 = 12.25
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(12.25, 3);
  });

  test("should handle zero overlaps", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillOverlaps({
      topOverlap: 0,
      bottomOverlap: 0,
      leftOverlap: 0,
      rightOverlap: 0,
    });
    await helpers.fillConfiguration({ gap: 0, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // With no overlaps or gaps: 24 / 2 = 12, height = 30
    const width = await helpers.getCalculatedDimension("Individual Width");
    const height = await helpers.getCalculatedDimension("Individual Height");

    expect(width).toBeCloseTo(12.0, 3);
    expect(height).toBeCloseTo(30.0, 3);
  });

  test("should handle large overlaps", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillOverlaps({
      topOverlap: 1.5,
      bottomOverlap: 1.5,
      leftOverlap: 1.0,
      rightOverlap: 1.0,
    });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // Width: (24 + 2 - 0.125) / 2 = 12.9375
    // Height: 30 + 3 = 33
    const width = await helpers.getCalculatedDimension("Individual Width");
    const height = await helpers.getCalculatedDimension("Individual Height");

    expect(width).toBeCloseTo(12.9375, 3);
    expect(height).toBeCloseTo(33.0, 3);
  });

  test("should handle different stile and rail widths", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillStileAndRail({ stileWidth: 2.5, railWidth: 3.0 });
    await helpers.waitForCalculation();

    // Verify custom stile and rail widths are displayed
    await helpers.verifyCalculatedDimensions({
      stileWidth: 2.5,
      railWidth: 3.0,
    });

    // Verify pieces reflect custom widths
    await helpers.expandPiece("Stile (Vertical)");
    const stileDetails = await helpers.getPieceDetails("Stile (Vertical)");
    expect(stileDetails.width).toBeCloseTo(2.5, 3);

    await page.getByText("Stile (Vertical)").first().click();
    await helpers.expandPiece("Rail (Horizontal)");
    const railDetails = await helpers.getPieceDetails("Rail (Horizontal)");
    expect(railDetails.width).toBeCloseTo(3.0, 3);
  });

  test("should handle router depth changes", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillConfiguration({ quantity: 2, type: "door" });

    // Test with 0.5" router depth
    await helpers.fillStileAndRail({ routerDepth: 0.5 });
    await helpers.waitForCalculation();

    await helpers.expandPiece("Rail (Horizontal)");
    let railDetails = await helpers.getPieceDetails("Rail (Horizontal)");
    const railLength1 = railDetails.length;

    // Change router depth to 0.25"
    await page.getByText("Rail (Horizontal)").first().click();
    await helpers.fillStileAndRail({ routerDepth: 0.25 });
    await helpers.waitForCalculation();

    await helpers.expandPiece("Rail (Horizontal)");
    railDetails = await helpers.getPieceDetails("Rail (Horizontal)");
    const railLength2 = railDetails.length;

    // Rail length should be different with different router depth
    expect(railLength1).not.toBeCloseTo(railLength2, 2);
  });

  test("should calculate correctly with asymmetric overlaps", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillOverlaps({
      topOverlap: 0.75,
      bottomOverlap: 0.25,
      leftOverlap: 0.625,
      rightOverlap: 0.375,
    });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // Width: (24 + 0.625 + 0.375 - 0.125) / 2 = 12.4375
    // Height: 30 + 0.75 + 0.25 = 31.0
    await helpers.verifyCalculatedDimensions({
      individualWidth: 12.4375,
      individualHeight: 31.0,
    });
  });

  test("should handle rapid input changes", async ({ page }) => {
    // Quickly change multiple inputs
    await page.getByLabel("Width (inches)").fill("20");
    await page.getByLabel("Height (inches)").fill("25");
    await page.getByLabel("Gap Between (inches)").fill("0.1875");
    await page.getByLabel("Quantity").fill("3");
    await helpers.waitForCalculation();

    // Verify calculations are correct after rapid changes
    // (20 + 1 - 0.1875*2) / 3 = 6.875
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(6.875, 3);
  });

  test("should maintain calculation accuracy across type switches", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 24 });
    await helpers.fillConfiguration({ gap: 0.125, quantity: 3, type: "door" });
    await helpers.waitForCalculation();

    // Get door calculation
    const doorWidth = await helpers.getCalculatedDimension("Individual Width");

    // Switch to drawer
    await page.getByLabel("Drawers (Stacked)").click();
    await helpers.waitForCalculation();

    const drawerHeight = await helpers.getCalculatedDimension("Individual Height");

    // For square opening, door width should equal drawer height
    expect(doorWidth).toBeCloseTo(drawerHeight, 4);
  });

  test("should handle narrow stile/rail configurations", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillStileAndRail({ stileWidth: 0.5, railWidth: 0.5, routerDepth: 0.25 });
    await helpers.waitForCalculation();

    // Verify narrow widths are handled correctly
    await helpers.verifyCalculatedDimensions({
      stileWidth: 0.5,
      railWidth: 0.5,
    });
  });

  test("should handle wide stile/rail configurations", async ({ page }) => {
    await helpers.fillCabinetDimensions({ openingWidth: 30, openingHeight: 36 });
    await helpers.fillStileAndRail({ stileWidth: 4.0, railWidth: 4.0, routerDepth: 0.5 });
    await helpers.waitForCalculation();

    // Verify wide widths are handled correctly
    await helpers.verifyCalculatedDimensions({
      stileWidth: 4.0,
      railWidth: 4.0,
    });
  });

  test("should maintain precision with multiple decimal operations", async ({ page }) => {
    // Use measurements that require multiple decimal operations
    await helpers.fillCabinetDimensions({ openingWidth: 23.875, openingHeight: 29.75 });
    await helpers.fillOverlaps({
      topOverlap: 0.5625,
      bottomOverlap: 0.4375,
      leftOverlap: 0.625,
      rightOverlap: 0.5,
    });
    await helpers.fillConfiguration({ gap: 0.1875, quantity: 3, type: "door" });
    await helpers.fillStileAndRail({ routerDepth: 0.375 });
    await helpers.waitForCalculation();

    // Complex calculation should maintain precision
    // Width: (23.875 + 0.625 + 0.5 - 0.1875*2) / 3
    const expectedWidth = (23.875 + 0.625 + 0.5 - 0.1875 * 2) / 3;
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(expectedWidth, 4);
  });
});
