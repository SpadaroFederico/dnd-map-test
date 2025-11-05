import { create } from "zustand";

interface MapObject {
  id: string;
  name?: string;
  type?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  opacity: number;
  shadowBlur: number;
  shadowColor: string;
  visible: boolean;
  layer?: number;
  __offsetX?: number;
  __offsetY?: number;
}

type CoreTool = "draw" | "select" | "background" | "shovel" | "stamp";
type BrushShape = "circle" | "irregular" | "tile";
type ActionMode = "add" | "subtract";

interface EditorState {
  objects: MapObject[];
  selectedId: string | null;
  selectedIds: string[];
  currentTool: CoreTool | null;
  setCurrentTool: (tool: CoreTool | null) => void;

  brushShape: BrushShape;
  setBrushShape: (shape: BrushShape) => void;

  roughness: number;
  setRoughness: (r: number) => void;

  maskEnabled: boolean;
  setMaskEnabled: (v: boolean) => void;

  actionMode: ActionMode;
  setActionMode: (m: ActionMode) => void;

  // 🔹 background ora logico, non più path
  background: "grass" | "dirt" | "water";
  setBackground: (t: "grass" | "dirt" | "water") => void;

  addObject: (obj: MapObject) => void;
  selectObject: (id: string, multi?: boolean) => void;
  deselectObject: () => void;
  deleteSelectedObject: () => void;
  moveObject: (id: string, x: number, y: number) => void;
  setTool: (tool: "draw" | "select" | "background" | "shovel") => void;

  // 🔹 gestione pala
  terrain: "dirt" | "grass" | "water";
  setTerrain: (t: "dirt" | "grass" | "water") => void;

  radius: number;
  setRadius: (r: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: [],
  selectedId: null,
  selectedIds: [],
  currentTool: "select",
  setCurrentTool: (tool) => set({ currentTool: tool }),

  brushShape: "circle",
  setBrushShape: (shape) => set({ brushShape: shape }),

  roughness: 12,
  setRoughness: (r) => set({ roughness: r }),

  maskEnabled: false,
  setMaskEnabled: (v) => set({ maskEnabled: v }),

  actionMode: "add",
  setActionMode: (m) => set({ actionMode: m }),

  // 🌿 nuovo sistema background
  background: "grass",
  setBackground: (t) => set({ background: t }),

  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),

  selectObject: (id, multi = false) => {
    const { selectedIds } = get();

    if (multi) {
      const newSelection = selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id];

      set({
        selectedIds: newSelection,
        selectedId: newSelection.length === 1 ? newSelection[0] : null,
      });
    } else {
      set({ selectedIds: [id], selectedId: id });
    }
  },

  deselectObject: () => set({ selectedIds: [], selectedId: null }),

  deleteSelectedObject: () =>
    set((state) => ({
      objects: state.objects.filter((o) => !state.selectedIds.includes(o.id)),
      selectedIds: [],
      selectedId: null,
    })),

  moveObject: (id, x, y) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, x, y } : obj
      ),
    })),

  setTool: (tool) => set({ currentTool: tool }),

  terrain: "grass",
  setTerrain: (t) => set({ terrain: t }),

  radius: 80,
  setRadius: (r) => set({ radius: r }),
}));
