import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
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
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionStartRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout>();
  const networkRetryCountRef = useRef<number>(0);
  const maxNetworkRetries = 3;
  
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
    try {
      cleanupAudioResources();
      
      let stream: MediaStream;
      
      if (audioSource === 'system') {
        // Ultra-high quality system audio capture
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 2,
            latency: 0.001,
            volume: 1.0
          }
        });
        
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          throw new Error('No system audio available - ensure "Share system audio" is selected');
        }
        
        // Apply advanced constraints for system audio
        const track = audioTracks[0];
        await track.applyConstraints({
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 2
        });
        
      } else {
        // Ultra-high quality microphone capture
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 1,
            latency: 0.001
          }
        });
      }

      streamRef.current = stream;

      // Create professional audio context
      audioContextRef.current = new AudioContext({ 
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      await audioContextRef.current.resume();

      // Create professional audio processing chain
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Noise gate for background elimination
      noiseGateRef.current = audioContextRef.current.createGain();
      noiseGateRef.current.gain.value = 1.0;
      
      // High-pass filter for low-frequency noise removal
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'highpass';
      filterNodeRef.current.frequency.value = 80;
      filterNodeRef.current.Q.value = 0.7;
      
      // Dynamic range compressor
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      compressorRef.current.threshold.value = -20;
      compressorRef.current.knee.value = 30;
      compressorRef.current.ratio.value = 8;
      compressorRef.current.attack.value = 0.003;
      compressorRef.current.release.value = 0.25;
      
      // Aggressive gain for speech recognition
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = audioSource === 'system' ? 8.0 : 4.0;
      
      // Limiter to prevent clipping
      limiterRef.current = audioContextRef.current.createDynamicsCompressor();
      limiterRef.current.threshold.value = -3;
      limiterRef.current.knee.value = 0;
      limiterRef.current.ratio.value = 20;
      limiterRef.current.attack.value = 0.001;
      limiterRef.current.release.value = 0.01;
      
      // Ultra-high resolution analyzer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 16384;
      analyserRef.current.smoothingTimeConstant = 0.05;
      analyserRef.current.minDecibels = -100;
      analyserRef.current.maxDecibels = -10;
      
      // Output destination
      destinationRef.current = audioContextRef.current.createMediaStreamDestination();
      
      // Connect the professional audio chain
      sourceNodeRef.current
        .connect(noiseGateRef.current)
        .connect(filterNodeRef.current)
        .connect(compressorRef.current)
        .connect(gainNodeRef.current)
        .connect(limiterRef.current)
        .connect(analyserRef.current)
        .connect(destinationRef.current);

      // Professional audio quality monitoring
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
          
          // Calculate signal-to-noise ratio
          const speechBandStart = Math.floor(300 * frequencyData.length / (audioContextRef.current!.sampleRate / 2));
          const speechBandEnd = Math.floor(3400 * frequencyData.length / (audioContextRef.current!.sampleRate / 2));
          
          let speechPower = 0;
          let noisePower = 0;
          
          for (let i = 0; i < frequencyData.length; i++) {
            const power = Math.pow(10, frequencyData[i] / 10);
            if (i >= speechBandStart && i <= speechBandEnd) {
              speechPower += power;
            } else {
              noisePower += power;
            }
          }
          
          const snr = speechPower > 0 && noisePower > 0 ? 
            10 * Math.log10(speechPower / noisePower) : 0;
          
          // Calculate spectral centroid for clarity
          let weightedSum = 0;
          let magnitudeSum = 0;
          for (let i = speechBandStart; i <= speechBandEnd; i++) {
            const magnitude = Math.pow(10, frequencyData[i] / 20);
            const frequency = i * audioContextRef.current!.sampleRate / (2 * frequencyData.length);
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
            const mean = qualityBufferRef.current.reduce((a, b) => a + b) / qualityBufferRef.current.length;
            variance = qualityBufferRef.current.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / qualityBufferRef.current.length;
          }
          const stability = variance > 0 ? Math.min(1, 1 / (1 + variance * 200)) : 1;
          
          // Update metrics
          setAudioLevel(Math.min(1, rms * 25));
          setQualityMetrics({
            signalToNoise: Math.max(0, Math.min(1, (snr + 15) / 35)),
            clarity: Math.max(0, Math.min(1, clarity / 2500)),
            volume: Math.min(1, rms * 15),
            stability
          });
          
          // Adaptive noise gate
          if (noiseGateRef.current) {
            const gateThreshold = Math.max(0.05, rms * 0.2);
            noiseGateRef.current.gain.value = rms > gateThreshold ? 1.0 : 0.05;
          }
          
          animationRef.current = requestAnimationFrame(monitorAudioQuality);
        }
      };

      monitorAudioQuality();
      
      console.log(`Professional audio initialized for ${audioSource} with 48kHz processing`);
      
    } catch (error) {
      console.error('Professional audio initialization failed:', error);
      if (audioSource === 'system') {
        setError('System audio failed. Click "Share system audio" and ensure audio is playing.');
      } else {
        setError('Microphone access failed. Check permissions and hardware.');
      }
      cleanupAudioResources();
    }
  }, [audioSource, isListening, cleanupAudioResources]);

  const initializeEnterpriseSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // Professional recognition settings
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 5; // Multiple alternatives for better accuracy

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      networkRetryCountRef.current = 0; // Reset retry count on successful start
      sessionStartRef.current = Date.now();
      
      // Start session duration tracking
      durationIntervalRef.current = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
      
      console.log(`Professional speech recognition started for ${audioSource}`);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;
      let bestAlternative = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        // Find the best alternative
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

      // Use final results preferentially, interim for immediate feedback
      const currentTranscript = finalTranscript || (bestConfidence > 0.7 ? interimTranscript : '');
      
      if (currentTranscript.trim()) {
        // Add to recognition buffer for quality analysis
        recognitionBufferRef.current.push(currentTranscript.trim());
        if (recognitionBufferRef.current.length > 10) {
          recognitionBufferRef.current.shift();
        }
        
        setTranscript(currentTranscript.trim());
        console.log(`Recognition (${audioSource}, confidence: ${bestConfidence.toFixed(3)}):`, currentTranscript.trim());
      }
    };

    recognitionRef.current.onerror = async (event: any) => {
      console.error(`Speech recognition error (${audioSource}):`, event.error);
      
      if (event.error === 'no-speech') {
        // Continue silently for no-speech - this is normal when there's silence
        console.log('No speech detected, continuing to listen...');
        return;
      }
      
      if (event.error === 'network') {
        // Enhanced network error handling
        networkRetryCountRef.current++;
        
        if (networkRetryCountRef.current <= maxNetworkRetries) {
          setError(`Network issue detected. Retrying... (${networkRetryCountRef.current}/${maxNetworkRetries})`);
          
          // Check network connectivity before retrying
          const isConnected = await checkNetworkConnectivity();
          
          if (!isConnected) {
            setError('No internet connection. Please check your network and try again.');
            // Use ref to access stopListening to avoid circular dependency
            if (stopListeningRef.current) {
              stopListeningRef.current();
            }
            return;
          }
          
          // Progressive retry delays: 1s, 3s, 5s
          const retryDelay = networkRetryCountRef.current * 2000;
          
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log(`Network retry ${networkRetryCountRef.current} initiated`);
              } catch (retryError) {
                console.warn('Network retry failed:', retryError);
                setError('Failed to reconnect. Please check your internet connection and restart.');
              }
            }
          }, retryDelay);
        } else {
          // Max retries exceeded
          setError('Network connection unstable. Please check your internet connection, disable VPN/proxy if active, and restart the application.');
          // Use ref to access stopListening to avoid circular dependency
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
        // Use ref to access stopListening to avoid circular dependency
        if (stopListeningRef.current) {
          stopListeningRef.current();
        }
      }
    };

    recognitionRef.current.onend = () => {
      console.log(`Speech recognition ended for ${audioSource}`);
      
      if (isListening) {
        // Only restart if we haven't exceeded network retry limits
        if (networkRetryCountRef.current < maxNetworkRetries) {
          // Intelligent restart with minimal delay
          const restartDelay = 25; // Ultra-fast restart
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Restart failed, reinitializing:', error);
                // Full reinitialize on restart failure
                setTimeout(() => {
                  if (isListening) {
                    initializeEnterpriseSpeechRecognition();
                    setTimeout(() => {
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
  }, [language, isListening, audioSource, checkNetworkConnectivity]); // Removed stopListening from dependencies

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
    networkRetryCountRef.current = 0; // Reset retry count
    recognitionBufferRef.current = [];
    console.log('Professional audio processing stopped');
  }, [cleanupAudioResources]);

  // Update the ref whenever stopListening changes
  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  const startListening = useCallback(async (source: 'microphone' | 'system' = 'microphone') => {
    if (isListening && audioSource === source) return;
    
    // Check network connectivity before starting
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      setError('No internet connection detected. Speech recognition requires an active internet connection.');
      return;
    }
    
    // Clean stop if switching sources
    if (isListening) {
      stopListening();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Starting professional ${source} recognition...`);
    setAudioSource(source);
    setTranscript('');
    setError(null);
    setSessionDuration(0);
    networkRetryCountRef.current = 0; // Reset retry count
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
      }, 50);
      
    } catch (error) {
      console.error(`Failed to start ${source}:`, error);
      setError(`Failed to start ${source}. Check permissions and hardware.`);
      cleanupAudioResources();
    }
  }, [isListening, audioSource, checkNetworkConnectivity, initializeEnterpriseAudio, initializeEnterpriseSpeechRecognition, stopListening]);

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
    startListening,
    stopListening,
    setAudioSource
  };
};