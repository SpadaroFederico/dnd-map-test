import React from "react";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export default function ToolButton({ icon, label, active, onClick }: ToolButtonProps) {
  return (
    <button
      className={`tool-button ${active ? "active" : ""}`}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  );
}
