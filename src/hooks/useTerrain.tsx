import { useState, useEffect } from "react";
import { loadImage, generateBlendedTexture, TILE_COUNT, TILE_PREFIX } from "../utils/terrainUtils";

type TilesetType = keyof typeof TILE_PREFIX;

/**
 * Hook per gestire caricamento tile e generazione del terreno blended.
 * Restituisce blendedImage e funzione per cambiare tileset.
 */
export function useTerrain(defaultTileset: TilesetType = "dirt") {
  const [tileset, setTileset] = useState<TilesetType>(defaultTileset);
  const [bgImages, setBgImages] = useState<HTMLImageElement[]>([]);
  const [blendedImage, setBlendedImage] = useState<HTMLImageElement | null>(null);

  /** Caricamento tile in base al tileset */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const prefix = TILE_PREFIX[tileset];
      const results = await Promise.all(
        Array.from({ length: TILE_COUNT }, (_, i) =>
          loadImage(`/assets/tiles/${tileset}/${prefix}_${i + 1}.png`)
        )
      );
      if (cancelled) return;
      const ok = results.filter(Boolean) as HTMLImageElement[];
      if (ok.length === 0) return;
      const filled = results.map((img) => img || ok[0]) as HTMLImageElement[];
      setBgImages(filled);
    })();
    return () => {
      cancelled = true;
    };
  }, [tileset]);

  /** Generazione del terreno blended */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (bgImages.length === 0) return;
      const img = await generateBlendedTexture(bgImages, window.innerWidth, window.innerHeight);
      if (!cancelled) setBlendedImage(img);
    })();
    return () => {
      cancelled = true;
    };
  }, [bgImages]);

  return { blendedImage, tileset, setTileset };
}
