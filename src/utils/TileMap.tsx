export type TerrainType = "grass" | "dirt" | "water";

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  variant: number; // indice immagine
}

/** 🔹 Crea una griglia di tile iniziali */
export function createTileMap(width: number, height: number, defaultTerrain: TerrainType): Tile[][] {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        terrain: defaultTerrain,
        variant: Math.floor(Math.random() * 15) + 1,
      });
    }
    tiles.push(row);
  }
  return tiles;
}

/** 🔹 Cambia il terreno di un singolo tile */
export function paintTile(
  tiles: Tile[][],
  x: number,
  y: number,
  newTerrain: TerrainType
): Tile[][] {
  const newTiles = tiles.map((row) => [...row]);
  const target = newTiles[y]?.[x];
  if (target) {
    target.terrain = newTerrain;
    target.variant = Math.floor(Math.random() * 15) + 1;
  }
  return newTiles;
}
