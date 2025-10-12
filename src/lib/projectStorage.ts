import { Cabinet } from "./types";

export interface ProjectExport {
  version: string;
  exportDate: string;
  projects: Cabinet[];
}

/**
 * Export a single project (cabinet) to a downloadable JSON file
 */
export const exportProjectToFile = (cabinet: Cabinet) => {
  const exportData: ProjectExport = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    projects: [cabinet],
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${cabinet.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export all projects to a single JSON file
 */
export const exportAllProjectsToFile = (cabinets: Cabinet[]) => {
  const exportData: ProjectExport = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    projects: cabinets,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cabinetr_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import projects from a JSON file
 * Returns the imported cabinets with new IDs to avoid conflicts
 */
export const importProjectsFromFile = (
  file: File
): Promise<Cabinet[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: ProjectExport = JSON.parse(content);

        // Validate the data structure
        if (!data.version || !data.projects || !Array.isArray(data.projects)) {
          throw new Error("Invalid project file format");
        }

        // Create new cabinets with fresh IDs and timestamps
        const importedCabinets: Cabinet[] = data.projects.map((project) => ({
          ...project,
          id: crypto.randomUUID(), // Generate new ID to avoid conflicts
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Preserve configurations with new IDs
          configurations: project.configurations?.map((config) => ({
            ...config,
            id: crypto.randomUUID(),
          })),
        }));

        resolve(importedCabinets);
      } catch (error) {
        reject(
          new Error(
            `Failed to import projects: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

/**
 * Create a duplicate of a cabinet with a new ID
 */
export const duplicateCabinet = (cabinet: Cabinet): Cabinet => {
  return {
    ...cabinet,
    id: crypto.randomUUID(),
    name: `${cabinet.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configurations: cabinet.configurations?.map((config) => ({
      ...config,
      id: crypto.randomUUID(),
    })),
  };
};

/**
 * Save all cabinets to localStorage
 */
export const saveToLocalStorage = (cabinets: Cabinet[], key: string = "cabinetr-cabinets") => {
  try {
    localStorage.setItem(key, JSON.stringify(cabinets));
    return true;
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
    return false;
  }
};

/**
 * Load all cabinets from localStorage
 */
export const loadFromLocalStorage = (key: string = "cabinetr-cabinets"): Cabinet[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return [];
  }
};

/**
 * Clear all cabinets from localStorage
 */
export const clearLocalStorage = (key: string = "cabinetr-cabinets") => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
    return false;
  }
};
