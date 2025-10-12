import { Page, expect } from "@playwright/test";
import { CabinetTestData } from "../fixtures/test-data";

export class CabinetHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the cabinet calculator home page
   */
  async goto() {
    await this.page.goto("/cabinet/new");
    await expect(this.page.getByRole("heading", { name: "3D Preview" })).toBeVisible();
  }

  /**
   * Fill in cabinet opening dimensions
   */
  async fillCabinetDimensions(config: Partial<CabinetTestData>) {
    if (config.openingWidth !== undefined) {
      await this.page.locator("input#width").fill(String(config.openingWidth));
    }
    if (config.openingHeight !== undefined) {
      await this.page.locator("input#height").fill(String(config.openingHeight));
    }
  }

  /**
   * Fill in overlap dimensions
   */
  async fillOverlaps(config: Partial<CabinetTestData>) {
    if (config.topOverlap !== undefined) {
      await this.page.locator("input#top").fill(String(config.topOverlap));
    }
    if (config.bottomOverlap !== undefined) {
      await this.page.locator("input#bottom").fill(String(config.bottomOverlap));
    }
    if (config.leftOverlap !== undefined) {
      await this.page.locator("input#left").fill(String(config.leftOverlap));
    }
    if (config.rightOverlap !== undefined) {
      await this.page.locator("input#right").fill(String(config.rightOverlap));
    }
  }

  /**
   * Fill in configuration settings
   */
  async fillConfiguration(config: Partial<CabinetTestData>) {
    if (config.gap !== undefined) {
      await this.page.locator("input#gap").fill(String(config.gap));
    }
    if (config.type !== undefined) {
      if (config.type === "door") {
        await this.page.getByLabel(/^Doors/).click();
      } else {
        await this.page.getByLabel(/^Drawers/).click();
      }
    }
    if (config.quantity !== undefined) {
      await this.page.locator("input#quantity").fill(String(config.quantity));
    }
  }

  /**
   * Fill in stile and rail dimensions
   */
  async fillStileAndRail(config: Partial<CabinetTestData>) {
    if (config.stileWidth !== undefined) {
      await this.page.getByLabel("Stile Width (inches)").fill(String(config.stileWidth));
    }
    if (config.railWidth !== undefined) {
      await this.page.getByLabel("Rail Width (inches)").fill(String(config.railWidth));
    }
    if (config.routerDepth !== undefined) {
      await this.page.getByLabel("Router Depth (inches)").fill(String(config.routerDepth));
    }
  }

  /**
   * Configure entire cabinet with all parameters
   */
  async configureCabinet(config: CabinetTestData) {
    await this.fillCabinetDimensions(config);
    await this.fillOverlaps(config);
    await this.fillConfiguration(config);
    await this.fillStileAndRail(config);
  }

  /**
   * Get calculated dimension value
   */
  async getCalculatedDimension(label: string): Promise<number> {
    const text = await this.page
      .getByText(label)
      .locator("..")
      .getByText(/"$/)
      .textContent();

    if (!text) {
      throw new Error(`Could not find calculated dimension for ${label}`);
    }

    return parseFloat(text.replace('"', ""));
  }

  /**
   * Verify calculated dimensions match expected values
   */
  async verifyCalculatedDimensions(expected: {
    individualWidth?: number;
    individualHeight?: number;
    stileWidth?: number;
    railWidth?: number;
  }) {
    if (expected.individualWidth !== undefined) {
      const width = await this.getCalculatedDimension("Individual Width");
      expect(width).toBeCloseTo(expected.individualWidth, 3);
    }
    if (expected.individualHeight !== undefined) {
      const height = await this.getCalculatedDimension("Individual Height");
      expect(height).toBeCloseTo(expected.individualHeight, 3);
    }
    if (expected.stileWidth !== undefined) {
      const stileWidth = await this.getCalculatedDimension("Stile Width");
      expect(stileWidth).toBeCloseTo(expected.stileWidth, 3);
    }
    if (expected.railWidth !== undefined) {
      const railWidth = await this.getCalculatedDimension("Rail Width");
      expect(railWidth).toBeCloseTo(expected.railWidth, 3);
    }
  }

  /**
   * Click download CSV button and wait for download
   */
  async downloadCSV(): Promise<string> {
    const downloadPromise = this.page.waitForEvent("download");
    const csvButton = this.page.getByRole("button", { name: /CSV/i });
    await csvButton.click();
    const download = await downloadPromise;
    const path = await download.path();

    if (!path) {
      throw new Error("Download failed - no path returned");
    }

    return path;
  }

  /**
   * Click on a piece to expand details
   */
  async expandPiece(pieceName: string) {
    await this.page.getByText(pieceName).first().click();
    await expect(this.page.getByText("Width")).toBeVisible();
    await expect(this.page.getByText("Length")).toBeVisible();
  }

  /**
   * Get piece details after expanding
   */
  async getPieceDetails(pieceName: string): Promise<{
    width: number;
    length: number;
    quantity: number;
  }> {
    const pieceContainer = this.page.locator("div").filter({ hasText: new RegExp(`^${pieceName}`) }).first();

    // Get quantity from the piece header
    const quantityText = await pieceContainer.getByText(/Qty:/).textContent();
    const quantity = quantityText ? parseInt(quantityText.replace("Qty:", "").trim()) : 0;

    // Get width and length from expanded details
    const widthText = await pieceContainer.getByText(/Width/).locator("..").locator("p").last().textContent();
    const lengthText = await pieceContainer.getByText(/Length/).locator("..").locator("p").last().textContent();

    const width = widthText ? parseFloat(widthText.replace('"', "")) : 0;
    const length = lengthText ? parseFloat(lengthText.replace('"', "")) : 0;

    return { width, length, quantity };
  }

  /**
   * Wait for calculations to update
   */
  async waitForCalculation() {
    // Wait a brief moment for React to update calculations
    await this.page.waitForTimeout(100);
  }
}
