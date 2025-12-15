import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { TuiPanel } from './ui/TuiPanel';
import { Play, Power, Upload, FileCode, Binary, Trash2 } from 'lucide-react';

const BOOT_MESSAGE = `
\x1b[33m    ____        __        __        _ 
   / __ \\____ _/ /_____ _/ /___  __(_)
  / /_/ / __ \`/ __/ __ \`/ __/ / / / / 
 / _, _/ /_/ / /_/ /_/ / /_/ /_/ / /  
/_/ |_|\\__,_/\\__/\\__,_/\\__/\\__,_/_/   \x1b[0m

\x1b[37mStatus: \x1b[32mReady\x1b[37m
Backend: \x1b[36mxterm.js (WebGL)\x1b[0m
----------------------------------------
\x1b[90m> Drop .wasm files to mount them
> Select a file below to execute\x1b[0m
`;

interface PreviewPaneProps {
  isActive?: boolean;
}

interface MountedFile {
  name: string;
  size: number;
  type: 'wasm' | 'binary' | 'other';
  file: File;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ isActive = false }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mountedFiles, setMountedFiles] = useState<MountedFile[]>([]);
  const wasmInstanceRef = useRef<WebAssembly.Instance | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#000000',
        foreground: '#e5e5e5',
        cursor: '#facc15',
        selectionBackground: 'rgba(250, 204, 21, 0.3)',
      },
      allowProposedApi: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.write(BOOT_MESSAGE);

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
    return () => clearTimeout(timer);
  }, [isActive]);

  // --- WASM LOADING LOGIC ---

  const logToTerm = (msg: string, color: string = '37') => {
    xtermRef.current?.write(`\r\n\x1b[${color}m${msg}\x1b[0m`);
  };

  const executeWasm = async (file: File) => {
    if (!xtermRef.current) return;
    
    // Reset Terminal
    xtermRef.current.reset();
    logToTerm(`[LOADER] Reading ${file.name}...`, '36');

    try {
      const buffer = await file.arrayBuffer();
      
      const imports = {
        env: {
          memory: new WebAssembly.Memory({ initial: 256 }),
          abort: () => logToTerm('Error: WASM aborted', '31'),
        },
        wasi_snapshot_preview1: {
          fd_write: () => 0,
          proc_exit: () => logToTerm('[PROCESS] Exit called', '33'),
        }
      };

      logToTerm('[LOADER] Instantiating WebAssembly module...', '36');
      
      try {
        const { instance } = await WebAssembly.instantiate(buffer, imports);
        wasmInstanceRef.current = instance;
        setIsWasmLoaded(true);
        
        logToTerm('[SUCCESS] WASM Loaded Successfully!', '32');
        logToTerm('----------------------------------------', '90');
        
        const exports = instance.exports as any;
        if (exports.main) {
           logToTerm('[EXEC] Running main()...', '32');
           exports.main();
        } else if (exports._start) {
           logToTerm('[EXEC] Running _start() (WASI)...', '32');
           exports._start();
        } else {
           logToTerm('[WARN] No entry point (main/_start) found.', '33');
           logToTerm('Available exports: ' + Object.keys(exports).join(', '), '90');
        }

      } catch (instantiateError: any) {
        logToTerm('[ERROR] Instantiation Failed:', '31');
        logToTerm(instantiateError.message, '31');
      }

    } catch (e: any) {
      logToTerm(`[ERROR] Failed to load file: ${e.message}`, '31');
    }
  };

  // --- HANDLERS ---

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const newMountedFiles: MountedFile[] = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.name.endsWith('.wasm') ? 'wasm' : 'binary',
      file: f
    }));

    setMountedFiles(prev => [...prev, ...newMountedFiles]);
    
    if (newMountedFiles.length > 0) {
      logToTerm(`[SYSTEM] Mounted ${newMountedFiles.length} file(s).`, '32');
      newMountedFiles.forEach(f => logToTerm(`  + ${f.name}`, '90'));
    }
  }, []);

  const handleSimulateRun = () => {
    if (!xtermRef.current) return;
    setIsWasmLoaded(true);
    xtermRef.current.reset();
    xtermRef.current.write('\x1b[?25l');
    
    const drawBox = () => {
        const t = xtermRef.current;
        if(!t) return;
        t.write('\x1b[2J\x1b[H');
        t.write('\x1b[38;5;220m┌──────────────────────────────────────────────────┐\r\n');
        t.write('│                 NABI SIMULATION                  │\r\n');
        t.write('├──────────────────────────────────────────────────┤\r\n');
        t.write('│  Simulating output for debugging purposes...     │\r\n');
        t.write('└──────────────────────────────────────────────────┘\r\n');
    };
    drawBox();
  };

  const handleStop = () => {
    if (!xtermRef.current) return;
    setIsWasmLoaded(false);
    wasmInstanceRef.current = null;
    xtermRef.current.write('\x1b[?25h');
    xtermRef.current.write('\x1b[2J\x1b[H');
    xtermRef.current.write(BOOT_MESSAGE);
    xtermRef.current.write('\n\x1b[31m[PROCESS] Terminated.\x1b[0m\r\n');
  };

  const removeFile = (fileName: string) => {
    setMountedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  return (
    <TuiPanel title="View / WASM Target" className="h-full flex flex-col" isActive={isActive}>
      {/* Control Bar */}
      <div className="absolute top-2 right-4 z-10 flex gap-2">
         {isWasmLoaded ? (
            <button 
              onClick={handleStop}
              className="flex items-center gap-2 bg-tui-error text-white px-3 py-1 text-xs font-bold rounded hover:opacity-90 transition-opacity"
            >
              <Power size={12} />
              STOP
            </button>
         ) : (
            <button 
              onClick={handleSimulateRun}
              className="flex items-center gap-2 bg-white/10 text-tui-muted px-3 py-1 text-xs font-bold rounded hover:bg-white/20 transition-colors"
            >
              <Play size={12} />
              TEST
            </button>
         )}
      </div>

      {/* Terminal Area */}
      <div 
        className={`flex-1 bg-black rounded border overflow-hidden relative p-1 transition-colors duration-200 ${isDragging ? 'border-tui-accent bg-white/5' : 'border-tui-border'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
            ref={terminalRef} 
            className="w-full h-full"
        />
        
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none">
             <div className="flex flex-col items-center text-tui-accent animate-bounce">
                <Upload size={48} />
                <span className="mt-4 font-bold font-mono text-lg">MOUNT FILES</span>
             </div>
          </div>
        )}
      </div>
      
      {/* Mounted Files List */}
      <div className="mt-2 border-t border-tui-border pt-2">
        <div className="text-xs text-tui-muted font-mono mb-2 flex justify-between items-center">
            <span>MOUNTED FILES ({mountedFiles.length})</span>
            <span>{isWasmLoaded ? 'Running' : 'Idle'}</span>
        </div>
        
        {mountedFiles.length === 0 ? (
            <div className="text-xs text-tui-muted/50 italic py-2 text-center border border-dashed border-tui-border rounded">
                No files mounted. Drag & drop here.
            </div>
        ) : (
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                {mountedFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded border border-transparent hover:border-tui-border group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {f.type === 'wasm' ? <FileCode size={14} className="text-tui-accent" /> : <Binary size={14} className="text-blue-400" />}
                            <span className="text-xs text-tui-text font-mono truncate max-w-[150px]">{f.name}</span>
                            <span className="text-[10px] text-tui-muted">{(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {f.type === 'wasm' && !isWasmLoaded && (
                                <button 
                                    onClick={() => executeWasm(f.file)}
                                    className="text-[10px] bg-tui-accent text-black px-1.5 py-0.5 rounded font-bold hover:opacity-80"
                                >
                                    RUN
                                </button>
                            )}
                            <button 
                                onClick={() => removeFile(f.name)}
                                className="text-tui-muted hover:text-tui-error opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </TuiPanel>
  );
};
