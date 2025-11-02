import React from "react";
import "./ToolPanel.css";

interface ToolPanelProps {
  activeTool: string | null;
  children: React.ReactNode;
}

export default function ToolPanel({ activeTool, children }: ToolPanelProps) {
  return (
    <div className={`tool-panel ${activeTool ? "open" : ""}`}>
      {children}
    </div>
  );
}
