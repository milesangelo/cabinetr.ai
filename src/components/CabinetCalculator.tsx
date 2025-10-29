import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CabinetPreview } from "./CabinetPreview";
import { PiecesView } from "./PiecesView";
import { Ruler } from "lucide-react";
import { parseRatio, normalizeRatios, validateRatios } from "@/lib/utils";

export interface CabinetParams {
  openingWidth: number;
  openingHeight: number;
  topOverlap: number;
  bottomOverlap: number;
  leftOverlap: number;
  rightOverlap: number;
  gap: number;
  type: "door" | "drawer";
  quantity: number;
  stileWidth: number;
  railWidth: number;
  routerDepth: number;
  includeHinges?: boolean;
  drawerSplitMode?: "even" | "custom";
  drawerRatios?: number[]; // percentages summing to 100, top→bottom
}

export interface CalculatedDimensions {
  totalWidth: number;
  totalHeight: number;
  individualWidth: number;
  individualHeight: number;
  stileWidth: number;
  railWidth: number;
  panelHeights?: number[]; // when drawers use custom ratios
}

const ROUTER_BIT_SIZE = 1.5; // 15" = 1.5" beveled edge

export const CabinetCalculator = () => {
  const [drawerRatioInputs, setDrawerRatioInputs] = useState<string[]>([]);
  const [params, setParams] = useState<CabinetParams>({
    openingWidth: 24,
    openingHeight: 30,
    topOverlap: 0.5,
    bottomOverlap: 0.5,
    leftOverlap: 0.5,
    rightOverlap: 0.5,
    gap: 0.125,
    type: "door",
    quantity: 2,
    stileWidth: 1,
    railWidth: 1,
    routerDepth: 0.375,
    drawerSplitMode: "even",
    drawerRatios: [],
  });

  const calculateDimensions = (): CalculatedDimensions => {
    const totalWidth =
      params.openingWidth + params.leftOverlap + params.rightOverlap;
    const totalHeight =
      params.openingHeight + params.topOverlap + params.bottomOverlap;

    let individualWidth: number;
    let individualHeight: number;
    let panelHeights: number[] | undefined;

    if (params.type === "door") {
      // Side by side - divide width, subtract gap
      individualWidth =
        (totalWidth - params.gap * (params.quantity - 1)) / params.quantity;
      individualHeight = totalHeight;
    } else {
      // Stacked drawers - divide height, subtract gap
      individualWidth = totalWidth;
      individualHeight =
        (totalHeight - params.gap * (params.quantity - 1)) / params.quantity;

      // Custom ratios for drawers
      if (
        params.drawerSplitMode === "custom" &&
        params.drawerRatios &&
        params.drawerRatios.length === params.quantity
      ) {
        if (validateRatios(params.drawerRatios)) {
          const availableHeight =
            totalHeight - params.gap * (params.quantity - 1);
          panelHeights = params.drawerRatios.map(
            (pct) => (pct / 100) * availableHeight
          );
        }
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

  const dimensions = calculateDimensions();

  const updateParam = <K extends keyof CabinetParams>(
    key: K,
    value: CabinetParams[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const syncRatiosWithQuantity = (quantity: number) => {
    // Create even split as starting point
    const even = Array.from({ length: quantity }, () => 100 / (quantity || 1));
    setDrawerRatioInputs(even.map((v) => v.toFixed(2)));
    updateParam("drawerRatios", even);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Ruler className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Cabinet Door Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                15" Beveled Edge Tongue & Groove Router
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Cabinet Opening Dimensions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (inches)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.125"
                    value={params.openingWidth}
                    onChange={(e) =>
                      updateParam("openingWidth", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.125"
                    value={params.openingHeight}
                    onChange={(e) =>
                      updateParam("openingHeight", parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Overlap
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="top">Top (inches)</Label>
                  <Input
                    id="top"
                    type="number"
                    step="0.0625"
                    value={params.topOverlap}
                    onChange={(e) =>
                      updateParam("topOverlap", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bottom">Bottom (inches)</Label>
                  <Input
                    id="bottom"
                    type="number"
                    step="0.0625"
                    value={params.bottomOverlap}
                    onChange={(e) =>
                      updateParam("bottomOverlap", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="left">Left (inches)</Label>
                  <Input
                    id="left"
                    type="number"
                    step="0.0625"
                    value={params.leftOverlap}
                    onChange={(e) =>
                      updateParam("leftOverlap", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="right">Right (inches)</Label>
                  <Input
                    id="right"
                    type="number"
                    step="0.0625"
                    value={params.rightOverlap}
                    onChange={(e) =>
                      updateParam("rightOverlap", parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Configuration
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gap">Gap Between (inches)</Label>
                  <Input
                    id="gap"
                    type="number"
                    step="0.0625"
                    value={params.gap}
                    onChange={(e) =>
                      updateParam("gap", parseFloat(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <RadioGroup
                    value={params.type}
                    onValueChange={(value) => {
                      updateParam("type", value);
                      if (value === "drawer") {
                        syncRatiosWithQuantity(params.quantity);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="door" id="door" />
                      <Label
                        htmlFor="door"
                        className="font-normal cursor-pointer"
                      >
                        Doors (Side by Side)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drawer" id="drawer" />
                      <Label
                        htmlFor="drawer"
                        className="font-normal cursor-pointer"
                      >
                        Drawers (Stacked)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="6"
                    value={params.quantity}
                    onChange={(e) => {
                      const q = parseInt(e.target.value);
                      updateParam("quantity", q);
                      if (params.type === "drawer") {
                        syncRatiosWithQuantity(q);
                      }
                    }}
                  />
                </div>
                {params.type === "drawer" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Drawer Split</Label>
                    <RadioGroup
                      value={params.drawerSplitMode || "even"}
                      onValueChange={(value) => {
                        updateParam("drawerSplitMode", value);
                        if (value === "custom") {
                          if (
                            !drawerRatioInputs.length ||
                            drawerRatioInputs.length !== params.quantity
                          ) {
                            syncRatiosWithQuantity(params.quantity);
                          }
                        }
                      }}
                      className="flex flex-row gap-3 mt-1"
                    >
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="even"
                          id="drawerEven"
                          className="h-3 w-3"
                        />
                        <Label
                          htmlFor="drawerEven"
                          className="text-xs ml-1 cursor-pointer"
                        >
                          Even
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="custom"
                          id="drawerCustom"
                          className="h-3 w-3"
                        />
                        <Label
                          htmlFor="drawerCustom"
                          className="text-xs ml-1 cursor-pointer"
                        >
                          Custom
                        </Label>
                      </div>
                    </RadioGroup>

                    {params.drawerSplitMode === "custom" && (
                      <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: params.quantity }).map(
                            (_, i) => (
                              <div className="space-y-1" key={i}>
                                <Label
                                  htmlFor={`drawerRatio${i}`}
                                  className="text-xs"
                                >{`Drawer ${i + 1} Ratio`}</Label>
                                <Input
                                  id={`drawerRatio${i}`}
                                  placeholder="e.g., 1/6 or 16.67%"
                                  value={drawerRatioInputs[i] ?? ""}
                                  onChange={(e) => {
                                    const newInputs = [...drawerRatioInputs];
                                    newInputs[i] = e.target.value;
                                    setDrawerRatioInputs(newInputs);
                                    const parsed = newInputs.map(
                                      (v) => parseRatio(v || "") ?? 0
                                    );
                                    updateParam("drawerRatios", parsed);
                                  }}
                                  className="h-8"
                                />
                              </div>
                            )
                          )}
                        </div>
                        <div className="text-xs">
                          {(() => {
                            const sum = (params.drawerRatios || []).reduce(
                              (a, b) => a + b,
                              0
                            );
                            const valid = validateRatios(
                              params.drawerRatios || []
                            );
                            return (
                              <span
                                className={
                                  valid
                                    ? "text-muted-foreground"
                                    : "text-red-600"
                                }
                              >
                                {`Sum: ${sum.toFixed(2)}%`}{" "}
                                {valid ? "" : "(must equal 100%)"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Stile & Rail Dimensions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stileWidth">Stile Width (inches)</Label>
                  <Input
                    id="stileWidth"
                    type="number"
                    step="0.125"
                    value={params.stileWidth}
                    onChange={(e) =>
                      updateParam("stileWidth", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="railWidth">Rail Width (inches)</Label>
                  <Input
                    id="railWidth"
                    type="number"
                    step="0.125"
                    value={params.railWidth}
                    onChange={(e) =>
                      updateParam("railWidth", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routerDepth">Router Depth (inches)</Label>
                  <Input
                    id="routerDepth"
                    type="number"
                    step="0.0625"
                    value={params.routerDepth}
                    onChange={(e) =>
                      updateParam("routerDepth", parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                Calculated Dimensions
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-secondary rounded-md">
                  <p className="text-muted-foreground">Individual Width</p>
                  <p className="text-lg font-semibold text-foreground">
                    {dimensions.individualWidth.toFixed(3)}"
                  </p>
                </div>
                <div className="p-3 bg-secondary rounded-md">
                  <p className="text-muted-foreground">Individual Height</p>
                  <p className="text-lg font-semibold text-foreground">
                    {dimensions.individualHeight.toFixed(3)}"
                  </p>
                </div>
                <div className="p-3 bg-secondary rounded-md">
                  <p className="text-muted-foreground">Stile Width</p>
                  <p className="text-lg font-semibold text-accent">
                    {dimensions.stileWidth.toFixed(3)}"
                  </p>
                </div>
                <div className="p-3 bg-secondary rounded-md">
                  <p className="text-muted-foreground">Rail Width</p>
                  <p className="text-lg font-semibold text-accent">
                    {dimensions.railWidth.toFixed(3)}"
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 3D Preview Panel */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              3D Preview
            </h2>
            <CabinetPreview params={params} dimensions={dimensions} />
          </Card>

          {/* Individual Pieces Panel */}
          <PiecesView params={params} dimensions={dimensions} />
        </div>
      </div>
    </div>
  );
};
