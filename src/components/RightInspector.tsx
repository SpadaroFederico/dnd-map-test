import "./ui/fantasy-ui.css";
import { useEditorStore } from "../store/editStore";
import { useEffect, useState } from "react";
import { FaTimes, FaTrashAlt, FaClone } from "react-icons/fa";

type MapObject = {
  id: string;
  x: number; y: number; width: number; height: number;
  color: string; rotation: number; opacity: number;
  shadowBlur: number; shadowColor: string;
  visible: boolean; layer: number;
};

export default function RightInspector() {
  const { objects, selectedId } = useEditorStore();
  const selected = objects.find(o => o.id === selectedId) as MapObject | undefined;
  const [visible, setVisible] = useState(true);

  // ESC per chiudere il pannello
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "i") setVisible(v => !v);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!visible) {
    return (
      <button
        className="f-ui-inspector-toggle"
        onClick={() => setVisible(true)}
        title="Apri Inspector (I)"
      >
        🧭
      </button>
    );
  }

  return (
    <aside className="f-ui-panel f-ui-right enhanced">
      <div className="f-ui-head compact">
        <div>
          <div className="f-ui-title">📜 Inspector</div>
          <div className="f-ui-sub">Oggetto selezionato</div>
        </div>
        <button className="f-ui-close" onClick={() => setVisible(false)}>
          <FaTimes />
        </button>
      </div>

      <div className="f-ui-body slim">
        {!selected ? (
          <div style={{ color: "#9b8c74", textAlign: "center", marginTop: 20 }}>
            Nessun oggetto selezionato.
            <br />
            <small>(clicca un elemento o disegna uno nuovo)</small>
          </div>
        ) : (
          <>
            <div className="f-section small">
              <div className="f-kv">
                <label>ID</label>
                <input className="f-inp small" value={selected.id} disabled />
              </div>

              <div className="f-kv">
                <label>Posizione</label>
                <div className="f-row-2">
                  <input className="f-inp small" value={Math.round(selected.x)} disabled />
                  <input className="f-inp small" value={Math.round(selected.y)} disabled />
                </div>
              </div>

              <div className="f-kv">
                <label>Dimensioni</label>
                <div className="f-row-2">
                  <input className="f-inp small" value={Math.round(selected.width)} disabled />
                  <input className="f-inp small" value={Math.round(selected.height)} disabled />
                </div>
              </div>

              <div className="f-kv">
                <label>Opacità</label>
                <input className="f-inp small" value={selected.opacity} disabled />
              </div>

              <div className="f-kv">
                <label>Colore</label>
                <input
                  type="color"
                  className="f-inp"
                  style={{ padding: 0, height: 30 }}
                  value={selected.color}
                  disabled
                />
              </div>
            </div>

            <div className="f-row buttons">
              <button
                className="f-btn ghost"
                disabled={!selected}
                title="Duplica oggetto (Ctrl+D)"
              >
                <FaClone />
              </button>
              <button
                className="f-btn danger"
                disabled={!selected}
                onClick={() => useEditorStore.getState().deleteSelectedObject()}
                title="Elimina oggetto (Del)"
              >
                <FaTrashAlt />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
