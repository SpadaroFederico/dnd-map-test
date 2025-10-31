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
}

interface EditorState {
  objects: MapObject[];
  selectedId: string | null;
  currentTool: "draw" | "select" | "background";
  background: string; 
  setBackground: (texture: string) => void; 
  addObject: (obj: MapObject) => void;
  selectObject: (id: string | null) => void;
  moveObject: (id: string, x: number, y: number) => void;
  setTool: (tool: "draw" | "select" | "background") => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  objects: [],
  selectedId: null,
  currentTool: "draw",
  background: "/assets/grass.png", 
  setBackground: (texture) => set({ background: texture }),
  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
  selectObject: (id) => set({ selectedId: id }),
  moveObject: (id, x, y) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, x, y } : obj
      ),
    })),
  setTool: (tool) => set({ currentTool: tool }),
}));
