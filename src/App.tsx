import { useRef, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { SlidePanel } from './components/SlidePanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CanvasStage } from './components/CanvasStage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './index.css';

function App() {
  useKeyboardShortcuts();
  const stageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Placeholder for export hook; real export is triggered by toolbar custom event.
    const handler = () => {
      // eslint-disable-next-line no-console
      console.log('Export requested');
    };
    window.addEventListener('sci-render:export', handler);
    return () => window.removeEventListener('sci-render:export', handler);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">SciRender</div>
      </header>
      <Toolbar />
      <div className="app-body">
        <SlidePanel />
        <div ref={stageContainerRef} className="canvas-area">
          <CanvasStage />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App
