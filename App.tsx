import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { PreviewPane } from './components/PreviewPane';
import { TuiPanel } from './components/ui/TuiPanel';
import { Message, LoadingState, Topic } from './types';
import { INITIAL_TOPICS } from './constants';
import { sendMessageToGemini } from './services/geminiService';
import { Send, TerminalSquare, LayoutTemplate, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  
  // New state for View Mode (Split vs Chat)
  const [showPreview, setShowPreview] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loadingState === LoadingState.LOADING) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoadingState(LoadingState.LOADING);

    try {
      const responseText = await sendMessageToGemini(messages, content);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I encountered an error connecting to the neural core. Please check your API key or network connection.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  }, [messages, loadingState]);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopicId(topic.id);
    handleSendMessage(topic.prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-tui-bg p-4 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 pb-2 border-b border-tui-border">
        <div className="flex items-center gap-2">
          <TerminalSquare className="text-tui-accent" />
          <h1 className="text-xl font-bold tracking-tight text-tui-text">
            RATATUI <span className="text-tui-accent">ARCHITECT</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-tui-panel border border-tui-border rounded-lg p-0.5">
             <button 
              onClick={() => setShowPreview(false)}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded transition-colors ${!showPreview ? 'bg-white/10 text-tui-text' : 'text-tui-muted hover:text-tui-text'}`}
             >
                <MessageSquare size={14} />
                CHAT
             </button>
             <button 
              onClick={() => setShowPreview(true)}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded transition-colors ${showPreview ? 'bg-white/10 text-tui-text' : 'text-tui-muted hover:text-tui-text'}`}
             >
                <LayoutTemplate size={14} />
                SPLIT VIEW
             </button>
          </div>
          <div className="hidden sm:block text-xs text-tui-muted font-mono border-l border-tui-border pl-4">
            STATUS: ONLINE | SYSTEM: RUST 1.75+
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 min-h-0 gap-4">
        <Sidebar 
          topics={INITIAL_TOPICS} 
          onSelectTopic={handleTopicSelect}
          selectedTopicId={selectedTopicId}
        />
        
        {/* Main Work Area */}
        <div className="flex flex-1 gap-4 min-w-0">
          
          {/* Chat Column */}
          <div className={`flex flex-col h-full gap-4 transition-all duration-300 ${showPreview ? 'w-1/2' : 'w-full'}`}>
             <ChatArea messages={messages} loadingState={loadingState} />
             
             {/* Input Area */}
            <TuiPanel className="h-24 flex-shrink-0" title="Input">
              <div className="flex h-full gap-2">
                <span className="text-tui-accent py-2">{'>'}</span>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about widgets, layout, or paste code to debug..."
                  className="flex-1 bg-transparent border-none outline-none resize-none text-tui-text font-mono py-2 custom-scrollbar"
                  disabled={loadingState === LoadingState.LOADING}
                />
                <button 
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={loadingState === LoadingState.LOADING || !inputValue.trim()}
                  className="self-end mb-1 p-2 text-tui-muted hover:text-tui-accent transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </TuiPanel>
          </div>

          {/* Preview Column (Conditional) */}
          {showPreview && (
            <div className="w-1/2 h-full flex flex-col min-w-[300px]">
              <PreviewPane isActive={showPreview} />
            </div>
          )}

        </div>
      </div>

      {/* Footer Hints */}
      <div className="mt-2 flex gap-4 text-xs text-tui-muted font-mono hidden sm:flex">
        <span>[Enter] Send</span>
        <span>[Shift+Enter] New Line</span>
        <span className="flex-1 text-right">v0.1.0-alpha</span>
      </div>
    </div>
  );
};

export default App;
