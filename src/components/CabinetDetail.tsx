import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CabinetPreview } from "./CabinetPreview";
import { PiecesView } from "./PiecesView";
import { ProjectCabinetList } from "./ProjectCabinetList";
import { ArrowLeft, Save, Ruler, Layers, Plus } from "lucide-react";
import { CabinetParams } from "./CabinetCalculator";
import { useCabinets } from "@/hooks/useCabinets";
import { useToast } from "@/hooks/use-toast";
import { CabinetConfiguration } from "@/lib/types";
import { parseRatio, validateRatios } from "@/lib/utils";

const getDefaultParams = (): CabinetParams => ({
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
  includeHinges: false,
});

export const CabinetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    addCabinet,
    updateCabinet,
    getCabinet,
    addConfigurationToCabinet,
    removeConfigurationFromCabinet,
  } = useCabinets();
  const { toast } = useToast();

  const isNew = id === "new";
  const existingCabinet = !isNew && id ? getCabinet(id) : null;

  const [name, setName] = useState(existingCabinet?.name || "");
  const [configName, setConfigName] = useState("");
  const [params, setParams] = useState<CabinetParams>(getDefaultParams());
  const [drawerRatioInputs, setDrawerRatioInputs] = useState<string[]>([]);
  const [explosionDistance, setExplosionDistance] = useState(0);
  const [configurations, setConfigurations] = useState(
    existingCabinet?.configurations || []
  );
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && !existingCabinet) {
      navigate("/");
    }
  }, [isNew, existingCabinet, navigate]);

  const calculateDimensions = () => {
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
        params.drawerRatios.length === params.quantity &&
        validateRatios(params.drawerRatios)
      ) {
        const availableHeight =
          totalHeight - params.gap * (params.quantity - 1);
        panelHeights = params.drawerRatios.map(
          (pct) => (pct / 100) * availableHeight
        );
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

  const handleAddConfiguration = () => {
    if (!configName.trim()) {
      toast({
        title: "Configuration name required",
        description: "Please enter a name for this cabinet configuration",
        variant: "destructive",
      });
      return;
    }

    if (isNew) {
      // For new projects, we need to create the project first
      if (!name.trim()) {
        toast({
          title: "Project name required",
          description: "Please enter a name for your project first",
          variant: "destructive",
        });
        return;
      }

      const newCabinet = addCabinet(name, params);
      const newConfig = addConfigurationToCabinet(
        newCabinet.id,
        configName,
        params
      );

      toast({
        title: "Configuration added",
        description: `${configName} has been added to the project`,
      });

      // Navigate to the newly created cabinet's edit page
      navigate(`/cabinet/${newCabinet.id}`, { replace: true });
    } else if (id) {
      if (editingConfigId) {
        // Update existing configuration
        updateCabinet(id, {
          configurations: configurations.map((config) =>
            config.id === editingConfigId
              ? { ...config, name: configName, params }
              : config
          ),
        });

        toast({
          title: "Configuration updated",
          description: `${configName} has been updated`,
        });
      } else {
        // Add new configuration
        addConfigurationToCabinet(id, configName, params);

        toast({
          title: "Configuration added",
          description: `${configName} has been added to the project`,
        });
      }

      const updatedCabinet = getCabinet(id);
      setConfigurations(updatedCabinet?.configurations || []);
    }

    // Reset the configuration form
    setConfigName("");
    setParams(getDefaultParams());
    setEditingConfigId(null);
  };

  const handleRemoveConfiguration = (configId: string) => {
    if (id) {
      removeConfigurationFromCabinet(id, configId);
      const updatedCabinet = getCabinet(id);
      setConfigurations(updatedCabinet?.configurations || []);

      // If we're deleting the configuration that's being edited, clear the form
      if (editingConfigId === configId) {
        setConfigName("");
        setParams(getDefaultParams());
        setEditingConfigId(null);
      }

      toast({
        title: "Configuration removed",
        description:
          "The cabinet configuration has been removed from the project",
      });
    }
  };

  const handleLoadConfiguration = (config: CabinetConfiguration) => {
    setConfigName(config.name);
    setParams(config.params);
    setEditingConfigId(config.id);

    toast({
      title: "Configuration loaded",
      description: `${config.name} is now loaded in the editor`,
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this cabinet project",
        variant: "destructive",
      });
      return;
    }

    if (isNew) {
      addCabinet(name, params);
      toast({
        title: "Project created",
        description: `${name} has been created successfully`,
      });
    } else if (id) {
      updateCabinet(id, { name });
      toast({
        title: "Project updated",
        description: `${name} has been updated successfully`,
      });
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {/* Desktop/Tablet Layout */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Ruler className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <h1 className="text-lg font-bold text-foreground">
                    {isNew ? "New Project" : "Edit Project"}
                  </h1>
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="Project Name (e.g., Kitchen Upper Cabinets)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 font-semibold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={handleSave} className="shadow-sm">
                <Save className="mr-2 h-4 w-4" />
                Save Project
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Ruler className="w-5 h-5 text-primary" />
                <h1 className="text-base font-bold text-foreground">
                  {isNew ? "New Project" : "Edit Project"}
                </h1>
              </div>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 font-semibold"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Configuration Form (2/3 width on large screens) */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {/* Visualization and Pieces Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column - 2/3 */}
              <div className="md:col-span-2 flex flex-col gap-4">
                {/* Set Name Input */}
                <Card className="p-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="configName"
                      className="text-sm font-semibold"
                    >
                      Cabinet Set Name
                    </Label>
                    <Input
                      id="configName"
                      placeholder="e.g., Left Door, Top Drawer"
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </Card>

                {/* 3D Preview */}
                <div className="h-[40vh] md:h-[50vh] flex-1">
                  <Card className="p-4 h-full flex flex-col">
                    <h2 className="text-lg font-semibold mb-3 text-foreground">
                      3D Preview
                    </h2>
                    {/* Exploded View Slider */}
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="explosion"
                          className="text-xs flex items-center gap-2"
                        >
                          <Layers className="h-3 w-3" />
                          Exploded View
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {explosionDistance}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="explosion"
                          min={0}
                          max={100}
                          step={1}
                          value={[explosionDistance]}
                          onValueChange={(value) =>
                            setExplosionDistance(value[0])
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExplosionDistance(0)}
                          className="text-xs px-2 py-1 h-6"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <CabinetPreview
                        params={params}
                        dimensions={dimensions}
                        explosionDistance={explosionDistance}
                      />
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right Column - 1/3 */}
              <div className="flex flex-col gap-4">
                {/* Pieces View (Cut List) */}
                <div className="flex-1 overflow-y-auto">
                  <PiecesView params={params} dimensions={dimensions} />
                </div>

                {/* Calculated Dimensions */}
                <Card className="p-3">
                  <h3 className="font-semibold text-sm text-foreground mb-2">
                    Calculated Dimensions
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-secondary rounded-md">
                      <p className="text-xs text-muted-foreground">
                        Individual Width
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {dimensions.individualWidth.toFixed(3)}"
                      </p>
                    </div>
                    <div className="p-2 bg-secondary rounded-md">
                      <p className="text-xs text-muted-foreground">
                        Individual Height
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {dimensions.individualHeight.toFixed(3)}"
                      </p>
                    </div>
                    <div className="p-2 bg-secondary rounded-md">
                      <p className="text-xs text-muted-foreground">
                        Stile Width
                      </p>
                      <p className="text-base font-semibold text-accent">
                        {dimensions.stileWidth.toFixed(3)}"
                      </p>
                    </div>
                    <div className="p-2 bg-secondary rounded-md">
                      <p className="text-xs text-muted-foreground">
                        Rail Width
                      </p>
                      <p className="text-base font-semibold text-accent">
                        {dimensions.railWidth.toFixed(3)}"
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Input Panel - Bottom Horizontal Layout */}
            <Card className="p-3 md:p-4">
              <div className="space-y-4">
                {/* Main Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Configuration */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">
                      Cabinet Set
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <RadioGroup
                          value={params.type}
                          onValueChange={(value) => updateParam("type", value)}
                          className="flex flex-row gap-3 mt-1"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="door"
                              id="door"
                              className="h-3 w-3"
                            />
                            <Label
                              htmlFor="door"
                              className="text-xs ml-1 cursor-pointer"
                            >
                              Doors
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="drawer"
                              id="drawer"
                              className="h-3 w-3"
                            />
                            <Label
                              htmlFor="drawer"
                              className="text-xs ml-1 cursor-pointer"
                            >
                              Drawers
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="quantity" className="text-xs">
                          Quantity
                        </Label>
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
                              const even = Array.from(
                                { length: q },
                                () => 100 / (q || 1)
                              );
                              setDrawerRatioInputs(
                                even.map((v) => v.toFixed(2))
                              );
                              updateParam("drawerRatios", even);
                            }
                          }}
                          className="h-8"
                        />
                      </div>
                      {params.type === "door" && (
                        <div className="flex items-center space-x-2 pt-1">
                          <Checkbox
                            id="includeHinges"
                            checked={params.includeHinges || false}
                            onCheckedChange={(checked) =>
                              updateParam("includeHinges", checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="includeHinges"
                            className="text-xs font-normal cursor-pointer"
                          >
                            Include Hinges
                          </Label>
                        </div>
                      )}
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
                                  const even = Array.from(
                                    { length: params.quantity },
                                    () => 100 / (params.quantity || 1)
                                  );
                                  setDrawerRatioInputs(
                                    even.map((v) => v.toFixed(2))
                                  );
                                  updateParam("drawerRatios", even);
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
                                          const newInputs = [
                                            ...drawerRatioInputs,
                                          ];
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
                                  const sum = (
                                    params.drawerRatios || []
                                  ).reduce((a, b) => a + b, 0);
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
                      <div className="pt-1 space-y-1">
                        <Button
                          onClick={handleAddConfiguration}
                          className="w-full h-8 text-xs"
                          variant="default"
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          {editingConfigId
                            ? "Update Cabinet Set"
                            : "Add to Project"}
                        </Button>
                        {editingConfigId && (
                          <Button
                            onClick={() => {
                              setConfigName("");
                              setParams(getDefaultParams());
                              setEditingConfigId(null);
                            }}
                            className="w-full h-8 text-xs"
                            variant="outline"
                          >
                            Clear / New Set
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opening Dimensions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">
                      Opening Size
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="width" className="text-xs">
                          Width (inches)
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.125"
                          value={params.openingWidth}
                          onChange={(e) =>
                            updateParam(
                              "openingWidth",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-xs">
                          Height (inches)
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.125"
                          value={params.openingHeight}
                          onChange={(e) =>
                            updateParam(
                              "openingHeight",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gap" className="text-xs">
                          Gap Between
                        </Label>
                        <Input
                          id="gap"
                          type="number"
                          step="0.0625"
                          value={params.gap}
                          onChange={(e) =>
                            updateParam("gap", parseFloat(e.target.value))
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Overlaps */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">
                      Overlaps
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="top" className="text-xs">
                          Top
                        </Label>
                        <Input
                          id="top"
                          type="number"
                          step="0.0625"
                          value={params.topOverlap}
                          onChange={(e) =>
                            updateParam(
                              "topOverlap",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bottom" className="text-xs">
                          Bottom
                        </Label>
                        <Input
                          id="bottom"
                          type="number"
                          step="0.0625"
                          value={params.bottomOverlap}
                          onChange={(e) =>
                            updateParam(
                              "bottomOverlap",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="left" className="text-xs">
                          Left
                        </Label>
                        <Input
                          id="left"
                          type="number"
                          step="0.0625"
                          value={params.leftOverlap}
                          onChange={(e) =>
                            updateParam(
                              "leftOverlap",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="right" className="text-xs">
                          Right
                        </Label>
                        <Input
                          id="right"
                          type="number"
                          step="0.0625"
                          value={params.rightOverlap}
                          onChange={(e) =>
                            updateParam(
                              "rightOverlap",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Frame Settings */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">
                      Frame Settings
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="stileWidth" className="text-xs">
                          Stile Width
                        </Label>
                        <Input
                          id="stileWidth"
                          type="number"
                          step="0.125"
                          value={params.stileWidth}
                          onChange={(e) =>
                            updateParam(
                              "stileWidth",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="railWidth" className="text-xs">
                          Rail Width
                        </Label>
                        <Input
                          id="railWidth"
                          type="number"
                          step="0.125"
                          value={params.railWidth}
                          onChange={(e) =>
                            updateParam("railWidth", parseFloat(e.target.value))
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="routerDepth" className="text-xs">
                          Router Depth
                        </Label>
                        <Input
                          id="routerDepth"
                          type="number"
                          step="0.0625"
                          value={params.routerDepth}
                          onChange={(e) =>
                            updateParam(
                              "routerDepth",
                              parseFloat(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Project Cabinet List (1/3 width on large screens, full width on mobile) */}
          <div className="h-[400px] lg:h-[calc(100vh-120px)]">
            <ProjectCabinetList
              configurations={configurations}
              onRemove={handleRemoveConfiguration}
              onLoad={handleLoadConfiguration}
              activeConfigId={editingConfigId}
              projectName={name}
              projectId={id || "new"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
