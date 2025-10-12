import { useState, useEffect } from "react";
import { Cabinet } from "@/lib/types";
import { CabinetParams } from "@/components/CabinetCalculator";
import { duplicateCabinet } from "@/lib/projectStorage";

const STORAGE_KEY = "cabinetr-cabinets";

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
});

export const useCabinets = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cabinets));
  }, [cabinets]);

  const addCabinet = (name: string, params?: CabinetParams): Cabinet => {
    const newCabinet: Cabinet = {
      id: crypto.randomUUID(),
      name,
      params: params || getDefaultParams(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCabinets((prev) => [...prev, newCabinet]);
    return newCabinet;
  };

  const updateCabinet = (id: string, updates: Partial<Omit<Cabinet, "id" | "createdAt">>) => {
    setCabinets((prev) =>
      prev.map((cabinet) =>
        cabinet.id === id
          ? { ...cabinet, ...updates, updatedAt: new Date().toISOString() }
          : cabinet
      )
    );
  };

  const deleteCabinet = (id: string) => {
    setCabinets((prev) => prev.filter((cabinet) => cabinet.id !== id));
  };

  const getCabinet = (id: string): Cabinet | undefined => {
    return cabinets.find((cabinet) => cabinet.id === id);
  };

  const addConfigurationToCabinet = (cabinetId: string, name: string, params: CabinetParams) => {
    const newConfig = {
      id: crypto.randomUUID(),
      name,
      params,
    };

    setCabinets((prev) =>
      prev.map((cabinet) =>
        cabinet.id === cabinetId
          ? {
              ...cabinet,
              configurations: [...(cabinet.configurations || []), newConfig],
              updatedAt: new Date().toISOString(),
            }
          : cabinet
      )
    );

    return newConfig;
  };

  const removeConfigurationFromCabinet = (cabinetId: string, configId: string) => {
    setCabinets((prev) =>
      prev.map((cabinet) =>
        cabinet.id === cabinetId
          ? {
              ...cabinet,
              configurations: (cabinet.configurations || []).filter(c => c.id !== configId),
              updatedAt: new Date().toISOString(),
            }
          : cabinet
      )
    );
  };

  const cloneCabinet = (id: string): Cabinet | undefined => {
    const original = cabinets.find((cabinet) => cabinet.id === id);
    if (!original) return undefined;

    const cloned = duplicateCabinet(original);
    setCabinets((prev) => [...prev, cloned]);
    return cloned;
  };

  const importCabinets = (newCabinets: Cabinet[]) => {
    setCabinets((prev) => [...prev, ...newCabinets]);
  };

  const replaceAllCabinets = (newCabinets: Cabinet[]) => {
    setCabinets(newCabinets);
  };

  return {
    cabinets,
    addCabinet,
    updateCabinet,
    deleteCabinet,
    getCabinet,
    addConfigurationToCabinet,
    removeConfigurationFromCabinet,
    cloneCabinet,
    importCabinets,
    replaceAllCabinets,
  };
};
