import { useEffect } from "react";
import Konva from "konva";

type Tool = "draw" | "select" | "background";

/**
 * Gestisce lo stato draggable dello Stage in base allo strumento attivo.
 * - Se currentTool = "select" → stage NON draggable
 * - Altrimenti → stage draggable
 */
export function useStageDraggable(
  stageRef: React.RefObject<Konva.Stage | null>,
  currentTool: Tool
) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.draggable(currentTool !== "select");
  }, [stageRef, currentTool]);
}
