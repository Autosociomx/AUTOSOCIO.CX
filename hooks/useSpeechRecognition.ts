
import { useState, useEffect, useRef, useCallback } from 'react';

// Type definition for the SpeechRecognition interface to satisfy TypeScript
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onstart: () => void;
  onend: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (onTranscript: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  
  // Evitar procesamiento de resultados duplicados mediante tracking de marcas de tiempo o contenidos
  const lastProcessedTranscript = useRef<string>('');

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Mantenemos false para procesar una frase a la vez y evitar bucles
    recognition.interimResults = false; // Solo procesamos resultados finales para evitar duplicidad de "interim"
    recognition.lang = 'es-MX';

    recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript.trim();

      if (transcript && transcript !== lastProcessedTranscript.current) {
        lastProcessedTranscript.current = transcript;
        onTranscriptRef.current(transcript);
        
        // Detenemos manualmente para forzar una captura limpia única
        recognition.stop();
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      lastProcessedTranscript.current = ''; // Reset al iniciar
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        lastProcessedTranscript.current = '';
        recognitionRef.current.start();
      } catch (e) {
        if (e.name !== 'InvalidStateError') {
          console.error("Could not start recognition:", e);
        }
      }
    }
  }, [isListening]);

  return {
    isListening,
    toggleListening,
    hasSupport: !!SpeechRecognition
  };
};
