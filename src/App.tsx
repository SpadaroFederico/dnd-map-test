import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from "react-konva";
import { useEditorStore } from "./store/editStore";
import { useRef, useEffect, useState } from "react";
import { Inspector } from "./components/Inspector";
import Konva from "konva";
import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

// 🔹 Funzione per generare il terreno procedurale
function generateBlendedTexture(images: HTMLImageElement[], width: number, height: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // 🌍 Aumenta le dimensioni del mondo
  const mapWidth = width * 5;   // 5x lo schermo orizzontalmente
  const mapHeight = height * 5; // 5x verticalmente
  canvas.width = mapWidth;
  canvas.height = mapHeight;

  const tileSize = 256;  // dimensione delle tile
  const scale = 0.007;   // varietà del noise (più alto = terreno più “macchiato”)

  for (let x = 0; x < mapWidth; x += tileSize) {
    for (let y = 0; y < mapHeight; y += tileSize) {
      const n = (noise2D(x * scale, y * scale) + 1) / 2;
      const random = Math.random() * 0.1 - 0.05;
      const idx = Math.min(Math.floor((n + random) * images.length), images.length - 1);
      const img = images[idx];

      // 🟢 Niente rotazione → niente buchi
      ctx.save();
      ctx.globalAlpha = 0.95 + Math.random() * 0.05;
      
      ctx.drawImage(img, x, y, tileSize, tileSize);
      ctx.restore();
    }
  }

  const finalImg = new Image();
  finalImg.src = canvas.toDataURL("image/png");
  return finalImg;
}

export default function App() {
  const transformerRef = useRef<any>(null);
  const shapeRef = useRef<any>(null);

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

  // 🔹 Zoom e Pan
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  // 🔹 Carichiamo le texture
  useEffect(() => {
    const variants = Array.from({ length: 9 }, (_, i) => i + 1);
    const imgs: HTMLImageElement[] = [];

    variants.forEach((v) => {
      const img = new Image();
      img.src = `/assets/tiles/grass_${v}.png`;
      img.onload = () => {
        imgs.push(img);
        if (imgs.length === variants.length) {
          console.log("✅ Tutte le immagini caricate");
          setBgImages(imgs);
        }
      };
    });
  }, []);

  // 🔹 Genera il terreno blended
  useEffect(() => {
    if (bgImages.length > 0) {
      console.log("🎨 Genero mappa procedurale...");
      const img = generateBlendedTexture(bgImages, window.innerWidth, window.innerHeight);
      setBlendedImage(img);
    }
  }, [bgImages]);

  // 🔹 Crea e muovi oggetti
  const handleStageClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (!clickedOnEmpty) return;

    if (currentTool === "draw") {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (pointer) {
        addObject({
          id: Date.now().toString(),
          x: pointer.x - 25,
          y: pointer.y - 25,
          width: 50,
          height: 50,
          color: "#2ecc71",
          rotation: 0,
          opacity: 1,
          shadowBlur: 5,
          shadowColor: "#000",
          brightness: 1,
          visible: true,
          layer: 1,
        });
      }
    }
  };

  // 🔹 Gestione selezione oggetti
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = transformer?.getStage();
    const selectedNode = stage?.findOne(`#${selectedId}`);
    if (selectedNode) transformer.nodes([selectedNode]);
    else transformer.nodes([]);
    transformer?.getLayer()?.batchDraw();
  }, [selectedId, objects]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1e1e1e" }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleStageClick}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
      >
        {/* 🌍 Layer terreno */}
        <Layer>
          {blendedImage && (
            <KonvaImage
              image={blendedImage}
              x={0}
              y={0}
              width={window.innerWidth * 3}
              height={window.innerHeight * 3}
            />
          )}
        </Layer>

        {/* 🎨 Layer oggetti */}
        <Layer>
          <Text text={`Tool: ${currentTool}`} x={20} y={20} fill="#fff" />

          {objects.map((obj) => (
            <Rect
              id={obj.id}
              ref={obj.id === selectedId ? shapeRef : null}
              key={obj.id}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill={obj.color}
              stroke={obj.id === selectedId ? "#f1c40f" : ""}
              strokeWidth={obj.id === selectedId ? 4 : 0}
              draggable={currentTool === "select" && obj.id === selectedId}
              onClick={() => selectObject(obj.id)}
              onDragEnd={(e) => moveObject(obj.id, e.target.x(), e.target.y())}
              shadowBlur={obj.shadowBlur}
              shadowColor={obj.shadowColor}
              opacity={obj.opacity}
              visible={obj.visible}
            />
          ))}

          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>

      <Inspector />
    </div>
  );
}
