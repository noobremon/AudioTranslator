import React, { useState } from 'react';
import { Mic2, Play, Volume2, Settings, Zap } from 'lucide-react';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers: string[];
}

interface VoiceSelectorProps {
  voices: ElevenLabsVoice[];
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  onPreviewVoice: (voiceId: string) => void;
  isLoading: boolean;
  hasApiKey: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onVoiceSelect,
  onPreviewVoice,
  isLoading,
  hasApiKey
}) => {
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  if (!hasApiKey) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-amber-300">
          <Mic2 className="w-5 h-5" />
          <span className="font-semibold">ElevenLabs Premium Voice</span>
        </div>
        <p className="text-sm text-amber-200 mt-1">
          Add your ElevenLabs API key to unlock ultra-realistic AI voice synthesis
        </p>
      </div>
    );
  }

  const selectedVoice = voices.find(voice => voice.voice_id === selectedVoiceId);

  const categorizeVoices = () => {
    const categories: { [key: string]: ElevenLabsVoice[] } = {};
    voices.forEach(voice => {
      const category = voice.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(voice);
    });
    return categories;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      'premade': 'Premium Voices',
      'cloned': 'Cloned Voices',
      'generated': 'Generated Voices',
      'professional': 'Professional Voices',
      'other': 'Other Voices'
    };
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premade':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'professional':
        return <Settings className="w-4 h-4 text-purple-400" />;
      default:
        return <Mic2 className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/30 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mic2 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">ElevenLabs Premium Voice</h3>
          <div className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
            {voices.length} voices available
          </div>
        </div>
        <button
          onClick={() => setShowVoiceSelector(!showVoiceSelector)}
          className="text-indigo-300 hover:text-indigo-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Current Voice Display */}
      <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">
              {selectedVoice?.name || 'No voice selected'}
            </div>
            <div className="text-slate-400 text-sm">
              {selectedVoice?.category && getCategoryLabel(selectedVoice.category)}
            </div>
          </div>
          {selectedVoice && (
            <button
              onClick={() => onPreviewVoice(selectedVoiceId)}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-sm">Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Selector */}
      {showVoiceSelector && (
        <div className="space-y-4">
          {Object.entries(categorizeVoices()).map(([category, categoryVoices]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon(category)}
                <h4 className="font-semibold text-slate-200">
                  {getCategoryLabel(category)}
                </h4>
                <span className="text-xs text-slate-400">
                  ({categoryVoices.length})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categoryVoices.map((voice) => (
                  <div
                    key={voice.voice_id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedVoiceId === voice.voice_id
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                        : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-600/30 text-slate-300'
                    }`}
                    onClick={() => onVoiceSelect(voice.voice_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{voice.name}</div>
                        {voice.description && (
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {voice.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewVoice(voice.voice_id);
                        }}
                        disabled={isLoading}
                        className="ml-2 p-1 hover:bg-slate-600/50 rounded transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ElevenLabs Features */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/20 rounded-lg p-3 mt-4">
        <h4 className="font-semibold text-indigo-300 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          ElevenLabs Premium Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          <ul className="space-y-1">
            <li>• <strong>Ultra-realistic voices:</strong> Human-like speech synthesis</li>
            <li>• <strong>Emotional expression:</strong> Natural tone and inflection</li>
            <li>• <strong>Multiple languages:</strong> Multilingual voice support</li>
          </ul>
          <ul className="space-y-1">
            <li>• <strong>Voice cloning:</strong> Custom voice models available</li>
            <li>• <strong>Professional quality:</strong> Studio-grade audio output</li>
            <li>• <strong>Real-time synthesis:</strong> Fast generation for live translation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;