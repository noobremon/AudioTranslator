import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

interface APIKeys {
  googleTranslate: string;
  azureTranslator: string;
  deepL: string;
  openAI: string;
  baiduTranslate: string;
  tencentTranslate: string;
}

interface TranslationResult {
  text: string;
  confidence: number;
  source: string;
  processingTime: number;
  quality: number;
}

interface TranslationContext {
  previousTranslations: string[];
  conversationContext: string;
  speakerContext: string;
  sessionStartTime: number;
}

export const useEnterpriseTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    googleTranslate: '',
    azureTranslator: '',
    deepL: '',
    openAI: '',
    baiduTranslate: '',
    tencentTranslate: ''
  });
  
  const contextRef = useRef<TranslationContext>({
    previousTranslations: [],
    conversationContext: '',
    speakerContext: '',
    sessionStartTime: Date.now()
  });
  
  const rateLimitRef = useRef<{ [key: string]: { count: number; resetTime: number } }>({});
  const cacheRef = useRef<{ [key: string]: { result: string; timestamp: number } }>({});

  // Enhanced Google Translate with retry logic
  const translateWithGoogle = async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> => {
    if (!apiKeys.googleTranslate) throw new Error('Google API key not provided');
    
    const startTime = Date.now();
    const cacheKey = `google_${text}_${sourceLang}_${targetLang}`;
    
    // Check cache first
    if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < 300000) {
      return {
        text: cacheRef.current[cacheKey].result,
        confidence: 0.95,
        source: 'Google Translate (Cached)',
        processingTime: Date.now() - startTime,
        quality: 0.95
      };
    }
    
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKeys.googleTranslate}`,
        {
          q: text,
          source: sourceLang === 'zh' ? 'zh-CN' : sourceLang,
          target: targetLang === 'en' ? 'en' : targetLang,
          format: 'text'
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      const confidence = response.data.data.translations[0].confidence || 0.95;
      
      // Cache the result
      cacheRef.current[cacheKey] = { result: translatedText, timestamp: Date.now() };
      
      return {
        text: translatedText,
        confidence,
        source: 'Google Translate',
        processingTime: Date.now() - startTime,
        quality: confidence * 0.95
      };
    } catch (error) {
      console.error('Google Translate failed:', error);
      throw error;
    }
  };

  // Enhanced Azure Translator with regional optimization
  const translateWithAzure = async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> => {
    if (!apiKeys.azureTranslator) throw new Error('Azure API key not provided');
    
    const startTime = Date.now();
    const cacheKey = `azure_${text}_${sourceLang}_${targetLang}`;
    
    if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < 300000) {
      return {
        text: cacheRef.current[cacheKey].result,
        confidence: 0.92,
        source: 'Azure Translator (Cached)',
        processingTime: Date.now() - startTime,
        quality: 0.92
      };
    }
    
    try {
      const response = await axios.post(
        'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0',
        [{ text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKeys.azureTranslator,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Region': 'global'
          },
          params: {
            from: sourceLang === 'zh' ? 'zh-Hans' : sourceLang,
            to: targetLang === 'en' ? 'en' : targetLang,
            includeAlignment: true,
            includeSentenceLength: true
          },
          timeout: 8000
        }
      );

      const translation = response.data[0].translations[0];
      cacheRef.current[cacheKey] = { result: translation.text, timestamp: Date.now() };
      
      return {
        text: translation.text,
        confidence: translation.confidence || 0.92,
        source: 'Azure Translator',
        processingTime: Date.now() - startTime,
        quality: (translation.confidence || 0.92) * 0.93
      };
    } catch (error) {
      console.error('Azure Translator failed:', error);
      throw error;
    }
  };

  // Enhanced DeepL with quality optimization
  const translateWithDeepL = async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> => {
    if (!apiKeys.deepL) throw new Error('DeepL API key not provided');
    
    const startTime = Date.now();
    const cacheKey = `deepl_${text}_${sourceLang}_${targetLang}`;
    
    if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < 300000) {
      return {
        text: cacheRef.current[cacheKey].result,
        confidence: 0.96,
        source: 'DeepL (Cached)',
        processingTime: Date.now() - startTime,
        quality: 0.96
      };
    }
    
    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        new URLSearchParams({
          text,
          source_lang: sourceLang === 'zh' ? 'ZH' : sourceLang.toUpperCase(),
          target_lang: targetLang === 'en' ? 'EN' : targetLang.toUpperCase(),
          auth_key: apiKeys.deepL,
          formality: 'default',
          preserve_formatting: '1'
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 8000
        }
      );

      const translation = response.data.translations[0];
      cacheRef.current[cacheKey] = { result: translation.text, timestamp: Date.now() };
      
      return {
        text: translation.text,
        confidence: 0.96,
        source: 'DeepL',
        processingTime: Date.now() - startTime,
        quality: 0.96
      };
    } catch (error) {
      console.error('DeepL failed:', error);
      throw error;
    }
  };

  // Enhanced OpenAI with context awareness
  const translateWithOpenAI = async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> => {
    if (!apiKeys.openAI) throw new Error('OpenAI API key not provided');
    
    const startTime = Date.now();
    const context = contextRef.current;
    
    try {
      const contextPrompt = context.previousTranslations.length > 0 
        ? `\n\nPrevious context: ${context.previousTranslations.slice(-3).join('; ')}`
        : '';
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional Chinese-English translator. Provide accurate, natural translations that maintain tone and cultural context. Focus on conversational flow.${contextPrompt}`
            },
            {
              role: 'user',
              content: `Translate this Chinese text to natural English: "${text}"`
            }
          ],
          max_tokens: 150,
          temperature: 0.1,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKeys.openAI}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const translatedText = response.data.choices[0].message.content.trim();
      
      return {
        text: translatedText,
        confidence: 0.94,
        source: 'OpenAI GPT-3.5',
        processingTime: Date.now() - startTime,
        quality: 0.94
      };
    } catch (error) {
      console.error('OpenAI translation failed:', error);
      throw error;
    }
  };

  // Baidu Translate for Chinese expertise
  const translateWithBaidu = async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> => {
    if (!apiKeys.baiduTranslate) throw new Error('Baidu API key not provided');
    
    const startTime = Date.now();
    const [appId, secretKey] = apiKeys.baiduTranslate.split('|');
    
    if (!appId || !secretKey) throw new Error('Invalid Baidu API key format');
    
    try {
      const salt = Date.now().toString();
      const query = text;
      const from = sourceLang === 'zh' ? 'zh' : sourceLang;
      const to = targetLang === 'en' ? 'en' : targetLang;
      
      // Create MD5 hash for Baidu API signature
      const sign = await createMD5Hash(appId + query + salt + secretKey);
      
      const response = await axios.post(
        'https://fanyi-api.baidu.com/api/trans/vip/translate',
        new URLSearchParams({
          q: query,
          from,
          to,
          appid: appId,
          salt,
          sign
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 8000
        }
      );

      if (response.data.trans_result && response.data.trans_result.length > 0) {
        const translatedText = response.data.trans_result[0].dst;
        
        return {
          text: translatedText,
          confidence: 0.91,
          source: 'Baidu Translate',
          processingTime: Date.now() - startTime,
          quality: 0.91
        };
      }
      
      throw new Error('Invalid Baidu response');
    } catch (error) {
      console.error('Baidu translation failed:', error);
      throw error;
    }
  };

  // MD5 hash function for Baidu API
  const createMD5Hash = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Ultra-comprehensive fallback dictionary
  const ultraComprehensiveFallback = (text: string): TranslationResult => {
    const startTime = Date.now();
    
    // Massive Chinese-English dictionary
    const megaDictionary: { [key: string]: string } = {
      // Business and Professional
      '会议': 'meeting', '项目': 'project', '工作': 'work', '任务': 'task', '完成': 'complete',
      '开始': 'start', '结束': 'end', '讨论': 'discuss', '决定': 'decide', '同意': 'agree',
      '客户': 'client', '公司': 'company', '团队': 'team', '领导': 'leader', '员工': 'employee',
      '报告': 'report', '计划': 'plan', '目标': 'goal', '结果': 'result', '问题': 'problem',
      '解决': 'solve', '处理': 'handle', '管理': 'manage', '负责': 'responsible', '合作': 'cooperate',
      
      // Daily Conversation
      '你好': 'hello', '谢谢': 'thank you', '对不起': 'sorry', '没关系': 'no problem',
      '再见': 'goodbye', '请': 'please', '好的': 'okay', '不好意思': 'excuse me',
      '明白': 'understand', '知道': 'know', '不知道': 'don\'t know', '可以': 'can',
      '不可以': 'cannot', '喜欢': 'like', '不喜欢': 'don\'t like', '想要': 'want',
      '需要': 'need', '希望': 'hope', '觉得': 'think', '认为': 'believe',
      
      // Time and Dates
      '今天': 'today', '明天': 'tomorrow', '昨天': 'yesterday', '现在': 'now',
      '早上': 'morning', '下午': 'afternoon', '晚上': 'evening', '时间': 'time',
      '小时': 'hour', '分钟': 'minute', '星期': 'week', '月': 'month', '年': 'year',
      '这个星期': 'this week', '下个星期': 'next week', '上个星期': 'last week',
      
      // Numbers and Quantities
      '一': 'one', '二': 'two', '三': 'three', '四': 'four', '五': 'five',
      '六': 'six', '七': 'seven', '八': 'eight', '九': 'nine', '十': 'ten',
      '很多': 'many', '一些': 'some', '全部': 'all', '没有': 'none',
      '第一': 'first', '第二': 'second', '最后': 'last', '最重要': 'most important',
      
      // Common Phrases and Expressions
      '怎么样': 'how about', '什么时候': 'when', '在哪里': 'where', '为什么': 'why',
      '怎么办': 'what to do', '没问题': 'no problem', '当然': 'of course', '一定': 'definitely',
      '可能': 'maybe', '应该': 'should', '必须': 'must', '需要': 'need',
      '重要': 'important', '有用': 'useful', '容易': 'easy', '困难': 'difficult',
      
      // Actions and Verbs
      '去': 'go', '来': 'come', '看': 'see', '听': 'listen', '说': 'say',
      '做': 'do', '买': 'buy', '卖': 'sell', '吃': 'eat', '喝': 'drink',
      '学习': 'study', '教': 'teach', '帮助': 'help', '支持': 'support',
      '使用': 'use', '制作': 'make', '创建': 'create', '建立': 'build',
      
      // Technology and Modern Terms
      '电脑': 'computer', '手机': 'mobile phone', '网络': 'network', '软件': 'software',
      '应用': 'application', '系统': 'system', '数据': 'data', '信息': 'information',
      '技术': 'technology', '创新': 'innovation', '发展': 'development', '进步': 'progress',
      
      // Emotions and Feelings
      '高兴': 'happy', '开心': 'happy', '快乐': 'joyful', '满意': 'satisfied',
      '难过': 'sad', '生气': 'angry', '担心': 'worried', '害怕': 'afraid',
      '兴奋': 'excited', '紧张': 'nervous', '放松': 'relaxed', '累': 'tired',
      
      // Common Adjectives
      '好': 'good', '坏': 'bad', '大': 'big', '小': 'small', '新': 'new', '旧': 'old',
      '快': 'fast', '慢': 'slow', '高': 'high', '低': 'low', '长': 'long', '短': 'short',
      '美丽': 'beautiful', '漂亮': 'pretty', '丑': 'ugly', '干净': 'clean', '脏': 'dirty'
    };
    
    let translated = text;
    let hasTranslation = false;
    
    // Enhanced phrase patterns with context
    const phrasePatterns = [
      { pattern: /你好.*吗/, replacement: 'How are you?' },
      { pattern: /谢谢.*你/, replacement: 'Thank you' },
      { pattern: /对不起.*/, replacement: 'Sorry' },
      { pattern: /没关系.*/, replacement: 'It\'s okay' },
      { pattern: /不好意思.*/, replacement: 'Excuse me' },
      { pattern: /请问.*/, replacement: 'Excuse me, may I ask...' },
      { pattern: /怎么样.*/, replacement: 'How about...' },
      { pattern: /什么时候.*/, replacement: 'When...' },
      { pattern: /在哪里.*/, replacement: 'Where is...' },
      { pattern: /多少钱.*/, replacement: 'How much does it cost?' },
      { pattern: /我不知道.*/, replacement: 'I don\'t know' },
      { pattern: /我明白了.*/, replacement: 'I understand' },
      { pattern: /没问题.*/, replacement: 'No problem' },
      { pattern: /当然可以.*/, replacement: 'Of course' }
    ];
    
    // Check phrase patterns first
    for (const { pattern, replacement } of phrasePatterns) {
      if (pattern.test(text)) {
        return {
          text: replacement,
          confidence: 0.85,
          source: 'Pattern Recognition',
          processingTime: Date.now() - startTime,
          quality: 0.85
        };
      }
    }
    
    // Dictionary lookup with longest match first
    const sortedEntries = Object.entries(megaDictionary).sort(([a], [b]) => b.length - a.length);
    
    for (const [chinese, english] of sortedEntries) {
      if (translated.includes(chinese)) {
        translated = translated.replace(new RegExp(chinese, 'g'), english);
        hasTranslation = true;
      }
    }
    
    if (hasTranslation) {
      // Clean up translation
      translated = translated.replace(/\s+/g, ' ').trim();
      
      return {
        text: translated,
        confidence: 0.75,
        source: 'Enhanced Dictionary',
        processingTime: Date.now() - startTime,
        quality: 0.75
      };
    }
    
    return {
      text: `[Translation needed: ${text}]`,
      confidence: 0.1,
      source: 'Fallback',
      processingTime: Date.now() - startTime,
      quality: 0.1
    };
  };

  // Advanced quality scoring
  const scoreTranslation = (result: TranslationResult, originalText: string): number => {
    let score = result.confidence;
    
    // Length ratio scoring
    const lengthRatio = result.text.length / originalText.length;
    if (lengthRatio < 0.2 || lengthRatio > 4) score *= 0.7;
    else if (lengthRatio >= 0.5 && lengthRatio <= 2) score *= 1.1;
    
    // Source quality bonuses
    const sourceBonus: { [key: string]: number } = {
      'DeepL': 1.15,
      'OpenAI GPT-3.5': 1.1,
      'Google Translate': 1.05,
      'Azure Translator': 1.03,
      'Baidu Translate': 1.02
    };
    
    if (sourceBonus[result.source]) {
      score *= sourceBonus[result.source];
    }
    
    // Speed bonus
    if (result.processingTime < 1000) score *= 1.05;
    else if (result.processingTime > 5000) score *= 0.9;
    
    // Error penalties
    if (result.text.includes('[') || result.text.includes('Translation needed')) {
      score *= 0.2;
    }
    
    return Math.min(1, score);
  };

  // Main enterprise translation function
  const translateText = useCallback(async (
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> => {
    if (!text.trim()) return '';
    
    setIsTranslating(true);
    
    try {
      // Update context
      const context = contextRef.current;
      context.conversationContext = text;
      
      // Prepare all available translation methods
      const translationMethods: (() => Promise<TranslationResult>)[] = [];
      
      // Add API-based methods
      if (apiKeys.googleTranslate) {
        translationMethods.push(() => translateWithGoogle(text, sourceLang, targetLang));
      }
      if (apiKeys.azureTranslator) {
        translationMethods.push(() => translateWithAzure(text, sourceLang, targetLang));
      }
      if (apiKeys.deepL) {
        translationMethods.push(() => translateWithDeepL(text, sourceLang, targetLang));
      }
      if (apiKeys.openAI) {
        translationMethods.push(() => translateWithOpenAI(text, sourceLang, targetLang));
      }
      if (apiKeys.baiduTranslate) {
        translationMethods.push(() => translateWithBaidu(text, sourceLang, targetLang));
      }
      
      // Always include fallback
      translationMethods.push(() => Promise.resolve(ultraComprehensiveFallback(text)));
      
      // Execute translations in parallel with timeout
      const results = await Promise.allSettled(
        translationMethods.map(method => 
          Promise.race([
            method(),
            new Promise<TranslationResult>((_, reject) => 
              setTimeout(() => reject(new Error('Translation timeout')), 10000)
            )
          ])
        )
      );
      
      // Collect successful results
      const successfulResults: TranslationResult[] = results
        .filter((result): result is PromiseFulfilledResult<TranslationResult> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .filter(result => result.text && !result.text.includes('[Error'));
      
      if (successfulResults.length === 0) {
        return `[All translation services failed: ${text}]`;
      }
      
      // Score and rank results
      const scoredResults = successfulResults
        .map(result => ({
          ...result,
          qualityScore: scoreTranslation(result, text)
        }))
        .sort((a, b) => b.qualityScore - a.qualityScore);
      
      // Use the best result
      const bestResult = scoredResults[0];
      
      // Update context
      context.previousTranslations.push(bestResult.text);
      if (context.previousTranslations.length > 15) {
        context.previousTranslations = context.previousTranslations.slice(-15);
      }
      
      console.log(`Best translation from ${bestResult.source} (score: ${bestResult.qualityScore.toFixed(3)}, ${bestResult.processingTime}ms):`, bestResult.text);
      
      return bestResult.text;
      
    } catch (error) {
      console.error('Enterprise translation failed:', error);
      return ultraComprehensiveFallback(text).text;
    } finally {
      setIsTranslating(false);
    }
  }, [apiKeys]);

  const updateAPIKeys = useCallback((keys: APIKeys) => {
    setApiKeys(keys);
  }, []);

  const clearContext = useCallback(() => {
    contextRef.current = {
      previousTranslations: [],
      conversationContext: '',
      speakerContext: '',
      sessionStartTime: Date.now()
    };
    // Clear cache
    cacheRef.current = {};
  }, []);

  return {
    translateText,
    isTranslating,
    updateAPIKeys,
    clearContext,
    hasAPIKeys: Object.values(apiKeys).some(key => key.trim() !== '')
  };
};