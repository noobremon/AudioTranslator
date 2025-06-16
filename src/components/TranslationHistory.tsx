import React from 'react';
import { Trash2, Copy, Clock } from 'lucide-react';

interface Translation {
  id: string;
  original: string;
  translated: string;
  timestamp: Date;
}

interface TranslationHistoryProps {
  translations: Translation[];
  onClear: () => void;
}

const TranslationHistory: React.FC<TranslationHistoryProps> = ({ translations, onClear }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Translation History</h2>
        <button
          onClick={onClear}
          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all duration-300 text-red-300"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-4">
        {translations.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>No translations yet. Start speaking to see your translation history.</p>
          </div>
        ) : (
          translations.map((translation) => (
            <div
              key={translation.id}
              className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/30"
            >
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <Clock className="w-3 h-3" />
                {formatTime(translation.timestamp)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-blue-300 mb-1">Original (Chinese):</div>
                  <div className="bg-blue-500/10 rounded p-3 relative group">
                    <p className="text-blue-100">{translation.original}</p>
                    <button
                      onClick={() => copyToClipboard(translation.original)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-500/20 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-green-300 mb-1">Translation (English):</div>
                  <div className="bg-green-500/10 rounded p-3 relative group">
                    <p className="text-green-100">{translation.translated}</p>
                    <button
                      onClick={() => copyToClipboard(translation.translated)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-green-500/20 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranslationHistory;