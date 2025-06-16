import React from 'react';
import { Volume2, Languages, Mic } from 'lucide-react';

interface SettingsPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  sourceLanguage: string;
  onSourceLanguageChange: (language: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (language: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  volume,
  onVolumeChange,
  sourceLanguage,
  onSourceLanguageChange,
  targetLanguage,
  onTargetLanguageChange
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Volume2 className="w-5 h-5" />
            Audio Volume
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-slate-300 min-w-[3rem]">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Mic className="w-5 h-5" />
            Source Language
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceLanguageChange(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          >
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="zh-TW">Chinese (Traditional)</option>
            <option value="ja-JP">Japanese</option>
            <option value="ko-KR">Korean</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Languages className="w-5 h-5" />
            Target Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => onTargetLanguageChange(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-300 mb-2">Tips for Better Performance</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Ensure your microphone is close to the audio source</li>
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Minimize background noise for better recognition</li>
            <li>• Use headphones to prevent audio feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;