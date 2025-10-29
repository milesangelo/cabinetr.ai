import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { CabinetParams, CalculatedDimensions } from "./CabinetCalculator";
import * as THREE from "three";
import { useRef } from "react";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface CabinetPreviewProps {
  params: CabinetParams;
  dimensions: CalculatedDimensions;
  explosionDistance?: number;
}

// Cabinet opening component
const CabinetOpening = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const inchesToUnits = (inches: number) => inches / 12; // Scale down for better viewing

  return (
    <group>
      {/* Opening frame */}
      <mesh position={[0, inchesToUnits(height) / 2, -0.2]}>
        <boxGeometry
          args={[inchesToUnits(width), inchesToUnits(height), 0.1]}
        />
        <meshStandardMaterial color="#4a5568" transparent opacity={0.3} />
      </mesh>
      {/* Opening outline */}
      <lineSegments>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(
              inchesToUnits(width),
              inchesToUnits(height),
              0.1
            ),
          ]}
        />
        <lineBasicMaterial color="#2d3748" linewidth={2} />
      </lineSegments>
    </group>
  );
};

// Door/Drawer component
const DoorPanel = ({
  width,
  height,
  position,
  stileWidth,
  railWidth,
  routerDepth = 0.375,
  internalExplosion = 0,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  stileWidth: number;
  railWidth: number;
  routerDepth?: number;
  internalExplosion?: number;
}) => {
  const inchesToUnits = (inches: number) => inches / 12;

  // White oak rift sawn colors
  const panelColor = "#d4c4a8"; // Light tan/beige for rift sawn oak
  const stileRailColor = "#c9b896"; // Slightly darker for contrast
  const grainColor = "#b8a888"; // Subtle grain lines
  const grooveColor = "#a89880"; // Darker color for grooves

  // Calculate explosion offsets for internal components
  const componentExplosion = internalExplosion * 0.3; // Scale down for internal explosion
  const stileExplosion = componentExplosion;
  const railExplosion = componentExplosion;
  const panelZExplosion = componentExplosion * 0.5; // Panel moves forward slightly

  return (
    <group position={position}>
      {/* Main panel with wood grain effect - moves forward in explosion */}
      <mesh position={[0, 0, -panelZExplosion]}>
        <boxGeometry
          args={[inchesToUnits(width), inchesToUnits(height), 0.08]}
        />
        <meshStandardMaterial
          color={panelColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Center panel inset (rift sawn pattern) - moves with main panel */}
      <mesh position={[0, 0, 0.04 - panelZExplosion]}>
        <boxGeometry
          args={[
            inchesToUnits(width - stileWidth * 2 - 0.5),
            inchesToUnits(height - railWidth * 2 - 0.5),
            0.02,
          ]}
        />
        <meshStandardMaterial
          color={grainColor}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Panel tongue edges (thin extensions that fit into the grooves) - 1/4" thick */}
      {internalExplosion > 0 && (
        <>
          {/* Left tongue */}
          <mesh
            position={[
              -inchesToUnits(width - stileWidth * 2) / 2 -
                inchesToUnits(routerDepth / 2),
              0,
              0.04 - panelZExplosion,
            ]}
          >
            <boxGeometry
              args={[
                inchesToUnits(routerDepth * 0.95), // Slightly smaller than groove for clearance
                inchesToUnits(height - railWidth * 2 - 0.5),
                inchesToUnits(0.24), // 1/4" thick to fit in groove
              ]}
            />
            <meshStandardMaterial
              color={panelColor}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Right tongue */}
          <mesh
            position={[
              inchesToUnits(width - stileWidth * 2) / 2 +
                inchesToUnits(routerDepth / 2),
              0,
              0.04 - panelZExplosion,
            ]}
          >
            <boxGeometry
              args={[
                inchesToUnits(routerDepth * 0.95),
                inchesToUnits(height - railWidth * 2 - 0.5),
                inchesToUnits(0.24),
              ]}
            />
            <meshStandardMaterial
              color={panelColor}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Top tongue */}
          <mesh
            position={[
              0,
              inchesToUnits(height - railWidth * 2) / 2 +
                inchesToUnits(routerDepth / 2),
              0.04 - panelZExplosion,
            ]}
          >
            <boxGeometry
              args={[
                inchesToUnits(width - stileWidth * 2 - 0.5),
                inchesToUnits(routerDepth * 0.95),
                inchesToUnits(0.24),
              ]}
            />
            <meshStandardMaterial
              color={panelColor}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Bottom tongue */}
          <mesh
            position={[
              0,
              -inchesToUnits(height - railWidth * 2) / 2 -
                inchesToUnits(routerDepth / 2),
              0.04 - panelZExplosion,
            ]}
          >
            <boxGeometry
              args={[
                inchesToUnits(width - stileWidth * 2 - 0.5),
                inchesToUnits(routerDepth * 0.95),
                inchesToUnits(0.24),
              ]}
            />
            <meshStandardMaterial
              color={panelColor}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </>
      )}

      {/* Left Stile - explodes left */}
      <mesh
        position={[
          -inchesToUnits(width) / 2 +
            inchesToUnits(stileWidth) / 2 -
            stileExplosion,
          0,
          0.05 + componentExplosion,
        ]}
      >
        <boxGeometry
          args={[inchesToUnits(stileWidth), inchesToUnits(height), 0.04]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Left Stile Groove (recessed into the stile) - full length, 1/4" wide, routerDepth deep */}
      <mesh
        position={[
          -inchesToUnits(width) / 2 +
            inchesToUnits(stileWidth - routerDepth / 2) -
            stileExplosion,
          0,
          0.05 + componentExplosion - inchesToUnits(routerDepth / 2),
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(routerDepth),
            inchesToUnits(height),
            inchesToUnits(0.25),
          ]}
        />
        <meshStandardMaterial
          color={grooveColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Right Stile - explodes right */}
      <mesh
        position={[
          inchesToUnits(width) / 2 -
            inchesToUnits(stileWidth) / 2 +
            stileExplosion,
          0,
          0.05 + componentExplosion,
        ]}
      >
        <boxGeometry
          args={[inchesToUnits(stileWidth), inchesToUnits(height), 0.04]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Right Stile Groove (recessed into the stile) - full length, 1/4" wide, routerDepth deep */}
      <mesh
        position={[
          inchesToUnits(width) / 2 -
            inchesToUnits(stileWidth - routerDepth / 2) +
            stileExplosion,
          0,
          0.05 + componentExplosion - inchesToUnits(routerDepth / 2),
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(routerDepth),
            inchesToUnits(height),
            inchesToUnits(0.25),
          ]}
        />
        <meshStandardMaterial
          color={grooveColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Top Rail - explodes up */}
      <mesh
        position={[
          0,
          inchesToUnits(height) / 2 -
            inchesToUnits(railWidth) / 2 +
            railExplosion,
          0.05 + componentExplosion,
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(width - stileWidth * 2),
            inchesToUnits(railWidth),
            0.04,
          ]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Top Rail Left Tongue (extends into left stile groove) - routerDepth long, 1/4" thick */}
      <mesh
        position={[
          -inchesToUnits(width - stileWidth * 2) / 2 -
            inchesToUnits(routerDepth / 2),
          inchesToUnits(height) / 2 -
            inchesToUnits(railWidth) / 2 +
            railExplosion,
          0.05 + componentExplosion - inchesToUnits(routerDepth / 2),
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(routerDepth * 0.95),
            inchesToUnits(railWidth),
            inchesToUnits(0.24),
          ]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Top Rail Right Tongue (extends into right stile groove) - routerDepth long, 1/4" thick */}
      <mesh
        position={[
          inchesToUnits(width - stileWidth * 2) / 2 +
            inchesToUnits(routerDepth / 2),
          inchesToUnits(height) / 2 -
            inchesToUnits(railWidth) / 2 +
            railExplosion,
          0.05 + componentExplosion - inchesToUnits(routerDepth / 2),
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(routerDepth * 0.95),
            inchesToUnits(railWidth),
            inchesToUnits(0.24),
          ]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Bottom Rail - explodes down */}
      <mesh
        position={[
          0,
          -inchesToUnits(height) / 2 +
            inchesToUnits(railWidth) / 2 -
            railExplosion,
          0.05 + componentExplosion,
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(width - stileWidth * 2),
            inchesToUnits(railWidth),
            0.04,
          ]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Bottom Rail Left Tongue (extends into left stile groove) - routerDepth long, 1/4" thick */}
      <mesh
        position={[
          -inchesToUnits(width - stileWidth * 2) / 2 -
            inchesToUnits(routerDepth / 2),
          -inchesToUnits(height) / 2 +
            inchesToUnits(railWidth) / 2 -
            railExplosion,
          0.05 + componentExplosion - inchesToUnits(routerDepth / 2),
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(routerDepth * 0.95),
            inchesToUnits(railWidth),
            inchesToUnits(0.24),
          ]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Bottom Rail Right Tongue (extends into right stile groove) - routerDepth long, 1/4" thick */}
      <mesh
        position={[
          inchesToUnits(width - stileWidth * 2) / 2 +
            inchesToUnits(routerDepth / 2),
          -inchesToUnits(height) / 2 +
            inchesToUnits(railWidth) / 2 -
            railExplosion,
          0.05 + componentExplosion - inchesToUnits(routerDepth / 2),
        ]}
      >
        <boxGeometry
          args={[
            inchesToUnits(routerDepth * 0.95),
            inchesToUnits(railWidth),
            inchesToUnits(0.24),
          ]}
        />
        <meshStandardMaterial
          color={stileRailColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle grain lines for rift sawn effect - move with panel */}
      {[...Array(5)].map((_, i) => {
        const offset = (i - 2) * 0.3;
        return (
          <mesh
            key={i}
            position={[inchesToUnits(offset), 0, 0.041 - panelZExplosion]}
          >
            <boxGeometry
              args={[0.01, inchesToUnits(height - railWidth * 2 - 0.5), 0.01]}
            />
            <meshBasicMaterial color={grainColor} opacity={0.3} transparent />
          </mesh>
        );
      })}

      {/* Edge outline */}
      <lineSegments>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(
              inchesToUnits(width),
              inchesToUnits(height),
              0.08
            ),
          ]}
        />
        <lineBasicMaterial color="#9d8b6f" linewidth={2} />
      </lineSegments>
    </group>
  );
};

export const CabinetPreview = ({
  params,
  dimensions,
  explosionDistance = 0,
}: CabinetPreviewProps) => {
  const inchesToUnits = (inches: number) => inches / 12;
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const handleRecenter = () => {
    if (controlsRef.current && cameraRef.current) {
      // Calculate the center of the doors
      const centerY = inchesToUnits(dimensions.totalHeight) / 2;
      const centerX = 0;
      const centerZ = 0;

      // Set the controls target to the center of the doors
      controlsRef.current.target.set(centerX, centerY, centerZ);

      // Calculate appropriate camera distance based on door size
      const maxDimension = Math.max(
        inchesToUnits(dimensions.totalWidth),
        inchesToUnits(dimensions.totalHeight)
      );
      const distance = maxDimension * 1.5;

      // Position camera to view from an angle
      cameraRef.current.position.set(
        distance,
        centerY + distance * 0.5,
        distance
      );
      controlsRef.current.update();
    }
  };

  const renderDoors = () => {
    const doors = [];
    // Calculate explosion offset (percentage to actual distance)
    const explosionFactor = (explosionDistance / 100) * 2; // Max 2 units explosion

    if (params.type === "door") {
      // Side by side
      const startX =
        -(dimensions.totalWidth / 2) + dimensions.individualWidth / 2;
      const centerX = 0;

      for (let i = 0; i < params.quantity; i++) {
        const baseX = startX + i * (dimensions.individualWidth + params.gap);
        // Calculate explosion offset from center
        const offsetDirection = baseX > centerX ? 1 : baseX < centerX ? -1 : 0;
        const explosionOffset = offsetDirection * explosionFactor;
        const x = baseX;

        doors.push(
          <DoorPanel
            key={i}
            width={dimensions.individualWidth}
            height={dimensions.individualHeight}
            position={[
              inchesToUnits(x) + explosionOffset,
              inchesToUnits(dimensions.totalHeight) / 2,
              explosionFactor * 0.5, // Also move forward slightly for depth effect
            ]}
            stileWidth={dimensions.stileWidth}
            railWidth={dimensions.railWidth}
            routerDepth={params.routerDepth}
            internalExplosion={explosionFactor}
          />
        );
      }
    } else {
      // Stacked drawers; support custom panel heights when provided
      const heights =
        dimensions.panelHeights &&
        dimensions.panelHeights.length === params.quantity
          ? dimensions.panelHeights
          : Array.from(
              { length: params.quantity },
              () => dimensions.individualHeight
            );

      // Compute center y positions top→bottom
      let currentTop = dimensions.totalHeight / 2;
      const centers: number[] = [];
      heights.forEach((h, i) => {
        const center = currentTop - h / 2;
        centers.push(center);
        currentTop = center - h / 2 - (i < heights.length - 1 ? params.gap : 0);
      });

      const stackCenter = centers.reduce((a, b) => a + b, 0) / centers.length;

      for (let i = 0; i < params.quantity; i++) {
        const baseY = centers[i];
        const offsetDirection =
          baseY > stackCenter ? 1 : baseY < stackCenter ? -1 : 0;
        const explosionOffset = offsetDirection * explosionFactor * 0.5;
        const y = baseY;

        doors.push(
          <DoorPanel
            key={i}
            width={dimensions.individualWidth}
            height={heights[i]}
            position={[
              0,
              inchesToUnits(y) + explosionOffset,
              explosionFactor * 0.5,
            ]}
            stileWidth={dimensions.stileWidth}
            railWidth={dimensions.railWidth}
            routerDepth={params.routerDepth}
            internalExplosion={explosionFactor}
          />
        );
      }
    }
    return doors;
  };

  return (
    <div className="w-full h-full bg-preview-bg rounded-lg overflow-hidden relative">
      <Button
        onClick={handleRecenter}
        size="icon"
        variant="secondary"
        className="absolute top-4 right-4 z-10 shadow-lg"
        title="Recenter view"
      >
        <Home />
      </Button>
      <Canvas>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[4, 3, 4]}
          fov={50}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          target={[0, inchesToUnits(dimensions.totalHeight) / 2, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />

        {/* Grid */}
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={15}
          fadeStrength={1}
          position={[0, 0, 0]}
        />

        {/* Cabinet opening */}
        <CabinetOpening
          width={params.openingWidth}
          height={params.openingHeight}
        />

        {/* Doors/Drawers */}
        {renderDoors()}
      </Canvas>
    </div>
  );
};
