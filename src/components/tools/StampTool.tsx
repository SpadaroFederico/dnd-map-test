import React, { useEffect, useRef } from "react";
import Konva from "konva";
import { Image as KonvaImage, Layer } from "react-konva";
import { useEditorStore } from "../../store/editStore";

interface StampToolProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageScale: number;
  mapWidth: number;
  mapHeight: number;
}

export default function StampTool({
  stageRef,
  stageScale,
  mapWidth,
  mapHeight,
}: StampToolProps) {
  const { currentTool } = useEditorStore();
  const layerRef = useRef<Konva.Layer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // parametri di test
  const scale = 1.0;
  const rotation = 0;
  const opacity = 0.9;

  /** 🖼️ Carica immagine della stamp */
  useEffect(() => {
    const img = new Image();
    img.src = "/assets/stamps/tree.png"; // 🔸 metti un PNG reale in public/assets/stamps/
    img.onload = () => {
      imgRef.current = img;
      console.log("[STAMP] Image loaded:", img.src);
    };
  }, []);

  /** 🎨 Prepara canvas disegno */
  useEffect(() => {
    if (!mapWidth || !mapHeight) return;
    const c = document.createElement("canvas");
    c.width = mapWidth;
    c.height = mapHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, mapWidth, mapHeight);
    canvasRef.current = c;
    ctxRef.current = ctx;
    console.log("[STAMP] Canvas ready:", { w: mapWidth, h: mapHeight });
  }, [mapWidth, mapHeight]);

  /** 🖱️ Gestione click sul canvas */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (currentTool !== "stamp") return;
      if (!ctxRef.current || !imgRef.current) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const world = transform.point(pointer);

      const ctx = ctxRef.current;
      const img = imgRef.current;
      if (!ctx || !img) return;

      const size = 256 * scale;

      console.log("[STAMP] Drawing image at", world);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(world.x, world.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();

      if (layerRef.current) layerRef.current.batchDraw();
    };

    stage.on("mousedown", handleClick);
    return () => {
      stage.off("mousedown", handleClick);
    };
  }, [currentTool, stageScale]);

  // mostra solo se lo strumento attivo è stamp
  if (currentTool !== "stamp") return null;

  return (
    <Layer listening={false} ref={layerRef}>
      {canvasRef.current && (
        <KonvaImage
          image={canvasRef.current as CanvasImageSource}
          x={0}
          y={0}
          width={mapWidth}
          height={mapHeight}
          opacity={1}
        />
      )}
    </Layer>
  );
}
