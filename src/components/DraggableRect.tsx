import { useRef, useState, useEffect } from "react";
import { Rect } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "../store/editStore";

type Tool = "draw" | "select" | "background";

interface DraggableRectProps {
  obj: any;
  isSelected: boolean;
  currentTool: Tool;
  blendedImage: HTMLImageElement | null;
  selectObject: (id: string, multi?: boolean) => void;
  moveObject: (id: string, x: number, y: number) => void;
  setIsDraggingObject: (v: boolean) => void;
}

export default function DraggableRect({
  obj,
  isSelected,
  currentTool,
  blendedImage,
  selectObject,
  moveObject,
  setIsDraggingObject,
}: DraggableRectProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const [dragging, setDragging] = useState(false);
  const [localPos, setLocalPos] = useState({ x: obj.x, y: obj.y });

  // 🔄 Mantiene la posizione locale sincronizzata
  useEffect(() => {
    if (!dragging) {
      setLocalPos({ x: obj.x, y: obj.y });
    }
  }, [obj.x, obj.y, dragging]);

  // ✅ Evita flick post drag
  useEffect(() => {
    if (!dragging) return;
    const dx = Math.abs(obj.x - localPos.x);
    const dy = Math.abs(obj.y - localPos.y);
    if (dx < 0.01 && dy < 0.01) {
      setDragging(false);
    }
  }, [obj.x, obj.y, localPos.x, localPos.y, dragging]);

  return (
    <Rect
      id={obj.id}
      ref={isSelected ? shapeRef : null}
      x={dragging ? localPos.x : obj.x}
      y={dragging ? localPos.y : obj.y}
      width={obj.width}
      height={obj.height}
      fill={obj.color}
      stroke={isSelected ? "#f1c40f" : ""}
      strokeWidth={isSelected ? 4 : 0}
      draggable={currentTool === "select"}
      shadowBlur={obj.shadowBlur}
      shadowColor={"#000000"}
      opacity={obj.opacity}
      visible={obj.visible}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage)
          stage.container().style.cursor =
            currentTool === "select" ? "move" : "not-allowed";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      onMouseDown={(e) => {
        if (currentTool !== "select") return;
        const multi = e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey;
        selectObject(obj.id, multi);
        e.cancelBubble = true;
      }}
      onDragStart={(e) => {
        if (currentTool !== "select") return;

        selectObject(obj.id, e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey);
        setDragging(true);
        setIsDraggingObject(true);
        e.cancelBubble = true;

        const store = useEditorStore.getState();
        const selectedObjects = store.objects.filter((o) =>
          store.selectedIds.includes(o.id)
        );
        const start = e.target.position();

        selectedObjects.forEach((o) => {
          o.__offsetX = o.x - start.x;
          o.__offsetY = o.y - start.y;
        });

        const stage = e.target.getStage();
        if (stage) stage.draggable(false);
      }}
      onDragMove={(e) => {
        if (currentTool !== "select") return;

        const store = useEditorStore.getState();
        const selectedObjects = store.objects.filter((o) =>
          store.selectedIds.includes(o.id)
        );
        const { x, y } = e.target.position();
        const stage = e.target.getStage();

        selectedObjects.forEach((o) => {
          const node = stage?.findOne(`#${o.id}`) as Konva.Rect;
          if (node) {
            node.position({
              x: x + (o.__offsetX ?? 0),
              y: y + (o.__offsetY ?? 0),
            });
          }
        });
      }}
      onDragEnd={(e) => {
        if (currentTool !== "select") return;

        const store = useEditorStore.getState();
        const { selectedIds, objects, moveObject } = store;
        const { x, y } = e.target.position();

        selectedIds.forEach((id) => {
          const o = objects.find((obj) => obj.id === id);
          if (o) moveObject(id, x + (o.__offsetX ?? 0), y + (o.__offsetY ?? 0));
        });

        setDragging(false);
        setIsDraggingObject(false);

        const stage = e.target.getStage();
        if (stage) stage.draggable(false);
      }}
      dragBoundFunc={(pos) => {
        if (!blendedImage) return pos;
        const maxX = blendedImage.width - obj.width;
        const maxY = blendedImage.height - obj.height;
        return {
          x: Math.min(Math.max(pos.x, 0), Math.max(0, maxX)),
          y: Math.min(Math.max(pos.y, 0), Math.max(0, maxY)),
        };
      }}
    />
  );
}
