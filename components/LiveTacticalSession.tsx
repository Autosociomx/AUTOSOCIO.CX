
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import CloseIcon from './icons/CloseIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import type { Language } from '../types';

interface LiveTacticalSessionProps {
  agent: any;
  onClose: () => void;
  mode?: 'consulting' | 'audit' | 'step-by-step';
  userLanguage: Language;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveTacticalSession: React.FC<LiveTacticalSessionProps> = ({ agent, onClose, mode = 'consulting', userLanguage = 'es' }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [transcription, setTranscription] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const intervalRef = useRef<number | null>(null);

  const stopAllSources = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
  }, []);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopAllSources();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  }, [stopAllSources]);

  const startSession = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            sessionPromise.then(session => {
              sessionRef.current = session;
              
              intervalRef.current = window.setInterval(() => {
                if (canvasRef.current && videoRef.current && sessionRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (!ctx) return;
                  
                  canvasRef.current.width = 640;
                  canvasRef.current.height = 480;
                  ctx.drawImage(videoRef.current, 0, 0, 640, 480);
                  
                  const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
                  sessionRef.current.sendRealtimeInput({ 
                    media: { data: base64, mimeType: 'image/jpeg' } 
                  });
                }
              }, 1000);
            });
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              stopAllSources();
              nextStartTimeRef.current = 0;
            }

            const textPart = message.serverContent?.modelTurn?.parts?.find(p => p.text);
            if (textPart?.text) {
              setTranscription(textPart.text);
              const lowerText = textPart.text.toLowerCase();
              if (lowerText.includes("paso siguiente") || lowerText.includes("completado") || lowerText.includes("correcto")) {
                setCurrentStep(prev => Math.min(prev + 1, 4));
              }
            }
          },
          onclose: () => onClose(),
          onerror: () => onClose()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
          },
          systemInstruction: `
          ESTÁNDAR DE MANDO FORENSE - AGENTE CARLOS "TACTICAL":
          Tu objetivo es guiar al técnico en la extracción del sensor de cigüeñal de un VW Jetta.
          
          REGLA DE IDIOMA CRÍTICA:
          DEBES RESPONDER Y HABLAR SIEMPRE EN EL IDIOMA: ${userLanguage.toUpperCase()}.

          PASOS OBLIGATORIOS QUE DEBES AUDITAR VISUALMENTE:
          1. Identificación: El técnico debe señalar el sensor. Confirma si ves el conector gris de 3 pines.
          2. Herramienta: Debe usar una llave Allen de 5mm o una punta Torx T30 según el año. Si usa otra, advierte del riesgo de barrer el tornillo.
          3. Desconexión: Asegúrate de que libere el seguro del conector sin romper la pestaña de plástico.
          4. Extracción: El sensor suele estar pegado por el aceite. Instruye movimientos oscilatorios suaves, no palanca brusca.
          
          CRÍTICO: Si ves que el técnico va a cometer un error que cause un daño de más de $100 USD (como romper el conector), grita "ALTO" y explica el porqué. Eres un mentor de $5,000 USD de valor, tu voz es la autoridad.`
        }
      });
    } catch (err) {
      onClose();
    }
  }, [onClose, stopAllSources, userLanguage]);

  useEffect(() => {
    startSession();
    return () => cleanup();
  }, [startSession, cleanup]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden">
      <div className="flex-grow relative bg-gray-900">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
        <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none"></div>

        <div className="absolute top-8 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-3xl p-5 rounded-[2rem] border border-white/10 shadow-2xl">
            <img src={agent.avatar} className="w-16 h-16 rounded-2xl border-2 border-cyan-500/40 object-cover" />
            <div>
              <h3 className="text-white text-xl font-black uppercase tracking-tighter leading-none">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.3em]">Auditoría Forense Activa</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button onClick={onClose} className="p-5 bg-white/10 hover:bg-rose-600/40 text-white rounded-full border border-white/10 transition-all backdrop-blur-3xl">
              <CloseIcon className="w-6 h-6" />
            </button>
            <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl backdrop-blur-md">
               <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Protocolo: Jetta_CKP_v2</span>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-6 space-y-2 pointer-events-none">
           {[1,2,3,4].map(step => (
             <div key={step} className={`flex items-center gap-3 transition-all duration-500 ${currentStep >= step ? 'opacity-100 scale-100' : 'opacity-30 scale-90'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${currentStep >= step ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/10 text-white'}`}>
                  {step}
                </div>
                <div className="h-px w-8 bg-white/10"></div>
             </div>
           ))}
        </div>

        <div className="absolute bottom-12 left-6 right-6 flex flex-col items-center gap-8">
          {transcription && (
            <div className="max-w-2xl bg-black/80 backdrop-blur-3xl px-10 py-6 rounded-[2.5rem] border border-cyan-500/20 text-center animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <p className="text-cyan-100 text-lg font-medium leading-relaxed italic">"{transcription}"</p>
            </div>
          )}
          
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-3xl px-10 py-5 rounded-full border border-white/10 shadow-2xl">
             <div className="flex items-center gap-3">
               <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping"></div>
               <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Visión 1-a-1 Sincronizada</span>
             </div>
             <div className="h-4 w-px bg-white/10"></div>
             <div className="flex items-center gap-2">
                <VerifiedIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Estándar Cero Errores</span>
             </div>
          </div>
        </div>

        {isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/98 backdrop-blur-3xl z-50">
            <div className="w-24 h-24 border-2 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin mb-8"></div>
            <p className="text-white font-black uppercase tracking-[0.5em] text-xs animate-pulse">Sincronizando Mando Forense...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTacticalSession;
