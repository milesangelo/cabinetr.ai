import { CabinetOpening, CutlistItem, GlobalSettings } from '../types';

export function roundUpTo16th(num: number): number {
  return Math.ceil(num * 16) / 16;
}

export function calculateCutlist(
  cabinetOpenings: CabinetOpening[],
  globalSettings: GlobalSettings
): CutlistItem[] {
  const cutlist = cabinetOpenings.flatMap((opening) => {
    const { width, height, overlay, quantity, isDoor, name } = opening
    const { railWidth, stileWidth, thickness, gapSize, tongueGrooveDepth } = globalSettings

    const totalHeight = roundUpTo16th(height + overlay.top + overlay.bottom);
    const totalWidth = roundUpTo16th(width + overlay.left + overlay.right);
    const totalGapSize = (quantity - 1) * gapSize;

    const stileLength = isDoor
      ? totalHeight
      : roundUpTo16th((totalHeight - totalGapSize) / quantity);

    const singleDoorTotalWidth = (totalWidth - totalGapSize) / quantity;
    const singleDoorRailWidth = singleDoorTotalWidth - (2 * stileWidth) + (2 * tongueGrooveDepth);

    const singleDrawerTotalWidth = totalWidth;
    const singleDrawerRailWidth = singleDrawerTotalWidth - (2 * stileWidth) + (2 * tongueGrooveDepth);

    const railLength = isDoor ? roundUpTo16th(singleDoorRailWidth) : roundUpTo16th(singleDrawerRailWidth);

    const panelLength = roundUpTo16th(stileLength - (2 * stileWidth) + (2 * tongueGrooveDepth));
    const panelWidth = railLength;

    return [
      { piece: 'Rail', length: railLength, width: railWidth, thickness, quantity: quantity * 2, name: `${name}_rails` },
      { piece: 'Stile', length: stileLength, width: stileWidth, thickness, quantity: quantity * 2, name: `${name}_stiles` },
      { piece: 'Panel', length: panelLength, width: panelWidth, thickness, quantity, name: `${name}_panel` }
    ]
  })

  // Combine similar pieces
  const combinedCutlist = cutlist.reduce((acc, item) => {
    const key = `${item.name}-${item.length.toFixed(3)}-${item.width.toFixed(3)}-${item.thickness}`
    if (acc[key]) {
      acc[key].quantity += item.quantity
    } else {
      acc[key] = { ...item }
    }
    return acc
  }, {} as Record<string, { piece: string, length: number, width: number, thickness: number, quantity: number, name: string }>)

  return Object.values(combinedCutlist)
}
