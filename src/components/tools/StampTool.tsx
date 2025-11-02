import React, { useState } from "react";
import "./ToolCommon.css";

export default function StampTool() {
  const [scale, setScale] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [layer, setLayer] = useState(0);

  return (
    <div className="tool-panel-content">
      <h3>Stamp Tool</h3>

      <div className="tool-group">
        <label>Stamp Scale</label>
        <input type="range" min="10" max="200" value={scale} onChange={(e) => setScale(Number(e.target.value))}/>
        <span>{scale}%</span>
      </div>

      <div className="tool-group">
        <label>Opacity</label>
        <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}/>
        <span>{opacity}%</span>
      </div>

      <div className="tool-group">
        <label>Rotation</label>
        <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(Number(e.target.value))}/>
        <span>{rotation}°</span>
      </div>

      <div className="tool-group">
        <label>Layer</label>
        <input type="number" min="0" max="10" value={layer} onChange={(e) => setLayer(Number(e.target.value))}/>
      </div>
    </div>
  );
}
