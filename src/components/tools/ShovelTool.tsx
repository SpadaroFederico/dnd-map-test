import React, { useEffect, useRef, useState } from "react";
import { Layer, Circle } from "react-konva";
import { useEditorStore } from "../../store/editStore";
import Konva from "konva";

interface ShovelToolProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageScale: number;
  radius: number;
  terrain: "dirt" | "grass" | "water";
}

export default function ShovelTool({
  stageRef,
  stageScale,
  radius,
  terrain,
}: ShovelToolProps) {
  const { currentTool } = useEditorStore();
  const [painting, setPainting] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const brushLayerRef = useRef<Konva.Layer | null>(null);

  const colorMap: Record<typeof terrain, string> = {
    dirt: "#8b5a2b",
    grass: "#2ecc71",
    water: "#3498db",
  };

  useEffect(() => {
    console.log("[SHOVEL] currentTool:", currentTool);
  }, [currentTool]);

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

      const isEraseNow = e.evt.shiftKey || eraseMode;
      if (painting) paint(world.x, world.y, isEraseNow);
    };

    const handleDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (currentTool !== "shovel") return;
      const isErase = e.evt.shiftKey;
      setEraseMode(isErase);
      setPainting(true);

      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const world = transform.point(pointer);

      paint(world.x, world.y, isErase);
    };

    const handleUp = () => {
      setPainting(false);
      setEraseMode(false);
    };

    stage.on("mousemove", handleMove);
    stage.on("mousedown", handleDown);
    stage.on("mouseup", handleUp);
    stage.on("mouseleave", handleUp);

    return () => {
      stage.off("mousemove", handleMove);
      stage.off("mousedown", handleDown);
      stage.off("mouseup", handleUp);
      stage.off("mouseleave", handleUp);
    };
  }, [painting, radius, terrain, stageScale, currentTool, eraseMode, stageRef]);

  // 🧹 FIX: eraseMode usa fill pieno, non trasparente
  const paint = (x: number, y: number, erase: boolean) => {
    const layer = brushLayerRef.current;
    if (!layer) return;

    const shape = new Konva.Circle({
      x,
      y,
      radius,
      fill: erase ? "#000000" : colorMap[terrain], // nero opaco per gomma
      opacity: erase ? 1 : 0.8,
      listening: false,
      globalCompositeOperation: erase ? "destination-out" : "source-over",
    });

    layer.add(shape);
    layer.batchDraw();
  };

  if (currentTool !== "shovel") return null;

  return (
    <>
      <Layer ref={brushLayerRef} />
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
