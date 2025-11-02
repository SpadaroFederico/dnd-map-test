import React, { useState } from "react";
import "./ToolCommon.css";

export default function BrushTool() {
  const [layer, setLayer] = useState("background");
  const [brushSize, setBrushSize] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [softness, setSoftness] = useState(100);

  return (
    <div className="tool-panel-content">
      <h3>Brush Tool</h3>

      <div className="tool-group">
        <label>Brush Layer</label>
        <div className="layer-switch">
          {["background", "foreground", "top"].map((l) => (
            <button
              key={l}
              className={layer === l ? "active" : ""}
              onClick={() => setLayer(l)}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-group">
        <label>Brush Size</label>
        <input
          type="range"
          min="1"
          max="300"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
        <span>{brushSize}</span>
      </div>

      <div className="tool-group">
        <label>Opacity</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
        <span>{opacity}%</span>
      </div>

      <div className="tool-group">
        <label>Softness</label>
        <input
          type="range"
          min="0"
          max="100"
          value={softness}
          onChange={(e) => setSoftness(Number(e.target.value))}
        />
        <span>{softness}%</span>
      </div>
    </div>
  );
}
