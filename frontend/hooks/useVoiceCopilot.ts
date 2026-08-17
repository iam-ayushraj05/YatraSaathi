import { useRef, useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';

export type VoiceState = 
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'
  | 'ending';

export interface VoiceHookOptions {
  language: 'EN' | 'HI';
  onResponse?: (result: {
    transcript: string;
    response: string;
    relevant_places?: any[];
    route_info?: any;
    warnings?: string[];
  }) => void;
  getHistory?: () => Array<{ role: string; content: string }>;
}

export function useVoiceCopilot({ language, onResponse, getHistory }: VoiceHookOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [statusText, setStatusText] = useState<string>('Ready to help');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isHindi = language === 'HI';

  // Refs for strict session and duplicate prevention
  const activeSessionRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const lastTranscriptTimeRef = useRef<number>(0);

  // Update status text whenever state or language changes
  const updateStatusText = useCallback((state: VoiceState, customText?: string) => {
    if (customText) {
      setStatusText(customText);
      return;
    }

    switch (state) {
      case 'idle':
        setStatusText(isHindi ? 'मदद के लिए तैयार' : 'Ready to help');
        break;
      case 'connecting':
        setStatusText(isHindi ? 'YatraSaathi से कनेक्ट हो रहा है...' : 'Connecting to YatraSaathi...');
        break;
      case 'listening':
        setStatusText(isHindi ? 'सुन रहा हूँ — बोलिए' : 'Listening — speak naturally');
        break;
      case 'processing':
        setStatusText(isHindi ? 'सोच रहा हूँ...' : 'Thinking...');
        break;
      case 'speaking':
        setStatusText(isHindi ? 'YatraSaathi बोल रहा है...' : 'YatraSaathi is speaking...');
        break;
      case 'error':
        setStatusText(isHindi ? 'कुछ समस्या हुई। टैप करके पुनः प्रयास करें।' : 'Something went wrong. Tap to retry.');
        break;
      case 'ending':
        setStatusText(isHindi ? 'कॉल समाप्त हो रही है...' : 'Ending conversation...');
        break;
    }
  }, [isHindi]);

  // Cleanly stop any audio synthesis or playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    isSpeakingRef.current = false;
  }, []);

  // Safely stop recognition
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // Centralized method to end call cleanly
  const endCall = useCallback(() => {
    console.log(`[VOICE] SESSION_END session_id=${sessionIdRef.current}`);
    activeSessionRef.current = false;
    sessionIdRef.current = '';
    isProcessingRef.current = false;
    isSpeakingRef.current = false;

    stopAudio();
    stopRecognition();

    setVoiceState('idle');
    setLiveTranscript('');
    setErrorMessage(null);
    updateStatusText('idle');
  }, [stopAudio, stopRecognition, updateStatusText]);

  // Dedicated single point to start speech recognition
  const startListening = useCallback((currentSessionId: string) => {
    if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) {
      return;
    }
    if (isProcessingRef.current || isSpeakingRef.current) {
      return;
    }

    stopRecognition();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceState('error');
      setErrorMessage(isHindi ? 'इस ब्राउज़र में Voice Speech Recognition उपलब्ध नहीं है।' : 'Speech recognition is not supported in this browser.');
      updateStatusText('error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;
        console.log(`[VOICE] LISTENING_START session_id=${currentSessionId}`);
        setVoiceState('listening');
        updateStatusText('listening');
      };

      recognition.onresult = (event: any) => {
        if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          setLiveTranscript(currentText);
        }

        if (finalTranscript.trim()) {
          const cleanSpeech = finalTranscript.trim();
          console.log(`[VOICE] TRANSCRIPT session_id=${currentSessionId} text="${cleanSpeech}"`);
          
          // Stop recognition immediately once final transcript is obtained
          stopRecognition();

          // Process user utterance
          void processUtterance(cleanSpeech, currentSessionId);
        }
      };

      recognition.onerror = (event: any) => {
        if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;
        const err = event?.error;
        console.warn(`[VOICE] Recognition event error: ${err}`);

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          stopRecognition();
          setVoiceState('error');
          setErrorMessage(isHindi ? 'Microphone उपयोग की अनुमति आवश्यक है।' : 'Microphone permission is required for voice copilot.');
          updateStatusText('error');
          endCall();
          return;
        }

        if (err === 'no-speech') {
          // Restart listening loop safely if no speech was detected
          setTimeout(() => {
            if (activeSessionRef.current && sessionIdRef.current === currentSessionId && !isProcessingRef.current && !isSpeakingRef.current) {
              startListening(currentSessionId);
            }
          }, 300);
          return;
        }

        if (err !== 'aborted') {
          setTimeout(() => {
            if (activeSessionRef.current && sessionIdRef.current === currentSessionId && !isProcessingRef.current && !isSpeakingRef.current) {
              startListening(currentSessionId);
            }
          }, 500);
        }
      };

      recognition.onend = () => {
        if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;
        // Do not auto-restart if currently processing or speaking
        if (isProcessingRef.current || isSpeakingRef.current) return;

        setTimeout(() => {
          if (activeSessionRef.current && sessionIdRef.current === currentSessionId && !isProcessingRef.current && !isSpeakingRef.current) {
            startListening(currentSessionId);
          }
        }, 300);
      };

      recognition.start();
    } catch (e) {
      console.error('[VOICE] Failed to start recognition:', e);
    }
  }, [isHindi, updateStatusText, stopRecognition, endCall]);

  // Audio response playback step
  const speakResponse = useCallback((replyText: string, audioUrl?: string, onComplete?: () => void) => {
    isSpeakingRef.current = true;
    setVoiceState('speaking');
    updateStatusText('speaking');
    console.log('[VOICE] SPEAKING_START');

    const handleSpeechEnd = () => {
      console.log('[VOICE] SPEAKING_END');
      isSpeakingRef.current = false;
      onComplete?.();
    };

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = handleSpeechEnd;
      audio.onerror = () => {
        console.warn('[VOICE] Audio URL failed to play. Fallback to speech synthesis.');
        fallbackSpeechSynthesis(replyText, handleSpeechEnd);
      };
      audio.play().catch(() => {
        fallbackSpeechSynthesis(replyText, handleSpeechEnd);
      });
      return;
    }

    fallbackSpeechSynthesis(replyText, handleSpeechEnd);

    function fallbackSpeechSynthesis(text: string, cb: () => void) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isHindi ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
          v.lang.startsWith(isHindi ? 'hi' : 'en') &&
          (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google UK English Female') || v.name.includes('Karen') || v.name.includes('Shweta') || v.name.includes('Google हिन्दी'))
        ) || voices.find(v => v.lang.startsWith(isHindi ? 'hi' : 'en'));
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onend = cb;
        utterance.onerror = cb;
        window.speechSynthesis.speak(utterance);
      } else {
        cb();
      }
    }

  }, [isHindi, updateStatusText]);

  // Backend utterance processing with strict locks and duplicate guards
  const processUtterance = async (transcriptText: string, currentSessionId: string) => {
    if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;
    if (isProcessingRef.current) {
      console.log('[VOICE] Duplicate processing blocked (isProcessing lock active)');
      return;
    }

    // Duplicate transcript check within 1.5s window
    const now = Date.now();
    if (
      lastTranscriptRef.current.toLowerCase() === transcriptText.toLowerCase() &&
      now - lastTranscriptTimeRef.current < 1500
    ) {
      console.log(`[VOICE] Duplicate transcript blocked: "${transcriptText}"`);
      startListening(currentSessionId);
      return;
    }

    lastTranscriptRef.current = transcriptText;
    lastTranscriptTimeRef.current = now;

    // Lock processing
    isProcessingRef.current = true;
    setVoiceState('processing');
    updateStatusText('processing');
    console.log(`[VOICE] REQUEST_START session_id=${currentSessionId}`);

    try {
      const history = getHistory ? getHistory() : [];
      const res = await api.copilot.processVoice({
        transcript: transcriptText,
        current_location: { lat: 28.6129, lng: 77.2295 },
        voice_gender: 'female',
        conversation_history: history
      });

      console.log(`[VOICE] RESPONSE_RECEIVED session_id=${currentSessionId}`);

      if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;

      const replyText = res.response || (isHindi ? 'उत्तर प्राप्त नहीं हुआ।' : 'I could not generate a response.');

      if (onResponse) {
        onResponse({
          transcript: transcriptText,
          response: replyText,
          relevant_places: res.relevant_places,
          route_info: res.route_info,
          warnings: res.warnings
        });
      }

      // Speech completion callback
      const onAudioFinished = () => {
        isProcessingRef.current = false;
        setLiveTranscript('');

        if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;

        if (res.is_end_call) {
          endCall();
          return;
        }

        // Return to listening state
        console.log(`[VOICE] LISTENING_RESTART session_id=${currentSessionId}`);
        startListening(currentSessionId);
      };

      speakResponse(replyText, res.audio?.audio_url, onAudioFinished);

    } catch (err) {
      console.error('[VOICE] Processing error:', err);
      isProcessingRef.current = false;

      if (!activeSessionRef.current || sessionIdRef.current !== currentSessionId) return;

      setVoiceState('error');
      setErrorMessage(isHindi ? 'कनेक्ट करने में असमर्थ। पुनः प्रयास करें।' : 'Unable to connect. Please try again.');
      updateStatusText('error');

      setTimeout(() => {
        if (activeSessionRef.current && sessionIdRef.current === currentSessionId) {
          startListening(currentSessionId);
        }
      }, 1000);
    }
  };

  // Toggle voice agent lifecycle
  const startSession = useCallback(async () => {
    if (activeSessionRef.current) {
      endCall();
      return;
    }

    const newSessionId = `vsession-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    console.log(`[VOICE] SESSION_START session_id=${newSessionId}`);
    
    activeSessionRef.current = true;
    sessionIdRef.current = newSessionId;
    isProcessingRef.current = false;
    isSpeakingRef.current = false;
    lastTranscriptRef.current = '';

    setVoiceState('connecting');
    updateStatusText('connecting');
    setLiveTranscript('');
    setErrorMessage(null);

    try {
      await api.copilot.getVoiceToken().catch(() => null);
      if (!activeSessionRef.current || sessionIdRef.current !== newSessionId) return;

      startListening(newSessionId);
    } catch (err) {
      console.warn('[VOICE] Token initialization fallback:', err);
      if (!activeSessionRef.current || sessionIdRef.current !== newSessionId) return;

      startListening(newSessionId);
    }

  }, [endCall, updateStatusText, startListening, isHindi]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    voiceState,
    statusText,
    liveTranscript,
    errorMessage,
    startSession,
    endCall,
    isSessionActive: activeSessionRef.current
  };
}
