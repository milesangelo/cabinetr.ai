import { Page, expect } from '@playwright/test';
import { TestGlobalSettings, TestCabinetOpening, ExpectedCutlistItem } from '../fixtures/test-data';

/**
 * Helper class for interacting with the Cabinet Cutlist Generator
 */
export class CabinetPageHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to the application
   */
  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Cabinet Cutlist Generator' })).toBeVisible();
  }

  /**
   * Fill in the global settings form
   */
  async fillGlobalSettings(settings: TestGlobalSettings) {
    await this.page.locator('#railWidth').fill(settings.railWidth.toString());
    await this.page.locator('#stileWidth').fill(settings.stileWidth.toString());
    await this.page.locator('#thickness').fill(settings.thickness.toString());
    await this.page.locator('#gapSize').fill(settings.gapSize.toString());
    await this.page.locator('#tongueGrooveDepth').fill(settings.tongueGrooveDepth.toString());
  }

  /**
   * Add a cabinet opening (door or drawer front)
   */
  async addCabinetOpening(opening: TestCabinetOpening) {
    // Fill in dimensions
    await this.page.locator('#width').fill(opening.width.toString());
    await this.page.locator('#height').fill(opening.height.toString());
    await this.page.locator('#quantity').fill(opening.quantity.toString());

    // Fill in overlays
    await this.page.locator('#overlay\\.top').fill(opening.overlay.top.toString());
    await this.page.locator('#overlay\\.bottom').fill(opening.overlay.bottom.toString());
    await this.page.locator('#overlay\\.left').fill(opening.overlay.left.toString());
    await this.page.locator('#overlay\\.right').fill(opening.overlay.right.toString());

    // Set door/drawer checkbox
    const isDoorCheckbox = this.page.locator('#isDoor');
    const isChecked = await isDoorCheckbox.isChecked();
    if (opening.isDoor && !isChecked) {
      await isDoorCheckbox.check();
    } else if (!opening.isDoor && isChecked) {
      await isDoorCheckbox.uncheck();
    }

    // Submit the form
    await this.page.getByRole('button', { name: 'Add' }).click();

    // Wait for cutlist to update by checking that table has rows
    await this.page.waitForSelector('tbody tr', { timeout: 5000 });
  }

  /**
   * Get all cutlist items from the table
   */
  async getCutlistItems(): Promise<Array<{
    name: string;
    piece: string;
    length: number;
    width: number;
    thickness: number;
    quantity: number;
  }>> {
    const rows = await this.page.locator('tbody tr').all();
    const items = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      items.push({
        name: cells[0],
        piece: cells[1],
        length: parseFloat(cells[2]),
        width: parseFloat(cells[3]),
        thickness: parseFloat(cells[4]),
        quantity: parseInt(cells[5]),
      });
    }

    return items;
  }

  /**
   * Verify that the cutlist matches the expected items
   */
  async verifyCutlist(expectedItems: ExpectedCutlistItem[]) {
    const actualItems = await this.getCutlistItems();

    // Check that we have the right number of items
    expect(actualItems.length).toBe(expectedItems.length);

    // For each expected item, find a matching actual item
    for (const expected of expectedItems) {
      const matchingItem = actualItems.find(
        (actual) =>
          actual.piece === expected.piece &&
          Math.abs(actual.length - expected.length) < 0.0001 &&
          Math.abs(actual.width - expected.width) < 0.0001 &&
          Math.abs(actual.thickness - expected.thickness) < 0.0001 &&
          actual.quantity === expected.quantity
      );

      expect(matchingItem,
        `Expected to find cutlist item: ${expected.piece} with ` +
        `length=${expected.length}, width=${expected.width}, ` +
        `thickness=${expected.thickness}, quantity=${expected.quantity}`
      ).toBeDefined();
    }
  }

  /**
   * Verify a specific cutlist item
   */
  async verifyCutlistItem(
    piece: string,
    expectedLength: number,
    expectedWidth: number,
    expectedThickness: number,
    expectedQuantity: number
  ) {
    const actualItems = await this.getCutlistItems();
    const item = actualItems.find((i) => i.piece === piece);

    expect(item, `Expected to find ${piece} in cutlist`).toBeDefined();

    if (item) {
      expect(item.length).toBeCloseTo(expectedLength, 3);
      expect(item.width).toBeCloseTo(expectedWidth, 3);
      expect(item.thickness).toBeCloseTo(expectedThickness, 3);
      expect(item.quantity).toBe(expectedQuantity);
    }
  }

  /**
   * Clear the form
   */
  async clearForm() {
    await this.page.getByRole('button', { name: 'Clear' }).click();
  }

  /**
   * Delete a cabinet opening by index
   */
  async deleteCabinetOpening(index: number) {
    const deleteButtons = await this.page.getByRole('button', { name: 'Delete' }).all();
    if (deleteButtons[index]) {
      await deleteButtons[index].click();
    }
  }

  /**
   * Get the number of cabinet openings currently added
   */
  async getCabinetOpeningsCount(): Promise<number> {
    const openingsList = await this.page.locator('ul li').all();
    return openingsList.length;
  }

  /**
   * Verify that the cutlist table is visible
   */
  async verifyCutlistTableVisible() {
    await expect(this.page.getByRole('heading', { name: 'Cutlist', exact: true })).toBeVisible();
    await expect(this.page.locator('table')).toBeVisible();
  }
}
