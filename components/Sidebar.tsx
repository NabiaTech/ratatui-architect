import React from 'react';
import { TuiPanel } from './ui/TuiPanel';
import { Topic } from '../types';
import { Terminal, Layout, List, Type, MousePointer, Layers } from 'lucide-react';

interface SidebarProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
  selectedTopicId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, onSelectTopic, selectedTopicId }) => {
  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'layout': return <Layout size={16} />;
      case 'widget': return <List size={16} />;
      case 'text': return <Type size={16} />;
      case 'event': return <MousePointer size={16} />;
      case 'layers': return <Layers size={16} />;
      default: return <Terminal size={16} />;
    }
  };

  return (
    <TuiPanel title="Explorer" className="h-full w-64 flex-shrink-0 mr-4 hidden md:flex">
      <div className="flex flex-col gap-2 h-full">
        <div className="text-xs text-tui-muted mb-2 uppercase tracking-wider">Quick Start</div>
        <div className="flex flex-col gap-1 overflow-y-auto">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`flex items-center gap-3 px-3 py-2 text-sm text-left transition-all hover:bg-white/5 
                ${selectedTopicId === topic.id 
                  ? 'bg-white/10 text-tui-accent border-l-2 border-tui-accent' 
                  : 'text-tui-muted border-l-2 border-transparent'}`}
            >
              {getIcon(topic.icon)}
              <span>{topic.title}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-tui-border">
          <div className="text-xs text-tui-muted">
            <p>Ratatui Architect v1.0</p>
            <p className="opacity-50 mt-1">Powered by Gemini 2.5</p>
          </div>
        </div>
      </div>
    </TuiPanel>
  );
};