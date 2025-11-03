import React, { useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "../store/editStore";
import DraggableRect from "./DraggableRect";
import SelectionGroup from "./SelectionGroup";
import GridLayer from "./GridLayer";
import ShovelTool from "./tools/ShovelTool";

type Vec2 = { x: number; y: number };
type Tool = "draw" | "select" | "background";

interface MapCanvasProps {
  blendedImage: HTMLImageElement | null;
  stageRef: React.RefObject<Konva.Stage | null>;
  transformerRef: React.RefObject<Konva.Transformer | null>;
  stageScale: number;
  stagePos: Vec2;
  setStageScale: React.Dispatch<React.SetStateAction<number>>;
  setStagePos: React.Dispatch<React.SetStateAction<Vec2>>;
  handleWheel: (e: any) => void;
  clampPosition: (pos: Vec2, scaleOverride?: number) => Vec2;
  selectionBox: { x: number; y: number; w: number; h: number } | null;
  setSelectionBox: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
  selectionStart: { x: number; y: number } | null;
  setSelectionStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  isManualPan: boolean;
  setIsManualPan: React.Dispatch<React.SetStateAction<boolean>>;
  isDraggingObject: boolean;
  setIsDraggingObject: React.Dispatch<React.SetStateAction<boolean>>;
  showGrid: boolean;
  gridSize: number;
}

export default function MapCanvas({
  blendedImage,
  stageRef,
  transformerRef,
  stageScale,
  stagePos,
  setStageScale,
  setStagePos,
  handleWheel,
  clampPosition,
  selectionBox,
  setSelectionBox,
  selectionStart,
  setSelectionStart,
  isManualPan,
  setIsManualPan,
  isDraggingObject,
  setIsDraggingObject,
  showGrid,
  gridSize,
}: MapCanvasProps) {
  const {
    objects,
    selectedId,
    selectedIds,
    currentTool,
    addObject,
    selectObject,
    moveObject,
  } = useEditorStore();

  // LOG: ogni render del componente con snapshot props principali
  {
    const stageSnap = (() => {
      const s = stageRef.current;
      if (!s) return null;
      return { x: s.x(), y: s.y(), scaleX: s.scaleX(), scaleY: s.scaleY() };
    })();

    console.log("[CANVAS][RENDER]", {
      props: {
        stageScale, stagePos, showGrid, gridSize,
        selectionBox, selectionStart, isManualPan, isDraggingObject,
        blended: blendedImage ? { w: blendedImage.width, h: blendedImage.height } : null,
        tool: currentTool,
        objects: objects.length,
        selectedIds,
      },
      stageSnap,
    });
  }

  /** ✅ Trasforma (resize/rotate) gli oggetti selezionati */
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = transformer?.getStage();
    if (!stage || !transformer) {
      console.log("[CANVAS][XFORM] transformer or stage missing");
      return;
    }

    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => Boolean(n));

    console.log("[CANVAS][XFORM] update nodes", {
      selectedIds,
      nodes: nodes.map((n) => n.id()),
    });

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, objects, transformerRef]);

  // Verifica runtime che lo Stage (Konva) rifletta lo stato controllato
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    const actual = { sx: s.scaleX(), sy: s.scaleY(), x: s.x(), y: s.y() };
    const expected = { sx: stageScale, sy: stageScale, x: stagePos.x, y: stagePos.y };
    const drift =
      Math.abs(actual.sx - expected.sx) > 0.0001 ||
      Math.abs(actual.x - expected.x) > 0.5 ||
      Math.abs(actual.y - expected.y) > 0.5;

    if (drift) {
      console.warn("[CANVAS][RENDER] DRIFT Stage vs State", { actual, expected });
    } else {
      console.log("[CANVAS][RENDER] Stage aligned with state", { actual });
    }
  });

  /** ✅ Click sullo stage: disegno o deselezione */
  const handleStageClick = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    console.log("[CANVAS][MOUSE] handleStageClick", {
      tool: useEditorStore.getState().currentTool,
      target: e.target?.getClassName?.(),
    });

    if (useEditorStore.getState().currentTool === "select" && e.target === stage) {
      console.log("[CANVAS][MOUSE] deselect all");
      useEditorStore.getState().deselectObject();
      return;
    }

    if (useEditorStore.getState().currentTool === "draw" && e.target === stage) {
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const pos = transform.point(pointer);

      console.log("[CANVAS][MOUSE] addObject at world pos", pos);

      addObject({
        id: Date.now().toString(),
        x: pos.x - 25,
        y: pos.y - 25,
        width: 600,
        height: 600,
        color: "#2ecc71",
        rotation: 0,
        opacity: 1,
        shadowBlur: 5,
        shadowColor: "#000000",
        visible: true,
        layer: 1,
      });
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onWheel={(e) => {
        const s = stageRef.current;
        console.log("[CANVAS][WHEEL] before", {
          state: { stageScale, stagePos },
          stage: s ? { x: s.x(), y: s.y(), sx: s.scaleX(), sy: s.scaleY() } : null,
          deltaY: e?.evt?.deltaY,
        });
        handleWheel(e);
        requestAnimationFrame(() => {
          const ss = stageRef.current;
          console.log("[CANVAS][WHEEL] after RAF", {
            state: { stageScale, stagePos },
            stage: ss ? { x: ss.x(), y: ss.y(), sx: ss.scaleX(), sy: ss.scaleY() } : null,
          });
        });
      }}
      dragBoundFunc={(pos) => {
        const clamped = clampPosition(pos);
        console.log("[CANVAS][CLAMP] dragBoundFunc", { in: pos, out: clamped });
        return clamped;
      }}
      draggable={(currentTool as Tool) !== "select"}
      x={stagePos.x}
      y={stagePos.y}
      scaleX={stageScale}
      scaleY={stageScale}
      onMouseDown={(e) => {
        const stage = stageRef.current;
        if (!stage) return;

        const isRightClick = e.evt.button === 1;
        const isCtrlClick = e.evt.ctrlKey;

        console.log("[CANVAS][MOUSE] onMouseDown", {
          btn: e.evt.button,
          ctrl: e.evt.ctrlKey,
          tool: currentTool,
          target: e.target?.getClassName?.(),
          stageDraggable: stage.draggable(),
        });

        if (isRightClick || isCtrlClick) {
          stage.draggable(true);
          setIsManualPan(true);
          stage.container().style.cursor = "grabbing";
          return;
        }

        if (currentTool === "select" && e.target !== stage) {
          console.log("[CANVAS][MOUSE] select mode, clicking object, no pan");
          return;
        }

        if (currentTool === "select" && e.target === stage) {
          const pointer = stage.getPointerPosition();
          if (!pointer) return;

          const transform = stage.getAbsoluteTransform().copy();
          transform.invert();
          const worldPos = transform.point(pointer);

          console.log("[CANVAS][MOUSE] start selectionBox at", worldPos);

          setSelectionStart(worldPos);
          setSelectionBox({ x: worldPos.x, y: worldPos.y, w: 0, h: 0 });
          return;
        }

        if (currentTool === "draw" && e.target === stage) {
          stage.draggable(false);
          handleStageClick(e);
          return;
        }

        stage.draggable(false);
        stage.container().style.cursor = "default";
      }}
      onMouseUp={(e) => {
        const stage = stageRef.current;
        if (!stage) return;

        console.log("[CANVAS][MOUSE] onMouseUp", {
          selectionBox,
          tool: currentTool,
          isManualPan,
        });

        // 🟦 Selezione multipla
        if (selectionBox && currentTool === "select") {
          const store = useEditorStore.getState();
          const box = {
            x1: selectionBox.x,
            y1: selectionBox.y,
            x2: selectionBox.x + selectionBox.w,
            y2: selectionBox.y + selectionBox.h,
          };

          const selected = store.objects
            .filter((o) => {
              const objLeft = o.x;
              const objRight = o.x + o.width;
              const objTop = o.y;
              const objBottom = o.y + o.height;

              const overlap =
                objRight >= box.x1 &&
                objLeft <= box.x2 &&
                objBottom >= box.y1 &&
                objTop <= box.y2;

              return overlap;
            })
            .map((o) => o.id);

          console.log("[CANVAS][MOUSE] selection completed", { box, selected });

          if (selected.length > 0) {
            const multi = e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey;
            if (multi) {
              const merged = Array.from(new Set([...store.selectedIds, ...selected]));
              store.deselectObject();
              merged.forEach((id) => store.selectObject(id, true));
            } else {
              store.deselectObject();
              selected.forEach((id) => store.selectObject(id, true));
            }
          } else {
            store.deselectObject();
          }

          setSelectionStart(null);
          setSelectionBox(null);
        }

        if (isManualPan) {
          console.log("[CANVAS][MOUSE] manual pan was active → skip reset here");
          return;
        }

        stage.draggable((currentTool as Tool) !== "select");
        stage.container().style.cursor = "default";
      }}
      onMouseMove={(e) => {
        if (!selectionStart) return;
        const stage = stageRef.current;
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const worldPos = transform.point(pointer);

        const x = Math.min(worldPos.x, selectionStart.x);
        const y = Math.min(worldPos.y, selectionStart.y);
        const w = Math.abs(worldPos.x - selectionStart.x);
        const h = Math.abs(worldPos.y - selectionStart.y);

        console.log("[CANVAS][MOUSE] update selectionBox", { x, y, w, h });

        setSelectionBox({ x, y, w, h });
      }}
    >
      {/* Sfondo */}
      <Layer listening={false}>
        {blendedImage && (
          <KonvaImage
            image={blendedImage}
            x={0}
            y={0}
            width={blendedImage.width}
            height={blendedImage.height}
          />
        )}
      </Layer>

      {/* Griglia */}
      <GridLayer
        showGrid={showGrid}
        blendedImage={blendedImage}
        gridSize={gridSize}
        stageScale={stageScale}
      />

      {/* 🟩 Layer della pala */}
      <ShovelTool
        stageRef={stageRef}
        stageScale={stageScale}
        radius={useEditorStore.getState().radius}
        terrain={useEditorStore.getState().terrain}
      />


      {/* Oggetti */}
      <Layer>
        <Text text={`Tool: ${currentTool}`} x={20} y={20} fill="#fff" />
        {objects.map((obj) => (
          <DraggableRect
            key={obj.id}
            obj={obj}
            isSelected={useEditorStore.getState().selectedIds.includes(obj.id)}
            currentTool={currentTool as Tool}
            blendedImage={blendedImage}
            selectObject={selectObject}
            moveObject={moveObject}
            setIsDraggingObject={setIsDraggingObject}
          />
        ))}

        {selectionBox && (
          <Rect
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.w}
            height={selectionBox.h}
            fill="rgba(52, 152, 219, 0.25)"
            stroke="#3498db"
            strokeWidth={1}
            listening={false}
          />
        )}

        <SelectionGroup
          selectedIds={selectedIds}
          objects={objects}
          moveObject={moveObject}
          stageRef={stageRef}
        />

        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
}
