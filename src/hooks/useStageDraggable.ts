import { useEffect } from "react";
import Konva from "konva";

type Tool = "draw" | "select" | "background" | "shovel" | "stamp";

/**
 * Gestisce lo spostamento (pan) dello stage con CTRL o tasto centrale.
 */
export function useStageDraggable(
  stageRef: React.RefObject<Konva.Stage | null>,
  currentTool: Tool
) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const isMiddleClick = e.evt.button === 1;
      const isCtrlClick = e.evt.ctrlKey;

      // Attiva pan solo se premo CTRL o tasto centrale
      if (isMiddleClick || isCtrlClick) {
        stage.draggable(true);
        container.style.cursor = "grabbing";
      } else {
        stage.draggable(false);
        container.style.cursor = "default";
      }
    };

    const handleMouseUp = () => {
      stage.draggable(false);
      container.style.cursor = "default";
    };

    // Attiva/disattiva cursore in base allo strumento
    if (currentTool === "select" || currentTool === "background") {
      stage.draggable(false);
      container.style.cursor = "default";
    }

    // Usa eventi di Konva, non del DOM!
    stage.on("mousedown", handleMouseDown);
    stage.on("mouseup", handleMouseUp);

    return () => {
      stage.off("mousedown", handleMouseDown);
      stage.off("mouseup", handleMouseUp);
    };
  }, [stageRef, currentTool]);
}
