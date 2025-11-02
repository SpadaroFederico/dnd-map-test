import { useState } from "react";
import { FaPaintBrush, FaLayerGroup, FaTree, FaFont, FaThLarge } from "react-icons/fa";
import ToolButton from "./ToolButton";
import ToolPanel from "./ToolPanel";
import BrushTool from "../tools/BrushTool";
import MaskTool from "../tools/MaskTool";
import StampTool from "../tools/StampTool";
import TextTool from "../tools/TextTool";
import GridTool from "../tools/GridTool";
import "./LeftSidebar.css";

type ToolType = "brush" | "mask" | "stamp" | "text" | "grid" | null;

export default function LeftSidebar() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);

  const toggleTool = (tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar-buttons">
          <ToolButton icon={<FaPaintBrush />} label="Brush" active={activeTool === "brush"} onClick={() => toggleTool("brush")} />
          <ToolButton icon={<FaLayerGroup />} label="Mask" active={activeTool === "mask"} onClick={() => toggleTool("mask")} />
          <ToolButton icon={<FaTree />} label="Stamp" active={activeTool === "stamp"} onClick={() => toggleTool("stamp")} />
          <ToolButton icon={<FaFont />} label="Text" active={activeTool === "text"} onClick={() => toggleTool("text")} />
          <ToolButton icon={<FaThLarge />} label="Grid" active={activeTool === "grid"} onClick={() => toggleTool("grid")} />
        </div>
      </div>

      <ToolPanel activeTool={activeTool}>
        {activeTool === "brush" && <BrushTool />}
        {activeTool === "mask" && <MaskTool />}
        {activeTool === "stamp" && <StampTool />}
        {activeTool === "text" && <TextTool />}
        {activeTool === "grid" && <GridTool />}
      </ToolPanel>
    </>
  );
}
