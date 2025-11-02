import React, { useState } from "react";
import "./ToolCommon.css";

export default function GridTool() {
  const [showGrid, setShowGrid] = useState(true);
  const [columns, setColumns] = useState(40);
  const [rows, setRows] = useState(30);
  const [color, setColor] = useState("#555555");
  const [width, setWidth] = useState(1);

  return (
    <div className="tool-panel-content">
      <h3>Grid Options</h3>

      <div className="tool-group">
        <label>
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)}/>
          Show Grid
        </label>
      </div>

      <div className="tool-group">
        <label>Columns</label>
        <input type="number" min="1" max="100" value={columns} onChange={(e) => setColumns(Number(e.target.value))}/>
      </div>

      <div className="tool-group">
        <label>Rows</label>
        <input type="number" min="1" max="100" value={rows} onChange={(e) => setRows(Number(e.target.value))}/>
      </div>

      <div className="tool-group">
        <label>Color</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
      </div>

      <div className="tool-group">
        <label>Line Width</label>
        <input type="range" min="0.5" max="5" step="0.5" value={width} onChange={(e) => setWidth(Number(e.target.value))}/>
        <span>{width}px</span>
      </div>
    </div>
  );
}
