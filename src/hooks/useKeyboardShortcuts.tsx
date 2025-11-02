import { useEffect } from "react";
import { useEditorStore } from "../store/editStore";

/**
 * Gestisce le scorciatoie da tastiera globali:
 * - ESC → deseleziona tutto
 * - DELETE / BACKSPACE → elimina oggetti selezionati
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useEditorStore.getState();

      switch (e.key) {
        case "Escape":
          state.deselectObject();
          break;

        case "Delete":
        case "Backspace":
          if (state.selectedIds.length > 0) {
            state.deleteSelectedObject();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
