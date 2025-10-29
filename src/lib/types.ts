import { CabinetParams } from "@/components/CabinetCalculator";

export interface CabinetConfiguration {
  id: string;
  name: string;
  params: CabinetParams;
}

export interface Cabinet {
  id: string;
  name: string;
  params: CabinetParams; // Keep for backwards compatibility with existing saved data
  configurations?: CabinetConfiguration[]; // New: array of cabinet configurations
  createdAt: string;
  updatedAt: string;
}

export interface PieceDimensions {
  name: string;
  width: number;
  length: number;
  quantity: number;
  notes: string;
}
