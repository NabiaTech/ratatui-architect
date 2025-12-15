import React from 'react';

interface TuiPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export const TuiPanel: React.FC<TuiPanelProps> = ({ title, children, className = "", isActive = false }) => {
  return (
    <div className={`relative flex flex-col border ${isActive ? 'border-tui-accent' : 'border-tui-border'} bg-tui-panel ${className} transition-colors duration-200`}>
      {title && (
        <div className="absolute -top-3 left-4 bg-tui-panel px-2 text-sm font-bold text-tui-text">
          <span className={isActive ? 'text-tui-accent' : 'text-tui-muted'}>
            [{title}]
          </span>
        </div>
      )}
      <div className="flex-1 overflow-hidden p-4">
        {children}
      </div>
    </div>
  );
};