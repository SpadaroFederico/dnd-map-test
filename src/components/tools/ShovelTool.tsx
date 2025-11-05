import React, { useEffect, useRef, useState } from "react";
import { Layer, Circle } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "../../store/editStore";
// import TerrainPainter from "../map/TerrainPainter";

interface ShovelToolProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageScale: number;
  radius: number;
  terrain: "dirt" | "grass" | "water";
  mapWidth: number;
  mapHeight: number;
}

export default function ShovelTool({
  stageRef,
  stageScale,
  radius,
  terrain,
  mapWidth,
  mapHeight,
}: ShovelToolProps) {
  const { currentTool } = useEditorStore();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // aggiorna posizione cursore per il cerchio
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const world = transform.point(pointer);
      setCursorPos(world);
    };

    stage.on("mousemove", handleMove);
    return () => {
      stage.off("mousemove", handleMove);
    };
  }, [stageRef]);

  if (currentTool !== "shovel") return null;

  return (
    <>
      {/* layer principale che gestisce il disegno delle texture
      <TerrainPainter
        stageRef={stageRef}
        stageScale={stageScale}
        radius={radius}
        terrain={terrain}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
      /> */}

      {/* cerchio cursore bianco visibile */}
      <Layer listening={false}>
        <Circle
          x={cursorPos.x}
          y={cursorPos.y}
          radius={radius}
          stroke="#fff"
          strokeWidth={1 / stageScale}
          opacity={0.6}
        />
      </Layer>
    </>
  );
}
