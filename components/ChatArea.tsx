import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { TuiPanel } from './ui/TuiPanel';
import { Message, LoadingState } from '../types';
import { Bot, User, Copy, Check } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  loadingState: LoadingState;
}

const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = React.useState(false);
  const content = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if it's an inline code snippet or a block
  const isInline = !className;

  if (isInline) {
    return <code className="bg-white/10 px-1 py-0.5 rounded text-tui-accent font-mono text-sm">{children}</code>;
  }

  return (
    <div className="relative group my-4 rounded border border-tui-border bg-black/50 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-tui-border">
        <span className="text-xs text-tui-muted uppercase font-mono">rust</span>
        <button 
          onClick={handleCopy}
          className="text-tui-muted hover:text-tui-text transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-tui-success" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-gray-300 whitespace-pre">
          {content}
        </code>
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, loadingState }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  return (
    <TuiPanel title="Terminal Output" className="flex-1 min-h-0" isActive={true}>
      <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-tui-muted opacity-50">
            <Bot size={48} className="mb-4" />
            <p>Ready to build TUIs.</p>
            <p className="text-sm">Select a topic or type a query.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded bg-tui-border flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-tui-accent" />
              </div>
            )}
            
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-white/5 border border-tui-border rounded-lg p-3' : ''}`}>
              {msg.role === 'model' ? (
                 <div className="prose prose-invert prose-sm max-w-none text-tui-text">
                   <ReactMarkdown
                      components={{
                        code: CodeBlock as any
                      }}
                   >
                     {msg.content}
                   </ReactMarkdown>
                 </div>
              ) : (
                <div className="text-tui-text">{msg.content}</div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loadingState === LoadingState.LOADING && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded bg-tui-border flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={16} className="text-tui-muted" />
              </div>
              <div className="flex items-center gap-1 text-tui-accent mt-2">
                <span className="w-2 h-2 bg-tui-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-tui-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-tui-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </TuiPanel>
  );
};