import { useState, useEffect, useRef, useCallback } from 'react';

// Add a type declaration for SpeechRecognition if not available
declare global {
  // Minimal SpeechRecognition type for compatibility
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI?: string;
    onaudioend?: (event: Event) => void;
    onaudiostart?: (event: Event) => void;
    onend?: (event: Event) => void;
    onerror?: (event:Event) => void;
    onnomatch?: (event: Event) => void;
    onresult?: (event: Event) => void;
    onsoundend?: (event: Event) => void;
    onsoundstart?: (event: Event) => void;
    onspeechend?: (event: Event) => void;
    onspeechstart?: (event: Event) => void;
    onstart?: (event: Event) => void;
    start(): void;
    stop(): void;
    abort(): void;
  }
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface AudioQualityMetrics {
  signalToNoise: number;
  clarity: number;
  volume: number;
  stability: number;
}

export const useEnterpriseAudio = (language: string = 'zh-CN') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioSource, setAudioSource] = useState<'microphone' | 'system'>('microphone');
  const [qualityMetrics, setQualityMetrics] = useState<AudioQualityMetrics>({
    signalToNoise: 0,
    clarity: 0,
    volume: 0,
    stability: 0
  });
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isSystemAudioSupported, setIsSystemAudioSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const restartTimeoutRef = useRef<number | undefined>();
  const sessionStartRef = useRef<number>(0);
  const durationIntervalRef = useRef<number>();
  const networkRetryCountRef = useRef<number>(0);
  const maxNetworkRetries = 3;
  
  // Add the new ref to track network retry scheduling
  const privateRetryScheduledRef = useRef<boolean>(false);
  
  // Professional audio processing nodes
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const noiseGateRef = useRef<GainNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  
  // Quality monitoring
  const qualityBufferRef = useRef<number[]>([]);
  const noiseFloorRef = useRef<number>(0);
  const recognitionBufferRef = useRef<string[]>([]);

  // Add ref to store stopListening function to break circular dependency
  const stopListeningRef = useRef<(() => void) | null>(null);

  // Track active streams to prevent multiple simultaneous captures
  const activeStreamRef = useRef<MediaStream | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const checkSystemAudioSupport = useCallback((): boolean => {
    // Check if getDisplayMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return false;
    }
    
    // Check if we're in a secure context (required for getDisplayMedia)
    if (!window.isSecureContext) {
      return false;
    }
    
    // Check browser compatibility
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isEdge = userAgent.includes('edg');
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    // System audio is best supported in Chrome and Edge
    return isChrome || isEdge || isFirefox;
  }, []);

  // Check system audio support on mount
  useEffect(() => {
    setIsSystemAudioSupported(checkSystemAudioSupport());
  }, [checkSystemAudioSupport]);

  const cleanupAudioResources = useCallback(() => {
    // Stop all timers immediately
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = undefined;
    }
    
    // Stop streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear active stream reference
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      activeStreamRef.current = null;
    }
    
    // Disconnect audio nodes
    try {
      sourceNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
      compressorRef.current?.disconnect();
      filterNodeRef.current?.disconnect();
      noiseGateRef.current?.disconnect();
      limiterRef.current?.disconnect();
      analyserRef.current?.disconnect();
      destinationRef.current?.disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
    
    // Reset refs
    sourceNodeRef.current = null;
    gainNodeRef.current = null;
    compressorRef.current = null;
    filterNodeRef.current = null;
    noiseGateRef.current = null;
    limiterRef.current = null;
    analyserRef.current = null;
    destinationRef.current = null;
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
    setQualityMetrics({ signalToNoise: 0, clarity: 0, volume: 0, stability: 0 });
    isInitializingRef.current = false;
  }, []);

  const checkNetworkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Test connectivity with a simple fetch to a reliable endpoint
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      console.warn('Network connectivity check failed:', error);
      return navigator.onLine;
    }
  }, []);

  const initializeEnterpriseAudio = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.log('Audio initialization already in progress, skipping...');
      return;
    }
    
    isInitializingRef.current = true;
    
    try {
      cleanupAudioResources();
      
      let stream: MediaStream;
      
      if (audioSource === 'system') {
        // Enhanced system audio support check
        if (!isSystemAudioSupported) {
          throw new Error('SYSTEM_AUDIO_NOT_SUPPORTED');
        }
        
        // Check if we already have an active system audio stream
        if (activeStreamRef.current && activeStreamRef.current.active) {
          console.log('Reusing existing system audio stream');
          stream = activeStreamRef.current;
        } else {
          try {
            console.log('Requesting new system audio stream...');
            
            // Simplified system audio capture with basic constraints
            stream = await navigator.mediaDevices.getDisplayMedia({
              video: false,
              audio: true  // Simplified to just true for maximum compatibility
            });
            
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
              throw new Error('NO_SYSTEM_AUDIO_TRACKS');
            }
            
            // Store the active stream for reuse
            activeStreamRef.current = stream;
            
            // Apply optimized constraints for Chinese audio recognition after stream creation
            const track = audioTracks[0];
            
            // Add event listeners for track state changes
            track.addEventListener('ended', () => {
              console.log('System audio track ended');
              if (isListening) {
                setError('System audio capture ended. Please restart system audio capture.');
                if (stopListeningRef.current) {
                  stopListeningRef.current();
                }
              }
            });
            
            track.addEventListener('mute', () => {
              console.log('System audio track muted');
            });
            
            track.addEventListener('unmute', () => {
              console.log('System audio track unmuted');
            });
            
            // Try to apply enhanced constraints, but don't fail if they're not supported
            try {
              if (typeof track.applyConstraints === 'function') {
                await track.applyConstraints({
                  echoCancellation: false,
                  noiseSuppression: false,
                  autoGainControl: false
                });
                console.log('Enhanced system audio constraints applied successfully');
              }
            } catch (constraintError) {
              console.warn('Could not apply enhanced constraints, using default settings:', constraintError);
            }

            if (typeof track.getSettings === 'function') {
              console.log('System audio track settings:', track.getSettings());
            }
            console.log('System audio stream successfully initialized');
            
          } catch (displayMediaError: any) {
            console.error('getDisplayMedia error:', displayMediaError);
            
            // Handle specific getDisplayMedia errors with detailed messages
            if (displayMediaError.name === 'NotSupportedError' || 
                displayMediaError.message === 'Not supported' ||
                displayMediaError.message.includes('not supported')) {
              throw new Error('SYSTEM_AUDIO_NOT_SUPPORTED');
            } else if (displayMediaError.name === 'NotAllowedError') {
              throw new Error('SYSTEM_AUDIO_PERMISSION_DENIED');
            } else if (displayMediaError.name === 'NotFoundError') {
              throw new Error('NO_SYSTEM_AUDIO_AVAILABLE');
            } else if (displayMediaError.name === 'AbortError') {
              throw new Error('SYSTEM_AUDIO_CAPTURE_ABORTED');
            } else if (displayMediaError.name === 'NotReadableError') {
              throw new Error('SYSTEM_AUDIO_HARDWARE_ERROR');
            } else if (displayMediaError.name === 'OverconstrainedError') {
              throw new Error('SYSTEM_AUDIO_CONSTRAINTS_ERROR');
            } else {
              // Generic error with original message
              throw new Error(`SYSTEM_AUDIO_ERROR: ${displayMediaError.message}`);
            }
          }
        }
        
      } else {
        // Ultra-high quality microphone capture
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 1,
            sampleSize: 24,
          }
        });
      }

      streamRef.current = stream;

      // Create professional audio context with optimal settings
      audioContextRef.current = new AudioContext({ 
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      await audioContextRef.current.resume();

      // Create enhanced audio processing chain for Chinese audio
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Adaptive noise gate for background audio
      noiseGateRef.current = audioContextRef.current.createGain();
      noiseGateRef.current.gain.value = 1.0;
      
      // Optimized filter for Chinese speech frequencies (200Hz - 8kHz)
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'bandpass';
      filterNodeRef.current.frequency.value = 1500; // Center on Chinese speech
      filterNodeRef.current.Q.value = 0.3; // Wide band for tonal languages
      
      // Dynamic range compressor optimized for Chinese audio
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      compressorRef.current.threshold.value = -24;  // Higher threshold for system audio
      compressorRef.current.knee.value = 30;
      compressorRef.current.ratio.value = 6;        // Moderate compression
      compressorRef.current.attack.value = 0.005;   // Fast attack for speech
      compressorRef.current.release.value = 0.1;    // Quick release
      
      // Aggressive gain for system audio recognition
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = audioSource === 'system' ? 12.0 : 4.0; // Much higher gain for system audio
      
      // Limiter to prevent clipping
      limiterRef.current = audioContextRef.current.createDynamicsCompressor();
      limiterRef.current.threshold.value = -1;      // Prevent clipping
      limiterRef.current.knee.value = 0;
      limiterRef.current.ratio.value = 20;
      limiterRef.current.attack.value = 0.001;
      limiterRef.current.release.value = 0.01;
      
      // Ultra-high resolution analyzer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 16384;          // High resolution for tonal analysis
      analyserRef.current.smoothingTimeConstant = 0.05;
      analyserRef.current.minDecibels = -100;
      analyserRef.current.maxDecibels = -10;
      
      // Output destination
      destinationRef.current = audioContextRef.current.createMediaStreamDestination();
      
      // Connect the enhanced audio chain for Chinese audio processing
      sourceNodeRef.current
        .connect(noiseGateRef.current)
        .connect(filterNodeRef.current)
        .connect(compressorRef.current)
        .connect(gainNodeRef.current)
        .connect(limiterRef.current)
        .connect(analyserRef.current)
        .connect(destinationRef.current);

      // Enhanced audio quality monitoring for Chinese speech
      const frequencyData = new Float32Array(analyserRef.current.frequencyBinCount);
      const timeData = new Float32Array(analyserRef.current.fftSize);

      const monitorAudioQuality = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getFloatFrequencyData(frequencyData);
          analyserRef.current.getFloatTimeDomainData(timeData);

          // Calculate RMS level
          let rms = 0;
          for (let i = 0; i < timeData.length; i++) {
            rms += timeData[i] * timeData[i];
          }
          rms = Math.sqrt(rms / timeData.length);

          // Chinese speech frequency analysis (200Hz - 8kHz)
          const sampleRate = audioContextRef.current?.sampleRate ?? 48000;
          const chineseSpeechStart = Math.floor(200 * frequencyData.length / (sampleRate / 2));
          const chineseSpeechEnd = Math.floor(8000 * frequencyData.length / (sampleRate / 2));

          let speechPower = 0;
          let noisePower = 0;

          for (let i = 0; i < frequencyData.length; i++) {
            const power = Math.pow(10, frequencyData[i] / 10);
            if (i >= chineseSpeechStart && i <= chineseSpeechEnd) {
              speechPower += power;
            } else {
              noisePower += power;
            }
          }

          const snr = speechPower > 0 && noisePower > 0 ?
            10 * Math.log10(speechPower / noisePower) : 0;

          // Enhanced clarity calculation for tonal languages
          let weightedSum = 0;
          let magnitudeSum = 0;
          for (let i = chineseSpeechStart; i <= chineseSpeechEnd && i < frequencyData.length; i++) {
            const magnitude = Math.pow(10, frequencyData[i] / 20);
            const frequency = i * sampleRate / (2 * frequencyData.length);
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
          }
          const clarity = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

          // Update quality buffer for stability
          qualityBufferRef.current.push(rms);
          if (qualityBufferRef.current.length > 200) {
            qualityBufferRef.current.shift();
          }

          // Calculate stability
          let variance = 0;
          if (qualityBufferRef.current.length > 20) {
            const mean = qualityBufferRef.current.reduce((a, b) => a + b, 0) / qualityBufferRef.current.length;
            variance = qualityBufferRef.current.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / qualityBufferRef.current.length;
          }
          const stability = variance > 0 ? Math.min(1, 1 / (1 + variance * 200)) : 1;

          setAudioLevel(Math.min(1, rms * (audioSource === 'system' ? 15 : 25)));
          setQualityMetrics({
            signalToNoise: Math.max(0, Math.min(1, (snr + 15) / 35)),
            clarity: Math.max(0, Math.min(1, clarity / 3000)),
            volume: Math.min(1, rms * (audioSource === 'system' ? 10 : 15)),
            stability
          });

          // Adaptive noise gate for system audio
          if (noiseGateRef.current) {
            const gateThreshold = audioSource === 'system' ?
              Math.max(0.02, rms * 0.1) :
              Math.max(0.05, rms * 0.2);
            noiseGateRef.current.gain.value = rms > gateThreshold ? 1.0 : 0.1;
          }

          animationRef.current = requestAnimationFrame(monitorAudioQuality);
        }
      };

      monitorAudioQuality();
      
      console.log(`Enhanced Chinese audio processing initialized for ${audioSource} with 48kHz/24-bit processing`);
      
    } catch (error: any) {
      console.error('Professional audio initialization failed:', error);
      
      // Handle specific error types with user-friendly messages
      if (error.message === 'SYSTEM_AUDIO_NOT_SUPPORTED') {
        setError('System audio capture is not supported by your browser. Please use Chrome, Edge, or Firefox, and ensure you\'re on a secure (HTTPS) connection. Try using microphone mode instead.');
      } else if (error.message === 'SYSTEM_AUDIO_PERMISSION_DENIED') {
        setError('System audio permission denied. Please click "Share system audio" when prompted and ensure Chinese audio is playing on your system.');
      } else if (error.message === 'NO_SYSTEM_AUDIO_TRACKS') {
        setError('No system audio available. Make sure "Share system audio" is selected and Chinese audio is playing on your system.');
      } else if (error.message === 'NO_SYSTEM_AUDIO_AVAILABLE') {
        setError('No system audio source found. Ensure Chinese audio is playing and try again.');
      } else if (error.message === 'SYSTEM_AUDIO_CAPTURE_ABORTED') {
        setError('System audio capture was cancelled. Please try again and allow screen sharing with audio.');
      } else if (error.message === 'SYSTEM_AUDIO_HARDWARE_ERROR') {
        setError('System audio hardware error. Please check your audio drivers and try again.');
      } else if (error.message === 'SYSTEM_AUDIO_CONSTRAINTS_ERROR') {
        setError('System audio configuration error. Please try using a different browser or restart your browser.');
      } else if (error.message.startsWith('SYSTEM_AUDIO_ERROR:')) {
        setError(`System audio error: ${error.message.replace('SYSTEM_AUDIO_ERROR: ', '')}. Please try refreshing the page or using microphone mode.`);
      } else if (error.name === 'NotSupportedError' || error.message === 'Not supported') {
        if (audioSource === 'system') {
          setError('System audio capture is not supported by your browser or environment. Please try using microphone mode instead.');
        } else {
          setError('Audio capture is not supported by your browser. Please use a modern browser like Chrome, Edge, or Firefox.');
        }
      } else if (error.name === 'NotAllowedError') {
        if (audioSource === 'system') {
          setError('System audio permission denied. Please allow screen sharing with audio when prompted.');
        } else {
          setError('Microphone permission denied. Please allow microphone access when prompted.');
        }
      } else if (error.name === 'NotFoundError') {
        if (audioSource === 'system') {
          setError('No system audio source available. Ensure Chinese audio is playing and try again.');
        } else {
          setError('No microphone found. Please check your microphone connection and try again.');
        }
      } else {
        // Generic fallback error message
        if (audioSource === 'system') {
          setError('System audio failed. Please ensure you\'re using a supported browser (Chrome/Edge/Firefox), on a secure connection, and Chinese audio is playing.');
        } else {
          setError('Microphone access failed. Check permissions and hardware, then try again.');
        }
      }
      
      cleanupAudioResources();
    } finally {
      isInitializingRef.current = false;
    }
  }, [audioSource, isListening, cleanupAudioResources, isSystemAudioSupported]);

  const initializeEnterpriseSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // Optimized recognition settings for Chinese audio
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 3; // Multiple alternatives for better Chinese recognition

    // Enhanced settings for better Chinese recognition
    if (recognitionRef.current.serviceURI) {
      recognitionRef.current.serviceURI = 'wss://www.google.com/speech-api/v2/recognize';
    }

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      networkRetryCountRef.current = 0;
      privateRetryScheduledRef.current = false; // Reset retry flag on start
      sessionStartRef.current = Date.now();
      
      // Start session duration tracking
      durationIntervalRef.current = window.setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
      
      console.log(`Enhanced Chinese speech recognition started for ${audioSource}`);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        // Find the best alternative for Chinese recognition
        let currentBest = result[0];
        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > currentBest.confidence) {
            currentBest = result[j];
          }
        }
        
        const transcript = currentBest.transcript;
        const confidence = currentBest.confidence || 0.9;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          bestConfidence = Math.max(bestConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Enhanced Chinese text processing
      const currentTranscript = finalTranscript || (bestConfidence > 0.6 ? interimTranscript : '');
      
      if (currentTranscript.trim()) {
        // Clean up Chinese text
        const cleanedTranscript = currentTranscript.trim()
          .replace(/\s+/g, '') // Remove spaces in Chinese text
          .replace(/[，。！？；：]/g, match => match + ' '); // Add space after Chinese punctuation
        
        // Add to recognition buffer for quality analysis
        recognitionBufferRef.current.push(cleanedTranscript);
        if (recognitionBufferRef.current.length > 10) {
          recognitionBufferRef.current.shift();
        }
        
        setTranscript(cleanedTranscript);
        console.log(`Chinese Recognition (${audioSource}, confidence: ${bestConfidence.toFixed(3)}):`, cleanedTranscript);
      }
    };

    recognitionRef.current.onerror = async (event: any) => {
      console.error(`Speech recognition error (${audioSource}):`, event.error);
      
      if (event.error === 'no-speech') {
        // Continue silently for no-speech
        return;
      }
      
      if (event.error === 'network') {
        // Enhanced network error handling with retry scheduling flag
        networkRetryCountRef.current++;
        
        if (networkRetryCountRef.current <= maxNetworkRetries) {
          setError(`Network issue detected. Retrying... (${networkRetryCountRef.current}/${maxNetworkRetries})`);
          
          // Check network connectivity before retrying
          const isConnected = await checkNetworkConnectivity();
          
          if (!isConnected) {
            setError('No internet connection. Please check your network and try again.');
            if (stopListeningRef.current) {
              stopListeningRef.current();
            }
            return;
          }
          
          // Set the retry scheduled flag to prevent onend from also scheduling a restart
          privateRetryScheduledRef.current = true;
          
          // Progressive retry delays
          const retryDelay = networkRetryCountRef.current * 2000;
          
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log(`Network retry ${networkRetryCountRef.current} initiated`);
                // Reset the flag after successful retry attempt
                privateRetryScheduledRef.current = false;
              } catch (retryError) {
                console.warn('Network retry failed:', retryError);
                setError('Failed to reconnect. Please check your internet connection and restart.');
                privateRetryScheduledRef.current = false;
              }
            } else {
              privateRetryScheduledRef.current = false;
            }
          }, retryDelay);
        } else {
          setError('Network connection unstable. Please check your internet connection and restart.');
          if (stopListeningRef.current) {
            stopListeningRef.current();
          }
        }
        return;
      }
      
      // Handle other errors
      const errorMessages: { [key: string]: string } = {
        'audio-capture': `${audioSource} capture failed. Check hardware and permissions.`,
        'not-allowed': `${audioSource} permission denied. Please allow access.`,
        'service-not-allowed': 'Speech recognition service unavailable. Try refreshing the page.',
        'bad-grammar': 'Recognition grammar error.',
        'language-not-supported': `Language ${language} not supported.`,
        'aborted': 'Recognition was aborted.'
      };
      
      setError(errorMessages[event.error] || `Recognition error: ${event.error}. Try refreshing the page.`);
      
      // Stop listening for critical errors
      if (['not-allowed', 'service-not-allowed', 'language-not-supported'].includes(event.error)) {
        if (stopListeningRef.current) {
          stopListeningRef.current();
        }
      }
    };

    recognitionRef.current.onend = () => {
      console.log(`Speech recognition ended for ${audioSource}`);
      
      if (isListening) {
        // Check if a network retry has already been scheduled by the onerror handler
        if (privateRetryScheduledRef.current) {
          console.log('Network retry already scheduled, skipping onend restart');
          return;
        }
        
        // Only restart if we haven't exceeded network retry limits
        if (networkRetryCountRef.current < maxNetworkRetries) {
          // Ultra-fast restart for continuous Chinese audio processing
          const restartDelay = audioSource === 'system' ? 50 : 25; // Faster restart for system audio
          restartTimeoutRef.current = window.setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Restart failed, reinitializing:', error);
                // Full reinitialize on restart failure
                window.setTimeout(() => {
                  if (isListening) {
                    initializeEnterpriseSpeechRecognition();
                    window.setTimeout(() => {
                      if (recognitionRef.current && isListening) {
                        recognitionRef.current.start();
                      }
                    }, 50);
                  }
                }, 500);
              }
            }
          }, restartDelay);
        }
      } else {
        setIsListening(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      }
    };
  }, [language, isListening, audioSource, checkNetworkConnectivity]);

  const stopListening = useCallback(() => {
    console.log('Stopping professional audio processing...');
    setIsListening(false);
    
    // Clear all timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = undefined;
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = undefined;
    }
    
    // Reset retry scheduling flag
    privateRetryScheduledRef.current = false;
    
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.warn('Recognition stop error:', error);
      }
    }
    
    // Clean up audio resources
    cleanupAudioResources();
    
    setSessionDuration(0);
    networkRetryCountRef.current = 0;
    recognitionBufferRef.current = [];
    console.log('Professional audio processing stopped');
  }, [cleanupAudioResources]);

  // Update the ref whenever stopListening changes
  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  const startListening = useCallback(async (source: 'microphone' | 'system' = 'microphone') => {
    if (isListening && audioSource === source) return;
    
    // Prevent system audio if not supported
    if (source === 'system' && !isSystemAudioSupported) {
      setError('System audio capture is not supported by your browser. Please use Chrome, Edge, or Firefox on a secure (HTTPS) connection.');
      return;
    }
    
    // Check network connectivity before starting
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      setError('No internet connection detected. Speech recognition requires an active internet connection.');
      return;
    }
    
    // Clean stop if switching sources
    if (isListening) {
      stopListening();
      await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay for proper cleanup
    }
    
    console.log(`Starting enhanced Chinese ${source} recognition...`);
    setAudioSource(source);
    setTranscript('');
    setError(null);
    setSessionDuration(0);
    networkRetryCountRef.current = 0;
    privateRetryScheduledRef.current = false; // Reset retry flag
    recognitionBufferRef.current = [];
    
    try {
      // Initialize audio and recognition in parallel
      const audioPromise = initializeEnterpriseAudio();
      initializeEnterpriseSpeechRecognition();
      
      await audioPromise;
      
      // Start recognition with minimal delay
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Failed to start recognition:', error);
            setError('Failed to start speech recognition. Please try again.');
          }
        }
      }, 100); // Slightly longer delay for system audio stability
      
    } catch (error) {
      console.error(`Failed to start ${source}:`, error);
      setError(`Failed to start ${source}. Check permissions and hardware.`);
      cleanupAudioResources();
    }
  }, [isListening, audioSource, isSystemAudioSupported, checkNetworkConnectivity, initializeEnterpriseAudio, initializeEnterpriseSpeechRecognition, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  // Update language
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
    qualityMetrics,
    sessionDuration,
    isSystemAudioSupported,
    startListening,
    stopListening,
    setAudioSource
  };
};