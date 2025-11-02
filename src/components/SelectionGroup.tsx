import { useRef } from "react";
import { Group, Rect } from "react-konva";
import Konva from "konva";

interface SelectionGroupProps {
  selectedIds: string[];
  objects: any[];
  moveObject: (id: string, x: number, y: number) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function SelectionGroup({
  selectedIds,
  objects,
  moveObject,
  stageRef,
}: SelectionGroupProps) {
  if (selectedIds.length <= 1) return null;

  const groupRef = useRef<Konva.Group>(null);
  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));

  const bounds = {
    x: Math.min(...selectedObjects.map((o) => o.x)),
    y: Math.min(...selectedObjects.map((o) => o.y)),
    w:
      Math.max(...selectedObjects.map((o) => o.x + o.width)) -
      Math.min(...selectedObjects.map((o) => o.x)),
    h:
      Math.max(...selectedObjects.map((o) => o.y + o.height)) -
      Math.min(...selectedObjects.map((o) => o.y)),
  };

  return (
    <Group
      ref={groupRef}
      x={bounds.x}
      y={bounds.y}
      draggable
      onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
        const { x, y } = e.target.position();
        const dx = x - bounds.x;
        const dy = y - bounds.y;
        const stage = stageRef.current;
        if (!stage) return;

        selectedObjects.forEach((o) => {
          const node = stage.findOne(`#${o.id}`) as Konva.Rect;
          if (node) node.position({ x: o.x + dx, y: o.y + dy });
        });
      }}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        const { x, y } = e.target.position();
        const dx = x - bounds.x;
        const dy = y - bounds.y;
        selectedObjects.forEach((o) => {
          moveObject(o.id, o.x + dx, o.y + dy);
        });
      }}
    >
      {/* hitbox invisibile per il drag di gruppo */}
      <Rect
        x={0}
        y={0}
        width={bounds.w}
        height={bounds.h}
        fill="rgba(0,0,0,0)"
        listening={true}
      />
    </Group>
  );
}
