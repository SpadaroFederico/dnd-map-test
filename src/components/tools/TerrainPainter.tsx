import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Layer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "../../store/editStore";
import { loadTerrainTextures } from "../../utils/terrainUtils";

interface TerrainPainterProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageScale: number;
  radius: number;
  terrain: "dirt" | "grass" | "water";
  mapWidth: number;
  mapHeight: number;
}

export default function TerrainPainter({
  stageRef,
  stageScale,
  radius,
  terrain,
  mapWidth,
  mapHeight,
}: TerrainPainterProps) {
  const { currentTool } = useEditorStore();
  const [painting, setPainting] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textures, setTextures] = useState<Record<string, HTMLImageElement[]> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  // Carica tutte le texture all'avvio
  useEffect(() => {
    console.log("[INIT] caricamento texture...");
    loadTerrainTextures().then((res) => {
      console.log("[INIT] texture caricate:", Object.keys(res || {}));
      setTextures(res);
    });
  }, []);

  // Crea canvas grande quanto la mappa (non lo stage!)
  useEffect(() => {
    if (!mapWidth || !mapHeight) {
      console.warn("[CANVAS] Dimensioni mappa non valide:", mapWidth, mapHeight);
      return;
    }

    console.log("[CANVAS] Creo canvas dimensioni:", mapWidth, "x", mapHeight);

    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, mapWidth, mapHeight); // ✅ usa le dimensioni della mappa
      console.log("[CANVAS] Canvas inizializzato correttamente");
    }

    const img = new window.Image();
    img.src = canvas.toDataURL();
    setImage(img);
  }, [mapWidth, mapHeight]);

  // Eventi di pittura
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !textures) {
      console.warn("[EVENT] Stage o texture non pronte");
      return;
    }

    const handleMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const world = transform.point(pointer);
      setCursorPos(world);

      console.log(
        `[MOVE] Pointer: (${pointer.x.toFixed(0)}, ${pointer.y.toFixed(0)}) → World: (${world.x.toFixed(0)}, ${world.y.toFixed(0)})`
      );

      const isEraseNow = e.evt.shiftKey || eraseMode;
      if (painting) {
        console.log("[MOVE] Sto dipingendo...", isEraseNow ? "(ERASE)" : "(PAINT)");
        paint(world.x, world.y, isEraseNow);
      }
    };

    const handleDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (currentTool !== "shovel") return;

      const isErase = e.evt.shiftKey;
      setEraseMode(isErase);
      setPainting(true);

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const world = transform.point(pointer);

      console.log("[DOWN] Inizio pittura a:", world.x, world.y, isErase ? "(gomma)" : "(pittura)");
      paint(world.x, world.y, isErase);
    };

    const handleUp = () => {
      console.log("[UP] Fine pittura");
      setPainting(false);
      setEraseMode(false);
    };

    stage.on("mousemove", handleMove);
    stage.on("mousedown", handleDown);
    stage.on("mouseup", handleUp);
    stage.on("mouseleave", handleUp);

    return () => {
      stage.off("mousemove", handleMove);
      stage.off("mousedown", handleDown);
      stage.off("mouseup", handleUp);
      stage.off("mouseleave", handleUp);
    };
  }, [painting, radius, terrain, stageScale, currentTool, eraseMode, textures]);

  // Funzione di disegno
  const paint = (x: number, y: number, erase: boolean) => {
    if (!canvasRef.current || !textures) {
      console.warn("[PAINT] Canvas o texture non pronti");
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      console.warn("[PAINT] Nessun contesto 2D");
      return;
    }

    const texArray = textures[terrain];
    if (!texArray || texArray.length === 0) {
      console.warn("[PAINT] Nessuna texture valida per", terrain);
      return;
    }

    const tex = texArray[Math.floor(Math.random() * texArray.length)];
    if (!tex) {
      console.warn("[PAINT] Texture non trovata");
      return;
    }

    console.log(
      `[PAINT] Disegno ${erase ? "gomma" : "pittura"} a (${x.toFixed(0)}, ${y.toFixed(0)})`
    );

    ctx.save();
    ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(tex, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();

    const newImg = new window.Image();
    newImg.src = canvasRef.current.toDataURL();
    setImage(newImg);
  };

  if (currentTool !== "shovel") return null;

  useEffect(() => {
    const interval = setInterval(() => {
      const stage = stageRef.current;
      if (stage) {
        console.log(
          `[STATE] Stage pos: (${stage.x().toFixed(0)}, ${stage.y().toFixed(0)}), scale: ${stage.scaleX().toFixed(2)}, painting: ${painting}`
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [stageRef, painting]);

  return (
    <Layer ref={layerRef} listening={false}>
      {image && (
        <KonvaImage
          image={image}
          x={0}
          y={0}
          width={mapWidth}      // ✅ dimensioni reali mappa
          height={mapHeight}    // ✅ dimensioni reali mappa
        />
      )}
    </Layer>
  );
}
