# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cabinetr.ai is a cabinet door and drawer calculator application built with React, TypeScript, Vite, and shadcn/ui. It helps woodworkers calculate precise dimensions for cabinet doors and drawers with tongue & groove joinery, specifically for 1.5" beveled edge router bits.

## Development Commands

### Running the Application
- `npm run dev` - Start development server on port 8080 (http://localhost:8080)
- `npm run preview` - Preview production build

### Building
- `npm run build` - Production build
- `npm run build:dev` - Development mode build

### Testing
- `npm run test:e2e` - Run all Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI mode
- `npm run test:e2e:headed` - Run Playwright tests in headed browser mode
- `npm run test:e2e:report` - Show Playwright test report
- E2E tests are located in `tests/e2e/` and run against http://localhost:8080
- Test helpers are in `tests/helpers/cabinet-helpers.ts`

### Code Quality
- `npm run lint` - Run ESLint
- Unused variables and parameters are intentionally allowed in TypeScript config
- ESLint config disables unused vars warnings

## Architecture Overview

### Data Model

The application uses a nested project structure:

1. **Cabinet (Project)**: Top-level entity that can contain multiple configurations
   - Has `id`, `name`, `params` (for backwards compatibility), and `configurations[]`
   - Stored in localStorage under key `"cabinetr-cabinets"`

2. **CabinetConfiguration**: Individual door/drawer configuration within a project
   - Has `id`, `name`, and `params`
   - Multiple configurations can be grouped under one Cabinet/Project

3. **CabinetParams**: The calculation parameters for doors or drawers
   - Opening dimensions, overlaps, gaps, quantities
   - Type (door/drawer), stile/rail widths, router depth
   - Drawer-specific: split mode (even/custom) and ratios

### State Management

- **useCabinets hook** (`src/hooks/useCabinets.ts`): Primary state management
  - Manages all cabinets with localStorage persistence
  - Provides CRUD operations: add, update, delete, get
  - Handles configurations: add/remove configurations within cabinets
  - Supports import/export and cloning
  - All updates automatically persist to localStorage

### Routing Structure

- `/` - Main cabinet list page (Index.tsx → CabinetList.tsx)
- `/cabinet/new` - Create new project
- `/cabinet/:id` - Edit existing project/cabinet (CabinetDetail.tsx)

The CabinetDetail page is the main working area where users:
- Create/edit project configurations
- View 3D previews of doors/drawers
- See cutlist/pieces view
- Export to CSV

### Calculation Logic

Core calculation functions are split between:
- `src/components/CabinetCalculator.tsx` - UI component with calculation logic
- `src/lib/exportUtils.ts` - Dimension and piece calculations for export

**Key calculations:**
1. Total dimensions = opening dimensions + overlaps
2. For doors: divide width by quantity, subtract gaps
3. For drawers: divide height by quantity, subtract gaps
4. Drawers support custom height ratios (top→bottom)
5. Piece calculations account for tongue/groove depth (`routerDepth`)
   - Rails extend by `routerDepth * 2` for tongues
   - Panels fit in grooves with `routerDepth` depth

### 3D Visualization

- Uses `@react-three/fiber` and `@react-three/drei` for 3D rendering
- CabinetPreview component handles the 3D visualization
- Supports "explosion view" with adjustable separation distance

### Import/Export System

Located in `src/lib/projectStorage.ts` and `src/lib/exportUtils.ts`:

- **JSON Export/Import**: Full project data with configurations
  - Single project or all projects
  - Includes version and export date metadata
  - Import regenerates IDs to avoid conflicts

- **CSV Export**: Cutlist format with dimensions
  - Exports all projects and their configurations
  - Format: Project header → Configuration → Pieces table
  - Precision: 4 decimal places for accurate 1/16" measurements (.toFixed(4))

### TypeScript Configuration

- Path alias: `@/` maps to `./src/`
- Relaxed strictness: `noImplicitAny`, `strictNullChecks`, `noUnusedLocals` disabled
- Project uses TypeScript project references (tsconfig.app.json, tsconfig.node.json)

### UI Components

Built with shadcn/ui (Radix UI primitives):
- Components in `src/components/ui/`
- Using Tailwind CSS with tailwind-merge and class-variance-authority
- Toast notifications via Sonner
- Form handling with react-hook-form and Zod validation

## Important Implementation Details

### Decimal Precision
Always use `.toFixed(4)` for dimension displays and calculations to ensure accurate 1/16" measurements (e.g., 8.1875 instead of 8.188).

### Router Depth
The default router depth is 0.375" (3/8") for tongue and groove joints. This value is added to rail lengths and panel dimensions to account for the tongues fitting into grooves.

### Backwards Compatibility
Cabinets can exist without configurations (legacy format) where params are stored directly on the Cabinet object. New implementations use the configurations array.

### Storage Key
All cabinet data persists to localStorage with key `"cabinetr-cabinets"`. The useCabinets hook handles automatic persistence on state changes.
