import { useState, useCallback, useRef, useEffect } from 'react';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers: string[];
}

interface ElevenLabsSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export const useElevenLabsTTS = (apiKey: string, volume: number = 0.8) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Voice settings for optimal quality
  const voiceSettings: ElevenLabsSettings = {
    stability: 0.75,        // Good balance of consistency
    similarity_boost: 0.85, // High similarity to original voice
    style: 0.5,            // Moderate style expression
    use_speaker_boost: true // Enhanced clarity
  };

  // Load available voices
  const loadVoices = useCallback(async () => {
    // Don't attempt to load voices if no API key is provided
    if (!apiKey || apiKey.trim() === '') {
      setVoices([]);
      setSelectedVoiceId('');
      setError(null); // Clear any previous errors
      return;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API key. Please check your API key in settings.');
        }
        throw new Error(`Failed to load voices: ${response.status}`);
      }

      const data = await response.json();
      setVoices(data.voices || []);
      
      // Auto-select a good English voice if none selected
      if (!selectedVoiceId && data.voices?.length > 0) {
        // Prefer premium English voices
        const englishVoice = data.voices.find((voice: ElevenLabsVoice) => 
          voice.name.toLowerCase().includes('rachel') || 
          voice.name.toLowerCase().includes('bella') ||
          voice.name.toLowerCase().includes('josh') ||
          voice.category === 'premade'
        ) || data.voices[0];
        
        setSelectedVoiceId(englishVoice.voice_id);
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to load ElevenLabs voices:', error);
      // Only set error if we actually have an API key (user is trying to use the service)
      if (apiKey && apiKey.trim() !== '') {
        setError(error.message || 'Failed to load voices. Check your API key.');
      }
      setVoices([]);
      setSelectedVoiceId('');
    }
  }, [apiKey, selectedVoiceId]);

  // Generate speech using ElevenLabs API
  const speak = useCallback(async (text: string, language: string = 'en-US') => {
    if (!text.trim()) {
      console.warn('No text provided for ElevenLabs TTS');
      return;
    }

    if (!apiKey || apiKey.trim() === '') {
      console.warn('No ElevenLabs API key provided');
      // Don't set error for missing API key - this is expected when not configured
      return;
    }

    if (!selectedVoiceId) {
      console.warn('No voice selected for ElevenLabs TTS');
      setError('Please select a voice first');
      return;
    }

    // Stop any current playback
    stop();

    setIsLoading(true);
    setError(null);

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: text.substring(0, 2500), // ElevenLabs character limit
            model_id: 'eleven_multilingual_v2', // Best model for multiple languages
            voice_settings: voiceSettings
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API key. Please check your API key in settings.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || `ElevenLabs API error: ${response.status}`);
      }

      // Convert response to audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and configure audio element
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';

      // Set up event listeners
      audioRef.current.onloadstart = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audioRef.current.onended = () => {
        setIsSpeaking(false);
        cleanup();
      };

      audioRef.current.onerror = (event) => {
        console.error('Audio playback error:', event);
        setError('Audio playback failed');
        setIsSpeaking(false);
        setIsLoading(false);
        cleanup();
      };

      audioRef.current.onabort = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        cleanup();
      };

      // Start playback
      await audioRef.current.play();
      
      console.log(`ElevenLabs TTS: Playing "${text.substring(0, 50)}..." with voice ${selectedVoiceId}`);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('ElevenLabs TTS request aborted');
      } else {
        console.error('ElevenLabs TTS error:', error);
        setError(error.message || 'Speech synthesis failed');
      }
      setIsSpeaking(false);
      setIsLoading(false);
    }
  }, [apiKey, selectedVoiceId, volume]);

  // Stop current speech
  const stop = useCallback(() => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSpeaking(false);
    setIsLoading(false);
    cleanup();
  }, []);

  // Cleanup resources
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      const audioUrl = audioRef.current.src;
      audioRef.current = null;
      
      // Revoke object URL to free memory
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    }
  }, []);

  // Preview a voice
  const previewVoice = useCallback(async (voiceId: string) => {
    if (!apiKey || apiKey.trim() === '') {
      // Don't show error for missing API key during preview
      console.warn('ElevenLabs API key required for voice preview');
      return;
    }

    try {
      await speak('Hello, this is a preview of this voice.', 'en-US');
    } catch (error) {
      console.error('Voice preview failed:', error);
    }
  }, [speak, apiKey]);

  // Load voices when API key changes
  useEffect(() => {
    loadVoices();
  }, [apiKey, loadVoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      cleanup();
    };
  }, [stop, cleanup]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    voices,
    selectedVoiceId,
    setSelectedVoiceId,
    error,
    loadVoices,
    previewVoice,
    hasApiKey: !!apiKey && apiKey.trim() !== ''
  };
};