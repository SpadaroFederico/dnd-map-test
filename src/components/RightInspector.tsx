import "./ui/fantasy-ui.css";
import { useEditorStore } from "../store/editStore";

type MapObject = {
  id: string;
  x: number; y: number; width: number; height: number;
  color: string; rotation: number; opacity: number;
  shadowBlur: number; shadowColor: string;
  visible: boolean; layer: number;
};

export default function RightInspector(){
  const { objects, selectedId } = useEditorStore();
  const selected = objects.find(o => o.id === selectedId) as MapObject | undefined;

  return (
    <aside className="f-ui-panel f-ui-right">
      <div className="f-ui-head">
        <div>
          <div className="f-ui-title">📐 Inspector</div>
          <div className="f-ui-sub">Proprietà di oggetti, layer e mappa</div>
        </div>
      </div>

      <div className="f-ui-body">
        {/* OGGETTO */}
        <div className="f-section">
          <div className="f-sec-title">Oggetto selezionato</div>
          {!selected ? (
            <div style={{color:"#7a6a55"}}>Nessun oggetto selezionato.</div>
          ) : (
            <>
              <div className="f-kv"><label>ID</label><input className="f-inp" value={selected.id} disabled/></div>
              <div className="f-kv"><label>Nome</label><input className="f-inp" placeholder="(facoltativo)" disabled/></div>

              <div className="f-kv"><label>Posizione</label>
                <div style={{display:"flex", gap:6}}>
                  <input className="f-inp" value={Math.round(selected.x)} disabled/>
                  <input className="f-inp" value={Math.round(selected.y)} disabled/>
                </div>
              </div>

              <div className="f-kv"><label>Dimensioni</label>
                <div style={{display:"flex", gap:6}}>
                  <input className="f-inp" value={Math.round(selected.width)} disabled/>
                  <input className="f-inp" value={Math.round(selected.height)} disabled/>
                </div>
              </div>

              <div className="f-kv"><label>Rotazione</label><input className="f-inp" value={selected.rotation ?? 0} disabled/></div>
              <div className="f-kv"><label>Opacità</label><input className="f-inp" value={selected.opacity} disabled/></div>

              <div className="f-kv"><label>Colore</label>
                <input type="color" className="f-inp" style={{padding:0,height:36}} value={selected.color} disabled/>
              </div>

              <div className="f-kv"><label>Ombra</label>
                <div style={{display:"flex", gap:6}}>
                  <input className="f-inp" value={selected.shadowBlur} disabled/>
                  <input type="color" className="f-inp" style={{padding:0,height:36}} value={selected.shadowColor} disabled/>
                </div>
              </div>

              <div className="f-kv"><label>Visibile</label>
                <div className="f-switch">
                  <input type="checkbox" checked={selected.visible} disabled/>
                  <span style={{fontSize:12,color:"#6b5a44"}}>(read‑only per ora)</span>
                </div>
              </div>

              <div className="f-kv"><label>Layer</label><input className="f-inp" value={selected.layer} disabled/></div>
            </>
          )}
        </div>

        {/* LAYER */}
        <div className="f-section">
          <div className="f-sec-title">Layer attivo</div>
          <div className="f-kv"><label>Nome</label><input className="f-inp" placeholder="Terreno base" disabled/></div>
          <div className="f-kv"><label>Visibile</label><input type="checkbox" checked readOnly/></div>
          <div className="f-kv"><label>Opacità</label><input className="f-inp" value={"100%"} disabled/></div>
          <div className="f-kv"><label>Fusione</label>
            <select className="f-inp" disabled>
              <option>Normale</option><option>Moltiplica</option><option>Sovrapponi</option>
            </select>
          </div>
        </div>

        {/* MAPPA */}
        <div className="f-section">
          <div className="f-sec-title">Mappa</div>
          <div className="f-kv"><label>Dimensione mondo</label>
            <div style={{display:"flex",gap:6}}>
              <input className="f-inp" value={"5× schermo"} disabled/>
              <input className="f-inp" value={"tile 256"} disabled/>
            </div>
          </div>
          <div className="f-kv"><label>Griglia</label>
            <div className="f-switch"><input type="checkbox" /> <span style={{fontSize:12}}>mostra</span></div>
          </div>
          <div className="f-kv"><label>Seed</label><input className="f-inp" placeholder="(casuale)" disabled/></div>
        </div>

        <div className="f-row" style={{justifyContent:"flex-end"}}>
          <button className="f-btn ghost">Duplica oggetto</button>
          <button className="f-btn">Elimina</button>
        </div>
      </div>
    </aside>
  );
}
