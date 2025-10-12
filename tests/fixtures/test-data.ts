export interface CabinetTestData {
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
}

export interface ExpectedDimensions {
  individualWidth: number;
  individualHeight: number;
  stileWidth: number;
  railWidth: number;
}

export interface ExpectedPiece {
  name: string;
  width: number;
  length: number;
  quantity: number;
}

export const defaultCabinetConfig: CabinetTestData = {
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
};

export const twoDoorConfig: CabinetTestData = {
  ...defaultCabinetConfig,
  openingWidth: 24,
  openingHeight: 30,
  quantity: 2,
  type: "door",
};

export const threeDrawerConfig: CabinetTestData = {
  ...defaultCabinetConfig,
  openingWidth: 18,
  openingHeight: 24,
  quantity: 3,
  type: "drawer",
};

export const singleDoorConfig: CabinetTestData = {
  ...defaultCabinetConfig,
  openingWidth: 18,
  openingHeight: 36,
  quantity: 1,
  type: "door",
};

export const customOverlapConfig: CabinetTestData = {
  ...defaultCabinetConfig,
  topOverlap: 0.75,
  bottomOverlap: 0.75,
  leftOverlap: 0.625,
  rightOverlap: 0.625,
  gap: 0.1875,
};

// Expected dimensions for two door config
export const twoDoorExpectedDimensions: ExpectedDimensions = {
  individualWidth: 12.4375, // (24 + 0.5 + 0.5 - 0.125) / 2
  individualHeight: 31.0, // 30 + 0.5 + 0.5
  stileWidth: 1.0,
  railWidth: 1.0,
};

// Expected pieces for two door config (2 doors)
export const twoDoorExpectedPieces: ExpectedPiece[] = [
  {
    name: "Stile (Vertical)",
    width: 1.0,
    length: 31.0, // Individual height
    quantity: 4, // 2 per door * 2 doors
  },
  {
    name: "Rail (Horizontal)",
    width: 1.0,
    length: 11.1875, // individualWidth - stileWidth*2 + routerDepth*2 = 12.4375 - 2 + 0.75
    quantity: 4, // 2 per door * 2 doors
  },
  {
    name: "Center Panel",
    width: 11.1875, // Same as rail length
    length: 29.75, // individualHeight - railWidth*2 + routerDepth*2 = 31 - 2 + 0.75
    quantity: 2, // 1 per door
  },
];
