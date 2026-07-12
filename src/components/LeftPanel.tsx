import { useState } from 'react';
import { SlidePanel } from './SlidePanel';
import { IconLibraryContent } from './IconLibraryContent';

type LeftTab = 'slides' | 'icons';

export function LeftPanel() {
  const [tab, setTab] = useState<LeftTab>('slides');

  return (
    <div className="left-panel">
      <div className="left-panel-tabs">
        <button
          className={tab === 'slides' ? 'active' : ''}
          onClick={() => setTab('slides')}
        >
          Slides
        </button>
        <button
          className={tab === 'icons' ? 'active' : ''}
          onClick={() => setTab('icons')}
        >
          Icons
        </button>
      </div>
      <div className="left-panel-body">
        {tab === 'slides' && <SlidePanel />}
        {tab === 'icons' && <IconLibraryContent />}
      </div>
    </div>
  );
}
