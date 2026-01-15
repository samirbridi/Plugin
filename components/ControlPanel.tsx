import React, { useState, useEffect } from 'react';
import { TimerConfig, TimerStatus } from '../types';
import { AVAILABLE_FONTS } from '../constants';
import { Play, Pause, RotateCcw, Square, Code, Search, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  config: TimerConfig;
  setConfig: React.Dispatch<React.SetStateAction<TimerConfig>>;
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
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
  onStop,
  onReset,
  onGenerateCode,
  isGenerating
}) => {
  const [availableFonts, setAvailableFonts] = useState<string[]>(AVAILABLE_FONTS);
  const [canLoadFonts, setCanLoadFonts] = useState(false);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);

  useEffect(() => {
    if ('queryLocalFonts' in window) {
      setCanLoadFonts(true);
    }
  }, []);

  const handleLoadFonts = async () => {
    try {
      setIsLoadingFonts(true);
      // @ts-ignore: experimental API
      const localFonts = await window.queryLocalFonts();
      const sysFontFamilies = localFonts.map((f: any) => f.family);
      const mergedFonts = Array.from(new Set([...AVAILABLE_FONTS, ...sysFontFamilies]));
      const sortedFonts = mergedFonts.sort((a, b) => a.localeCompare(b));
      setAvailableFonts(sortedFonts);
    } catch (err) {
      console.error("Error loading fonts:", err);
      alert("Could not load system fonts.");
    } finally {
      setIsLoadingFonts(false);
    }
  };

  const handleChange = <K extends keyof TimerConfig>(key: K, value: TimerConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Helper to calculate H/M/S from total seconds for the UI
  const limitHours = Math.floor(config.limitSeconds / 3600);
  const limitMinutes = Math.floor((config.limitSeconds % 3600) / 60);
  const limitSeconds = config.limitSeconds % 60;

  const handleTimeChange = (type: 'h' | 'm' | 's', val: number) => {
    const safeVal = Math.max(0, val);
    let newTotal = 0;
    
    if (type === 'h') {
        newTotal = (safeVal * 3600) + (limitMinutes * 60) + limitSeconds;
    } else if (type === 'm') {
        newTotal = (limitHours * 3600) + (safeVal * 60) + limitSeconds;
    } else {
        newTotal = (limitHours * 3600) + (limitMinutes * 60) + safeVal;
    }
    
    handleChange('limitSeconds', newTotal);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl overflow-y-auto h-full text-sm flex flex-col">
      <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Plugin Configuration</h2>

      {/* Transport Controls */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Row 1: Start / Pause */}
        {status === TimerStatus.RUNNING ? (
          <button onClick={onPause} className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded font-bold transition">
            <Pause size={18} /> Pause
          </button>
        ) : (
          <button onClick={onStart} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white p-3 rounded font-bold transition">
            <Play size={18} /> Start
          </button>
        )}

        {/* Row 1: Reset (keeps state but zeroes time) */}
        <button onClick={onReset} className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white p-3 rounded font-bold transition">
          <RotateCcw size={18} /> Reset
        </button>

        {/* Row 2: Stop (Full width or separate?) Let's make it prominent */}
        <button onClick={onStop} className="col-span-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white p-3 rounded font-bold transition">
          <Square size={18} fill="currentColor" /> Stop
        </button>
      </div>

      {/* General Settings */}
      <div className="space-y-6 flex-1">
        
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
                        >
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
                            >
                              {isLoadingFonts ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                            </button>
                        )}
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
                    <label className="block text-gray-400 mb-2">Limit Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">Hours</span>
                            <input 
                                type="number" 
                                min="0"
                                value={limitHours}
                                onChange={(e) => handleTimeChange('h', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 outline-none text-center"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">Minutes</span>
                            <input 
                                type="number" 
                                min="0"
                                value={limitMinutes}
                                onChange={(e) => handleTimeChange('m', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 outline-none text-center"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">Seconds</span>
                            <input 
                                type="number" 
                                min="0"
                                value={limitSeconds}
                                onChange={(e) => handleTimeChange('s', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 outline-none text-center"
                            />
                        </div>
                    </div>
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

      {/* Author Info Footer (Moved here) */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">
           Progressive Timer
        </div>
        <div className="text-sm text-indigo-400 font-bold font-mono">
           v1.0 by Mizin
        </div>
      </div>
    </div>
  );
};