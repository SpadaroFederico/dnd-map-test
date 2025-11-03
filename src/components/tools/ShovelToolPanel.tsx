import React from "react";

interface ShovelToolPanelProps {
  terrain: "dirt" | "grass" | "water";
  radius: number;
  setTerrain: (t: "dirt" | "grass" | "water") => void;
  setRadius: (n: number) => void;
}

export default function ShovelToolPanel({
  terrain,
  radius,
  setTerrain,
  setRadius,
}: ShovelToolPanelProps) {
  return (
    <div className="tool-panel-content">
      <h3>Pala</h3>

      <div className="tool-group">
        <label>Tipo Terreno</label>
        <div className="layer-switch">
          {(["dirt", "grass", "water"] as const).map((t) => (
            <button
              key={t}
              className={terrain === t ? "active" : ""}
              onClick={() => setTerrain(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-group">
        <label>Raggio</label>
        <input
          type="range"
          min="10"
          max="200"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
        <span>{radius}px</span>
      </div>

      <p style={{ fontSize: 12, opacity: 0.6 }}>
        Tieni <kbd>Shift</kbd> per cancellare (gomma).
      </p>
    </div>
  );
}
