import React from "react";
import { useEditorStore } from "../../store/editStore";
import {
  FaBezierCurve,
  FaCircle,
  FaThLarge,
  FaPlus,
  FaMinus,
  FaMask,
} from "react-icons/fa";


type Props = {
  terrain: "dirt" | "grass" | "water";
  radius: number;
  setTerrain: (t: "dirt" | "grass" | "water") => void;
  setRadius: (r: number) => void;
};

export default function ShovelToolPanel({
  terrain,
  radius,
  setTerrain,
  setRadius,
}: Props) {
  const {
    brushShape,
    setBrushShape,
    roughness,
    setRoughness,
    maskEnabled,
    setMaskEnabled,
    actionMode,
    setActionMode,
  } = useEditorStore();

  return (
    <div className="shovel-panel">
      <h4>Shovel Settings</h4>

      {/* modalità di azione */}
      <div className="panel-group">
        <label>Mode</label>
        <div className="panel-row">
          <button
            className={actionMode === "add" ? "active" : ""}
            onClick={() => setActionMode("add")}
            title="Add terrain"
          >
            <FaPlus /> Add
          </button>
          <button
            className={actionMode === "subtract" ? "active" : ""}
            onClick={() => setActionMode("subtract")}
            title="Remove terrain"
          >
            <FaMinus /> Subtract
          </button>
        </div>
      </div>

      {/* grandezza pennello */}
      <div className="panel-group">
        <label>Brush Size: {radius}</label>
        <input
          type="range"
          min={8}
          max={400}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
      </div>

      {/* forma pennello */}
      <div className="panel-group">
        <label>Brush Shape</label>
        <div className="panel-row">
          <button
            className={brushShape === "irregular" ? "active" : ""}
            onClick={() => setBrushShape("irregular")}
            title="Irregular edges"
          >
            <FaBezierCurve />
          </button>
          <button
            className={brushShape === "circle" ? "active" : ""}
            onClick={() => setBrushShape("circle")}
            title="Circular brush"
          >
            <FaCircle />
          </button>
          <button
            className={brushShape === "tile" ? "active" : ""}
            onClick={() => setBrushShape("tile")}
            title="Tile mode"
          >
            <FaThLarge />
          </button>
        </div>
      </div>

      {/* roughness solo per irregolare */}
      {brushShape === "irregular" && (
        <div className="panel-group">
          <label>Roughness: {roughness}</label>
          <input
            type="range"
            min={1}
            max={40} // compatibile con Inkarnate (38-40)
            step={1}
            value={roughness}
            onChange={(e) => setRoughness(Number(e.target.value))}
          />
        </div>
      )}

      {/* mask effect */}
      <div className="panel-group">
        <label className="mask-toggle">
          <input
            type="checkbox"
            checked={maskEnabled}
            onChange={(e) => setMaskEnabled(e.target.checked)}
          />
          <FaMask style={{ marginRight: 6 }} />
          Enable Mask Effect
        </label>
      </div>

      {/* tipo terreno */}
      <div className="panel-group">
        <label>Terrain Type</label>
        <div className="panel-row">
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
    </div>
  );
}
