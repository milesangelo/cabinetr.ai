import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CabinetParams, CalculatedDimensions } from "./CabinetCalculator";
import { validateRatios } from "@/lib/utils";

interface PieceDimensions {
  name: string;
  width: number;
  length: number;
  quantity: number;
  notes: string;
}

interface PiecesViewProps {
  params: CabinetParams;
  dimensions: CalculatedDimensions;
}

export const PiecesView = ({ params, dimensions }: PiecesViewProps) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const calculatePieceDimensions = (): PieceDimensions[] => {
    const pieces: PieceDimensions[] = [];
    const panelsNeeded = params.quantity;

    // If drawers with custom panel heights, output per-panel pieces separately
    const customHeights =
      params.type === "drawer" &&
      dimensions.panelHeights &&
      dimensions.panelHeights.length === panelsNeeded
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
        panelHeight - params.railWidth * 2 + params.routerDepth * 2;
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
      // Even split or doors → aggregate quantities
      // Stiles (vertical) - 2 per panel
      const stileLength = dimensions.individualHeight;
      pieces.push({
        name: "Stile (Vertical)",
        width: params.stileWidth,
        length: stileLength,
        quantity: panelsNeeded * 2,
        notes: `Full height of panel`,
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
        quantity: panelsNeeded * 2,
        notes: `Width between stiles + ${params.routerDepth * 2}" for tongues`,
      });

      // Center Panel
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

    // Hinges (if doors and hinges are enabled)
    if (params.type === "door" && params.includeHinges) {
      const hingesPerDoor = dimensions.individualHeight > 36 ? 3 : 2;
      const totalHinges = hingesPerDoor * panelsNeeded;
      const hingeOverlay = params.leftOverlap;
      pieces.push({
        name: "Hinges",
        width: 0,
        length: 0,
        quantity: totalHinges,
        notes: `${hingesPerDoor} per door, ${hingeOverlay}" overlay (${
          hingeOverlay > 0.5 ? "Full" : hingeOverlay > 0.25 ? "Half" : "Inset"
        } overlay)`,
      });
    }

    return pieces;
  };

  const pieces = calculatePieceDimensions();

  const downloadCSV = () => {
    // Create CSV header
    const headers = [
      "Piece Type",
      "Width (inches)",
      "Length (inches)",
      "Quantity",
      "Notes",
    ];

    // Create CSV rows
    const rows = pieces.map((piece) => [
      piece.name,
      piece.name === "Hinges" ? "N/A" : piece.width.toFixed(3),
      piece.name === "Hinges" ? "N/A" : piece.length.toFixed(3),
      piece.quantity.toString(),
      piece.notes,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cutlist_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-foreground">Cut List</h2>
        <Button
          onClick={downloadCSV}
          size="sm"
          variant="outline"
          disabled={
            params.type === "drawer" &&
            params.drawerSplitMode === "custom" &&
            !validateRatios(params.drawerRatios || [])
          }
        >
          <Download className="mr-2 h-3 w-3" />
          CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">
                Piece
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground">
                Width
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground">
                Length
              </th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">
                Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece, index) => (
              <tr
                key={index}
                className="border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() =>
                  setSelectedPiece(
                    selectedPiece === piece.name ? null : piece.name
                  )
                }
              >
                <td className="py-2 px-2 font-medium text-foreground">
                  {piece.name}
                </td>
                <td className="py-2 px-2 text-right font-mono text-foreground">
                  {piece.name === "Hinges" ? "-" : `${piece.width.toFixed(4)}"`}
                </td>
                <td className="py-2 px-2 text-right font-mono text-foreground">
                  {piece.name === "Hinges"
                    ? "-"
                    : `${piece.length.toFixed(4)}"`}
                </td>
                <td className="py-2 px-2 text-center font-semibold text-primary">
                  {piece.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPiece && (
        <div className="mt-3 p-3 bg-accent/10 rounded-md border border-border">
          <p className="text-xs font-semibold text-foreground mb-1">
            {pieces.find((p) => p.name === selectedPiece)?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {pieces.find((p) => p.name === selectedPiece)?.notes}
          </p>
        </div>
      )}
    </Card>
  );
};
