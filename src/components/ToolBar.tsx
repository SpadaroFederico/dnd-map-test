import React from "react";
import { useEditorStore } from "../store/editStore";

interface ToolbarProps {
  currentTool: string | null;
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  tileset: "grass" | "water" | "dirt";
  setTileset: (tileset: "grass" | "water" | "dirt") => void;
}

export default function Toolbar({
  currentTool,
  showGrid,
  setShowGrid,
  tileset,
  setTileset,
}: ToolbarProps) {
  return (
    <>
      {/* Toolbar principale */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 300,
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => useEditorStore.getState().setTool("draw")}
          style={{
            padding: "8px 14px",
            background: currentTool === "draw" ? "#2ecc71" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Disegna
        </button>

        <button
          onClick={() => useEditorStore.getState().setTool("select")}
          style={{
            padding: "8px 14px",
            background: currentTool === "select" ? "#3498db" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Seleziona
        </button>
      </div>

      {/* Toggle griglia */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        style={{
          marginLeft: 500,
          padding: "8px 14px",
          background: showGrid ? "#f39c12" : "#555",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {showGrid ? "Nascondi griglia" : "Mostra griglia"}
      </button>

      {/* Tileset switcher */}
      <div style={{ display: "flex", gap: "8px", marginLeft: "600px" }}>
        <button
          onClick={() => setTileset("dirt")}
          style={{
            padding: "8px 14px",
            background: tileset === "dirt" ? "#8e6e53" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Terra
        </button>
        <button
          onClick={() => setTileset("grass")}
          style={{
            padding: "8px 14px",
            background: tileset === "grass" ? "#27ae60" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Erba
        </button>
        <button
          onClick={() => setTileset("water")}
          style={{
            padding: "8px 14px",
            background: tileset === "water" ? "#2980b9" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Acqua
        </button>
      </div>
    </>
  );
}
