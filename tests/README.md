# E2E Tests for Cabinet Cutlist Generator

This directory contains end-to-end tests for the Cabinet Cutlist Generator application using Playwright.

## Directory Structure

```
tests/
├── e2e/                    # E2E test files
│   └── cabinet-cutlist.spec.ts
├── fixtures/               # Test data and scenarios
│   └── test-data.ts
├── helpers/                # Helper functions for tests
│   └── cabinet-helpers.ts
└── README.md              # This file
```

## Running Tests

### Run all e2e tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for debugging)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode (step through)
```bash
npm run test:e2e:debug
```

## Modifying Test Dimensions

To easily change the dimensions used in tests, edit the file `tests/fixtures/test-data.ts`.

### Example: Modify the custom scenario

Open `tests/fixtures/test-data.ts` and find the `customScenario` object:

```typescript
export const customScenario: TestScenario = {
  name: 'Custom Test Scenario',
  globalSettings: {
    railWidth: 1,              // Change this
    stileWidth: 1,             // Change this
    thickness: 0.75,           // Change this
    gapSize: 0.125,            // Change this
    tongueGrooveDepth: 0.375,  // Change this
  },
  cabinetOpenings: [
    {
      width: 15,               // Change this
      height: 20,              // Change this
      overlay: {
        top: 0.75,             // Change this
        bottom: 0.25,          // Change this
        left: 0.625,           // Change this
        right: 0.375           // Change this
      },
      quantity: 1,             // Change this
      isDoor: true,            // Change this to false for drawer
    },
  ],
  expectedCutlist: [
    // Update these based on your calculations
    { piece: 'Rail', length: 15.75, width: 1, thickness: 0.75, quantity: 2 },
    { piece: 'Stile', length: 21, width: 1, thickness: 0.75, quantity: 2 },
    { piece: 'Panel', length: 19.75, width: 15.75, thickness: 0.75, quantity: 1 },
  ],
};
```

### Adding New Test Scenarios

1. Create a new scenario in `test-data.ts`:

```typescript
export const myNewScenario: TestScenario = {
  name: 'My New Test',
  globalSettings: {
    // Your settings here
  },
  cabinetOpenings: [
    // Your cabinet openings here
  ],
  expectedCutlist: [
    // Your expected cutlist here
  ],
};
```

2. Add a test case in `tests/e2e/cabinet-cutlist.spec.ts`:

```typescript
test('should calculate cutlist for my new scenario', async () => {
  const scenario = myNewScenario;

  await helper.fillGlobalSettings(scenario.globalSettings);
  await helper.addCabinetOpening(scenario.cabinetOpenings[0]);
  await helper.verifyCutlist(scenario.expectedCutlist);
});
```

## Helper Functions

The `CabinetPageHelper` class provides convenient methods for interacting with the application:

- `goto()` - Navigate to the application
- `fillGlobalSettings(settings)` - Fill in global settings
- `addCabinetOpening(opening)` - Add a cabinet opening
- `getCutlistItems()` - Get all cutlist items from the table
- `verifyCutlist(expectedItems)` - Verify the entire cutlist
- `verifyCutlistItem(piece, length, width, thickness, quantity)` - Verify a specific item
- `clearForm()` - Clear the form
- `deleteCabinetOpening(index)` - Delete a cabinet opening
- `getCabinetOpeningsCount()` - Get the count of cabinet openings

## Test Coverage

The test suite covers:

- ✅ Simple single door calculations
- ✅ Multiple doors (quantity > 1)
- ✅ Drawer front calculations
- ✅ Custom dimensions
- ✅ Multiple different openings
- ✅ Form clearing
- ✅ Deleting openings
- ✅ Dynamic updates when global settings change
- ✅ Asymmetric overlays

## Calculating Expected Values

To calculate expected cutlist values for your test scenarios:

### For Doors:
- **Stile Length** = height + overlay.top + overlay.bottom (rounded up to 1/16")
- **Rail Length** = (width + overlay.left + overlay.right - (quantity - 1) × gapSize) / quantity - (2 × stileWidth) + (2 × tongueGrooveDepth) (rounded up to 1/16")
- **Panel Length** = stileLength - (2 × stileWidth) + (2 × tongueGrooveDepth) (rounded up to 1/16")
- **Panel Width** = railLength

### For Drawer Fronts:
- **Stile Length** = (height + overlay.top + overlay.bottom - (quantity - 1) × gapSize) / quantity (rounded up to 1/16")
- **Rail Length** = width + overlay.left + overlay.right - (2 × stileWidth) + (2 × tongueGrooveDepth) (rounded up to 1/16")
- **Panel Length** = stileLength - (2 × stileWidth) + (2 × tongueGrooveDepth) (rounded up to 1/16")
- **Panel Width** = railLength

## Troubleshooting

### Tests fail with "Page not found"
Make sure your dev server is running. The tests will automatically start the dev server, but if port 5173 is in use, you may need to adjust the `playwright.config.ts`.

### Expected values don't match
Remember that all dimensions are rounded up to the nearest 1/16" (0.0625"). Use the `roundUpTo16th` helper function from calculations.ts to calculate expected values.

### Tests are flaky
Try running with `--headed` or `--debug` mode to see what's happening. The tests include appropriate waits, but you may need to add additional assertions if the UI is slow to update.
