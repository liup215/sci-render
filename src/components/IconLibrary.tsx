import { IconLibraryContent } from './IconLibraryContent';

interface IconLibraryProps {
  onClose: () => void;
}

export function IconLibrary({ onClose }: IconLibraryProps) {
  return (
    <div className="icon-library-panel">
      <div className="icon-library-header">
        <span className="icon-library-title">图标库</span>
        <button className="icon-library-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <IconLibraryContent />
    </div>
  );
}
