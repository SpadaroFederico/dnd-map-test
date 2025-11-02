import { useEffect } from "react";
import Konva from "konva";

export function useTransformerSync(
  transformerRef: React.RefObject<Konva.Transformer | null>,
  selectedIds: string[],
  objects: any[]
) {
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = transformer?.getStage();
    if (!stage || !transformer) return;

    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => Boolean(n));

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, objects]);
}
