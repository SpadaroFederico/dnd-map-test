import { useRef, useEffect, useState } from "react";
import Konva from "konva";
import { useEditorStore } from "./store/editStore";

import LeftSidebar from "./components/sidebar/LeftSidebar";
import RightInspector from "./components/RightInspector";
import Toolbar from "./components/ToolBar";
import MapCanvas from "./components/map/MapCanvas";

import { useMapHooks } from "./hooks/useMapHooks";
import { useTerrain } from "./hooks/useTerrain";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTransformerSync } from "./hooks/useTransformerSync";
import { useStageDraggable } from "./hooks/useStageDraggable";

import "./components/ui/fantasy-ui.css";

// =========================
// Costanti di configurazione
// =========================
const INITIAL_FIT = 0.5;
const PAN_PADDING = 200;
const MIN_SCALE = 0.3;
const MAX_SCALE = 5;

type Tool = "draw" | "select" | "background";

export default function App() {
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const { selectedId, selectedIds, currentTool, objects } = useEditorStore();

  // 🌍 Hook terreno
  const { blendedImage, tileset, setTileset } = useTerrain("dirt");

  // 🧩 Stati UI locali
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [isManualPan, setIsManualPan] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(250);

  // 🗺️ Hook mappa
  const {
    stageScale,
    setStageScale,
    stagePos,
    setStagePos,
    handleWheel,
    clampPosition,
    applyFit,
  } = useMapHooks({
    blendedImage,
    MIN_SCALE,
    MAX_SCALE,
    PAN_PADDING,
    INITIAL_FIT,
  });

  // 🧭 Fit iniziale
  useEffect(() => {
    if (!blendedImage) return;
    applyFit();
    const onResize = () => applyFit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [blendedImage]);

  // 🔄 Sincronizzazione Transformer
  useTransformerSync(transformerRef, selectedIds, objects);

  // ⌨️ Scorciatoie da tastiera globali
  useKeyboardShortcuts();

  // 🖱️ Gestione drag dello stage in base allo strumento
  useStageDraggable(stageRef, currentTool as Tool);

  // =========================
  // Render
  // =========================
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1e1e1e" }}>
      {/* Sidebar sinistra */}
      <LeftSidebar />

      {/* Toolbar superiore */}
      <Toolbar
        currentTool={currentTool}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        tileset={tileset}
        setTileset={setTileset}
      />

      <LeftSidebar />

      {/* Mappa principale */}
      <MapCanvas />

      {/* Inspector laterale */}
      {selectedId && <RightInspector />}
    </div>
  );
}
