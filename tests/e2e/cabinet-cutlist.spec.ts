import { test, expect } from '@playwright/test';
import { CabinetPageHelper } from '../helpers/cabinet-helpers';
import {
  simpleDoorScenario,
  multipleDoorScenario,
  drawerFrontScenario,
  customScenario,
} from '../fixtures/test-data';

test.describe('Cabinet Cutlist Generator', () => {
  let helper: CabinetPageHelper;

  test.beforeEach(async ({ page }) => {
    helper = new CabinetPageHelper(page);
    await helper.goto();
  });

  test('should display the main page with all form elements', async () => {
    // Verify the page title
    await expect(helper['page'].getByRole('heading', { name: 'Cabinet Cutlist Generator' })).toBeVisible();

    // Verify global settings section
    await expect(helper['page'].getByRole('heading', { name: 'Global Settings' })).toBeVisible();
    await expect(helper['page'].locator('#railWidth')).toBeVisible();
    await expect(helper['page'].locator('#stileWidth')).toBeVisible();
    await expect(helper['page'].locator('#thickness')).toBeVisible();
    await expect(helper['page'].locator('#gapSize')).toBeVisible();
    await expect(helper['page'].locator('#tongueGrooveDepth')).toBeVisible();

    // Verify cabinet opening form section
    await expect(helper['page'].getByRole('heading', { name: 'Add Cabinet Opening' })).toBeVisible();
    await expect(helper['page'].locator('#width')).toBeVisible();
    await expect(helper['page'].locator('#height')).toBeVisible();
    await expect(helper['page'].getByRole('button', { name: 'Add' })).toBeVisible();

    // Verify cutlist section
    await helper.verifyCutlistTableVisible();
  });

  test('should calculate cutlist for a simple door', async () => {
    const scenario = simpleDoorScenario;

    // Fill in global settings
    await helper.fillGlobalSettings(scenario.globalSettings);

    // Add cabinet opening
    await helper.addCabinetOpening(scenario.cabinetOpenings[0]);

    // Verify the cutlist
    await helper.verifyCutlist(scenario.expectedCutlist);

    // Verify specific items
    await helper.verifyCutlistItem('Rail', 8.75, 2.5, 0.75, 2);
    await helper.verifyCutlistItem('Stile', 25, 2.5, 0.75, 2);
    await helper.verifyCutlistItem('Panel', 20.75, 8.75, 0.75, 1);
  });

  test('should calculate cutlist for multiple doors', async () => {
    const scenario = multipleDoorScenario;

    // Fill in global settings
    await helper.fillGlobalSettings(scenario.globalSettings);

    // Add cabinet opening
    await helper.addCabinetOpening(scenario.cabinetOpenings[0]);

    // Verify the cutlist
    await helper.verifyCutlist(scenario.expectedCutlist);

    // Verify specific items
    await helper.verifyCutlistItem('Rail', 8.1875, 2.5, 0.75, 4);
    await helper.verifyCutlistItem('Stile', 31, 2.5, 0.75, 4);
    await helper.verifyCutlistItem('Panel', 26.75, 8.1875, 0.75, 2);
  });

  test('should calculate cutlist for a drawer front', async () => {
    const scenario = drawerFrontScenario;

    // Fill in global settings
    await helper.fillGlobalSettings(scenario.globalSettings);

    // Add cabinet opening (drawer front)
    await helper.addCabinetOpening(scenario.cabinetOpenings[0]);

    // Verify the cutlist
    await helper.verifyCutlist(scenario.expectedCutlist);

    // Verify specific items
    await helper.verifyCutlistItem('Rail', 14.75, 2.5, 0.75, 2);
    await helper.verifyCutlistItem('Stile', 7, 2.5, 0.75, 2);
    await helper.verifyCutlistItem('Panel', 2.75, 14.75, 0.75, 1);
  });

  test('should calculate cutlist for custom scenario', async () => {
    const scenario = customScenario;

    // Fill in global settings
    await helper.fillGlobalSettings(scenario.globalSettings);

    // Add cabinet opening
    await helper.addCabinetOpening(scenario.cabinetOpenings[0]);

    // Verify the cutlist
    await helper.verifyCutlist(scenario.expectedCutlist);

    // Verify specific items
    await helper.verifyCutlistItem('Rail', 14.75, 1, 0.75, 2);
    await helper.verifyCutlistItem('Stile', 21, 1, 0.75, 2);
    await helper.verifyCutlistItem('Panel', 19.75, 14.75, 0.75, 1);
  });

  test('should handle adding multiple different openings', async () => {
    // Use default global settings
    await helper.fillGlobalSettings(simpleDoorScenario.globalSettings);

    // Add a door
    await helper.addCabinetOpening(simpleDoorScenario.cabinetOpenings[0]);

    // Add a drawer
    await helper.addCabinetOpening(drawerFrontScenario.cabinetOpenings[0]);

    // Verify we have 2 openings
    const openingsCount = await helper.getCabinetOpeningsCount();
    expect(openingsCount).toBe(2);

    // Verify the cutlist has items from both openings
    const cutlistItems = await helper.getCutlistItems();
    expect(cutlistItems.length).toBeGreaterThan(3); // Should have more than one opening's worth

    // Check that we have items for both DOOR1 and DRWR1
    const doorItems = cutlistItems.filter((item) => item.name.includes('DOOR'));
    const drawerItems = cutlistItems.filter((item) => item.name.includes('DRWR'));

    expect(doorItems.length).toBeGreaterThan(0);
    expect(drawerItems.length).toBeGreaterThan(0);
  });

  test('should clear the form when Clear button is clicked', async () => {
    // Fill in some values
    await helper['page'].locator('#width').fill('15');
    await helper['page'].locator('#height').fill('20');
    await helper['page'].locator('#overlay\\.top').fill('0.5');

    // Click clear
    await helper.clearForm();

    // Verify fields are reset to 0
    await expect(helper['page'].locator('#width')).toHaveValue('0');
    await expect(helper['page'].locator('#height')).toHaveValue('0');
    await expect(helper['page'].locator('#overlay\\.top')).toHaveValue('0');
  });

  test('should delete a cabinet opening', async () => {
    await helper.fillGlobalSettings(simpleDoorScenario.globalSettings);
    await helper.addCabinetOpening(simpleDoorScenario.cabinetOpenings[0]);

    // Verify opening was added
    let openingsCount = await helper.getCabinetOpeningsCount();
    expect(openingsCount).toBe(1);

    // Delete the opening
    await helper.deleteCabinetOpening(0);

    // Verify opening was deleted
    openingsCount = await helper.getCabinetOpeningsCount();
    expect(openingsCount).toBe(0);

    // Verify cutlist is empty
    const cutlistItems = await helper.getCutlistItems();
    expect(cutlistItems.length).toBe(0);
  });

  test('should update cutlist when global settings change', async () => {
    const scenario = simpleDoorScenario;

    // Add opening with initial settings
    await helper.fillGlobalSettings(scenario.globalSettings);
    await helper.addCabinetOpening(scenario.cabinetOpenings[0]);

    // Get initial cutlist
    const initialCutlist = await helper.getCutlistItems();

    // Change global settings (increase rail width)
    await helper['page'].locator('#railWidth').fill('3');

    // Wait a moment for recalculation
    await helper['page'].waitForTimeout(100);

    // Get updated cutlist
    const updatedCutlist = await helper.getCutlistItems();

    // Verify that rail width changed in cutlist
    const initialRail = initialCutlist.find((item) => item.piece === 'Rail');
    const updatedRail = updatedCutlist.find((item) => item.piece === 'Rail');

    expect(initialRail?.width).toBe(2.5);
    expect(updatedRail?.width).toBe(3);
  });

  test('should handle asymmetric overlays correctly', async () => {
    const settings = {
      railWidth: 2.5,
      stileWidth: 2.5,
      thickness: 0.75,
      gapSize: 0.125,
      tongueGrooveDepth: 0.375,
    };

    const opening = {
      width: 15,
      height: 20,
      overlay: { top: 0.75, bottom: 0.25, left: 0.625, right: 0.375 },
      quantity: 1,
      isDoor: true,
    };

    await helper.fillGlobalSettings(settings);
    await helper.addCabinetOpening(opening);

    // Expected calculations:
    // Total height = 20 + 0.75 + 0.25 = 21"
    // Total width = 15 + 0.625 + 0.375 = 16"
    // Rail width = 16 - (2 * 2.5) + (2 * 0.375) = 11.75"
    await helper.verifyCutlistItem('Stile', 21, 2.5, 0.75, 2);
    await helper.verifyCutlistItem('Rail', 11.75, 2.5, 0.75, 2);
  });

  test('should allow custom names for cabinet openings', async () => {
    await helper.fillGlobalSettings(simpleDoorScenario.globalSettings);

    // Add a door with custom name
    const customNamedDoor = {
      ...simpleDoorScenario.cabinetOpenings[0],
      name: 'KITCHEN_UPPER',
    };
    await helper.addCabinetOpening(customNamedDoor);

    // Verify the cutlist has items with the custom name
    const cutlistItems = await helper.getCutlistItems();
    const customNamedItems = cutlistItems.filter((item) => item.name.includes('KITCHEN_UPPER'));

    expect(customNamedItems.length).toBeGreaterThan(0);
    expect(customNamedItems.some((item) => item.name === 'KITCHEN_UPPER_rails')).toBe(true);
    expect(customNamedItems.some((item) => item.name === 'KITCHEN_UPPER_stiles')).toBe(true);
    expect(customNamedItems.some((item) => item.name === 'KITCHEN_UPPER_panel')).toBe(true);
  });

  test('should auto-generate names when name field is empty', async () => {
    await helper.fillGlobalSettings(simpleDoorScenario.globalSettings);

    // Add a door without custom name (should auto-generate DOOR1)
    await helper.addCabinetOpening(simpleDoorScenario.cabinetOpenings[0]);

    // Add a drawer without custom name (should auto-generate DRWR1)
    await helper.addCabinetOpening(drawerFrontScenario.cabinetOpenings[0]);

    // Verify the cutlist has auto-generated names
    const cutlistItems = await helper.getCutlistItems();

    const doorItems = cutlistItems.filter((item) => item.name.includes('DOOR1'));
    const drawerItems = cutlistItems.filter((item) => item.name.includes('DRWR1'));

    expect(doorItems.length).toBeGreaterThan(0);
    expect(drawerItems.length).toBeGreaterThan(0);
  });
});
