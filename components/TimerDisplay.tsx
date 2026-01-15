import React, { useMemo, useEffect, useState } from 'react';
import { TimerConfig, TimerStatus } from '../types';

interface TimerDisplayProps {
  elapsedSeconds: number;
  config: TimerConfig;
  status: TimerStatus;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ elapsedSeconds, config, status }) => {
  const [blinkVisible, setBlinkVisible] = useState(true);

  const remaining = config.limitSeconds - elapsedSeconds;
  const isLimitReached = config.limitEnabled && remaining <= 0;

  // Blinking effect logic
  useEffect(() => {
    let interval: number;
    if (isLimitReached && config.finalMessageBlink && status === TimerStatus.RUNNING) {
      interval = window.setInterval(() => {
        setBlinkVisible(v => !v);
      }, 500);
    } else {
      setBlinkVisible(true);
    }
    return () => clearInterval(interval);
  }, [isLimitReached, config.finalMessageBlink, status]);

  // Determine Color
  const currentColor = useMemo(() => {
    if (!config.limitEnabled) return config.colorDefault;
    if (remaining <= 5) return config.color5s;
    if (remaining <= 10) return config.color10s;
    if (remaining <= 15) return config.color15s;
    if (remaining <= 30) return config.color30s;
    return config.colorDefault;
  }, [remaining, config]);

  // Format Time HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    
    // Resolume typical format often omits hours if 0, but let's keep it standard MM:SS or HH:MM:SS
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const displayText = isLimitReached ? config.finalMessage : formatTime(elapsedSeconds);
  const opacity = !blinkVisible && isLimitReached ? 0 : 1;

  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative border border-gray-700 rounded-lg shadow-2xl">
      {/* Simulation of Resolume checkerboard background for transparency */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
             backgroundSize: '20px 20px',
             backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
           }} 
      />
      
      {/* Main Timer Text */}
      <div 
        style={{
          fontFamily: config.fontFamily,
          fontSize: `${config.fontSize}px`,
          color: currentColor,
          opacity: opacity,
          transition: 'color 0.3s ease',
          textShadow: '0 0 10px rgba(0,0,0,0.5)',
          zIndex: 10
        }}
        className="font-bold whitespace-nowrap select-none"
      >
        {displayText}
      </div>
    </div>
  );
};