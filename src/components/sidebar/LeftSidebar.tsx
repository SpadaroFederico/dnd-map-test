import { useState } from "react";
import {
  FaPaintBrush,
  FaLayerGroup,
  FaTree,
  FaFont,
  FaThLarge,
  FaMountain,
} from "react-icons/fa";
import ToolButton from "./ToolButton";
import ToolPanel from "./ToolPanel";
import BrushTool from "../tools/BrushTool";
import MaskTool from "../tools/MaskTool";
import StampTool from "../tools/StampTool";
import TextTool from "../tools/TextTool";
import GridTool from "../tools/GridTool";
import ShovelToolPanel from "../tools/ShovelToolPanel";
import { useEditorStore } from "../../store/editStore";
import "./LeftSidebar.css";

type ToolType =
  | "brush"
  | "mask"
  | "stamp"
  | "text"
  | "grid"
  | "shovel"
  | null;

export default function LeftSidebar() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const setCurrentTool = useEditorStore((state) => state.setCurrentTool);

  // 🔹 ora presi dallo store
  const terrain = useEditorStore((state) => state.terrain);
  const setTerrain = useEditorStore((state) => state.setTerrain);
  const radius = useEditorStore((state) => state.radius);
  const setRadius = useEditorStore((state) => state.setRadius);

  const toggleTool = (tool: ToolType) => {
    setActiveTool((prev) => {
      const newTool = prev === tool ? null : tool;

      if (["brush", "shovel"].includes(newTool || "")) {
        const mappedTool = newTool === "brush" ? "draw" : newTool;
        setCurrentTool(
          mappedTool as "draw" | "select" | "background" | "shovel" | null
        );
      } else {
        setCurrentTool("select");
      }

      return newTool;
    });
  };

  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar-buttons">
          <ToolButton
            icon={<FaPaintBrush />}
            label="Brush"
            active={activeTool === "brush"}
            onClick={() => toggleTool("brush")}
          />
          <ToolButton
            icon={<FaMountain />}
            label="Shovel"
            active={activeTool === "shovel"}
            onClick={() => toggleTool("shovel")}
          />
          <ToolButton
            icon={<FaLayerGroup />}
            label="Mask"
            active={activeTool === "mask"}
            onClick={() => toggleTool("mask")}
          />
          <ToolButton
            icon={<FaTree />}
            label="Stamp"
            active={activeTool === "stamp"}
            onClick={() => toggleTool("stamp")}
          />
          <ToolButton
            icon={<FaFont />}
            label="Text"
            active={activeTool === "text"}
            onClick={() => toggleTool("text")}
          />
          <ToolButton
            icon={<FaThLarge />}
            label="Grid"
            active={activeTool === "grid"}
            onClick={() => toggleTool("grid")}
          />
        </div>
      </div>

      <ToolPanel activeTool={activeTool}>
        {activeTool === "brush" && <BrushTool />}
        {activeTool === "mask" && <MaskTool />}
        {activeTool === "stamp" && <StampTool />}
        {activeTool === "text" && <TextTool />}
        {activeTool === "grid" && <GridTool />}
        {activeTool === "shovel" && (
          <ShovelToolPanel
            terrain={terrain}
            radius={radius}
            setTerrain={setTerrain}
            setRadius={setRadius}
          />
        )}
      </ToolPanel>
    </>
  );
}
