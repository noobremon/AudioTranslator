import { useState, useCallback } from 'react';

// Multiple translation APIs for better accuracy and fallback
const translateWithLibreTranslate = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang === 'zh' ? 'zh' : sourceLang,
        target: targetLang === 'en' ? 'en' : targetLang,
        format: 'text'
      })
    });
    
    const data = await response.json();
    
    if (data.translatedText && typeof data.translatedText === 'string' && data.translatedText.trim()) {
      return data.translatedText.trim();
    }
    
    throw new Error('Invalid LibreTranslate response');
  } catch (error) {
    console.error('LibreTranslate failed:', error);
    throw error;
  }
};

const translateWithMyMemory = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  const langMap: { [key: string]: string } = {
    'zh': 'zh-CN',
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'es': 'es',
    'fr': 'fr',
    'de': 'de'
  };

  const source = langMap[sourceLang] || sourceLang;
  const target = langMap[targetLang] || targetLang;

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}&de=example@email.com`
    );
    const data = await response.json();
    
    if (data.responseData && 
        data.responseData.translatedText && 
        typeof data.responseData.translatedText === 'string' &&
        data.responseData.translatedText.trim() !== '' &&
        !data.responseData.translatedText.includes('DAILY LIMIT EXCEEDED') &&
        !data.responseData.translatedText.includes('QUOTA EXCEEDED') &&
        !data.responseData.translatedText.includes('API LIMIT EXCEEDED') &&
        !data.responseData.translatedText.includes('SERVICE UNAVAILABLE') &&
        data.responseData.match > 0.3) { // Ensure minimum quality
      return data.responseData.translatedText.trim();
    }
    
    throw new Error('Invalid or low-quality MyMemory response');
  } catch (error) {
    console.error('MyMemory translation failed:', error);
    throw error;
  }
};

// Comprehensive Chinese to English dictionary with context-aware translations
const chineseToEnglishDict: { [key: string]: string } = {
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
  '什么': 'what',
  '什麼': 'what',
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
  '长': 'long',
  '長': 'long',
  '短': 'short',
  '高': 'tall / high',
  '矮': 'short / low',
  '胖': 'fat',
  '瘦': 'thin',
  '新': 'new',
  '旧': 'old',
  '舊': 'old',
  '好': 'good',
  '坏': 'bad',
  '壞': 'bad',
  '美': 'beautiful',
  '丑': 'ugly',
  '醜': 'ugly',
  '热': 'hot',
  '熱': 'hot',
  '冷': 'cold',
  '快': 'fast',
  '慢': 'slow',
  '容易': 'easy',
  '难': 'difficult',
  '難': 'difficult',
  '重要': 'important',
  '有趣': 'interesting',
  '无聊': 'boring',
  '無聊': 'boring'
};

// Enhanced phonetic matching with tone variations
const phoneticMatching = (text: string): string => {
  const phoneticMap: { [key: string]: string } = {
    // Basic greetings
    'ni hao': '你好',
    'ni hao ma': '你好吗',
    'nin hao': '您好',
    'zao shang hao': '早上好',
    'wan shang hao': '晚上好',
    'zai jian': '再见',
    'bai bai': '拜拜',
    
    // Gratitude and politeness
    'xie xie': '谢谢',
    'xie xie ni': '谢谢你',
    'duo xie': '多谢',
    'gan xie': '感谢',
    'bu ke qi': '不客气',
    'bu yong xie': '不用谢',
    'mei guan xi': '没关系',
    'bu yao jin': '不要紧',
    
    // Apologies
    'dui bu qi': '对不起',
    'bu hao yi si': '不好意思',
    'bao qian': '抱歉',
    'hen bao qian': '很抱歉',
    
    // Requests
    'qing': '请',
    'qing wen': '请问',
    'ma fan ni': '麻烦你',
    'lao jia': '劳驾',
    
    // Responses
    'shi de': '是的',
    'dui': '对',
    'mei cuo': '没错',
    'bu shi': '不是',
    'bu dui': '不对',
    'hao de': '好的',
    'hao': '好',
    'xing': '行',
    'ke yi': '可以',
    'mei wen ti': '没问题',
    'dang ran': '当然',
    'ken ding': '肯定',
    'yi ding': '一定',
    
    // Understanding
    'ming bai': '明白',
    'dong le': '懂了',
    'zhi dao le': '知道了',
    'liao jie': '了解',
    'qing chu': '清楚',
    'bu ming bai': '不明白',
    'bu dong': '不懂',
    'ting bu dong': '听不懂',
    'kan bu dong': '看不懂',
    'bu zhi dao': '不知道',
    'bu qing chu': '不清楚',
    
    // Pronouns
    'wo': '我',
    'ni': '你',
    'nin': '您',
    'ta': '他',
    'ta': '她', // Context dependent
    'wo men': '我们',
    'ni men': '你们',
    'ta men': '他们',
    'da jia': '大家',
    'bie ren': '别人',
    
    // Common verbs
    'shi': '是',
    'you': '有',
    'mei you': '没有',
    'qu': '去',
    'lai': '来',
    'hui lai': '回来',
    'zou': '走',
    'pao': '跑',
    'kan': '看',
    'kan jian': '看见',
    'ting': '听',
    'ting jian': '听见',
    'shuo': '说',
    'jiang': '讲',
    'gao su': '告诉',
    'zuo': '做',
    'gan': '干',
    'gong zuo': '工作',
    'xue xi': '学习',
    'jiao': '教',
    'xue': '学',
    
    // Daily activities
    'chi': '吃',
    'he': '喝',
    'shui': '睡',
    'shui jiao': '睡觉',
    'qi chuang': '起床',
    'xi zao': '洗澡',
    'shua ya': '刷牙',
    'mai': '买',
    'mai': '卖', // Context dependent
    'kai': '开',
    'guan': '关',
    'da kai': '打开',
    'guan bi': '关闭',
    
    // Time
    'xian zai': '现在',
    'jin tian': '今天',
    'ming tian': '明天',
    'zuo tian': '昨天',
    'qian tian': '前天',
    'hou tian': '后天',
    'shi jian': '时间',
    'dian zhong': '点钟',
    'fen zhong': '分钟',
    'xiao shi': '小时',
    'zao shang': '早上',
    'shang wu': '上午',
    'zhong wu': '中午',
    'xia wu': '下午',
    'wan shang': '晚上',
    'ye li': '夜里',
    
    // Numbers
    'yi': '一',
    'er': '二',
    'san': '三',
    'si': '四',
    'wu': '五',
    'liu': '六',
    'qi': '七',
    'ba': '八',
    'jiu': '九',
    'shi': '十',
    'bai': '百',
    'qian': '千',
    'wan': '万',
    'hen duo': '很多',
    'yi xie': '一些',
    'yi dian': '一点',
    'quan bu': '全部',
    'suo you': '所有',
    
    // Business terms
    'hui yi': '会议',
    'kai hui': '开会',
    'xiang mu': '项目',
    'gong cheng': '工程',
    'ren wu': '任务',
    'wan cheng': '完成',
    'kai shi': '开始',
    'jie shu': '结束',
    'ting zhi': '停止',
    'ji xu': '继续',
    'tao lun': '讨论',
    'shang liang': '商量',
    'jue ding': '决定',
    'xuan ze': '选择',
    'tong yi': '同意',
    'bu tong yi': '不同意',
    'fan dui': '反对',
    'zhi chi': '支持',
    
    // Questions and problems
    'wen ti': '问题',
    'kun nan': '困难',
    'ma fan': '麻烦',
    'jie jue': '解决',
    'chu li': '处理',
    'bang zhu': '帮助',
    'bang mang': '帮忙',
    
    // Question words
    'shen me': '什么',
    'na li': '哪里',
    'na er': '哪儿',
    'wei shen me': '为什么',
    'zen me': '怎么',
    'zen me yang': '怎么样',
    'duo shao': '多少',
    'ji ge': '几个',
    'shen me shi hou': '什么时候',
    'shei': '谁',
    'na ge': '哪个'
  };

  let processedText = text.toLowerCase().trim();
  
  // Remove punctuation and extra spaces
  processedText = processedText.replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ');
  
  // Check for phonetic matches (longest first)
  const sortedPhonetics = Object.entries(phoneticMap).sort(([a], [b]) => b.length - a.length);
  
  for (const [phonetic, chinese] of sortedPhonetics) {
    if (processedText.includes(phonetic)) {
      processedText = processedText.replace(new RegExp(phonetic, 'gi'), chinese);
    }
  }
  
  return processedText;
};

// Enhanced context-aware translation with phrase detection
const contextAwareTranslation = (text: string): string => {
  // Common phrase patterns
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
    { pattern: /当然可以.*/, replacement: 'Of course' },
    { pattern: /很高兴.*/, replacement: 'Very happy' },
    { pattern: /祝你.*/, replacement: 'Wish you...' }
  ];
  
  // Check for phrase patterns first
  for (const { pattern, replacement } of phrasePatterns) {
    if (pattern.test(text)) {
      return replacement;
    }
  }
  
  return text;
};

// Enhanced fallback translation with better accuracy
const fallbackTranslation = (text: string, sourceLang: string, targetLang: string): string => {
  if (sourceLang === 'zh' && targetLang === 'en') {
    let processedText = text.trim();
    
    // First, try phonetic matching for spoken input
    processedText = phoneticMatching(processedText);
    
    // Check for context-aware phrase translations
    const contextResult = contextAwareTranslation(processedText);
    if (contextResult !== processedText) {
      return contextResult;
    }
    
    // Direct dictionary lookup
    if (chineseToEnglishDict[processedText]) {
      return chineseToEnglishDict[processedText];
    }
    
    // Enhanced word-by-word translation with better phrase handling
    let translated = processedText;
    let hasTranslation = false;
    
    // Sort by length (longest first) to handle phrases before individual words
    const sortedEntries = Object.entries(chineseToEnglishDict)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [chinese, english] of sortedEntries) {
      if (translated.includes(chinese)) {
        translated = translated.replace(new RegExp(chinese, 'g'), english);
        hasTranslation = true;
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
      
      return translated;
    }
    
    // If no translation found, return with note
    return `[Translation needed: ${text}]`;
  }
  
  return text;
};

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (
    text: string, 
    sourceLang: string, 
    targetLang: string
  ): Promise<string> => {
    if (!text.trim()) return '';
    
    console.log(`Translating: "${text}" from ${sourceLang} to ${targetLang}`);
    setIsTranslating(true);
    
    try {
      // First try enhanced fallback for immediate response
      const fallbackResult = fallbackTranslation(text, sourceLang, targetLang);
      
      // If fallback found a good translation, use it immediately
      if (fallbackResult !== text && !fallbackResult.includes('[Translation needed:')) {
        console.log(`Fallback translation: "${fallbackResult}"`);
        setIsTranslating(false);
        return fallbackResult;
      }
      
      // Try multiple online translation services for better accuracy
      const translationPromises = [
        translateWithMyMemory(text, sourceLang, targetLang),
        translateWithLibreTranslate(text, sourceLang, targetLang)
      ];
      
      try {
        // Use Promise.allSettled to get results from all services
        const results = await Promise.allSettled(translationPromises);
        
        // Find the best translation result
        const successfulResults = results
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(translation => translation && translation.trim() && !translation.includes('['));
        
        if (successfulResults.length > 0) {
          // Return the first successful translation
          const bestTranslation = successfulResults[0];
          console.log(`Online translation: "${bestTranslation}"`);
          return bestTranslation;
        }
        
        // If online services failed, use fallback
        console.log('Online services failed, using fallback');
        return fallbackResult;
        
      } catch (error) {
        console.warn('All online translation services failed:', error);
        return fallbackResult;
      }
    } catch (error) {
      console.error('Translation error:', error);
      return `[Error translating: ${text}]`;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return {
    translateText,
    isTranslating
  };
};