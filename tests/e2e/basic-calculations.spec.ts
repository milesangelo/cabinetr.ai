import { test, expect } from "@playwright/test";
import { CabinetHelpers } from "../helpers/cabinet-helpers";
import {
  defaultCabinetConfig,
  twoDoorConfig,
  twoDoorExpectedDimensions,
  singleDoorConfig,
} from "../fixtures/test-data";

test.describe("Basic Cabinet Calculations", () => {
  let helpers: CabinetHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CabinetHelpers(page);
    await helpers.goto();
  });

  test("should load the cabinet calculator with default values", async ({ page }) => {
    // Verify page title
    await expect(page.getByRole("heading", { name: "Cabinet Door Calculator" })).toBeVisible();

    // Verify subtitle
    await expect(page.getByText("15\" Beveled Edge Tongue & Groove Router")).toBeVisible();

    // Verify main sections are visible
    await expect(page.getByText("Cabinet Opening Dimensions")).toBeVisible();
    await expect(page.getByText("Overlap")).toBeVisible();
    await expect(page.getByText("Configuration")).toBeVisible();
    await expect(page.getByText("Stile & Rail Dimensions")).toBeVisible();
    await expect(page.getByText("Calculated Dimensions")).toBeVisible();
    await expect(page.getByText("3D Preview")).toBeVisible();
    await expect(page.getByText("Individual Pieces")).toBeVisible();
  });

  test("should calculate correct dimensions for default two door configuration", async () => {
    // Configure with two door settings
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Verify calculated dimensions
    await helpers.verifyCalculatedDimensions(twoDoorExpectedDimensions);
  });

  test("should calculate correct dimensions for single door", async () => {
    // Configure with single door
    await helpers.configureCabinet(singleDoorConfig);
    await helpers.waitForCalculation();

    // For single door: no gap subtraction needed
    const expectedWidth = 18 + 0.5 + 0.5; // 19.0
    const expectedHeight = 36 + 0.5 + 0.5; // 37.0

    await helpers.verifyCalculatedDimensions({
      individualWidth: expectedWidth,
      individualHeight: expectedHeight,
      stileWidth: 1.0,
      railWidth: 1.0,
    });
  });

  test("should update calculations when dimensions change", async ({ page }) => {
    // Start with default config
    await helpers.configureCabinet(defaultCabinetConfig);
    await helpers.waitForCalculation();

    // Change width and verify update
    await page.getByLabel("Width (inches)").fill("30");
    await helpers.waitForCalculation();

    // New width calculation: (30 + 0.5 + 0.5 - 0.125) / 2 = 15.4375
    const width = await helpers.getCalculatedDimension("Individual Width");
    expect(width).toBeCloseTo(15.4375, 3);

    // Change height and verify update
    await page.getByLabel("Height (inches)").fill("36");
    await helpers.waitForCalculation();

    // New height calculation: 36 + 0.5 + 0.5 = 37.0
    const height = await helpers.getCalculatedDimension("Individual Height");
    expect(height).toBeCloseTo(37.0, 3);
  });

  test("should handle decimal precision for 1/16 inch measurements", async ({ page }) => {
    // Set dimensions that should result in precise 1/16 inch measurements
    await helpers.fillCabinetDimensions({ openingWidth: 24.0625, openingHeight: 30.1875 });
    await helpers.fillOverlaps({
      topOverlap: 0.5625,
      bottomOverlap: 0.4375,
      leftOverlap: 0.625,
      rightOverlap: 0.5,
    });
    await helpers.fillConfiguration({ gap: 0.1875, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // Verify precision is maintained
    const width = await helpers.getCalculatedDimension("Individual Width");
    const height = await helpers.getCalculatedDimension("Individual Height");

    // Width: (24.0625 + 0.625 + 0.5 - 0.1875) / 2 = 12.5
    expect(width).toBeCloseTo(12.5, 4);

    // Height: 30.1875 + 0.5625 + 0.4375 = 31.1875
    expect(height).toBeCloseTo(31.1875, 4);
  });

  test("should calculate correctly with custom overlaps", async () => {
    // Use custom overlap configuration
    await helpers.fillCabinetDimensions({ openingWidth: 24, openingHeight: 30 });
    await helpers.fillOverlaps({
      topOverlap: 0.75,
      bottomOverlap: 0.75,
      leftOverlap: 0.625,
      rightOverlap: 0.625,
    });
    await helpers.fillConfiguration({ gap: 0.1875, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // Width: (24 + 0.625 + 0.625 - 0.1875) / 2 = 12.53125
    // Height: 30 + 0.75 + 0.75 = 31.5
    await helpers.verifyCalculatedDimensions({
      individualWidth: 12.53125,
      individualHeight: 31.5,
    });
  });

  test("should display stile and rail dimensions correctly", async () => {
    await helpers.configureCabinet(defaultCabinetConfig);
    await helpers.waitForCalculation();

    // Verify stile and rail widths match input
    await helpers.verifyCalculatedDimensions({
      stileWidth: defaultCabinetConfig.stileWidth,
      railWidth: defaultCabinetConfig.railWidth,
    });
  });
});
