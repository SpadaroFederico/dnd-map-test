import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from "react-konva";
import { useEditorStore } from "./store/editStore";
import { useRef, useEffect, useState } from "react";
import LeftSidebar from "./components/LeftSidebar";
import RightInspector from "./components/RightInspector";
import "./components/ui/fantasy-ui.css";

import Konva from "konva";
import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

/** =========================
 *  Parametri “di mondo”
 *  ========================= */
const TILE_SIZE = 256;         // dimensione tile base (coerente con i PNG)
const WORLD_SCALE = 6;         // quante volte lo schermo (larghezza/altezza) è il mondo
const INITIAL_FIT = 0.5;      // quanto zoom-out all’avvio (0.85 = mostra “tutto + margine”)

const PAN_PADDING = 200;       // margine ai bordi quando il mondo è > viewport
const MIN_SCALE = 0.3;         // limite di sicurezza (sostituito al runtime dal fit iniziale)
const MAX_SCALE = 5;

type Vec2 = { x: number; y: number };

// FIX: alias tool allineato col tuo store (include "background")
type Tool = "draw" | "select" | "background";

// === Tileset di sfondo (default) ===
const DEFAULT_TILESET = "dirt" as const; // "dirt" | "grass"
const TILE_COUNT = 15;
const TILE_PREFIX = {
  grass: "grass",
  dirt: "dirt_stylized_rock", 
  water: "water",
} as const;

type TilesetType = keyof typeof TILE_PREFIX;

/** Loader immagine robusto: se fallisce, ritorna null senza rompere */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Genera terreno su canvas “a griglia”, con fallback per tile mancanti */
async function generateBlendedTexture(
  images: HTMLImageElement[],
  viewW: number,
  viewH: number
): Promise<HTMLImageElement> {
  // Allinea il mondo su griglia e scala desiderata
  const mapWidth = Math.ceil((viewW * WORLD_SCALE) / TILE_SIZE) * TILE_SIZE;
  const mapHeight = Math.ceil((viewH * WORLD_SCALE) / TILE_SIZE) * TILE_SIZE;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = mapWidth;
  canvas.height = mapHeight;

  const scale = 0.007; // frequenza del noise

  // safety: almeno 1 immagine “buona”
  const good = images.filter(Boolean);
  const fallback = good[0];

  for (let x = 0; x < mapWidth; x += TILE_SIZE) {
    for (let y = 0; y < mapHeight; y += TILE_SIZE) {
      const n = (noise2D(x * scale, y * scale) + 1) / 2;
      const random = Math.random() * 0.1 - 0.05;
      let idx = Math.floor((n + random) * images.length);
      if (idx < 0) idx = 0;
      if (idx >= images.length) idx = images.length - 1;

      let img = images[idx] || fallback;
      if (!img) {
        // ultimo fallback assoluto: riempi un quadretto per evitare buchi visivi
        ctx.fillStyle = "#6f8a4f";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = 0.95 + Math.random() * 0.05;
      ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
      ctx.restore();
    }
  }

  const finalImg = new Image();
  finalImg.src = canvas.toDataURL("image/png");
  await new Promise((res) => (finalImg.onload = res));
  return finalImg;
}

/** =========================
 *  Rettangolo draggable “a prova di jitter”
 *  - usa posizione locale durante il drag
 *  - commit allo store solo a fine drag
 *  ========================= */
function DraggableRect({
  obj,
  isSelected,
  currentTool,
  blendedImage,
  selectObject,
  moveObject,
  setIsDraggingObject,
}: {
  obj: any;
  isSelected: boolean;
  currentTool: Tool;
  blendedImage: HTMLImageElement | null;
  selectObject: (id: string) => void;
  moveObject: (id: string, x: number, y: number) => void;
  setIsDraggingObject: (v: boolean) => void;
}) {
  const shapeRef = useRef<Konva.Rect>(null);
  const [dragging, setDragging] = useState(false);
  const [localPos, setLocalPos] = useState({ x: obj.x, y: obj.y });


  // 🔄 Quando non stai trascinando, tieni localPos allineata allo store
  useEffect(() => {
    if (!dragging) {
      setLocalPos({ x: obj.x, y: obj.y });
    }
  }, [obj.x, obj.y, dragging]);

  // ✅ Evita flick: dopo onDragEnd aspetta che lo store "raggiunga" localPos
  useEffect(() => {
    if (!dragging) return;
    const dx = Math.abs(obj.x - localPos.x);
    const dy = Math.abs(obj.y - localPos.y);
    // tolleranza piccola per numeri floating
    if (dx < 0.01 && dy < 0.01) {
      setDragging(false); // ora possiamo tornare a leggere da obj.x/obj.y senza blink
      // console.log("[Sync] store ↔︎ localPos ok, stop dragging");
    }
  }, [obj.x, obj.y, localPos.x, localPos.y, dragging]);

  return (
    <Rect
      id={obj.id}
      ref={isSelected ? shapeRef : null}
      // 📌 Durante il drag usa sempre la posizione locale
      x={dragging ? localPos.x : obj.x}
      y={dragging ? localPos.y : obj.y}
      width={obj.width}
      height={obj.height}
      fill={obj.color}
      stroke={isSelected ? "#f1c40f" : ""}
      strokeWidth={isSelected ? 4 : 0}
      draggable={currentTool === "select"}

      onMouseDown={(e) => {
        if (currentTool !== "select") return;
        selectObject(obj.id);
        e.cancelBubble = true;
      }}

      onDragStart={(e) => {
        if (currentTool !== "select") return;
        selectObject(obj.id);
        setDragging(true);
        setIsDraggingObject(true);
        e.cancelBubble = true;
        const stage = e.target.getStage();
        if (stage) {
          stage.draggable(false);
          console.log("[DragStart] Blocca pan Stage. scale=", stage.scaleX(), "stagePos=", { x: stage.x(), y: stage.y() });
        }
        console.log("[DragStart] obj.id=", obj.id, "start localPos=", localPos);
      }}

      onDragMove={(e) => {
        if (currentTool !== "select") return;
        const { x, y } = e.target.position();
        setLocalPos({ x, y }); // solo stato locale: nessun re-render da store qui
      }}

      onDragEnd={(e) => {
        if (currentTool !== "select") return;
        const { x, y } = e.target.position();

        // 👇 Mantieni la shape esattamente dove l’hai lasciata
        setLocalPos({ x, y });

        // ⛔️ Non chiudere ancora il "dragging": aspetta lo store nel useEffect
        setIsDraggingObject(false);

        // Commit una volta sola allo store (usa gli stessi x,y di localPos)
        moveObject(obj.id, x, y);

        const stage = e.target.getStage();
        if (stage) {
          stage.draggable(currentTool !== "select");
          console.log("[DragEnd] Commit store e (forse) sblocca pan Stage:", currentTool !== "select", "final pos=", { x, y });
        }
      }}

      dragBoundFunc={(pos) => {
        if (!blendedImage) return pos;
        const maxX = blendedImage.width - obj.width;
        const maxY = blendedImage.height - obj.height;
        return {
          x: Math.min(Math.max(pos.x, 0), Math.max(0, maxX)),
          y: Math.min(Math.max(pos.y, 0), Math.max(0, maxY)),
        };
      }}

      shadowBlur={obj.shadowBlur}
      shadowColor={"#000000"}
      opacity={obj.opacity}
      visible={obj.visible}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = currentTool === "select" ? "move" : "not-allowed";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    />
  );
}


export default function App() {
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRef = useRef<Konva.Rect>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const {
    objects,
    selectedId,
    currentTool,
    addObject,
    selectObject,
    moveObject,
  } = useEditorStore();

  const [bgImages, setBgImages] = useState<HTMLImageElement[]>([]);
  const [blendedImage, setBlendedImage] = useState<HTMLImageElement | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState<Vec2>({ x: 0, y: 0 });
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [tileset, setTileset] = useState<TilesetType>(DEFAULT_TILESET);
  const [isManualPan, setIsManualPan] = useState(false);


  console.log("[Render] currentTool=", currentTool);

  /** =========================
   *  Zoom (centrato sul puntatore) con limite dinamico
   *  ========================= */
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // usa la scala iniziale come limite min dinamico
    const minScale = (window as any).initialScale || MIN_SCALE;
    newScale = Math.max(minScale * 0.98, Math.min(MAX_SCALE, newScale));

    // mantieni il punto sotto al mouse
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const unclamped = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    const clamped = clampPosition(unclamped, newScale);
    setStageScale(newScale);
    setStagePos(clamped);

    console.log("[Wheel] oldScale=", oldScale, "newScale=", newScale, "stagePos=", clamped);
  };

  /** =========================
   *  Clamp pan Stage (considera map e viewport)
   *  ========================= */
  const clampPosition = (pos: Vec2, scaleOverride?: number): Vec2 => {
    if (!blendedImage) return pos;
    const scale = scaleOverride ?? stageScale;

    const mapW = blendedImage.width * scale;
    const mapH = blendedImage.height * scale;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    // quando il mondo è più piccolo della viewport -> centrato perfetto
    if (mapW <= viewW && mapH <= viewH) {
      return { x: (viewW - mapW) / 2, y: (viewH - mapH) / 2 };
    }

    // solo una dimensione più piccola -> centra quella
    let minX: number, maxX: number, minY: number, maxY: number;

    if (mapW < viewW) {
      minX = maxX = (viewW - mapW) / 2;
    } else {
      minX = viewW - mapW - PAN_PADDING;
      maxX = PAN_PADDING;
    }

    if (mapH < viewH) {
      minY = maxY = (viewH - mapH) / 2;
    } else {
      minY = viewH - mapH - PAN_PADDING;
      maxY = PAN_PADDING;
    }

    const clamped = {
      x: Math.min(Math.max(pos.x, minX), maxX),
      y: Math.min(Math.max(pos.y, minY), maxY),
    };
    return clamped;
  };

  /** =========================
   *  Fit-to-screen iniziale e onResize
   *  ========================= */
  useEffect(() => {
    if (!blendedImage) return;

    const applyFit = () => {
      const mapW = blendedImage.width;
      const mapH = blendedImage.height;
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

    const scaleX = viewW / mapW;
      const scaleY = viewH / mapH;
      const fitScale = Math.min(scaleX, scaleY) * INITIAL_FIT;

      (window as any).initialScale = fitScale;

      const centered = { x: (viewW - mapW * fitScale) / 2, y: (viewH - mapH * fitScale) / 2 };
      setStageScale(fitScale);
      setStagePos(clampPosition(centered, fitScale));

      console.log("[Fit] fitScale=", fitScale, "centered=", centered);
    };

    applyFit();

    const onResize = () => {
      // non rigenero il terreno; solo rifitto la vista
      applyFit();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blendedImage]);

  /** =========================
 *  Caricamento robusto delle tile (tileset switch)
 *  ========================= */
useEffect(() => {
  let cancelled = false;
  (async () => {
    const prefix = TILE_PREFIX[tileset as keyof typeof TILE_PREFIX];

    const results = await Promise.all(
      Array.from({ length: TILE_COUNT }, (_, i) =>
        loadImage(`/assets/tiles/${tileset}/${prefix}_${i + 1}.png`)
      )
    );
    if (cancelled) return;

    const ok = results.filter(Boolean) as HTMLImageElement[];
    if (ok.length === 0) {
      console.warn(`❌ Nessuna tile caricata. Controlla /assets/tiles/${tileset}/`);
      return;
    }
    // rimpiazzo gli errori con un fallback per mantenere lunghezza costante
    const filled = results.map((img) => img || ok[0]) as HTMLImageElement[];
    setBgImages(filled);
    console.log(`[Tiles] loaded ${filled.length} from /assets/tiles/${tileset}/`);
  })();

  return () => {
    cancelled = true;
  };
}, [tileset]);

  /** =========================
   *  Generazione terreno
   *  ========================= */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (bgImages.length === 0) return;
      const img = await generateBlendedTexture(bgImages, window.innerWidth, window.innerHeight);
      if (!cancelled) setBlendedImage(img);
      console.log("[Terrain] generated", img?.width, "x", img?.height);
    })();
    return () => {
      cancelled = true;
    };
  }, [bgImages]);

  /** =========================
   *  Aggiunta oggetti (solo su click su area vuota e tool = draw)
   *  ========================= */
  const handleStageClick = (e: any) => {
    // clic valido solo se target è davvero lo Stage (non Layer, non Shape)
    const stage = stageRef.current;
    if (!stage || e.target !== stage) return;

    if (useEditorStore.getState().currentTool !== "draw") return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // coordinate locali allo Stage (ok)
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(pointer);

    addObject({
      id: Date.now().toString(),
      x: pos.x - 25,
      y: pos.y - 25,
      width: 50,
      height: 50,
      color: "#2ecc71",
      rotation: 0,
      opacity: 1,
      shadowBlur: 5,
      // FIX: "#000" -> "#000000" per evitare warning
      shadowColor: "#000000",
      visible: true,
      layer: 1,
    });

    console.log("[AddObject] at", pos);
  };

  /** =========================
   *  Selezione -> Transformer
   *  ========================= */
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = transformer?.getStage();
    const selectedNode = stage?.findOne(`#${selectedId}`);
    if (selectedNode) transformer?.nodes([selectedNode]);
    else transformer?.nodes([]);
    transformer?.getLayer()?.batchDraw();
  }, [selectedId, objects]);

  /** =========================
   *  Forza lo stato draggable dello Stage
   *  ========================= */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // FIX: in modalità "select" lo stage NON deve mai essere draggable
    const shouldBeDraggable = (currentTool as Tool) !== "select";
    stage.draggable(shouldBeDraggable);
    console.log("[Effect] Stage.draggable=", shouldBeDraggable, "currentTool=", currentTool);
  }, [currentTool]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1e1e1e" }}>
      {/* UI */}
      <LeftSidebar />
      
      {/* Toolbar */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 300,
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => useEditorStore.getState().setTool("draw")}
          style={{
            padding: "8px 14px",
            background: currentTool === "draw" ? "#2ecc71" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Disegna
        </button>

        <button
          onClick={() => useEditorStore.getState().setTool("select")}
          style={{
            padding: "8px 14px",
            background: currentTool === "select" ? "#3498db" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Seleziona
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginLeft: "600px" }}>
        <button onClick={() => setTileset("dirt")}>Terra</button>
        <button onClick={() => setTileset("grass")}>Erba</button>
        <button onClick={() => setTileset("water")}>Acqua</button>
      </div>

      {/* Stage */}
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        dragBoundFunc={(pos) => clampPosition(pos)}
        draggable={(currentTool as Tool) !== "select"} 
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={(e) => {
          const stage = stageRef.current;
          if (!stage) return;

          const isRightClick = e.evt.button === 1;
          const isCtrlClick = e.evt.ctrlKey;

          console.log("[MouseDown]", {
            button: e.evt.button,
            ctrl: e.evt.ctrlKey,
            tool: currentTool,
            target: e.target.getClassName(),
            draggable: stage.draggable(),
          });

          // 🧭 PAN MANUALE (tasto destro o Ctrl)
          if (isRightClick || isCtrlClick) {
            stage.draggable(true);
            setIsManualPan(true);
            stage.container().style.cursor = "grabbing";
            console.log("🟢 Pan abilitato manualmente");
            return;
          }

          // 🧱 Selezione su oggetto
          if (currentTool === "select" && e.target !== stage) {
            console.log("⛔ Clic su oggetto in SELECT → nessun pan");
            return;
          }

          // ✏️ Disegna nuovo oggetto
          if (currentTool === "draw" && e.target === stage) {
            stage.draggable(false);
            handleStageClick(e);
            return;
          }

          stage.draggable(false);
          stage.container().style.cursor = "default";
        }}

        onMouseUp={(e) => {
          const stage = stageRef.current;
          if (!stage) return;

          // 🧭 se era pan manuale, il rilascio sarà gestito in onDragEnd
          if (isManualPan) {
            console.log("🕐 MouseUp ignorato perché pan manuale ancora attivo");
            return;
          }

          stage.draggable((currentTool as Tool) !== "select");
          stage.container().style.cursor = "default";
          console.log("🧹 MouseUp → ripristino stato drag=", stage.draggable());
        }}

        onDragStart={(e) => {
          const stage = stageRef.current;
          if (!stage || e.target !== stage) return;
          stage.container().style.cursor = "grabbing";
          console.log("🚀 Stage drag start", {
            tool: currentTool,
            draggable: stage.draggable(),
            pos: { x: e.target.x(), y: e.target.y() },
          });
        }}

        onDragMove={(e) => {
          const stage = stageRef.current;
          if (!stage || e.target !== stage) return;

          // NON aggiornare stagePos qui, altrimenti React blocca il movimento
          if (isManualPan) return;

          // 👇 solo se non è pan manuale (es. resize/fit automatici)
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}

        onDragEnd={(e) => {
          const stage = stageRef.current;
          if (!stage || e.target !== stage) return;

          setStagePos({ x: e.target.x(), y: e.target.y() });

          if (isManualPan) {
            console.log("🏁 Pan manuale dragEnd → disattivo draggable");
            setIsManualPan(false);
            stage.draggable((currentTool as Tool) !== "select");
          }

          stage.container().style.cursor = "grab";
          console.log("✅ Stage drag end", {
            tool: currentTool,
            finalPos: { x: e.target.x(), y: e.target.y() },
            draggable: stage.draggable(),
          });
        }}
      >
        {/* Sfondo (non interattivo) */}
        <Layer listening={false}>
          {blendedImage && (
            <KonvaImage
              image={blendedImage}
              x={0}
              y={0}
              width={blendedImage.width}
              height={blendedImage.height}
            />
          )}
        </Layer>

        {/* Oggetti */}
        <Layer>
          <Text text={`Tool: ${currentTool}`} x={20} y={20} fill="#fff" />

          {objects.map((obj) => (
            <DraggableRect
              key={obj.id}
              obj={obj}
              isSelected={obj.id === selectedId}
              currentTool={currentTool as Tool}
              blendedImage={blendedImage}
              selectObject={selectObject}
              moveObject={moveObject}
              setIsDraggingObject={setIsDraggingObject}
            />
          ))}

          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>

      {/* Inspector: visibile solo se c'è un oggetto selezionato */}
      {selectedId && <RightInspector />}
    </div>
  );
}
