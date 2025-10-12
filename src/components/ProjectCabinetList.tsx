import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { CabinetConfiguration } from "@/lib/types";
import { downloadAllCabinetsCSV } from "@/lib/exportUtils";
import { Cabinet } from "@/lib/types";

interface ProjectCabinetListProps {
  configurations: CabinetConfiguration[];
  onRemove: (configId: string) => void;
  onLoad: (config: CabinetConfiguration) => void;
  activeConfigId: string | null;
  projectName: string;
  projectId: string;
}

export const ProjectCabinetList = ({
  configurations,
  onRemove,
  onLoad,
  activeConfigId,
  projectName,
  projectId,
}: ProjectCabinetListProps) => {
  const handleExportAll = () => {
    if (configurations.length === 0) return;

    // Create a single cabinet project with all configurations
    const cabinetProject: Cabinet = {
      id: projectId,
      name: projectName || "Cabinet Project",
      params: configurations[0].params, // Keep first config params for backwards compatibility
      configurations: configurations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    downloadAllCabinetsCSV([cabinetProject]);
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Cabinet Sets ({configurations.length})
        </h2>
        {configurations.length > 0 && (
          <Button onClick={handleExportAll} variant="outline" size="sm">
            <Download className="mr-2 h-3 w-3" />
            Export All
          </Button>
        )}
      </div>

      {configurations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <p className="text-sm mb-2">No cabinet sets added yet</p>
            <p className="text-xs">
              Configure a cabinet and click "Add to Project" to add it
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {configurations.map((config) => {
            const isActive = config.id === activeConfigId;
            return (
              <Card
                key={config.id}
                className={`p-3 cursor-pointer transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:border-primary/50"
                }`}
                onClick={() => onLoad(config)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {config.name}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                        EDITING
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(config.id);
                    }}
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-foreground">
                      {config.params.type === "door" ? "Doors" : "Drawers"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opening:</span>
                    <span className="font-medium text-foreground">
                      {config.params.openingWidth}" × {config.params.openingHeight}"
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium text-foreground">
                      {config.params.quantity}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
};
