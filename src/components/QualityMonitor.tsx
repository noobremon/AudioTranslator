import React from 'react';
import { Activity, Signal, Volume2, Zap, TrendingUp, Clock, Cpu, Wifi } from 'lucide-react';

interface AudioQualityMetrics {
  signalToNoise: number;
  clarity: number;
  volume: number;
  stability: number;
}

interface QualityMonitorProps {
  metrics: AudioQualityMetrics;
  sessionDuration: number;
  isActive: boolean;
}

const QualityMonitor: React.FC<QualityMonitorProps> = ({ metrics, sessionDuration, isActive }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (value: number): string => {
    if (value >= 0.85) return 'text-green-400';
    if (value >= 0.7) return 'text-blue-400';
    if (value >= 0.5) return 'text-yellow-400';
    if (value >= 0.3) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityBg = (value: number): string => {
    if (value >= 0.85) return 'bg-green-500';
    if (value >= 0.7) return 'bg-blue-500';
    if (value >= 0.5) return 'bg-yellow-500';
    if (value >= 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getQualityLabel = (value: number): string => {
    if (value >= 0.85) return 'Excellent';
    if (value >= 0.7) return 'Very Good';
    if (value >= 0.5) return 'Good';
    if (value >= 0.3) return 'Fair';
    return 'Poor';
  };

  const overallQuality = (metrics.signalToNoise + metrics.clarity + metrics.volume + metrics.stability) / 4;
  const translationReadiness = overallQuality >= 0.7;

  return (
    <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          Professional Audio Quality Monitor
        </h3>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
            isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
          }`}>
            {isActive ? <Wifi className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            {isActive ? 'LIVE PROCESSING' : 'STANDBY'}
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-700/50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{formatDuration(sessionDuration)}</span>
          </div>
        </div>
      </div>

      {/* Overall Quality Indicator */}
      <div className="mb-6 bg-slate-700/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Translation Readiness
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${getQualityColor(overallQuality)}`}>
              {(overallQuality * 100).toFixed(0)}%
            </span>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              translationReadiness 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
            }`}>
              {translationReadiness ? 'READY' : 'OPTIMIZING'}
            </div>
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getQualityBg(overallQuality)} relative overflow-hidden`}
            style={{ width: `${overallQuality * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {getQualityLabel(overallQuality)} audio quality - {translationReadiness ? 'Optimal for 1-hour continuous translation' : 'Adjusting for maximum accuracy'}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Signal to Noise Ratio */}
        <div className="bg-slate-700/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Signal className={`w-6 h-6 ${getQualityColor(metrics.signalToNoise)}`} />
          </div>
          <div className="text-xs text-slate-400 mb-2 font-semibold">SIGNAL/NOISE</div>
          <div className={`text-xl font-bold ${getQualityColor(metrics.signalToNoise)} mb-2`}>
            {(metrics.signalToNoise * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getQualityBg(metrics.signalToNoise)}`}
              style={{ width: `${metrics.signalToNoise * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.signalToNoise >= 0.8 ? 'Crystal Clear' : 
             metrics.signalToNoise >= 0.6 ? 'Very Clean' : 
             metrics.signalToNoise >= 0.4 ? 'Clean' : 'Noisy'}
          </div>
        </div>

        {/* Clarity */}
        <div className="bg-slate-700/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Zap className={`w-6 h-6 ${getQualityColor(metrics.clarity)}`} />
          </div>
          <div className="text-xs text-slate-400 mb-2 font-semibold">CLARITY</div>
          <div className={`text-xl font-bold ${getQualityColor(metrics.clarity)} mb-2`}>
            {(metrics.clarity * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getQualityBg(metrics.clarity)}`}
              style={{ width: `${metrics.clarity * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.clarity >= 0.8 ? 'HD Quality' : 
             metrics.clarity >= 0.6 ? 'High Quality' : 
             metrics.clarity >= 0.4 ? 'Good Quality' : 'Low Quality'}
          </div>
        </div>

        {/* Volume */}
        <div className="bg-slate-700/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Volume2 className={`w-6 h-6 ${getQualityColor(metrics.volume)}`} />
          </div>
          <div className="text-xs text-slate-400 mb-2 font-semibold">VOLUME</div>
          <div className={`text-xl font-bold ${getQualityColor(metrics.volume)} mb-2`}>
            {(metrics.volume * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getQualityBg(metrics.volume)}`}
              style={{ width: `${metrics.volume * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.volume >= 0.8 ? 'Perfect Level' : 
             metrics.volume >= 0.6 ? 'Good Level' : 
             metrics.volume >= 0.4 ? 'Adequate' : 'Too Quiet'}
          </div>
        </div>

        {/* Stability */}
        <div className="bg-slate-700/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Activity className={`w-6 h-6 ${getQualityColor(metrics.stability)}`} />
          </div>
          <div className="text-xs text-slate-400 mb-2 font-semibold">STABILITY</div>
          <div className={`text-xl font-bold ${getQualityColor(metrics.stability)} mb-2`}>
            {(metrics.stability * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getQualityBg(metrics.stability)}`}
              style={{ width: `${metrics.stability * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.stability >= 0.8 ? 'Rock Solid' : 
             metrics.stability >= 0.6 ? 'Very Stable' : 
             metrics.stability >= 0.4 ? 'Stable' : 'Unstable'}
          </div>
        </div>
      </div>

      {/* Professional Recommendations */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Professional Audio Optimization
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
          <div>
            <strong>Current Status:</strong>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• 48kHz/24-bit professional processing</li>
              <li>• Dynamic range compression active</li>
              <li>• Noise gate and filtering enabled</li>
              <li>• Multi-alternative speech recognition</li>
            </ul>
          </div>
          <div>
            <strong>Optimization Tips:</strong>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Ensure stable internet connection</li>
              <li>• Minimize background applications</li>
              <li>• Use quality audio source</li>
              <li>• Keep browser tab active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityMonitor;