import { useState, useCallback, useRef, useEffect } from "react";
import Konva from "konva";

type Vec2 = { x: number; y: number };

interface UseMapHooksProps {
  blendedImage: HTMLImageElement | null;
  MIN_SCALE: number;
  MAX_SCALE: number;
  PAN_PADDING: number;
  INITIAL_FIT: number;
}

const EPS = 1e-4;

export function useMapHooks({
  blendedImage,
  MIN_SCALE,
  MAX_SCALE,
  PAN_PADDING,
  INITIAL_FIT,
}: UseMapHooksProps) {
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState<Vec2>({ x: 0, y: 0 });

  const stageScaleRef = useRef(stageScale);
  useEffect(() => {
    stageScaleRef.current = stageScale;
  }, [stageScale]);

  const wheelFrame = useRef<{ pending: boolean; id: number | null }>({
    pending: false,
    id: null,
  });

  const clampPosition = useCallback(
    (pos: Vec2, scaleOverride?: number): Vec2 => {
      const scale = scaleOverride ?? stageScaleRef.current;
      if (!blendedImage) return pos;

      const mapW = blendedImage.width * scale;
      const mapH = blendedImage.height * scale;
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      if (mapW <= viewW && mapH <= viewH) return pos;

      const pad = PAN_PADDING / scale;
      let minX = Math.min(0, viewW - mapW) - pad;
      let maxX = pad;
      let minY = Math.min(0, viewH - mapH) - pad;
      let maxY = pad;

      if (mapW < viewW) minX = maxX = (viewW - mapW) / 2;
      if (mapH < viewH) minY = maxY = (viewH - mapH) / 2;

      return {
        x: Math.min(Math.max(pos.x, minX), maxX),
        y: Math.min(Math.max(pos.y, minY), maxY),
      };
    },
    [blendedImage, PAN_PADDING]
  );

  const handleWheel = useCallback(
    (e: any) => {
      e.evt.preventDefault();
      if (wheelFrame.current.pending) return;
      wheelFrame.current.pending = true;

      wheelFrame.current.id = requestAnimationFrame(() => {
        wheelFrame.current.pending = false;

        const stage: Konva.Stage | null = e.target.getStage?.() ?? null;
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const oldScale = stageScaleRef.current;
        const scaleBy = 1.08;
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        const minScale = (window as any).initialScale || MIN_SCALE;
        const minClamp = minScale * 0.995;
        const minSnap = minScale * 1.005;

        if (newScale <= minClamp) {
          newScale = minScale;
          stage.scale({ x: newScale, y: newScale });
          stage.batchDraw();
          setStageScale(newScale);
          return;
        }
        if (newScale < minSnap) newScale = minScale;

        newScale = Math.min(MAX_SCALE, newScale);

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const unclamped = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };

        const clamped = clampPosition(unclamped, newScale);

        const smallChange =
          Math.abs(newScale - oldScale) < EPS &&
          Math.abs(clamped.x - stagePos.x) < 0.5 &&
          Math.abs(clamped.y - stagePos.y) < 0.5;

        if (smallChange) return;

        stage.scale({ x: newScale, y: newScale });
        stage.position(clamped);
        stage.batchDraw();

        setStageScale(newScale);
        setStagePos(clamped);
      });
    },
    [clampPosition, MAX_SCALE, MIN_SCALE]
  );

  const applyFit = useCallback(() => {
    if (!blendedImage) return;

    const mapW = blendedImage.width;
    const mapH = blendedImage.height;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    const scaleX = viewW / mapW;
    const scaleY = viewH / mapH;
    const fitScale = Math.min(scaleX, scaleY) * INITIAL_FIT;

    (window as any).initialScale = fitScale;

    const centered = {
      x: (viewW - mapW * fitScale) / 2,
      y: (viewH - mapH * fitScale) / 2,
    };

    const clamped = clampPosition(centered, fitScale);

    setStageScale(fitScale);
    setStagePos(clamped);
  }, [blendedImage, INITIAL_FIT, clampPosition]);

  return {
    stageScale,
    setStageScale,
    stagePos,
    setStagePos,
    handleWheel,
    clampPosition,
    applyFit,
  };
}
