import { useState, useCallback, useRef, useEffect } from 'react';

export const useTextToSpeech = (volume: number = 0.8) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };

    updateVoices();
    speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  const speak = useCallback((text: string, language: string = 'en-US') => {
    if (!text.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;

    // Find the best voice for the language
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(language.split('-')[0]) && 
      (voice.name.includes('Enhanced') || voice.name.includes('Premium') || voice.localService)
    ) || voices.find(voice => voice.lang.startsWith(language.split('-')[0]));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = language;
    utterance.volume = volume;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      // Only log errors that are not 'interrupted' since that's expected behavior
      if (event.error !== 'interrupted') {
        console.error('Speech synthesis error:', event);
      }
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    speechSynthesis.speak(utterance);
  }, [voices, volume]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    voices
  };
};