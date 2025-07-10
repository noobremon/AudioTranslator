import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

interface APIKeys {
  googleTranslate: string;
  azureTranslator: string;
  deepL: string;
  openAI: string;
  baiduTranslate: string;
  tencentTranslate: string;
  elevenLabs: string;
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
    tencentTranslate: '',
    elevenLabs: ''
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

  // Comprehensive Chinese-English dictionary with enhanced coverage
  const comprehensiveChineseDictionary: { [key: string]: string } = {
    // Enhanced greetings and common phrases
    '你好': 'Hello',
    '您好': 'Hello (formal)',
    '你好吗': 'How are you?',
    '你好嗎': 'How are you?',
    '您好吗': 'How are you? (formal)',
    '早上好': 'Good morning',
    '上午好': 'Good morning',
    '下午好': 'Good afternoon',
    '晚上好': 'Good evening',
    '晚安': 'Good night',
    '再见': 'Goodbye',
    '再會': 'Goodbye',
    '拜拜': 'Bye bye',
    '回见': 'See you later',
    '明天见': 'See you tomorrow',
    
    // Names and personal information
    '你叫什么名字': 'What is your name?',
    '你叫什麼名字': 'What is your name?',
    '我叫': 'My name is',
    '我的名字是': 'My name is',
    '名字': 'name',
    '姓名': 'full name',
    '姓': 'surname',
    '叫': 'called',
    '什么': 'what',
    '什麼': 'what',
    
    // Enhanced gratitude and politeness
    '谢谢': 'Thank you',
    '謝謝': 'Thank you',
    '谢谢你': 'Thank you',
    '谢谢您': 'Thank you (formal)',
    '多谢': 'Thank you very much',
    '感谢': 'Thank you',
    '感謝': 'Thank you',
    '不客气': 'You\'re welcome',
    '不客氣': 'You\'re welcome',
    '不用谢': 'You\'re welcome',
    '没关系': 'It\'s okay / No problem',
    '沒關係': 'It\'s okay / No problem',
    '不要紧': 'It\'s okay',
    
    // Enhanced apologies
    '对不起': 'Sorry',
    '對不起': 'Sorry',
    '不好意思': 'Excuse me / Sorry',
    '抱歉': 'Sorry',
    '很抱歉': 'Very sorry',
    '请原谅': 'Please forgive me',
    '請原諒': 'Please forgive me',
    
    // Enhanced requests and politeness
    '请': 'Please',
    '請': 'Please',
    '请问': 'Excuse me (asking)',
    '請問': 'Excuse me (asking)',
    '麻烦你': 'Please help me',
    '麻煩你': 'Please help me',
    '劳驾': 'Excuse me',
    '勞駕': 'Excuse me',
    
    // Enhanced responses and confirmations
    '是的': 'Yes',
    '对': 'Yes / Right',
    '對': 'Yes / Right',
    '没错': 'That\'s right',
    '沒錯': 'That\'s right',
    '不是': 'No / Not',
    '不对': 'No / Wrong',
    '不對': 'No / Wrong',
    '好的': 'Okay / Good',
    '好': 'Good / Okay',
    '行': 'Okay / Fine',
    '可以': 'Can / Okay',
    '没问题': 'No problem',
    '沒問題': 'No problem',
    '当然': 'Of course',
    '當然': 'Of course',
    '肯定': 'Definitely',
    '一定': 'Definitely',
    
    // Enhanced understanding
    '明白': 'I understand',
    '懂了': 'I understand',
    '知道了': 'I know / Got it',
    '了解': 'I understand',
    '清楚': 'Clear',
    '不明白': 'I don\'t understand',
    '不懂': 'I don\'t understand',
    '听不懂': 'I don\'t understand (hearing)',
    '聽不懂': 'I don\'t understand (hearing)',
    '看不懂': 'I don\'t understand (reading)',
    '不知道': 'I don\'t know',
    '不清楚': 'Not clear',
    
    // Enhanced pronouns and people
    '我': 'I',
    '你': 'you',
    '您': 'you (formal)',
    '他': 'he',
    '她': 'she',
    '它': 'it',
    '我们': 'we',
    '我們': 'we',
    '你们': 'you all',
    '你們': 'you all',
    '他们': 'they',
    '他們': 'they',
    '大家': 'everyone',
    '别人': 'others',
    '別人': 'others',
    
    // Enhanced common verbs with context
    '是': 'is / am / are',
    '有': 'have / there is',
    '没有': 'don\'t have / there isn\'t',
    '沒有': 'don\'t have / there isn\'t',
    '去': 'go',
    '来': 'come',
    '來': 'come',
    '回来': 'come back',
    '回來': 'come back',
    '走': 'walk / go',
    '跑': 'run',
    '看': 'look / see / watch',
    '看见': 'see',
    '看見': 'see',
    '听': 'listen / hear',
    '聽': 'listen / hear',
    '听见': 'hear',
    '聽見': 'hear',
    '说': 'say / speak',
    '說': 'say / speak',
    '讲': 'speak / tell',
    '講': 'speak / tell',
    '告诉': 'tell',
    '告訴': 'tell',
    '做': 'do / make',
    '干': 'do',
    '幹': 'do',
    '工作': 'work',
    '学习': 'study / learn',
    '學習': 'study / learn',
    '教': 'teach',
    '学': 'learn',
    '學': 'learn',
    
    // Enhanced daily activities
    '吃': 'eat',
    '喝': 'drink',
    '睡': 'sleep',
    '睡觉': 'sleep',
    '睡覺': 'sleep',
    '起床': 'get up',
    '洗澡': 'take a shower',
    '刷牙': 'brush teeth',
    '买': 'buy',
    '買': 'buy',
    '卖': 'sell',
    '賣': 'sell',
    '开': 'open / drive',
    '開': 'open / drive',
    '关': 'close',
    '關': 'close',
    '打开': 'open',
    '打開': 'open',
    '关闭': 'close',
    '關閉': 'close',
    
    // Enhanced time expressions
    '现在': 'now',
    '現在': 'now',
    '今天': 'today',
    '明天': 'tomorrow',
    '昨天': 'yesterday',
    '前天': 'the day before yesterday',
    '后天': 'the day after tomorrow',
    '後天': 'the day after tomorrow',
    '这个星期': 'this week',
    '這個星期': 'this week',
    '下个星期': 'next week',
    '下個星期': 'next week',
    '上个星期': 'last week',
    '上個星期': 'last week',
    '时间': 'time',
    '時間': 'time',
    '点钟': 'o\'clock',
    '點鐘': 'o\'clock',
    '分钟': 'minute',
    '分鐘': 'minute',
    '小时': 'hour',
    '小時': 'hour',
    '早上': 'morning',
    '上午': 'morning',
    '中午': 'noon',
    '下午': 'afternoon',
    '晚上': 'evening',
    '夜里': 'night',
    '夜裡': 'night',
    
    // Enhanced numbers and quantities
    '一': 'one',
    '二': 'two',
    '三': 'three',
    '四': 'four',
    '五': 'five',
    '六': 'six',
    '七': 'seven',
    '八': 'eight',
    '九': 'nine',
    '十': 'ten',
    '百': 'hundred',
    '千': 'thousand',
    '万': 'ten thousand',
    '萬': 'ten thousand',
    '很多': 'many / a lot',
    '一些': 'some',
    '一点': 'a little',
    '一點': 'a little',
    '全部': 'all',
    '所有': 'all',
    
    // Enhanced business and meeting terms
    '会议': 'meeting',
    '會議': 'meeting',
    '开会': 'have a meeting',
    '開會': 'have a meeting',
    '项目': 'project',
    '項目': 'project',
    '工程': 'project / engineering',
    '任务': 'task',
    '任務': 'task',
    '完成': 'complete / finish',
    '开始': 'start / begin',
    '開始': 'start / begin',
    '结束': 'end / finish',
    '結束': 'end / finish',
    '停止': 'stop',
    '继续': 'continue',
    '繼續': 'continue',
    '讨论': 'discuss',
    '討論': 'discuss',
    '商量': 'discuss',
    '决定': 'decide',
    '決定': 'decide',
    '选择': 'choose',
    '選擇': 'choose',
    '同意': 'agree',
    '不同意': 'disagree',
    '反对': 'oppose',
    '反對': 'oppose',
    '支持': 'support',
    
    // Enhanced questions and problems
    '问题': 'question / problem',
    '問題': 'question / problem',
    '困难': 'difficulty',
    '困難': 'difficulty',
    '麻烦': 'trouble',
    '麻煩': 'trouble',
    '解决': 'solve',
    '解決': 'solve',
    '处理': 'handle',
    '處理': 'handle',
    '帮助': 'help',
    '幫助': 'help',
    '帮忙': 'help',
    '幫忙': 'help',
    
    // Enhanced question words
    '哪里': 'where',
    '哪裡': 'where',
    '哪儿': 'where',
    '哪兒': 'where',
    '为什么': 'why',
    '為什麼': 'why',
    '怎么': 'how',
    '怎麼': 'how',
    '怎么样': 'how about',
    '怎麼樣': 'how about',
    '多少': 'how much / how many',
    '几个': 'how many',
    '幾個': 'how many',
    '什么时候': 'when',
    '什麼時候': 'when',
    '谁': 'who',
    '誰': 'who',
    '哪个': 'which',
    '哪個': 'which',
    
    // Enhanced locations and directions
    '这里': 'here',
    '這裡': 'here',
    '那里': 'there',
    '那裡': 'there',
    '上面': 'above / on top',
    '下面': 'below / under',
    '里面': 'inside',
    '裡面': 'inside',
    '外面': 'outside',
    '前面': 'in front',
    '后面': 'behind',
    '後面': 'behind',
    '左边': 'left side',
    '左邊': 'left side',
    '右边': 'right side',
    '右邊': 'right side',
    '中间': 'middle',
    '中間': 'middle',
    
    // Enhanced emotions and feelings
    '高兴': 'happy',
    '高興': 'happy',
    '开心': 'happy',
    '開心': 'happy',
    '快乐': 'happy',
    '快樂': 'happy',
    '难过': 'sad',
    '難過': 'sad',
    '伤心': 'sad',
    '傷心': 'sad',
    '生气': 'angry',
    '生氣': 'angry',
    '害怕': 'afraid',
    '担心': 'worried',
    '擔心': 'worried',
    '紧张': 'nervous',
    '緊張': 'nervous',
    '累': 'tired',
    '饿': 'hungry',
    '餓': 'hungry',
    '渴': 'thirsty',
    
    // Enhanced common adjectives
    '大': 'big',
    '小': 'small',
    '长/長': 'long',
    '短': 'short',
    '高': 'tall / high',
    '矮': 'short / low',
    '胖': 'fat',
    '瘦': 'thin',
    '新': 'new',
    '旧/舊': 'old',
    // '好': 'good', // Removed duplicate, already defined above
    '坏/壞': 'bad',
    '美': 'beautiful',
    '丑/醜': 'ugly',
    '热/熱': 'hot',
    '冷': 'cold',
    '快': 'fast',
    '慢': 'slow',
    '容易': 'easy',
    '难': 'difficult', // Handles both simplified and traditional
    '重要': 'important',
    '有趣': 'interesting',
    '无聊': 'boring',
    '無聊': 'boring',
    
    // Additional common phrases and expressions
    '不错': 'not bad',
    '不錯': 'not bad',
    '很好': 'very good',
    '太好了': 'great',
    '真的吗': 'really?',
    '真的嗎': 'really?',
    '当然了': 'of course',
    '當然了': 'of course',
    '没事': 'it\'s nothing',
    '沒事': 'it\'s nothing',
    '算了': 'forget it',
    '随便': 'whatever',
    '隨便': 'whatever',
    '加油': 'come on / good luck',
    '小心': 'be careful',
    '注意': 'pay attention',
    '等等': 'wait',
    '等一下': 'wait a moment',
    '慢点': 'slow down',
    '慢點': 'slow down',
    '快点': 'hurry up',
    '快點': 'hurry up'
  };

  // Enhanced phrase patterns for better context recognition
  const enhancedPhrasePatterns = [
    // Name-related patterns
    { pattern: /你叫什么名字/, replacement: 'What is your name?' },
    { pattern: /你叫什麼名字/, replacement: 'What is your name?' },
    { pattern: /我叫(.+)/, replacement: 'My name is $1' },
    { pattern: /我的名字是(.+)/, replacement: 'My name is $1' },
    
    // Greeting patterns
    { pattern: /你好.*吗/, replacement: 'How are you?' },
    { pattern: /你好.*嗎/, replacement: 'How are you?' },
    { pattern: /早上好/, replacement: 'Good morning' },
    { pattern: /下午好/, replacement: 'Good afternoon' },
    { pattern: /晚上好/, replacement: 'Good evening' },
    
    // Gratitude patterns
    { pattern: /谢谢.*你/, replacement: 'Thank you' },
    { pattern: /謝謝.*你/, replacement: 'Thank you' },
    { pattern: /多谢.*/, replacement: 'Thank you very much' },
    
    // Apology patterns
    { pattern: /对不起.*/, replacement: 'Sorry' },
    { pattern: /對不起.*/, replacement: 'Sorry' },
    { pattern: /不好意思.*/, replacement: 'Excuse me' },
    
    // Common responses
    { pattern: /没关系.*/, replacement: 'It\'s okay' },
    { pattern: /沒關係.*/, replacement: 'It\'s okay' },
    { pattern: /没问题.*/, replacement: 'No problem' },
    { pattern: /沒問題.*/, replacement: 'No problem' },
    { pattern: /当然可以.*/, replacement: 'Of course' },
    { pattern: /當然可以.*/, replacement: 'Of course' },
    
    // Question patterns
    { pattern: /请问.*/, replacement: 'Excuse me, may I ask...' },
    { pattern: /請問.*/, replacement: 'Excuse me, may I ask...' },
    { pattern: /怎么样.*/, replacement: 'How about...' },
    { pattern: /怎麼樣.*/, replacement: 'How about...' },
    { pattern: /什么时候.*/, replacement: 'When...' },
    { pattern: /什麼時候.*/, replacement: 'When...' },
    { pattern: /在哪里.*/, replacement: 'Where is...' },
    { pattern: /在哪裡.*/, replacement: 'Where is...' },
    { pattern: /多少钱.*/, replacement: 'How much does it cost?' },
    { pattern: /多少錢.*/, replacement: 'How much does it cost?' },
    
    // Understanding patterns
    { pattern: /我不知道.*/, replacement: 'I don\'t know' },
    { pattern: /我明白了.*/, replacement: 'I understand' },
    { pattern: /我懂了.*/, replacement: 'I understand' },
    
    // Emotional expressions
    { pattern: /很高兴.*/, replacement: 'Very happy' },
    { pattern: /很高興.*/, replacement: 'Very happy' },
    { pattern: /太好了.*/, replacement: 'That\'s great' },
    { pattern: /真的吗.*/, replacement: 'Really?' },
    { pattern: /真的嗎.*/, replacement: 'Really?' },
    
    // Wishes and blessings
    { pattern: /祝你.*/, replacement: 'Wish you...' },
    { pattern: /祝您.*/, replacement: 'Wish you...' }
  ];

  // Ultra-comprehensive fallback dictionary
  const ultraComprehensiveFallback = (text: string): TranslationResult => {
    const startTime = Date.now();
    
    // Clean and normalize the input text
    let cleanedText = text.trim()
      .replace(/\s+/g, '') // Remove spaces for Chinese text
      .replace(/[，。！？；：""'']/g, match => match + ' '); // Add space after punctuation
    
    // Check enhanced phrase patterns first
    for (const { pattern, replacement } of enhancedPhrasePatterns) {
      if (pattern.test(cleanedText)) {
        const result = cleanedText.replace(pattern, replacement);
        return {
          text: result,
          confidence: 0.9,
          source: 'Enhanced Pattern Recognition',
          processingTime: Date.now() - startTime,
          quality: 0.9
        };
      }
    }
    
    // Direct dictionary lookup
    if (comprehensiveChineseDictionary[cleanedText]) {
      return {
        text: comprehensiveChineseDictionary[cleanedText],
        confidence: 0.95,
        source: 'Direct Dictionary Match',
        processingTime: Date.now() - startTime,
        quality: 0.95
      };
    }
    
    // Enhanced word-by-word translation with better phrase handling
    let translated = cleanedText;
    let hasTranslation = false;
    let translationCount = 0;
    
    // Sort by length (longest first) to handle phrases before individual words
    const sortedEntries = Object.entries(comprehensiveChineseDictionary)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [chinese, english] of sortedEntries) {
      if (translated.includes(chinese)) {
        translated = translated.replace(new RegExp(chinese, 'g'), english);
        hasTranslation = true;
        translationCount++;
      }
    }
    
    // Clean up the translation
    if (hasTranslation) {
      // Remove extra spaces and clean up
      translated = translated.replace(/\s+/g, ' ').trim();
      
      // Basic grammar improvements
      translated = translated.replace(/\b(is|am|are)\s+(is|am|are)\b/g, '$1');
      translated = translated.replace(/\bI\s+you\b/g, 'I and you');
      translated = translated.replace(/\byou\s+I\b/g, 'you and I');
      translated = translated.replace(/\b(a|an|the)\s+(a|an|the)\b/g, '$1');
      
      // Calculate confidence based on translation coverage
      const confidence = Math.min(0.95, 0.6 + (translationCount * 0.1));
      
      return {
        text: translated,
        confidence,
        source: 'Enhanced Dictionary Translation',
        processingTime: Date.now() - startTime,
        quality: confidence
      };
    }
    
    // If no translation found, return with note
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
      'Baidu Translate': 1.02,
      'Enhanced Pattern Recognition': 1.08,
      'Direct Dictionary Match': 1.12,
      'Enhanced Dictionary Translation': 1.0
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
      
      // First try enhanced fallback for immediate response
      const fallbackResult = ultraComprehensiveFallback(text);
      
      // If fallback found a good translation, use it immediately for fast response
      if (fallbackResult.confidence >= 0.8) {
        console.log(`High-confidence fallback translation: "${fallbackResult.text}" (confidence: ${fallbackResult.confidence})`);
        setIsTranslating(false);
        
        // Update context with successful translation
        context.previousTranslations.push(fallbackResult.text);
        if (context.previousTranslations.length > 15) {
          context.previousTranslations = context.previousTranslations.slice(-15);
        }
        
        return fallbackResult.text;
      }
      
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
      
      // Always include enhanced fallback
      translationMethods.push(() => Promise.resolve(fallbackResult));
      
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
    hasAPIKeys: Object.values(apiKeys).some(key => key.trim() !== ''),
    elevenLabsApiKey: apiKeys.elevenLabs
  };
};