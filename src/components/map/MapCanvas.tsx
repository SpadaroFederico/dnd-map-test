import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "../../store/editStore";
import { useMapHooks } from "../../hooks/useMapHooks";
import { useStageDraggable } from "../../hooks/useStageDraggable";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import TerrainLayer from "./TerrainLayer";
import TerrainPainter from "./TerrainPainter";
import { createTileMap, Tile } from "../../utils/TileMap";

export default function MapCanvas() {
  const stageRef = useRef<Konva.Stage | null>(null);

  // 🔹 recupera tool e background dallo store
  const { currentTool, background } = useEditorStore();

  const tileSize = 256;
  const tilesWide = 30;
  const tilesHigh = 20;

  // Stato delle tile
  const [tiles, setTiles] = useState<Tile[][]>(() =>
    createTileMap(tilesWide, tilesHigh, "grass")
  );

  // Stato per effetto fade
  const [fadeOpacity, setFadeOpacity] = useState(1);

  // Zoom e pan (usa hook già esistente)
  const {
    stageScale,
    setStageScale,
    stagePos,
    setStagePos,
    handleWheel,
    clampPosition,
    applyFit,
  } = useMapHooks({
    blendedImage: null,
    MIN_SCALE: 0.3,
    MAX_SCALE: 5,
    PAN_PADDING: 200,
    INITIAL_FIT: 0.7,
  });

  // Drag stage in base allo strumento
  useStageDraggable(stageRef, (currentTool ?? "select") as any);

  // Shortcut globali
  useKeyboardShortcuts();

  // Fit iniziale
  useEffect(() => {
    applyFit();
    window.addEventListener("resize", applyFit);
    return () => window.removeEventListener("resize", applyFit);
  }, []);

  // 🔹 Effetto fade al cambio sfondo
  useEffect(() => {
    setFadeOpacity(0); // fade out
    const t1 = setTimeout(() => {
      setFadeOpacity(1); // fade in dopo 200ms
    }, 200);
    return () => clearTimeout(t1);
  }, [background]);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      x={stagePos.x}
      y={stagePos.y}
      scaleX={stageScale}
      scaleY={stageScale}
      draggable={false}
      onWheel={handleWheel}
      dragBoundFunc={clampPosition}
      style={{ background: "#222" }}
    >
      {/* Layer principale del terreno */}
      <TerrainLayer 
        mapWidth={7680} 
        mapHeight={5120} 
        tileSize={256} 
      />


      {/* Strumento pennello/pala */}
      <TerrainPainter
        stageRef={stageRef}
        tiles={tiles}
        setTiles={setTiles}
        tileSize={tileSize}
      />
    </Stage>
  );
}
