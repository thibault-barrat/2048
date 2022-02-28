export const pixelSize = 8;

export type TileMeta = {
  id: number;
  position: [number, number];
  value: number;
  mergeWith?: number;
};

const tileMargin = pixelSize * 2;
const tileWidthMultiplier = 12.5;
const tileWidth = tileWidthMultiplier * pixelSize;
export const tileTotalWidth = tileWidth + tileMargin;