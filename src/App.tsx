import { useRef, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { LeftPanel } from './components/LeftPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CanvasStage } from './components/CanvasStage';
import { Rulers } from './components/Rulers';
import { useEditorStore } from './store/useEditorStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './index.css';

function App() {
  useKeyboardShortcuts();
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const { rulersVisible } = useEditorStore();

  useEffect(() => {
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
        <Toolbar />
      </header>
      <div className="app-body">
        <LeftPanel />
        <div ref={stageContainerRef} className="canvas-area">
          <div
            className="canvas-workspace"
            style={{
              gridTemplateColumns: rulersVisible ? '20px 1fr' : '0px 1fr',
              gridTemplateRows: rulersVisible ? '20px 1fr' : '0px 1fr',
            }}
          >
            <Rulers />
            <div className="stage-wrapper">
              <CanvasStage />
            </div>
          </div>
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App
