import { useState, useRef, useCallback, useEffect } from 'react';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { useAppStore } from '../../store/appStore';

const MIN_LEFT = 200, MAX_LEFT = 380;
const MIN_RIGHT = 320, MAX_RIGHT = 520;

function ProgressBar({ datasets }) {
  const isActive = datasets.some(d => d.status === 'processing' || d.status === 'uploading');
  if (!isActive) return null;
  return (
    <div className="h-[2px] w-full overflow-hidden bg-[#e5e0da] flex-shrink-0">
      <div className="h-full bg-[#1a3c2e] rounded-full" style={{
        animation: 'progressSlide 1.8s ease-in-out infinite',
      }} />
    </div>
  );
}

export function WorkspaceLayout() {
  const { datasets } = useAppStore();
  const [leftW, setLeftW] = useState(250);
  const [rightW, setRightW] = useState(400);
  const containerRef = useRef(null);
  const dragging = useRef(null);

  const onDown = useCallback((side) => (e) => {
    e.preventDefault();
    dragging.current = side;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      if (dragging.current === 'left') setLeftW(Math.max(MIN_LEFT, Math.min(MAX_LEFT, e.clientX - r.left)));
      else setRightW(Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, r.right - e.clientX)));
    };
    const onUp = () => { dragging.current = null; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);

  const dividerCls = "w-[3px] cursor-col-resize hover:bg-[#1a3c2e]/15 active:bg-[#1a3c2e]/25 transition-colors flex-shrink-0 relative";

  return (
    <div ref={containerRef} className="flex flex-col h-screen overflow-hidden bg-[#f0ebe4]">
      <ProgressBar datasets={datasets} />
      <div className="flex flex-1 min-h-0">
        <div style={{ width: leftW, minWidth: leftW }} className="flex-shrink-0"><LeftPanel /></div>
        <div className={dividerCls} onMouseDown={onDown('left')}><div className="absolute inset-y-0 -left-1.5 -right-1.5" /></div>
        <div className="flex-1 min-w-0"><CenterPanel /></div>
        <div className={dividerCls} onMouseDown={onDown('right')}><div className="absolute inset-y-0 -left-1.5 -right-1.5" /></div>
        <div style={{ width: rightW, minWidth: rightW }} className="flex-shrink-0"><RightPanel /></div>
      </div>
    </div>
  );
}
