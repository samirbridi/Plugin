import React, { useState, useEffect } from 'react';
import { TimerConfig, TimerStatus } from '../types';
import { AVAILABLE_FONTS } from '../constants';
import { Play, Pause, RotateCcw, Code, Search, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  config: TimerConfig;
  setConfig: React.Dispatch<React.SetStateAction<TimerConfig>>;
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onGenerateCode: () => void;
  isGenerating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  setConfig,
  status,
  onStart,
  onPause,
  onReset,
  onGenerateCode,
  isGenerating
}) => {
  const [availableFonts, setAvailableFonts] = useState<string[]>(AVAILABLE_FONTS);
  const [canLoadFonts, setCanLoadFonts] = useState(false);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);

  useEffect(() => {
    // Check if the Local Font Access API is supported (Chrome/Edge/Opera)
    if ('queryLocalFonts' in window) {
      setCanLoadFonts(true);
    }
  }, []);

  const handleLoadFonts = async () => {
    try {
      setIsLoadingFonts(true);
      // @ts-ignore: experimental API
      const localFonts = await window.queryLocalFonts();
      
      // Extract family names
      const sysFontFamilies = localFonts.map((f: any) => f.family);
      
      // Merge with default fonts to ensure we have a complete list
      // Use Set to remove duplicates
      const mergedFonts = Array.from(new Set([...AVAILABLE_FONTS, ...sysFontFamilies]));
      
      // Sort alphabetically for easier finding
      const sortedFonts = mergedFonts.sort((a, b) => a.localeCompare(b));
      
      setAvailableFonts(sortedFonts);
    } catch (err) {
      console.error("Error loading fonts:", err);
      alert("Could not load system fonts. Please ensure you grant permission when prompted by the browser.");
    } finally {
      setIsLoadingFonts(false);
    }
  };

  const handleChange = <K extends keyof TimerConfig>(key: K, value: TimerConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl overflow-y-auto h-full text-sm">
      <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Plugin Configuration</h2>

      {/* Transport Controls */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {status === TimerStatus.RUNNING ? (
          <button onClick={onPause} className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded font-bold transition">
            <Pause size={18} /> Pause
          </button>
        ) : (
          <button onClick={onStart} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white p-3 rounded font-bold transition">
            <Play size={18} /> Start
          </button>
        )}
        <button onClick={onReset} className="col-span-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white p-3 rounded font-bold transition">
          <RotateCcw size={18} /> Reset
        </button>
      </div>

      {/* General Settings */}
      <div className="space-y-6">
        
        {/* Font Config */}
        <section>
            <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wider">Appearance</h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-gray-400 mb-1">Font Family</label>
                    <div className="flex gap-2">
                        <select 
                            value={config.fontFamily}
                            onChange={(e) => handleChange('fontFamily', e.target.value)}
                            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            style={{ backgroundImage: 'none' }} // Remove default arrow to style cleaner if needed, or keep default
                        >
                            {/* Ensure the current font is an option even if not in the list yet */}
                            {!availableFonts.includes(config.fontFamily) && (
                                <option value={config.fontFamily}>{config.fontFamily}</option>
                            )}
                            {availableFonts.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                        
                        {canLoadFonts && (
                            <button 
                              onClick={handleLoadFonts}
                              disabled={isLoadingFonts}
                              className="px-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white rounded flex items-center justify-center transition disabled:opacity-50"
                              title="Scan/Refresh System Fonts"
                            >
                              {isLoadingFonts ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                            </button>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {canLoadFonts 
                        ? "Click the search icon to load all fonts installed on your computer." 
                        : "Browser does not support scanning local fonts. Using standard list."}
                    </div>
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Size (px)</label>
                    <input 
                        type="number" 
                        value={config.fontSize}
                        onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 outline-none"
                    />
                </div>
            </div>
        </section>

        {/* Limit Config */}
        <section>
            <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wider">Time & Limit</h3>
            <div className="flex items-center gap-3 mb-3">
                <input 
                    type="checkbox" 
                    id="limitEnabled"
                    checked={config.limitEnabled}
                    onChange={(e) => handleChange('limitEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600"
                />
                <label htmlFor="limitEnabled" className="text-white select-none">Enable Time Limit</label>
            </div>
            
            {config.limitEnabled && (
                <div>
                    <label className="block text-gray-400 mb-1">Limit (Seconds)</label>
                    <input 
                        type="number" 
                        value={config.limitSeconds}
                        onChange={(e) => handleChange('limitSeconds', Number(e.target.value))}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 outline-none"
                    />
                    <div className="text-xs text-gray-500 mt-1">{(config.limitSeconds / 60).toFixed(1)} minutes</div>
                </div>
            )}
        </section>

        {/* Colors Config */}
        {config.limitEnabled && (
        <section>
            <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wider">Threshold Colors</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Default</span>
                    <input type="color" value={config.colorDefault} onChange={(e) => handleChange('colorDefault', e.target.value)} className="h-8 w-14 bg-transparent cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-green-400">30s Remaining</span>
                    <input type="color" value={config.color30s} onChange={(e) => handleChange('color30s', e.target.value)} className="h-8 w-14 bg-transparent cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-blue-400">15s Remaining</span>
                    <input type="color" value={config.color15s} onChange={(e) => handleChange('color15s', e.target.value)} className="h-8 w-14 bg-transparent cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-yellow-400">10s Remaining</span>
                    <input type="color" value={config.color10s} onChange={(e) => handleChange('color10s', e.target.value)} className="h-8 w-14 bg-transparent cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-red-400">5s Remaining</span>
                    <input type="color" value={config.color5s} onChange={(e) => handleChange('color5s', e.target.value)} className="h-8 w-14 bg-transparent cursor-pointer" />
                </div>
            </div>
        </section>
        )}

        {/* Final Message Config */}
        {config.limitEnabled && (
        <section>
             <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wider">End Event</h3>
             <div className="space-y-3">
                <div>
                    <label className="block text-gray-400 mb-1">Final Message</label>
                    <input 
                        type="text" 
                        value={config.finalMessage}
                        onChange={(e) => handleChange('finalMessage', e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 outline-none"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="blink"
                        checked={config.finalMessageBlink}
                        onChange={(e) => handleChange('finalMessageBlink', e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <label htmlFor="blink" className="text-white select-none">Blink Message</label>
                </div>
             </div>
        </section>
        )}

        <hr className="border-gray-700 my-4" />

        <button 
            onClick={onGenerateCode}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded font-bold text-white transition ${isGenerating ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
            {isGenerating ? (
                <span>Generating C++...</span>
            ) : (
                <>
                  <Code size={20} /> Generate C++ / DLL Code
                </>
            )}
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
            Generates code for compilation into a .dll
        </p>

      </div>
    </div>
  );
};