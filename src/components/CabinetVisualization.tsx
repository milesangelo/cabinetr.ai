import { CabinetOpening, GlobalSettings } from '../types';
import { roundUpTo16th } from '../utils/calculations';

interface CabinetVisualizationProps {
  opening: CabinetOpening;
  globalSettings: GlobalSettings;
}

interface DimensionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
  orientation?: 'horizontal' | 'vertical';
}

const DimensionLine: React.FC<DimensionLineProps> = ({
  x1, y1, x2, y2, label, offset = 20, orientation = 'horizontal'
}) => {
  const isHorizontal = orientation === 'horizontal';
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Offset the dimension line
  const offsetY1 = isHorizontal ? y1 + offset : y1;
  const offsetY2 = isHorizontal ? y2 + offset : y2;
  const offsetX1 = isHorizontal ? x1 : x1 + offset;
  const offsetX2 = isHorizontal ? x2 : x2 + offset;

  return (
    <g className="dimension-line">
      {/* Extension lines */}
      {isHorizontal ? (
        <>
          <line x1={x1} y1={y1} x2={x1} y2={offsetY1} stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={x2} y1={y2} x2={x2} y2={offsetY2} stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1} x2={offsetX1} y2={y1} stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={x2} y1={y2} x2={offsetX2} y2={y2} stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
        </>
      )}

      {/* Dimension line */}
      <line
        x1={isHorizontal ? x1 : offsetX1}
        y1={isHorizontal ? offsetY1 : y1}
        x2={isHorizontal ? x2 : offsetX2}
        y2={isHorizontal ? offsetY2 : y2}
        stroke="#666"
        strokeWidth="1.5"
        markerStart="url(#arrowStart)"
        markerEnd="url(#arrowEnd)"
      />

      {/* Label */}
      <text
        x={isHorizontal ? midX : offsetX1 + 10}
        y={isHorizontal ? offsetY1 - 5 : midY}
        textAnchor="middle"
        fontSize="12"
        fill="#333"
        fontWeight="500"
      >
        {label}"
      </text>
    </g>
  );
};

export default function CabinetVisualization({ opening, globalSettings }: CabinetVisualizationProps) {
  const { width, height, overlay, quantity, isDoor, name } = opening;
  const { railWidth, stileWidth, gapSize, tongueGrooveDepth } = globalSettings;

  // Calculate actual dimensions
  const totalHeight = roundUpTo16th(height + overlay.top + overlay.bottom);
  const totalWidth = roundUpTo16th(width + overlay.left + overlay.right);
  const totalGapSize = (quantity - 1) * gapSize;

  const stileLength = isDoor
    ? totalHeight
    : roundUpTo16th((totalHeight - totalGapSize) / quantity);

  const singleDoorTotalWidth = (totalWidth - totalGapSize) / quantity;
  const singleDrawerTotalWidth = totalWidth;

  const doorWidth = isDoor ? singleDoorTotalWidth : singleDrawerTotalWidth;
  const railLength = doorWidth - (2 * stileWidth) + (2 * tongueGrooveDepth);
  const panelLength = stileLength - (2 * railWidth) + (2 * tongueGrooveDepth);

  // SVG dimensions and scaling
  const padding = 80;
  const svgWidth = 800;
  const svgHeight = 600;
  const maxDrawWidth = svgWidth - (2 * padding);
  const maxDrawHeight = svgHeight - (2 * padding);

  // Calculate scale to fit the drawing
  const scale = Math.min(
    maxDrawWidth / totalWidth,
    maxDrawHeight / totalHeight,
    30 // Max scale for very small cabinets
  );

  // Scaled dimensions
  const scaledOpeningWidth = width * scale;
  const scaledOpeningHeight = height * scale;
  const scaledTotalWidth = totalWidth * scale;
  const scaledTotalHeight = totalHeight * scale;
  const scaledDoorWidth = doorWidth * scale;
  const scaledStileLength = stileLength * scale;
  const scaledStileWidth = stileWidth * scale;
  const scaledRailWidth = railWidth * scale;
  const scaledRailLength = railLength * scale;
  const scaledPanelLength = panelLength * scale;
  const scaledGapSize = gapSize * scale;
  const scaledOverlayTop = overlay.top * scale;
  const scaledOverlayBottom = overlay.bottom * scale;
  const scaledOverlayLeft = overlay.left * scale;
  const scaledOverlayRight = overlay.right * scale;

  // Calculate positions (centered in SVG)
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Opening position (the cabinet box opening)
  const openingX = centerX - (scaledOpeningWidth / 2);
  const openingY = centerY - (scaledOpeningHeight / 2);

  // Door/drawer position (with overlays)
  const doorX = openingX - scaledOverlayLeft;
  const doorY = openingY - scaledOverlayTop;

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">
        {name || 'Preview'} - 2D Visualization
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {isDoor ? 'Door' : 'Drawer Front'} Configuration
        {quantity > 1 && ` (${quantity} doors)`}
      </p>

      <svg width={svgWidth} height={svgHeight} className="border bg-white">
        {/* Define arrow markers for dimension lines */}
        <defs>
          <marker
            id="arrowStart"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M5,0 L5,6 L0,3 z" fill="#666" />
          </marker>
          <marker
            id="arrowEnd"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L5,3 z" fill="#666" />
          </marker>
        </defs>

        {/* Cabinet Opening (dashed rectangle) */}
        <rect
          x={openingX}
          y={openingY}
          width={scaledOpeningWidth}
          height={scaledOpeningHeight}
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <text
          x={openingX + scaledOpeningWidth / 2}
          y={openingY + scaledOpeningHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#999"
          fontStyle="italic"
        >
          Cabinet Opening
        </text>

        {/* Render doors/drawers */}
        {Array.from({ length: quantity }).map((_, i) => {
          const currentDoorX = doorX + (i * (scaledDoorWidth + scaledGapSize));

          return (
            <g key={i}>
              {/* Door/Drawer background */}
              <rect
                x={currentDoorX}
                y={doorY}
                width={scaledDoorWidth}
                height={scaledStileLength}
                fill="#E8DCC4"
                stroke="#8B7355"
                strokeWidth="2"
              />

              {/* Top Rail */}
              <rect
                x={currentDoorX + scaledStileWidth}
                y={doorY}
                width={scaledRailLength}
                height={scaledRailWidth}
                fill="#D4A574"
                stroke="#8B7355"
                strokeWidth="1"
              />

              {/* Bottom Rail */}
              <rect
                x={currentDoorX + scaledStileWidth}
                y={doorY + scaledStileLength - scaledRailWidth}
                width={scaledRailLength}
                height={scaledRailWidth}
                fill="#D4A574"
                stroke="#8B7355"
                strokeWidth="1"
              />

              {/* Left Stile */}
              <rect
                x={currentDoorX}
                y={doorY}
                width={scaledStileWidth}
                height={scaledStileLength}
                fill="#C19A6B"
                stroke="#8B7355"
                strokeWidth="1"
              />

              {/* Right Stile */}
              <rect
                x={currentDoorX + scaledDoorWidth - scaledStileWidth}
                y={doorY}
                width={scaledStileWidth}
                height={scaledStileLength}
                fill="#C19A6B"
                stroke="#8B7355"
                strokeWidth="1"
              />

              {/* Panel (center) */}
              <rect
                x={currentDoorX + scaledStileWidth}
                y={doorY + scaledRailWidth}
                width={scaledRailLength}
                height={scaledPanelLength}
                fill="#F5E6D3"
                stroke="#8B7355"
                strokeWidth="1"
                strokeDasharray="3,3"
              />

              {/* Panel label */}
              <text
                x={currentDoorX + scaledDoorWidth / 2}
                y={doorY + scaledStileLength / 2}
                textAnchor="middle"
                fontSize="11"
                fill="#666"
                fontStyle="italic"
              >
                Panel
              </text>
            </g>
          );
        })}

        {/* Dimension Lines */}

        {/* Overall width */}
        <DimensionLine
          x1={doorX}
          y1={doorY + scaledStileLength}
          x2={doorX + scaledTotalWidth}
          y2={doorY + scaledStileLength}
          label={totalWidth.toFixed(4)}
          offset={40}
          orientation="horizontal"
        />

        {/* Overall height */}
        <DimensionLine
          x1={doorX + scaledTotalWidth}
          y1={doorY}
          x2={doorX + scaledTotalWidth}
          y2={doorY + scaledStileLength}
          label={totalHeight.toFixed(4)}
          offset={40}
          orientation="vertical"
        />

        {/* Opening width */}
        <DimensionLine
          x1={openingX}
          y1={openingY}
          x2={openingX + scaledOpeningWidth}
          y2={openingY}
          label={width.toFixed(4)}
          offset={-30}
          orientation="horizontal"
        />

        {/* Opening height */}
        <DimensionLine
          x1={openingX}
          y1={openingY}
          x2={openingX}
          y2={openingY + scaledOpeningHeight}
          label={height.toFixed(4)}
          offset={-30}
          orientation="vertical"
        />

        {/* Stile width indicator (left side) */}
        {scaledStileWidth > 15 && (
          <text
            x={doorX + scaledStileWidth / 2}
            y={doorY + scaledStileLength / 2}
            textAnchor="middle"
            fontSize="10"
            fill="#333"
            fontWeight="600"
          >
            S:{stileWidth}"
          </text>
        )}

        {/* Rail width indicator (top) */}
        {scaledRailWidth > 15 && (
          <text
            x={doorX + scaledStileWidth + scaledRailLength / 2}
            y={doorY + scaledRailWidth / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#333"
            fontWeight="600"
          >
            R:{railWidth}"
          </text>
        )}

        {/* Gap indicator (if multiple doors) */}
        {quantity > 1 && (
          <text
            x={doorX + scaledDoorWidth + scaledGapSize / 2}
            y={doorY + scaledStileLength / 2}
            textAnchor="middle"
            fontSize="10"
            fill="#E63946"
            fontWeight="600"
          >
            Gap:{gapSize}"
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#C19A6B] border border-[#8B7355]"></div>
          <span>Stiles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#D4A574] border border-[#8B7355]"></div>
          <span>Rails</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#F5E6D3] border border-[#8B7355] border-dashed"></div>
          <span>Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#999] border-dashed bg-white"></div>
          <span>Opening</span>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
        <h4 className="font-semibold mb-2">Technical Details:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div><strong>Door Width:</strong> {doorWidth.toFixed(4)}"</div>
          <div><strong>Door Height:</strong> {stileLength.toFixed(4)}"</div>
          <div><strong>Rail Length:</strong> {railLength.toFixed(4)}"</div>
          <div><strong>Panel Size:</strong> {railLength.toFixed(4)}" x {panelLength.toFixed(4)}"</div>
          <div><strong>Overlays:</strong> T:{overlay.top}" B:{overlay.bottom}" L:{overlay.left}" R:{overlay.right}"</div>
          <div><strong>T/G Depth:</strong> {tongueGrooveDepth}"</div>
        </div>
      </div>
    </div>
  );
}
