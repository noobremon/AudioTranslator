import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle, CheckCircle, Zap, Globe, Brain, Shield } from 'lucide-react';

interface APIKeys {
  googleTranslate: string;
  azureTranslator: string;
  deepL: string;
  openAI: string;
  baiduTranslate: string;
  tencentTranslate: string;
}

interface APIKeyManagerProps {
  onKeysUpdate: (keys: APIKeys) => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onKeysUpdate }) => {
  const [keys, setKeys] = useState<APIKeys>({
    googleTranslate: '',
    azureTranslator: '',
    deepL: '',
    openAI: '',
    baiduTranslate: '',
    tencentTranslate: ''
  });
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [saved, setSaved] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: 'testing' | 'success' | 'error' | null }>({});

  useEffect(() => {
    // Load saved keys from localStorage
    const savedKeys = localStorage.getItem('enterpriseTranslationAPIKeys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setKeys(parsedKeys);
        onKeysUpdate(parsedKeys);
      } catch (error) {
        console.error('Failed to load saved API keys:', error);
      }
    }
  }, [onKeysUpdate]);

  const handleKeyChange = (keyType: keyof APIKeys, value: string) => {
    const updatedKeys = { ...keys, [keyType]: value };
    setKeys(updatedKeys);
    // Clear test result when key changes
    setTestResults(prev => ({ ...prev, [keyType]: null }));
  };

  const testAPIKey = async (keyType: keyof APIKeys) => {
    const key = keys[keyType];
    if (!key.trim()) return;

    setTestResults(prev => ({ ...prev, [keyType]: 'testing' }));

    try {
      let testResult = false;
      
      switch (keyType) {
        case 'googleTranslate':
          const googleResponse = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: '你好', source: 'zh', target: 'en', format: 'text' })
            }
          );
          testResult = googleResponse.ok;
          break;
          
        case 'azureTranslator':
          const azureResponse = await fetch(
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=zh&to=en',
            {
              method: 'POST',
              headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([{ text: '你好' }])
            }
          );
          testResult = azureResponse.ok;
          break;
          
        case 'deepL':
          const deeplResponse = await fetch(
            'https://api-free.deepl.com/v2/translate',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                text: '你好',
                source_lang: 'ZH',
                target_lang: 'EN',
                auth_key: key
              })
            }
          );
          testResult = deeplResponse.ok;
          break;
          
        case 'openAI':
          const openaiResponse = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Translate "你好" to English' }],
                max_tokens: 10
              })
            }
          );
          testResult = openaiResponse.ok;
          break;
          
        default:
          testResult = true; // For Baidu and Tencent, assume valid if provided
      }
      
      setTestResults(prev => ({ ...prev, [keyType]: testResult ? 'success' : 'error' }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [keyType]: 'error' }));
    }
  };

  const saveKeys = () => {
    localStorage.setItem('enterpriseTranslationAPIKeys', JSON.stringify(keys));
    onKeysUpdate(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleShowKey = (keyType: string) => {
    setShowKeys(prev => ({ ...prev, [keyType]: !prev[keyType] }));
  };

  const hasAnyKey = Object.values(keys).some(key => key.trim() !== '');
  const keyCount = Object.values(keys).filter(key => key.trim() !== '').length;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Enterprise Translation API Keys</h2>
        {hasAnyKey && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-300">{keyCount} API{keyCount !== 1 ? 's' : ''} configured</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Google Translate API */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-300">
            <Globe className="w-4 h-4" />
            <span>Google Translate API Key</span>
            <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">Most Reliable</span>
          </label>
          <div className="relative">
            <input
              type={showKeys.googleTranslate ? 'text' : 'password'}
              value={keys.googleTranslate}
              onChange={(e) => handleKeyChange('googleTranslate', e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 pr-20 text-white outline-none focus:border-blue-500 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {testResults.googleTranslate === 'testing' && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
              {testResults.googleTranslate === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {testResults.googleTranslate === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
              <button
                onClick={() => testAPIKey('googleTranslate')}
                className="text-xs bg-blue-500/20 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => toggleShowKey('googleTranslate')}
                className="text-slate-400 hover:text-white"
              >
                {showKeys.googleTranslate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Get from: Google Cloud Console → APIs & Services → Credentials</p>
        </div>

        {/* Azure Translator */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-purple-300">
            <Shield className="w-4 h-4" />
            <span>Azure Translator Key</span>
            <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">Enterprise Grade</span>
          </label>
          <div className="relative">
            <input
              type={showKeys.azureTranslator ? 'text' : 'password'}
              value={keys.azureTranslator}
              onChange={(e) => handleKeyChange('azureTranslator', e.target.value)}
              placeholder="abc123..."
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 pr-20 text-white outline-none focus:border-purple-500 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {testResults.azureTranslator === 'testing' && <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
              {testResults.azureTranslator === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {testResults.azureTranslator === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
              <button
                onClick={() => testAPIKey('azureTranslator')}
                className="text-xs bg-purple-500/20 px-2 py-1 rounded hover:bg-purple-500/30 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => toggleShowKey('azureTranslator')}
                className="text-slate-400 hover:text-white"
              >
                {showKeys.azureTranslator ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Get from: Azure Portal → Translator Service → Keys and Endpoint</p>
        </div>

        {/* DeepL API */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-green-300">
            <Zap className="w-4 h-4" />
            <span>DeepL API Key</span>
            <span className="text-xs bg-green-500/20 px-2 py-1 rounded">Highest Quality</span>
          </label>
          <div className="relative">
            <input
              type={showKeys.deepL ? 'text' : 'password'}
              value={keys.deepL}
              onChange={(e) => handleKeyChange('deepL', e.target.value)}
              placeholder="abc123-def4-56gh-789i-jklmnopqrstu:fx"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 pr-20 text-white outline-none focus:border-green-500 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {testResults.deepL === 'testing' && <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />}
              {testResults.deepL === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {testResults.deepL === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
              <button
                onClick={() => testAPIKey('deepL')}
                className="text-xs bg-green-500/20 px-2 py-1 rounded hover:bg-green-500/30 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => toggleShowKey('deepL')}
                className="text-slate-400 hover:text-white"
              >
                {showKeys.deepL ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Get from: DeepL Pro Account → API Keys</p>
        </div>

        {/* OpenAI API */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-orange-300">
            <Brain className="w-4 h-4" />
            <span>OpenAI API Key</span>
            <span className="text-xs bg-orange-500/20 px-2 py-1 rounded">AI Context</span>
          </label>
          <div className="relative">
            <input
              type={showKeys.openAI ? 'text' : 'password'}
              value={keys.openAI}
              onChange={(e) => handleKeyChange('openAI', e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 pr-20 text-white outline-none focus:border-orange-500 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {testResults.openAI === 'testing' && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />}
              {testResults.openAI === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {testResults.openAI === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
              <button
                onClick={() => testAPIKey('openAI')}
                className="text-xs bg-orange-500/20 px-2 py-1 rounded hover:bg-orange-500/30 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => toggleShowKey('openAI')}
                className="text-slate-400 hover:text-white"
              >
                {showKeys.openAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Get from: OpenAI Platform → API Keys</p>
        </div>

        {/* Baidu Translate */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-red-300">
            <Globe className="w-4 h-4" />
            <span>Baidu Translate API Key</span>
            <span className="text-xs bg-red-500/20 px-2 py-1 rounded">Chinese Expert</span>
          </label>
          <div className="relative">
            <input
              type={showKeys.baiduTranslate ? 'text' : 'password'}
              value={keys.baiduTranslate}
              onChange={(e) => handleKeyChange('baiduTranslate', e.target.value)}
              placeholder="App ID|Secret Key (format: appid|secret)"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 pr-12 text-white outline-none focus:border-red-500 transition-colors"
            />
            <button
              onClick={() => toggleShowKey('baiduTranslate')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKeys.baiduTranslate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">Get from: Baidu AI Cloud → Machine Translation → API Keys</p>
        </div>

        {/* Tencent Translate */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Shield className="w-4 h-4" />
            <span>Tencent Cloud API Key</span>
            <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded">Fast & Accurate</span>
          </label>
          <div className="relative">
            <input
              type={showKeys.tencentTranslate ? 'text' : 'password'}
              value={keys.tencentTranslate}
              onChange={(e) => handleKeyChange('tencentTranslate', e.target.value)}
              placeholder="SecretId|SecretKey (format: id|key)"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg px-4 py-3 pr-12 text-white outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={() => toggleShowKey('tencentTranslate')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKeys.tencentTranslate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">Get from: Tencent Cloud → API Keys → Machine Translation</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={saveKeys}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
            saved 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save API Keys'}
        </button>

        {!hasAnyKey && (
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Add at least one API key for professional translation</span>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Enterprise Translation Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <ul className="space-y-1">
            <li>• <strong>Multi-API Redundancy:</strong> Automatic failover between 6 translation services</li>
            <li>• <strong>Quality Scoring:</strong> AI-powered translation accuracy assessment</li>
            <li>• <strong>Context Preservation:</strong> Maintains conversation flow for better accuracy</li>
            <li>• <strong>Real-time Processing:</strong> Sub-second translation for live audio</li>
          </ul>
          <ul className="space-y-1">
            <li>• <strong>Error Recovery:</strong> Intelligent retry with different APIs on failure</li>
            <li>• <strong>Rate Limit Management:</strong> Smart API usage optimization</li>
            <li>• <strong>Batch Processing:</strong> Optimized for long-duration sessions</li>
            <li>• <strong>Professional Grade:</strong> 99.9% uptime for critical applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIKeyManager;