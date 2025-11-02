import React, { useState } from "react";
import "./ToolCommon.css";

export default function MaskTool() {
  const [mode, setMode] = useState("add");
  const [brushSize, setBrushSize] = useState(100);
  const [roughness, setRoughness] = useState(8);
  const [smooth, setSmooth] = useState(true);

  return (
    <div className="tool-panel-content">
      <h3>Mask Tool</h3>

      <div className="tool-group">
        <label>Action</label>
        <div className="layer-switch">
          <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>+ Add</button>
          <button className={mode === "subtract" ? "active" : ""} onClick={() => setMode("subtract")}>– Subtract</button>
        </div>
      </div>

      <div className="tool-group">
        <label>Brush Size</label>
        <input type="range" min="1" max="300" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}/>
        <span>{brushSize}</span>
      </div>

      <div className="tool-group">
        <label>Roughness</label>
        <input type="number" min="1" max="20" value={roughness} onChange={(e) => setRoughness(Number(e.target.value))}/>
      </div>

      <div className="tool-group">
        <label>
          <input type="checkbox" checked={smooth} onChange={(e) => setSmooth(e.target.checked)}/>
          Smooth
        </label>
      </div>
    </div>
  );
}
