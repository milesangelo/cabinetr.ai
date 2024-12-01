export interface GlobalSettings {
    railWidth: number
    stileWidth: number
    thickness: number
    gapSize:number
  }
  
  export interface CabinetOpening {
    width: number
    height: number
    overlay: number
    quantity: number
  }
  
  export interface CutlistItem {
    piece: string;
    name: string;
    length: number;
    width: number;
    thickness: number;
    quantity: number;
  }
  
  export interface CutlistProps {
    cutlist: CutlistItem[];
  }