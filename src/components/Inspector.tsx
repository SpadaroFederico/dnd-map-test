import React from "react";
import { useEditorStore } from "../store/editStore";

export const Inspector: React.FC = () => {
  const { objects, selectedId } = useEditorStore();
  const selected = objects.find((o) => o.id === selectedId);

  if (!selected) {
    return (
      <div
        style={{
          padding: "12px",
          color: "#aaa",
          fontStyle: "italic",
        }}
      >
        Nessun oggetto selezionato.
      </div>
    );
  }

  const updateProperty = (prop: keyof typeof selected, value: number) => {
    useEditorStore.setState((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === selected.id ? { ...obj, [prop]: value } : obj
      ),
    }));
  };

  return (
    <div
      style={{
        width: "250px",
        background: "#222",
        color: "#fff",
        padding: "12px",
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        borderLeft: "1px solid #333",
        fontFamily: "monospace",
        overflowY: "auto",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          borderBottom: "1px solid #444",
          paddingBottom: "6px",
        }}
      >
        Proprietà
      </h3>

      <div style={{ marginBottom: "12px" }}>
        <strong>ID:</strong> {selected.id}
      </div>

    <label>X:</label>
    <input
        type="number"
        value={selected.x}
        onChange={(e) => updateProperty("x", Number(e.target.value))}
    />

    <label>Y:</label>
    <input
        type="number"
        value={selected.y}
        onChange={(e) => updateProperty("y", Number(e.target.value))}
    />

    <label>Larghezza:</label>
    <input
        type="number"
        value={selected.width}
        onChange={(e) => updateProperty("width", Number(e.target.value))}
    />

    <label>Altezza:</label>
    <input
        type="number"
        value={selected.height}
        onChange={(e) => updateProperty("height", Number(e.target.value))}
    />

    <label>Rotazione:</label>
    <input
        type="number"
        value={selected.rotation ?? 0}
        onChange={(e) => updateProperty("rotation", Number(e.target.value))}
    />

    <label>Opacità:</label>
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={selected.opacity}
      onChange={(e) => updateProperty("opacity", Number(e.target.value))}
    />

    <label>Luminosità:</label>
    <input
      type="range"
      min="0.5"
      max="1.5"
      step="0.05"
      value={selected.brightness}
      onChange={(e) => updateProperty("brightness", Number(e.target.value))}
    />

    <label>Ombra:</label>
    <input
      type="range"
      min="0"
      max="20"
      value={selected.shadowBlur}
      onChange={(e) => updateProperty("shadowBlur", Number(e.target.value))}
    />

    <label>Colore ombra:</label>
    <input
      type="color"
      value={selected.shadowColor}
      onChange={(e) => updateProperty("shadowColor", e.target.value as any)}
    />

    <label>
    <input
        type="checkbox"
        checked={selected.visible}
        onChange={(e) => updateProperty("visible", e.target.checked ? 1 : 0)}
    />
    Visibile
    </label>

    <hr />

    <button
    onClick={() =>
        useEditorStore.setState((state) => ({
        objects: state.objects.filter((obj) => obj.id !== selected.id),
        selectedId: null,
        }))
    }
    style={{
        marginTop: "10px",
        padding: "8px 14px",
        width: "100%",
        background: "#e74c3c",
        border: "none",
        color: "white",
        cursor: "pointer",
        borderRadius: "6px",
    }}
    >
    🗑️ Elimina oggetto
    </button>
    </div>
  );
};
