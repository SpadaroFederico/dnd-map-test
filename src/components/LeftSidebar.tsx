import { useState } from "react";
import { useEditorStore } from "../store/editStore";
import "./ui/fantasy-ui.css";

type Tab = "Terreni" | "Pennelli" | "Libreria";

const terrainList = [
  { key: "grass",  label: "Erba",    emoji: "🌿" },
  { key: "sand",   label: "Sabbia",  emoji: "🏖️" },
  { key: "rock",   label: "Roccia",  emoji: "🪨" },
  { key: "dirt",   label: "Terra",   emoji: "🧱" },
  { key: "snow",   label: "Neve",    emoji: "❄️" },
  { key: "water",  label: "Acqua",   emoji: "🌊" },
];

export default function LeftSidebar(){
  const [tab, setTab] = useState<Tab>("Terreni");
  const currentTool = useEditorStore(s => s.currentTool);

  return (
    <aside className="f-ui-panel f-ui-left">
      <div className="f-ui-head">
        <div>
          <div className="f-ui-title">🧭 Palette</div>
          <div className="f-ui-sub">Terreni, pennelli e risorse</div>
        </div>
        <div className="f-tabs">
          {(["Terreni","Pennelli","Libreria"] as Tab[]).map(t => (
            <button
              key={t}
              className={`f-tab ${tab===t?"active":""}`}
              onClick={()=>setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="f-ui-body">
        {tab === "Terreni" && (
          <>
            <div className="f-section">
              <div className="f-sec-title">Tipi di terreno</div>
              <div className="f-chips">
                {terrainList.map(t => (
                  <div key={t.key} className="f-chip">
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="f-section">
              <div className="f-sec-title">Varianti (anteprime)</div>
              <div className="f-grid">
                {/* Anteprime finte: sostituisci con /assets/tiles/xxx se vuoi */}
                {Array.from({length:9},(_,i)=>i+1).map(n => (
                  <div key={n} className="f-thumb" style={{
                    backgroundImage: `url(/assets/tiles/grass_${Math.min(n,9)}.png)`
                  }}/>
                ))}
              </div>
            </div>

            <div className="f-section">
              <div className="f-sec-title">Livelli terreno</div>
              <div className="f-row">
                <button className="f-btn">+ Aggiungi livello</button>
                <button className="f-btn ghost">🗑 Elimina</button>
                <button className="f-btn ghost">⬆ Su</button>
                <button className="f-btn ghost">⬇ Giù</button>
              </div>
              <div className="f-row">
                <label className="f-sec-title" style={{margin:0}}>Opacità</label>
                <input type="range" min={0} max={1} step={0.01} defaultValue={1}/>
              </div>
              <div className="f-row">
                <label className="f-sec-title" style={{margin:0}}>Fusione</label>
                <select className="f-sel" defaultValue="normal" disabled>
                  <option value="normal">Normale</option>
                  <option value="multiply">Moltiplica</option>
                  <option value="overlay">Sovrapponi</option>
                  <option value="soft-light">Luce soffusa</option>
                </select>
              </div>
            </div>
          </>
        )}

        {tab === "Pennelli" && (
          <>
            <div className="f-section">
              <div className="f-sec-title">Strumento</div>
              <div className="f-chips">
                <div className={`f-chip ${currentTool==="draw"?"active":""}`} onClick={() => useEditorStore.getState().setTool("draw")}>🖌 Pennello</div>
                <div className={`f-chip ${currentTool==="select"?"active":""}`} onClick={() => useEditorStore.getState().setTool("select")}>🖱 Seleziona</div>
                <div className="f-chip">🧽 Cancellino</div>
                <div className="f-chip">🪣 Riempimento</div>
              </div>
            </div>

            <div className="f-section">
              <div className="f-sec-title">Impostazioni pennello</div>
              <div className="f-row">
                <span>Dimensione</span>
                <input type="range" min={1} max={300} defaultValue={120}/>
              </div>
              <div className="f-row">
                <span>Morbidezza</span>
                <input type="range" min={0} max={1} step={0.01} defaultValue={0.45}/>
              </div>
              <div className="f-row">
                <span>Opacità</span>
                <input type="range" min={0} max={1} step={0.01} defaultValue={1}/>
              </div>
              <div className="f-row">
                <span>Variazione</span>
                <input type="range" min={0} max={1} step={0.01} defaultValue={0.3}/>
              </div>
              <div className="f-row">
                <span>Colore</span>
                <input type="color" defaultValue="#2ecc71"/>
              </div>
            </div>

            <div className="f-section">
              <div className="f-sec-title">Snap & griglia</div>
              <div className="f-row"><span>Mostra griglia</span><input type="checkbox" /></div>
              <div className="f-row"><span>Snap alla griglia</span><input type="checkbox" /></div>
              <div className="f-row">
                <span>Dimensione griglia</span>
                <input type="range" min={16} max={512} defaultValue={64}/>
              </div>
            </div>
          </>
        )}

        {tab === "Libreria" && (
          <>
            <div className="f-section">
              <div className="f-sec-title">Pack di risorse</div>
              <div className="f-chips">
                <div className="f-chip">🌲 Foresta</div>
                <div className="f-chip">⛰ Montagna</div>
                <div className="f-chip">🏚 Rovine</div>
                <div className="f-chip">🏘 Villaggi</div>
              </div>
            </div>
            <div className="f-section">
              <div className="f-sec-title">Anteprime</div>
              <div className="f-grid">
                {Array.from({length:6},(_,i)=>i+1).map(n => (
                  <div key={n} className="f-thumb" style={{backgroundImage: `radial-gradient(#c9c19c, #9aa57c)`}} />
                ))}
              </div>
              <div style={{marginTop:8, display:'flex', gap:8}}>
                <button className="f-btn">+ Importa PNG</button>
                <button className="f-btn ghost">Crea cartella</button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
