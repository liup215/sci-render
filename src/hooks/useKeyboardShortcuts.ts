import { useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import type { Tool } from '../types';

const TOOL_KEYS: Record<string, Tool> = {
  v: 'select',
  r: 'rect',
  c: 'circle',
  l: 'line',
  a: 'arrow',
  t: 'text',
};

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (isTyping) return;

      const store = useEditorStore.getState();
      const { tool, selectedIds } = store;

      // Tool switching (ignore when Ctrl/Cmd is held so shortcuts like Ctrl+C/V work)
      const nextTool = TOOL_KEYS[e.key.toLowerCase()];
      if (!e.ctrlKey && !e.metaKey && nextTool && nextTool !== tool) {
        store.setTool(nextTool);
        return;
      }

      // Escape cancels the current tool / drawing selection
      if (e.key === 'Escape') {
        if (tool !== 'select') {
          store.setTool('select');
        } else {
          store.clearSelection();
        }
        return;
      }

      // Select all on active slide
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        store.selectAll();
        return;
      }

      // Duplicate selected
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }

      // Copy / Paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        store.copySelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        store.paste();
        return;
      }

      // Group / Ungroup
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          store.ungroupSelected();
        } else {
          store.groupSelected();
        }
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        store.redo();
        return;
      }

      // Layer ordering shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        store.bringToFront();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        store.sendToBack();
        return;
      }
      if (e.key === ']') {
        store.moveForward();
        return;
      }
      if (e.key === '[') {
        store.moveBackward();
        return;
      }

      // Nudge with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedIds.length === 0) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        store.moveObjects(dx, dy);
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
