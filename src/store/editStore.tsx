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

interface EditorState {
  objects: MapObject[];
  selectedId: string | null;
  selectedIds: string[];
  currentTool: "draw" | "select" | "background" | "shovel" | null;
  setCurrentTool: (
    tool: "draw" | "select" | "background" | "shovel" | null
  ) => void;
  background: string;
  setBackground: (texture: string) => void;
  addObject: (obj: MapObject) => void;
  selectObject: (id: string, multi?: boolean) => void;
  deselectObject: () => void;
  deleteSelectedObject: () => void;
  moveObject: (id: string, x: number, y: number) => void;
  setTool: (tool: "draw" | "select" | "background" | "shovel") => void;

  // 🔹 nuovi stati globali
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
  background: "/assets/grass.png",

  setBackground: (texture) => set({ background: texture }),

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

  // 🔹 gestione pala
  terrain: "grass",
  setTerrain: (t) => set({ terrain: t }),
  radius: 80,
  setRadius: (r) => set({ radius: r }),
}));
