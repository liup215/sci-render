import { Toolbox } from './Toolbox';
import { IconLibraryContent } from './IconLibraryContent';

export function LeftPanel() {
  return (
    <div className="left-panel">
      <Toolbox />
      <div className="left-panel-body">
        <IconLibraryContent />
      </div>
    </div>
  );
}
