import React, { useState } from "react";
import "./ToolCommon.css";

export default function TextTool() {
  const [font, setFont] = useState("IM Fell English SC");
  const [size, setSize] = useState(24);
  const [color, setColor] = useState("#ffffff");
  const [outline, setOutline] = useState(true);

  return (
    <div className="tool-panel-content">
      <h3>Text Tool</h3>

      <div className="tool-group">
        <label>Font</label>
        <select value={font} onChange={(e) => setFont(e.target.value)}>
          <option>IM Fell English SC</option>
          <option>Roboto</option>
          <option>Playfair Display</option>
        </select>
      </div>

      <div className="tool-group">
        <label>Size</label>
        <input type="range" min="8" max="72" value={size} onChange={(e) => setSize(Number(e.target.value))}/>
        <span>{size}px</span>
      </div>

      <div className="tool-group">
        <label>Color</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
      </div>

      <div className="tool-group">
        <label>
          <input type="checkbox" checked={outline} onChange={(e) => setOutline(e.target.checked)}/> Outline
        </label>
      </div>
    </div>
  );
}
