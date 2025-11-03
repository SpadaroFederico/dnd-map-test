import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

/** =========================
 *  COSTANTI GLOBALI DEL TERRENO
 *  ========================= */
export const TILE_SIZE = 256;       // dimensione base di ogni tile
export const WORLD_SCALE = 6;       // moltiplicatore di ampiezza del mondo
export const TILE_COUNT = 15;       // numero di tile da caricare

export const TILE_PREFIX = {
  grass: "grass",
  dirt: "dirt_stylized_rock",
  water: "water",
} as const;

/** =========================
 *  Loader immagine robusto
 *  ========================= */
export async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** =========================
 *  Genera la texture blended del terreno
 *  ========================= */
export async function generateBlendedTexture(
  images: HTMLImageElement[],
  viewW: number,
  viewH: number
): Promise<HTMLImageElement> {
  const mapWidth = Math.ceil((viewW * WORLD_SCALE) / TILE_SIZE) * TILE_SIZE;
  const mapHeight = Math.ceil((viewH * WORLD_SCALE) / TILE_SIZE) * TILE_SIZE;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = mapWidth;
  canvas.height = mapHeight;

  const scale = 0.007;
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
 *  Caricamento dinamico di tutte le texture terreno
 *  ========================= */
export async function loadTerrainTextures() {
  const terrains = Object.keys(TILE_PREFIX) as (keyof typeof TILE_PREFIX)[];
  const textures: Record<string, HTMLImageElement[]> = {};

  for (const type of terrains) {
    textures[type] = [];
    const prefix = TILE_PREFIX[type];

    for (let i = 1; i <= TILE_COUNT; i++) {
      const src = `/assets/tiles/${type}/${prefix}_${i}.png`;
      const img = await loadImage(src);
      if (img) textures[type].push(img);
    }
  }

  return textures as {
    grass: HTMLImageElement[];
    dirt: HTMLImageElement[];
    water: HTMLImageElement[];
  };
}

