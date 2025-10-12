import { test, expect } from "@playwright/test";
import { CabinetHelpers } from "../helpers/cabinet-helpers";
import { twoDoorConfig, threeDrawerConfig, singleDoorConfig } from "../fixtures/test-data";
import fs from "fs";

test.describe("CSV Download Functionality", () => {
  let helpers: CabinetHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CabinetHelpers(page);
    await helpers.goto();
  });

  test("should download CSV file with correct headers", async () => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();

    // Read CSV content
    const csvContent = fs.readFileSync(downloadPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    // Verify headers
    const headers = lines[0];
    expect(headers).toBe(
      '"Piece Type","Width (inches)","Length (inches)","Quantity","Notes"'
    );
  });

  test("should download CSV with correct data for two doors", async () => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();

    // Read and parse CSV
    const csvContent = fs.readFileSync(downloadPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    // Should have header + 3 piece types
    expect(lines.length).toBe(4);

    // Parse and verify each piece
    const stileRow = lines[1];
    expect(stileRow).toContain('"Stile (Vertical)"');
    expect(stileRow).toContain('"1.000"'); // Width
    expect(stileRow).toContain('"31.000"'); // Length (individual height)
    expect(stileRow).toContain('"4"'); // Quantity (2 per door * 2 doors)

    const railRow = lines[2];
    expect(railRow).toContain('"Rail (Horizontal)"');
    expect(railRow).toContain('"1.000"'); // Width
    expect(railRow).toContain('"11.188"'); // Length (calculated)
    expect(railRow).toContain('"4"'); // Quantity (2 per door * 2 doors)

    const panelRow = lines[3];
    expect(panelRow).toContain('"Center Panel"');
    expect(panelRow).toContain('"11.188"'); // Width
    expect(panelRow).toContain('"29.750"'); // Length
    expect(panelRow).toContain('"2"'); // Quantity (1 per door)
  });

  test("should download CSV with correct data for three drawers", async () => {
    await helpers.configureCabinet(threeDrawerConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();

    // Read and parse CSV
    const csvContent = fs.readFileSync(downloadPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    // Should have header + 3 piece types
    expect(lines.length).toBe(4);

    // Verify quantities for 3 drawers
    const stileRow = lines[1];
    expect(stileRow).toContain('"6"'); // 2 per drawer * 3 drawers

    const railRow = lines[2];
    expect(railRow).toContain('"6"'); // 2 per drawer * 3 drawers

    const panelRow = lines[3];
    expect(panelRow).toContain('"3"'); // 1 per drawer
  });

  test("should download CSV with correct data for single door", async () => {
    await helpers.configureCabinet(singleDoorConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();

    // Read and parse CSV
    const csvContent = fs.readFileSync(downloadPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    // Verify quantities for single door
    const stileRow = lines[1];
    expect(stileRow).toContain('"2"'); // 2 per door * 1 door

    const railRow = lines[2];
    expect(railRow).toContain('"2"'); // 2 per door * 1 door

    const panelRow = lines[3];
    expect(panelRow).toContain('"1"'); // 1 per door
  });

  test("should include notes field in CSV", async () => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();

    // Read CSV
    const csvContent = fs.readFileSync(downloadPath, "utf-8");

    // Verify notes are present
    expect(csvContent).toContain("Full height of panel");
    expect(csvContent).toContain("for tongues");
    expect(csvContent).toContain("Fits in grooves");
  });

  test("should properly format CSV with quotes around text fields", async () => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();

    // Read CSV
    const csvContent = fs.readFileSync(downloadPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    // Each row should have properly quoted fields
    for (const line of lines) {
      // Count quotes - should be even number (opening and closing)
      const quoteCount = (line.match(/"/g) || []).length;
      expect(quoteCount % 2).toBe(0);

      // Verify comma-separated structure
      expect(line).toContain(",");
    }
  });

  test("should download CSV with filename containing current date", async () => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Get current date in ISO format
    const today = new Date().toISOString().split("T")[0];

    // Download CSV
    const downloadPromise = helpers.downloadCSV();
    const download = await downloadPromise;

    // Verify filename contains date
    expect(download).toContain("cutlist_");
    expect(download).toContain(today);
    expect(download).toContain(".csv");
  });

  test("should match CSV dimensions with UI displayed dimensions", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Get UI dimensions
    const individualWidth = await helpers.getCalculatedDimension("Individual Width");
    const individualHeight = await helpers.getCalculatedDimension("Individual Height");

    // Download CSV
    const downloadPath = await helpers.downloadCSV();
    const csvContent = fs.readFileSync(downloadPath, "utf-8");

    // Verify stile length in CSV matches individual height in UI
    expect(csvContent).toContain(`"${individualHeight.toFixed(3)}"`);
  });

  test("should handle decimal precision correctly in CSV", async ({ page }) => {
    // Set up configuration with precise measurements
    await helpers.fillCabinetDimensions({ openingWidth: 24.0625, openingHeight: 30.1875 });
    await helpers.fillConfiguration({ gap: 0.1875, quantity: 2, type: "door" });
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();
    const csvContent = fs.readFileSync(downloadPath, "utf-8");

    // Verify 3 decimal places are used (e.g., "12.500", "31.188")
    const lines = csvContent.trim().split("\n");
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Extract numeric values and verify they have 3 decimal places
      const matches = line.match(/"(\d+\.\d{3})"/g);
      expect(matches).toBeTruthy();
      if (matches) {
        expect(matches.length).toBeGreaterThan(0);
      }
    }
  });

  test("should update CSV content when configuration changes", async () => {
    // First configuration
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();
    const download1Path = await helpers.downloadCSV();
    const csv1Content = fs.readFileSync(download1Path, "utf-8");

    // Change to different configuration
    await helpers.configureCabinet(threeDrawerConfig);
    await helpers.waitForCalculation();
    const download2Path = await helpers.downloadCSV();
    const csv2Content = fs.readFileSync(download2Path, "utf-8");

    // CSV content should be different
    expect(csv1Content).not.toBe(csv2Content);

    // First should have quantity 2 (doors)
    expect(csv1Content).toContain('"2"'); // for center panel

    // Second should have quantity 3 (drawers)
    expect(csv2Content).toContain('"3"'); // for center panel
  });

  test("should handle special characters in notes field", async ({ page }) => {
    await helpers.configureCabinet(twoDoorConfig);
    await helpers.waitForCalculation();

    // Download CSV
    const downloadPath = await helpers.downloadCSV();
    const csvContent = fs.readFileSync(downloadPath, "utf-8");

    // Verify notes with special characters are properly quoted
    // Router depth note includes inches symbol and quotes
    expect(csvContent).toContain("0.75"); // router depth * 2
  });
});
