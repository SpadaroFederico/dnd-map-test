import React, { useEffect, useState } from "react";
import { Layer, Image as KonvaImage } from "react-konva";
import { useEditorStore } from "../../store/editStore";
import {
  TILE_COUNT,
  TILE_PREFIX,
  TILE_SIZE,
  loadImage,
} from "../../utils/terrainUtils";

interface TerrainLayerProps {
  mapWidth?: number;
  mapHeight?: number;
  tileSize?: number;
}

/**
 * 🔹 Layer principale del terreno
 * Crea una texture 2D casuale partendo da tile PNG nella cartella /assets/tiles/{terrain}/
 */
export default function TerrainLayer({
  mapWidth = 4096,
  mapHeight = 4096,
  tileSize = TILE_SIZE,
}: TerrainLayerProps) {
  const background = useEditorStore((s) => s.background);
  const [tiles, setTiles] = useState<HTMLImageElement[]>([]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  /** 🔹 Carica le tile del terreno selezionato */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const prefix = TILE_PREFIX[background];
      const loaded: HTMLImageElement[] = [];

      for (let i = 1; i <= TILE_COUNT; i++) {
        const src = `/assets/tiles/${background}/${prefix}_${i}.png`;
        const img = await loadImage(src);
        if (img) loaded.push(img);
      }

      if (!cancelled) {
        setTiles(loaded);
        console.log(`[TerrainLayer] Caricate ${loaded.length} tile per: ${background}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [background]);

  /** 🔹 Disegna il terreno su canvas */
  useEffect(() => {
    if (tiles.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, mapWidth, mapHeight);

    // Disegno casuale con piccola variazione d'opacità
    for (let y = 0; y < mapHeight; y += tileSize) {
      for (let x = 0; x < mapWidth; x += tileSize) {
        const randomIndex = Math.floor(Math.random() * tiles.length);
        const img = tiles[randomIndex];
        if (img) {
          ctx.globalAlpha = 0.95 + Math.random() * 0.05;
          ctx.drawImage(img, x, y, tileSize, tileSize);
        }
      }
    }

    const output = new Image();
    output.src = canvas.toDataURL("image/png");
    output.onload = () => setImage(output);
  }, [tiles, background, mapWidth, mapHeight, tileSize]);

  /** 🔹 Debug info */
  useEffect(() => {
    console.log("[TerrainLayer] Render", { background, tiles: tiles.length });
  }, [background, tiles.length]);

  return (
    <Layer listening={false}>
      {image ? (
        <KonvaImage
          key={background} // forza re-render quando cambia tipo terreno
          image={image}
          x={0}
          y={0}
          width={mapWidth}
          height={mapHeight}
          opacity={1}
        />
      ) : (
        <></>
      )}
    </Layer>
  );
}
