import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  audioLevel: number;
  isSpeaking: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, audioLevel, isSpeaking }) => {
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="flex justify-center items-center h-32">
      <div className="flex items-end gap-1 h-20">
        {bars.map((bar) => {
          const height = isActive 
            ? Math.max(10, (audioLevel * 80) + (Math.sin(Date.now() / 200 + bar) * 10))
            : isSpeaking 
            ? Math.max(10, 40 + (Math.sin(Date.now() / 150 + bar) * 20))
            : 10;
          
          return (
            <div
              key={bar}
              className={`w-2 rounded-full transition-all duration-100 ${
                isActive 
                  ? 'bg-gradient-to-t from-blue-500 to-cyan-400' 
                  : isSpeaking
                  ? 'bg-gradient-to-t from-green-500 to-emerald-400'
                  : 'bg-slate-600'
              }`}
              style={{
                height: `${height}px`,
                animationDelay: `${bar * 50}ms`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioVisualizer;