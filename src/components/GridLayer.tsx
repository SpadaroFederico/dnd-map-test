import { Layer, Rect } from "react-konva";
import React from "react";

interface GridLayerProps {
  showGrid: boolean;
  blendedImage: HTMLImageElement | null;
  gridSize: number;
  stageScale: number;
}

export default function GridLayer({
  showGrid,
  blendedImage,
  gridSize,
  stageScale,
}: GridLayerProps) {
  if (!showGrid || !blendedImage) return null;

  const verticalLines = Array.from(
    { length: Math.ceil(blendedImage.width / gridSize) + 1 },
    (_, i) => (
      <Rect
        key={`v-${i}`}
        x={i * gridSize}
        y={0}
        width={10}
        height={blendedImage.height}
        fill={`rgba(0, 0, 0, ${Math.max(0.15, 0.45 / stageScale)})`}
      />
    )
  );

  const horizontalLines = Array.from(
    { length: Math.ceil(blendedImage.height / gridSize) + 1 },
    (_, j) => (
      <Rect
        key={`h-${j}`}
        x={0}
        y={j * gridSize}
        width={blendedImage.width}
        height={10}
        fill="rgba(0, 0, 0, 0.35)"
      />
    )
  );

  return (
    <Layer listening={false}>
      {verticalLines}
      {horizontalLines}
    </Layer>
  );
}
