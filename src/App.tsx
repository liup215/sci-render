import { useRef, useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { SlidePanel } from './components/SlidePanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CanvasStage } from './components/CanvasStage';
import { IconLibrary } from './components/IconLibrary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './index.css';

function App() {
  useKeyboardShortcuts();
  const [iconLibraryOpen, setIconLibraryOpen] = useState(false);
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
      <Toolbar onOpenIconLibrary={() => setIconLibraryOpen(true)} />
      <div className="app-body">
        <SlidePanel />
        <div ref={stageContainerRef} className="canvas-area">
          <CanvasStage />
          {iconLibraryOpen && <IconLibrary onClose={() => setIconLibraryOpen(false)} />}
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App
