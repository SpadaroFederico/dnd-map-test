import React, { useEffect } from "react";
import Konva from "konva";
import { useEditorStore } from "../../store/editStore";
import { Tile, paintTile } from "../../utils/TileMap";

interface TerrainPainterProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  tiles: Tile[][];
  setTiles: React.Dispatch<React.SetStateAction<Tile[][]>>;
  tileSize: number;
}

/** 🔹 Gestisce i click per cambiare il terreno */
export default function TerrainPainter({ stageRef, tiles, setTiles, tileSize }: TerrainPainterProps) {
  const { currentTool, terrain } = useEditorStore();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (currentTool !== "shovel" && currentTool !== "draw") return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const tx = Math.floor(pointer.x / tileSize);
      const ty = Math.floor(pointer.y / tileSize);

      if (tx >= 0 && ty >= 0 && ty < tiles.length && tx < tiles[0].length) {
        setTiles((prev) => paintTile(prev, tx, ty, terrain));
      }
    };

    stage.on("mousedown", handleClick);
    return () => {
      stage.off("mousedown", handleClick);
    };
  }, [currentTool, terrain, tiles, tileSize, setTiles]);

  return null;
}
