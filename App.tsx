import React, { useState, useEffect, useRef } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { ControlPanel } from './components/ControlPanel';
import { DEFAULT_CONFIG } from './constants';
import { TimerConfig, TimerStatus } from './types';
import { generateFFGLCode } from './services/geminiService';
import { X, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Modal State for Code
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleStart = () => setStatus(TimerStatus.RUNNING);
  const handlePause = () => setStatus(TimerStatus.PAUSED);
  const handleStop = () => {
    setStatus(TimerStatus.IDLE);
    setElapsedSeconds(0);
  };
  const handleReset = () => {
    // If running, we keep running but from 0. If paused, we stay paused at 0.
    setElapsedSeconds(0);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const code = await generateFFGLCode(config);
    setGeneratedCode(code);
    setIsGenerating(false);
    setShowCodeModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-gray-800">
        <ControlPanel 
          config={config} 
          setConfig={setConfig} 
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onReset={handleReset}
          onGenerateCode={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 h-full flex flex-col p-6 bg-gray-950">
        <header className="mb-6 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight uppercase text-indigo-400">Progressive Timer</h1>
                <p className="text-gray-500 mt-1">Resolume Arena Plugin Designer</p>
            </div>
            <div className="text-right text-xs text-gray-600">
                Designed for Resolume 7+<br/>
                Output: C++ (Source)
            </div>
        </header>

        <div className="flex-1 relative">
            <TimerDisplay 
              elapsedSeconds={elapsedSeconds} 
              config={config} 
              status={status}
            />
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-800 text-sm text-gray-400">
            <strong>Note:</strong> This web application simulates the plugin logic. To use this in Resolume Arena, 
            use the "Generate C++" button to get the source code, then compile it as a .dll using Visual Studio 
            with the FFGL SDK.
        </div>
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Generated C++ Source Code</h2>
              <div className="flex gap-2">
                 <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition"
                 >
                    {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                    {copySuccess ? 'Copied' : 'Copy Code'}
                 </button>
                 <button onClick={() => setShowCodeModal(false)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400">
                    <X size={24} />
                 </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
              <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-800 text-xs text-gray-400">
                Instructions: 1. Download FFGL SDK. 2. Create new VS Project. 3. Paste this code into source. 4. Compile as DLL (Release x64). 5. Place in Resolume effects folder.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;