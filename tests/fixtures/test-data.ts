/**
 * Test fixtures for cabinet cutlist e2e tests.
 * Modify these values to test different scenarios.
 */

export interface TestGlobalSettings {
  railWidth: number;
  stileWidth: number;
  thickness: number;
  gapSize: number;
  tongueGrooveDepth: number;
}

export interface TestOverlay {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TestCabinetOpening {
  width: number;
  height: number;
  overlay: TestOverlay;
  quantity: number;
  isDoor: boolean;
  name?: string; // Optional: will auto-generate if not provided
}

export interface ExpectedCutlistItem {
  piece: string;
  length: number;
  width: number;
  thickness: number;
  quantity: number;
}

export interface TestScenario {
  name: string;
  globalSettings: TestGlobalSettings;
  cabinetOpenings: TestCabinetOpening[];
  expectedCutlist: ExpectedCutlistItem[];
}

/**
 * Test Scenario 1: Simple single door
 */
export const simpleDoorScenario: TestScenario = {
  name: 'Simple Single Door',
  globalSettings: {
    railWidth: 2.5,
    stileWidth: 2.5,
    thickness: 0.75,
    gapSize: 0.125,
    tongueGrooveDepth: 0.375,
  },
  cabinetOpenings: [
    {
      width: 12,
      height: 24,
      overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      quantity: 1,
      isDoor: true,
    },
  ],
  expectedCutlist: [
    { piece: 'Rail', length: 8.75, width: 2.5, thickness: 0.75, quantity: 2 },
    { piece: 'Stile', length: 25, width: 2.5, thickness: 0.75, quantity: 2 },
    { piece: 'Panel', length: 20.75, width: 8.75, thickness: 0.75, quantity: 1 },
  ],
};

/**
 * Test Scenario 2: Multiple doors (quantity > 1)
 */
export const multipleDoorScenario: TestScenario = {
  name: 'Multiple Doors',
  globalSettings: {
    railWidth: 2.5,
    stileWidth: 2.5,
    thickness: 0.75,
    gapSize: 0.125,
    tongueGrooveDepth: 0.375,
  },
  cabinetOpenings: [
    {
      width: 24,
      height: 30,
      overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      quantity: 2,
      isDoor: true,
    },
  ],
  expectedCutlist: [
    { piece: 'Rail', length: 8.1875, width: 2.5, thickness: 0.75, quantity: 4 },
    { piece: 'Stile', length: 31, width: 2.5, thickness: 0.75, quantity: 4 },
    { piece: 'Panel', length: 26.75, width: 8.1875, thickness: 0.75, quantity: 2 },
  ],
};

/**
 * Test Scenario 3: Drawer front
 */
export const drawerFrontScenario: TestScenario = {
  name: 'Drawer Front',
  globalSettings: {
    railWidth: 2.5,
    stileWidth: 2.5,
    thickness: 0.75,
    gapSize: 0.125,
    tongueGrooveDepth: 0.375,
  },
  cabinetOpenings: [
    {
      width: 18,
      height: 6,
      overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      quantity: 1,
      isDoor: false,
    },
  ],
  expectedCutlist: [
    { piece: 'Rail', length: 14.75, width: 2.5, thickness: 0.75, quantity: 2 },
    { piece: 'Stile', length: 7, width: 2.5, thickness: 0.75, quantity: 2 },
    { piece: 'Panel', length: 2.75, width: 14.75, thickness: 0.75, quantity: 1 },
  ],
};

/**
 * Test Scenario 4: Custom dimensions for easy modification
 * MODIFY THESE VALUES TO TEST YOUR OWN SCENARIOS
 */
export const customScenario: TestScenario = {
  name: 'Custom Test Scenario',
  globalSettings: {
    railWidth: 1,
    stileWidth: 1,
    thickness: 0.75,
    gapSize: 0.125,
    tongueGrooveDepth: 0.375,
  },
  cabinetOpenings: [
    {
      width: 15,
      height: 20,
      overlay: { top: 0.75, bottom: 0.25, left: 0.625, right: 0.375 },
      quantity: 1,
      isDoor: true,
    },
  ],
  expectedCutlist: [
    { piece: 'Rail', length: 14.75, width: 1, thickness: 0.75, quantity: 2 },
    { piece: 'Stile', length: 21, width: 1, thickness: 0.75, quantity: 2 },
    { piece: 'Panel', length: 19.75, width: 14.75, thickness: 0.75, quantity: 1 },
  ],
};

/**
 * All test scenarios
 */
export const allScenarios = [
  simpleDoorScenario,
  multipleDoorScenario,
  drawerFrontScenario,
  customScenario,
];
