import { Cabinet, PieceDimensions } from "./types";
import { CabinetParams, CalculatedDimensions } from "@/components/CabinetCalculator";

export const calculateDimensions = (params: CabinetParams): CalculatedDimensions => {
  const totalWidth =
    params.openingWidth + params.leftOverlap + params.rightOverlap;
  const totalHeight =
    params.openingHeight + params.topOverlap + params.bottomOverlap;

  let individualWidth: number;
  let individualHeight: number;
  let panelHeights: number[] | undefined;

  if (params.type === "door") {
    individualWidth =
      (totalWidth - params.gap * (params.quantity - 1)) / params.quantity;
    individualHeight = totalHeight;
  } else {
    individualWidth = totalWidth;
    individualHeight =
      (totalHeight - params.gap * (params.quantity - 1)) / params.quantity;

    if (
      params.drawerSplitMode === "custom" &&
      params.drawerRatios &&
      params.drawerRatios.length === params.quantity
    ) {
      const availableHeight = totalHeight - params.gap * (params.quantity - 1);
      panelHeights = params.drawerRatios.map((pct) => (pct / 100) * availableHeight);
    }
  }

  return {
    totalWidth,
    totalHeight,
    individualWidth,
    individualHeight,
    stileWidth: params.stileWidth,
    railWidth: params.railWidth,
    panelHeights,
  };
};

export const calculatePieceDimensions = (
  params: CabinetParams,
  dimensions: CalculatedDimensions
): PieceDimensions[] => {
  const pieces: PieceDimensions[] = [];
  const panelsNeeded = params.quantity;

  const customHeights = params.type === "drawer" && dimensions.panelHeights && dimensions.panelHeights.length === panelsNeeded
    ? dimensions.panelHeights
    : null;

  const addPanelPieces = (panelIndex: number, panelHeight: number) => {
    // Stiles (vertical) - 2 per panel
    pieces.push({
      name: "Stile (Vertical)",
      width: params.stileWidth,
      length: panelHeight,
      quantity: 2,
      notes: `Drawer ${panelIndex + 1} (top→bottom)`,
    });

    // Rails (horizontal) - 2 per panel
    const railLength =
      dimensions.individualWidth -
      params.stileWidth * 2 +
      params.routerDepth * 2;
    pieces.push({
      name: "Rail (Horizontal)",
      width: params.railWidth,
      length: railLength,
      quantity: 2,
      notes: `Drawer ${panelIndex + 1} (top→bottom)`,
    });

    // Center Panel
    const panelWidth =
      dimensions.individualWidth -
      params.stileWidth * 2 +
      params.routerDepth * 2;
    const panelInnerHeight =
      panelHeight -
      params.railWidth * 2 +
      params.routerDepth * 2;
    pieces.push({
      name: "Center Panel",
      width: panelWidth,
      length: panelInnerHeight,
      quantity: 1,
      notes: `Drawer ${panelIndex + 1} (top→bottom)`,
    });
  };

  if (customHeights) {
    customHeights.forEach((h, i) => addPanelPieces(i, h));
  } else {
    // Aggregate like current behavior
    const stileLength = dimensions.individualHeight;
    pieces.push({
      name: "Stile (Vertical)",
      width: params.stileWidth,
      length: stileLength,
      quantity: panelsNeeded * 2,
      notes: `Full height of panel`,
    });

    const railLength =
      dimensions.individualWidth -
      params.stileWidth * 2 +
      params.routerDepth * 2;
    pieces.push({
      name: "Rail (Horizontal)",
      width: params.railWidth,
      length: railLength,
      quantity: panelsNeeded * 2,
      notes: `Width between stiles + ${params.routerDepth * 2}" for tongues`,
    });

    const panelWidth =
      dimensions.individualWidth -
      params.stileWidth * 2 +
      params.routerDepth * 2;
    const panelHeight =
      dimensions.individualHeight -
      params.railWidth * 2 +
      params.routerDepth * 2;
    pieces.push({
      name: "Center Panel",
      width: panelWidth,
      length: panelHeight,
      quantity: panelsNeeded,
      notes: `Fits in grooves with ${params.routerDepth}" depth`,
    });
  }

  return pieces;
};

export const generateSingleCabinetCSV = (cabinet: Cabinet): string => {
  const dimensions = calculateDimensions(cabinet.params);
  const pieces = calculatePieceDimensions(cabinet.params, dimensions);

  const rows = pieces.map((piece) => [
    piece.name,
    piece.width.toFixed(3),
    piece.length.toFixed(3),
    piece.quantity.toString(),
    piece.notes,
  ]);

  return rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
};

export const downloadAllCabinetsCSV = (cabinets: Cabinet[]) => {
  if (cabinets.length === 0) {
    return;
  }

  const headers = [
    "Piece Type",
    "Width (inches)",
    "Length (inches)",
    "Quantity",
    "Notes",
  ];

  let csvContent = "";

  cabinets.forEach((cabinet, index) => {
    // Check if this is a project with configurations or a single cabinet
    const hasConfigurations = cabinet.configurations && cabinet.configurations.length > 0;

    if (hasConfigurations) {
      // Export each configuration in the project
      cabinet.configurations!.forEach((config, configIndex) => {
        if (index > 0 || configIndex > 0) {
          csvContent += "\n"; // Add blank line between configurations
        }
        csvContent += `"=== ${cabinet.name} - ${config.name} ==="\n`;
        csvContent += `"Type: ${config.params.type === "door" ? "Doors (Side by Side)" : "Drawers (Stacked)"}"\n`;
        csvContent += `"Opening: ${config.params.openingWidth}" x ${config.params.openingHeight}""\n`;
        csvContent += `"Quantity: ${config.params.quantity}"\n`;
        csvContent += "\n";

        // Add headers
        csvContent += headers.join(",") + "\n";

        // Add pieces
        const tempCabinet: Cabinet = {
          id: config.id,
          name: config.name,
          params: config.params,
          createdAt: cabinet.createdAt,
          updatedAt: cabinet.updatedAt,
        };
        csvContent += generateSingleCabinetCSV(tempCabinet) + "\n";
      });
    } else {
      // Legacy export for cabinets without configurations
      if (index > 0) {
        csvContent += "\n"; // Add blank line between cabinets
      }
      csvContent += `"=== ${cabinet.name} ==="\n`;
      csvContent += `"Type: ${cabinet.params.type === "door" ? "Doors (Side by Side)" : "Drawers (Stacked)"}"\n`;
      csvContent += `"Opening: ${cabinet.params.openingWidth}" x ${cabinet.params.openingHeight}""\n`;
      csvContent += `"Quantity: ${cabinet.params.quantity}"\n`;
      csvContent += "\n";

      // Add headers
      csvContent += headers.join(",") + "\n";

      // Add pieces
      csvContent += generateSingleCabinetCSV(cabinet) + "\n";
    }
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `all-cutlists_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
