# Cabinet Calculator E2E Tests

This directory contains comprehensive Playwright end-to-end tests for the Cabinet Door Calculator application.

## Test Structure

```
tests/
├── e2e/                          # E2E test files
│   ├── basic-calculations.spec.ts    # Core calculation tests
│   ├── type-switching.spec.ts        # Door/drawer switching tests
│   ├── csv-download.spec.ts          # CSV download functionality tests
│   ├── pieces-view.spec.ts           # Pieces view interaction tests
│   └── input-validation.spec.ts      # Input validation and edge cases
├── helpers/                      # Test helper utilities
│   └── cabinet-helpers.ts            # Helper class with common test operations
├── fixtures/                     # Test data fixtures
│   └── test-data.ts                  # Predefined test configurations
└── README.md                     # This file
```

## Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### 1. Basic Calculations (`basic-calculations.spec.ts`)
- ✅ Application loads with default values
- ✅ Correct dimension calculations for various configurations
- ✅ Dynamic updates when inputs change
- ✅ Decimal precision (1/16 inch accuracy)
- ✅ Custom overlap configurations
- ✅ Stile and rail dimension display

### 2. Type Switching (`type-switching.spec.ts`)
- ✅ Door to drawer switching and recalculation
- ✅ Drawer to door switching and recalculation
- ✅ Quantity changes for doors (side by side)
- ✅ Quantity changes for drawers (stacked)
- ✅ Multiple type toggle cycles
- ✅ Gap calculation with different quantities
- ✅ Stile/rail dimension persistence

### 3. CSV Download (`csv-download.spec.ts`)
- ✅ CSV file download functionality
- ✅ Correct CSV headers
- ✅ Accurate data for two doors configuration
- ✅ Accurate data for three drawers configuration
- ✅ Accurate data for single door configuration
- ✅ Notes field inclusion
- ✅ Proper CSV formatting with quotes
- ✅ Filename with current date
- ✅ CSV dimensions match UI dimensions
- ✅ Decimal precision in CSV output
- ✅ CSV updates with configuration changes

### 4. Pieces View (`pieces-view.spec.ts`)
- ✅ Display all three piece types (Stile, Rail, Center Panel)
- ✅ Quantity display for each piece
- ✅ Expand/collapse piece details
- ✅ Correct dimensions for stile pieces
- ✅ Correct dimensions for rail pieces
- ✅ Correct dimensions for center panel pieces
- ✅ Quantity updates with configuration changes
- ✅ Notes display for each piece type
- ✅ Router depth in notes
- ✅ Visual highlighting of selected pieces
- ✅ Help text visibility
- ✅ Download CSV button presence
- ✅ Dimension updates on input changes
- ✅ Correct piece order

### 5. Input Validation (`input-validation.spec.ts`)
- ✅ 1/16 inch precision (0.0625)
- ✅ 1/8 inch precision (0.125)
- ✅ 1/32 inch precision (0.03125)
- ✅ Very small dimensions
- ✅ Very large dimensions
- ✅ Maximum quantity (6 doors/drawers)
- ✅ Zero gap handling
- ✅ Large gap handling
- ✅ Zero overlaps
- ✅ Large overlaps
- ✅ Different stile and rail widths
- ✅ Router depth changes
- ✅ Asymmetric overlaps
- ✅ Rapid input changes
- ✅ Calculation accuracy across type switches
- ✅ Narrow stile/rail configurations
- ✅ Wide stile/rail configurations
- ✅ Multiple decimal operations precision

## Test Helpers

The `CabinetHelpers` class provides convenient methods for common test operations:

- `goto()` - Navigate to the application
- `fillCabinetDimensions()` - Fill width and height inputs
- `fillOverlaps()` - Fill overlap inputs
- `fillConfiguration()` - Fill gap, type, and quantity
- `fillStileAndRail()` - Fill stile, rail, and router depth
- `configureCabinet()` - Fill all inputs at once
- `getCalculatedDimension()` - Get calculated dimension value
- `verifyCalculatedDimensions()` - Verify expected dimensions
- `downloadCSV()` - Download CSV and return file path
- `expandPiece()` - Expand piece details
- `getPieceDetails()` - Get piece dimensions and quantity
- `waitForCalculation()` - Wait for calculations to update

## Test Fixtures

Pre-configured test data in `fixtures/test-data.ts`:

- `defaultCabinetConfig` - Default configuration
- `twoDoorConfig` - Two doors side by side
- `threeDrawerConfig` - Three stacked drawers
- `singleDoorConfig` - Single door
- `customOverlapConfig` - Custom overlap settings
- `twoDoorExpectedDimensions` - Expected dimensions for two door config
- `twoDoorExpectedPieces` - Expected pieces for two door config

## Browser Coverage

Tests run on three browsers:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

## Continuous Integration

The tests are configured to:
- Run in headless mode on CI
- Retry failed tests twice
- Run tests sequentially (not in parallel)
- Generate HTML reports
- Capture traces on first retry
- Take screenshots on failure

## Notes

- Tests use realistic cabinet dimensions and configurations
- All calculations are verified to 3-4 decimal places
- CSV download tests verify both file content and formatting
- Pieces view tests verify both UI interactions and data accuracy
- Edge cases include very small/large dimensions and various precision levels
