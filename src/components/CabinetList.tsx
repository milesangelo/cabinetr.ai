import { useNavigate } from "react-router-dom";
import { useCabinets } from "@/hooks/useCabinets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus, Trash2, Ruler, Upload, Copy, FileDown, Archive } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useRef } from "react";
import { downloadAllCabinetsCSV } from "@/lib/exportUtils";
import {
  exportProjectToFile,
  exportAllProjectsToFile,
  importProjectsFromFile
} from "@/lib/projectStorage";
import { useToast } from "@/hooks/use-toast";

export const CabinetList = () => {
  const navigate = useNavigate();
  const { cabinets, deleteCabinet, cloneCabinet, importCabinets } = useCabinets();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cabinetToDelete, setCabinetToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCabinetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cabinetToDelete) {
      deleteCabinet(cabinetToDelete);
      setCabinetToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleExportAll = () => {
    downloadAllCabinetsCSV(cabinets);
  };

  const handleExportProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cabinet = cabinets.find(c => c.id === id);
    if (cabinet) {
      exportProjectToFile(cabinet);
      toast({
        title: "Project Exported",
        description: `${cabinet.name} has been exported successfully.`,
      });
    }
  };

  const handleBackupAll = () => {
    exportAllProjectsToFile(cabinets);
    toast({
      title: "Backup Created",
      description: `All ${cabinets.length} project(s) have been backed up.`,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedCabinets = await importProjectsFromFile(file);
      importCabinets(importedCabinets);
      toast({
        title: "Import Successful",
        description: `${importedCabinets.length} project(s) have been imported.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned = cloneCabinet(id);
    if (cloned) {
      toast({
        title: "Project Duplicated",
        description: `${cloned.name} has been created.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Cabinet Projects
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your cabinet door and drawer projects
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <Button onClick={handleImportClick} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              {cabinets.length > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportAll}>
                        <Download className="mr-2 h-4 w-4" />
                        Export All CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleBackupAll}>
                        <Archive className="mr-2 h-4 w-4" />
                        Backup All Projects
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <Button onClick={() => navigate("/cabinet/new")}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {cabinets.length === 0 ? (
          <Card className="p-12 text-center">
            <Ruler className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              No projects yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <Button onClick={() => navigate("/cabinet/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cabinets.map((cabinet) => (
              <Card
                key={cabinet.id}
                className="p-6 cursor-pointer hover:border-primary transition-all"
                onClick={() => navigate(`/cabinet/${cabinet.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {cabinet.name}
                  </h3>
                  <div className="flex gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleDuplicate(cabinet.id, e)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleExportProject(cabinet.id, e)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Export Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(cabinet.id, e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {cabinet.configurations && cabinet.configurations.length > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cabinet Sets:</span>
                        <span className="font-medium text-foreground">
                          {cabinet.configurations.length}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cabinet.configurations.map((config, idx) => (
                          <div key={config.id} className="truncate">
                            {idx + 1}. {config.name}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-foreground">
                          {cabinet.params.type === "door" ? "Doors" : "Drawers"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Opening:</span>
                        <span className="font-medium text-foreground">
                          {cabinet.params.openingWidth}" × {cabinet.params.openingHeight}"
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium text-foreground">
                          {cabinet.params.quantity}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  Updated {new Date(cabinet.updatedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cabinet Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cabinet project? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
