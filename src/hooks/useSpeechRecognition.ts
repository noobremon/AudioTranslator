import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (language: string = 'zh-CN') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioSource, setAudioSource] = useState<'microphone' | 'system'>('microphone');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const processingStreamRef = useRef<MediaStream | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const cleanupAudioResources = useCallback(() => {
    // Stop animation frame immediately
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    // Stop all streams quickly
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (processingStreamRef.current) {
      processingStreamRef.current.getTracks().forEach(track => track.stop());
      processingStreamRef.current = null;
    }
    
    // Disconnect audio nodes without error handling for speed
    try {
      sourceNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
      filterNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();
      destinationRef.current?.disconnect();
    } catch {}
    
    // Reset refs
    sourceNodeRef.current = null;
    gainNodeRef.current = null;
    filterNodeRef.current = null;
    analyserRef.current = null;
    destinationRef.current = null;
    
    // Close audio context asynchronously
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
  }, []);

  const initializeAudioContext = useCallback(async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    
    try {
      // Quick cleanup
      cleanupAudioResources();
      
      let stream: MediaStream;
      
      if (audioSource === 'system') {
        // Optimized system audio capture
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000, // Higher sample rate for better quality
            channelCount: 2,
            sampleSize: 16,
            latency: 0.005 // Ultra-low latency
          }
        });
        
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          throw new Error('No system audio available');
        }
        
      } else {
        // Optimized microphone capture
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false, // Disable for faster processing
            sampleRate: 48000,
            channelCount: 1,
            sampleSize: 16,
            latency: 0.005 // Ultra-low latency
          }
        });
      }

      streamRef.current = stream;

      // Create high-performance audio context
      audioContextRef.current = new AudioContext({ 
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      // Force resume immediately
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create optimized audio processing chain
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Aggressive gain for better recognition
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = audioSource === 'system' ? 4.0 : 2.0; // Higher gain
      
      // Optimized filter for speech frequencies
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'bandpass';
      filterNodeRef.current.frequency.value = 1000; // Center on speech frequencies
      filterNodeRef.current.Q.value = 0.5; // Wider band for better capture
      
      // High-resolution analyzer for better level detection
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024; // Smaller for faster processing
      analyserRef.current.smoothingTimeConstant = 0.1; // Less smoothing for faster response
      analyserRef.current.minDecibels = -80;
      analyserRef.current.maxDecibels = -10;
      
      // Create destination
      destinationRef.current = audioContextRef.current.createMediaStreamDestination();
      
      // Connect processing chain
      sourceNodeRef.current
        .connect(filterNodeRef.current)
        .connect(gainNodeRef.current)
        .connect(analyserRef.current)
        .connect(destinationRef.current);

      processingStreamRef.current = destinationRef.current.stream;

      // Ultra-fast audio level monitoring
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Fast level calculation - focus on speech range
          let sum = 0;
          const speechStart = Math.floor(dataArray.length * 0.1); // Skip low frequencies
          const speechEnd = Math.floor(dataArray.length * 0.8); // Skip high frequencies
          
          for (let i = speechStart; i < speechEnd; i++) {
            sum += dataArray[i];
          }
          
          const average = sum / (speechEnd - speechStart);
          const normalizedLevel = Math.min(1, average / 100);
          setAudioLevel(normalizedLevel);
          
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
      
    } catch (error) {
      console.error('Audio initialization failed:', error);
      if (audioSource === 'system') {
        setError('System audio failed. Click "Share system audio" and ensure audio is playing.');
      } else {
        setError('Microphone access failed. Please allow microphone access.');
      }
      cleanupAudioResources();
    } finally {
      isInitializingRef.current = false;
    }
  }, [audioSource, isListening, cleanupAudioResources]);

  const initializeSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // Ultra-fast recognition settings
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 1; // Single result for speed

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.9;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          // Use interim results immediately for speed
          interimTranscript += transcript;
        }
      }

      // Prioritize any available transcript for immediate response
      const currentTranscript = finalTranscript || interimTranscript;
      
      if (currentTranscript.trim()) {
        setTranscript(currentTranscript.trim());
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Ignore no-speech errors for continuous operation
        return;
      }
      
      if (event.error === 'network') {
        // Quick retry on network errors
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {}
          }
        }, 500);
        return;
      }
      
      if (event.error === 'audio-capture') {
        setError(`${audioSource} capture failed. Check permissions.`);
      } else if (event.error === 'not-allowed') {
        setError(`${audioSource} permission denied.`);
      } else {
        setError(`Recognition error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Immediate restart for continuous operation
        restartTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              // Quick reinitialize on restart failure
              setTimeout(() => {
                if (isListening) {
                  initializeSpeechRecognition();
                  setTimeout(() => {
                    if (recognitionRef.current && isListening) {
                      recognitionRef.current.start();
                    }
                  }, 50);
                }
              }, 200);
            }
          }
        }, 50); // Ultra-fast restart
      } else {
        setIsListening(false);
      }
    };
  }, [language, isListening, audioSource]);

  const startListening = useCallback(async (source: 'microphone' | 'system' = 'microphone') => {
    if (isListening && audioSource === source) return;
    
    // Quick stop if switching sources
    if (isListening) {
      stopListening();
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
    }
    
    setAudioSource(source);
    setTranscript('');
    setError(null);
    
    try {
      // Parallel initialization for speed
      const audioPromise = initializeAudioContext();
      initializeSpeechRecognition();
      
      await audioPromise;
      
      // Start recognition immediately
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            setError('Failed to start recognition. Try again.');
          }
        }
      }, 50); // Minimal delay
      
    } catch (error) {
      setError(`Failed to start ${source}. Check permissions.`);
      cleanupAudioResources();
    }
  }, [isListening, audioSource, initializeAudioContext, initializeSpeechRecognition]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    
    // Clear timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = undefined;
    }
    
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch {}
    }
    
    // Clean up resources
    cleanupAudioResources();
  }, [cleanupAudioResources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  // Update language quickly
  useEffect(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = language;
    }
  }, [language, isListening]);

  return {
    isListening,
    transcript,
    error,
    audioLevel,
    audioSource,
    startListening,
    stopListening,
    setAudioSource
  };
};