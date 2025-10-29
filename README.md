# Cabinetr.ai

A professional cabinet door and drawer calculator for woodworkers. Calculate precise dimensions for cabinet doors and drawers with tongue & groove joinery, specifically designed for 1.5" beveled edge router bits.

## Features

- **Precise Calculations**: Calculate exact dimensions for cabinet doors and drawers with 1/16" precision
- **Project Management**: Organize multiple cabinet configurations within projects
- **3D Visualization**: Preview your doors and drawers with an interactive 3D exploded view
- **Cutlist Generation**: Export detailed cutlists as CSV for all your pieces
- **Tongue & Groove Support**: Automatic calculations for router depth and joint dimensions
- **Custom Drawer Ratios**: Support for both even and custom height ratios for stacked drawers
- **Import/Export**: Save and share projects as JSON files
- **Offline Support**: All data stored locally in your browser

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)

To check if you have Node.js installed:
```bash
node --version
npm --version
```

If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cabinetr.ai.git
cd cabinetr.ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, Vite, TypeScript, and UI components.

### 3. Run the Development Server

```bash
npm run dev
```

The application will start on **http://localhost:8080**

Open your browser and navigate to the URL shown in the terminal.

### 4. Build for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

### Development
- `npm run dev` - Start development server on http://localhost:8080
- `npm run build:dev` - Create a development build

### Production
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally

### Testing
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run Playwright tests in UI mode (interactive)
- `npm run test:e2e:headed` - Run tests in headed browser mode
- `npm run test:e2e:report` - Show detailed test report

### Code Quality
- `npm run lint` - Run ESLint to check code quality

## Running Tests

The project uses Playwright for end-to-end testing.

### First Time Setup

Install Playwright browsers (only needed once):

```bash
npx playwright install
```

### Running Tests

Run all tests:
```bash
npm run test:e2e
```

Run tests with interactive UI:
```bash
npm run test:e2e:ui
```

Run tests in headed mode (see the browser):
```bash
npm run test:e2e:headed
```

View test report:
```bash
npm run test:e2e:report
```

## Project Structure

```
cabinetr.ai/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── CabinetCalculator.tsx
│   │   ├── CabinetDetail.tsx
│   │   ├── CabinetList.tsx
│   │   ├── CabinetPreview.tsx  # 3D visualization
│   │   └── PiecesView.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useCabinets.ts
│   ├── lib/              # Utilities and types
│   │   ├── types.ts
│   │   ├── exportUtils.ts
│   │   ├── projectStorage.ts
│   │   └── utils.ts
│   ├── pages/            # Route pages
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Application entry point
├── tests/
│   ├── e2e/              # End-to-end tests
│   ├── fixtures/         # Test data
│   └── helpers/          # Test helpers
├── public/               # Static assets
└── package.json
```

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **3D Graphics**: React Three Fiber (@react-three/fiber)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Testing**: Playwright
- **State Management**: React hooks with localStorage persistence

## Usage

### Creating a New Project

1. Click the "New Project" button on the home page
2. Enter a project name
3. Configure your cabinet opening dimensions
4. Choose between doors (side by side) or drawers (stacked)
5. Adjust overlaps, gaps, and stile/rail widths
6. Add multiple configurations to the same project if needed

### Exporting Cutlists

- **Single Project**: Click the export icon on a project card
- **All Projects**: Click "Export All CSV" in the header
- Cutlists include all pieces with width, length, quantity, and notes
- Dimensions are precise to 4 decimal places (1/16" accuracy)

### Import/Export Projects

- **Export**: Save projects as JSON files for backup or sharing
- **Import**: Load previously saved projects
- All configurations and settings are preserved

## Browser Compatibility

Cabinetr.ai works best on modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Data Storage

All project data is stored locally in your browser's localStorage. Your data:
- Never leaves your device
- Persists between sessions
- Can be exported as JSON for backup

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, you can change it in `vite.config.js`:

```javascript
server: {
  port: 3000, // Change to your preferred port
}
```

### Build Errors

If you encounter build errors:

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear Vite cache:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Test Failures

If Playwright tests fail:

1. Ensure browsers are installed:
```bash
npx playwright install
```

2. Make sure the dev server is not already running on port 8080

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your License Here]

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
