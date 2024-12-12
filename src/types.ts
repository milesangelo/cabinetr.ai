export interface GlobalSettings {
    railWidth: number
    stileWidth: number
    thickness: number
    gapSize: number
    tongueGrooveDepth: number
  }
  

  export interface Overlay {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }
  
  export interface CabinetOpening {
    width: number;
    height: number;
    overlay: Overlay;
    quantity: number;
    isDoor: boolean;
    name: string;
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