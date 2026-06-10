import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DecodedVehicle, AdvisorMessage, Language } from '../types';
import type { Chat } from '@google/genai';
import { decodeVIN, fuelTypeIcon } from '../services/vinDecodeService';
import { extractVINFromImage, createVehicleExpertSession, sendMessageToExpert } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import MicrophoneIcon from './icons/MicrophoneIcon';
import CameraIcon from './icons/CameraIcon';
import SearchIcon from './icons/SearchIcon';

interface VINAdvisorProps {
  userLanguage?: Language;
  onSearchPart?: (query: string) => void;
  onCallExpert?: () => void;
}

const QUICK_PROBLEMS = [
  '🔴 El mecánico me dio un diagnóstico y no sé si creerle',
  '⚠️ La luz del motor está encendida',
  '🔊 Escucho un ruido extraño al frenar',
  '💨 El carro echa humo o huele raro',
  '🚗 Vibra o jalonea al acelerar',
  '❄️ El aire acondicionado no enfría',
];

const VINAdvisor: React.FC<VINAdvisorProps> = ({
  userLanguage = 'es',
  onSearchPart,
  onCallExpert,
}) => {
  const [step, setStep] = useState<'entry' | 'scanning' | 'chat'>('entry');
  const [vehicle, setVehicle] = useState<DecodedVehicle | null>(null);
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [vinInput, setVinInput] = useState('');
  const [isDecodingVIN, setIsDecodingVIN] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ data: string; mimeType: string } | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const vinImageRef = useRef<HTMLInputElement>(null);
  const chatImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput(transcript);
  }, []);
  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceTranscript);

  // ── VIN scan from image ────────────────────────────────────────────────────
  const handleVINImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningImage(true);
    setVinError(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      const extracted = await extractVINFromImage({ data: base64, mimeType: file.type });
      if (extracted) {
        setVinInput(extracted);
        await handleVINDecode(extracted);
      } else {
        setVinError('No se pudo leer el VIN de la imagen. Escríbelo manualmente.');
      }
      setIsScanningImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVINDecode = async (vin = vinInput) => {
    if (!vin.trim()) return;
    setIsDecodingVIN(true);
    setVinError(null);
    const decoded = await decodeVIN(vin);
    setIsDecodingVIN(false);
    if (decoded) {
      setVehicle(decoded);
      setStep('scanning');
    } else {
      setVinError('VIN no reconocido. Verifica que sean 17 caracteres correctos.');
    }
  };

  // ── Start expert chat ──────────────────────────────────────────────────────
  const startChat = async (initialText: string, withVehicle?: DecodedVehicle) => {
    const v = withVehicle ?? vehicle;
    setStep('chat');
    setIsSending(true);

    chatSessionRef.current = createVehicleExpertSession(v, userLanguage);

    const userMsg: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: initialText,
      timestamp: new Date(),
    };
    setMessages([userMsg]);

    try {
      const { text, sources } = await sendMessageToExpert(chatSessionRef.current, initialText);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'advisor',
        content: text,
        sources,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'advisor',
        content: 'Error de conexión. Intenta de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImage) || isSending || !chatSessionRef.current) return;

    const text = input.trim() || '(Imagen adjunta)';
    const img = pendingImage;
    setInput('');
    setPendingImage(null);
    setIsSending(true);

    const userMsg: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { text: responseText, sources } = await sendMessageToExpert(
        chatSessionRef.current,
        text,
        img || undefined
      );
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'advisor',
        content: responseText,
        sources,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'advisor',
        content: 'Error de conexión. Intenta de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChatImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setPendingImage({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── RENDER: Entry ──────────────────────────────────────────────────────────
  if (step === 'entry') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-10 animate-slide-up">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <span className="font-black text-3xl text-white italic">A</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Tu asesor mecánico<br />
            <span className="text-cyan-400">de élite</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            Describe el problema de tu carro o escanea el VIN para obtener un diagnóstico honesto al instante.
          </p>
        </div>

        {/* VIN Scanner */}
        <div className="glass border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            Paso 1 (opcional) — Identifica tu vehículo exacto
          </div>
          <p className="text-gray-500 text-xs">
            Con el VIN, AutoSocio conoce exactamente tu motor, año y trim — diagnóstico más preciso.
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={vinInput}
              onChange={e => { setVinInput(e.target.value.toUpperCase()); setVinError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleVINDecode()}
              placeholder="Escribe el VIN (17 caracteres)"
              maxLength={17}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm font-mono outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-700 uppercase"
            />
            <button
              onClick={() => vinImageRef.current?.click()}
              disabled={isScanningImage}
              title="Tomar foto del VIN"
              className="w-12 h-12 glass border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all flex-shrink-0"
            >
              {isScanningImage
                ? <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                : <CameraIcon className="w-5 h-5" />
              }
            </button>
            <button
              onClick={() => handleVINDecode()}
              disabled={isDecodingVIN || vinInput.length < 5}
              className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-white hover:bg-cyan-500 transition-all disabled:opacity-40 flex-shrink-0"
            >
              {isDecodingVIN
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <SearchIcon className="w-5 h-5" />
              }
            </button>
          </div>

          {vinError && (
            <p className="text-rose-400 text-xs font-bold">{vinError}</p>
          )}

          <input ref={vinImageRef} type="file" accept="image/*" hidden onChange={handleVINImageUpload} />

          <div className="flex items-center gap-2 text-[9px] text-gray-600">
            <span>📍 El VIN está en el parabrisas, puerta del conductor o tarjeta de circulación</span>
          </div>
        </div>

        {/* Direct problem input */}
        <div className="glass border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            Describe el problema directamente
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim() && startChat(input.trim())}
              placeholder="Ej: El mecánico dice que necesito cambiar la transmisión..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-700"
            />
            <button
              onClick={() => toggleListening()}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                isListening ? 'bg-red-500 text-white' : 'glass border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <MicrophoneIcon className="w-5 h-5" isListening={isListening} />
            </button>
          </div>

          <button
            onClick={() => input.trim() && startChat(input.trim())}
            disabled={!input.trim()}
            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all disabled:opacity-30"
          >
            Consultar a AutoSocio Elite →
          </button>
        </div>

        {/* Quick problems */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">o elige tu situación</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_PROBLEMS.map((p, i) => (
              <button
                key={i}
                onClick={() => startChat(p.replace(/^[^\s]+\s/, ''))}
                className="glass border border-white/10 rounded-2xl px-4 py-3 text-left text-xs text-gray-300 hover:border-cyan-500/30 hover:text-white transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: VIN Confirmed ─────────────────────────────────────────────────
  if (step === 'scanning' && vehicle) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="text-4xl">🎯</div>
          <h2 className="font-black text-2xl text-white">Vehículo identificado</h2>
          <p className="text-gray-500 text-sm">AutoSocio ahora es experto en TU carro exacto</p>
        </div>

        <div className="glass border border-cyan-500/20 rounded-3xl p-8 space-y-5 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-black text-white">
                {vehicle.make} {vehicle.model}
              </div>
              <div className="text-cyan-400 font-black text-xl">{vehicle.year}</div>
            </div>
            <div className="text-4xl">{fuelTypeIcon(vehicle.fuelType)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Motor', value: vehicle.engine },
              { label: 'Combustible', value: vehicle.fuelType },
              { label: 'Transmisión', value: vehicle.transmission || 'N/D' },
              { label: 'Tracción', value: vehicle.driveType || 'N/D' },
              { label: 'Carrocería', value: vehicle.bodyClass || 'N/D' },
              { label: 'Trim', value: vehicle.trim || 'Estándar' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{label}</div>
                <div className="text-white text-sm font-bold mt-0.5 truncate">{value}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="text-[9px] text-gray-600 font-mono">VIN: {vehicle.vin}</div>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && input.trim() && startChat(input.trim(), vehicle)}
            placeholder="¿Cuál es el problema o qué te dijo el mecánico?"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-600"
          />
          <button
            onClick={() => input.trim() && startChat(input.trim(), vehicle)}
            disabled={!input.trim()}
            className="w-full py-4 bg-cyan-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-cyan-500 transition-all disabled:opacity-30 shadow-lg shadow-cyan-500/20"
          >
            Consultar al experto de este vehículo →
          </button>
          <button
            onClick={() => { setStep('entry'); setVehicle(null); setVinInput(''); }}
            className="w-full py-3 text-gray-500 text-xs font-bold hover:text-white transition-all"
          >
            ← Cambiar vehículo
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Chat ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto flex flex-col animate-slide-up" style={{ minHeight: 'calc(100vh - 200px)' }}>

      {/* Vehicle badge */}
      {vehicle && (
        <div className="flex items-center gap-3 mb-6 glass border border-cyan-500/20 rounded-2xl px-4 py-3">
          <div className="text-xl">{fuelTypeIcon(vehicle.fuelType)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm text-white truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div className="text-[10px] text-cyan-400/70">{vehicle.engine} · VIN {vehicle.vin.slice(-6)}</div>
          </div>
          <button
            onClick={() => { setStep('entry'); setMessages([]); setVehicle(null); }}
            className="text-[9px] text-gray-600 hover:text-white transition-all uppercase tracking-widest font-bold flex-shrink-0"
          >
            cambiar
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-6 pb-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            {msg.role === 'advisor' && (
              <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center font-black text-sm text-white flex-shrink-0 shadow-md">
                AS
              </div>
            )}

            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600/20 border border-cyan-500/30 text-white rounded-tr-sm'
                  : 'glass border border-white/10 text-gray-200 rounded-tl-sm'
              }`}>
                {msg.role === 'advisor' && (
                  <div className="text-[9px] text-cyan-400 font-black uppercase tracking-widest mb-2">
                    AutoSocio Elite
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="space-y-1 w-full">
                  <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Fuentes consultadas</div>
                  {msg.sources.slice(0, 3).map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] text-cyan-400/70 hover:text-cyan-400 transition-all truncate"
                    >
                      <span className="w-3 h-3 rounded bg-cyan-500/20 flex-shrink-0 flex items-center justify-center text-[7px]">↗</span>
                      <span className="truncate">{s.title || s.url}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center font-black text-sm text-white flex-shrink-0">
              AS
            </div>
            <div className="glass border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action CTAs */}
      {messages.length >= 2 && (
        <div className="flex gap-3 mb-4">
          {onSearchPart && (
            <button
              onClick={() => {
                const lastAdvisor = [...messages].reverse().find(m => m.role === 'advisor');
                onSearchPart(lastAdvisor?.content?.slice(0, 60) || '');
              }}
              className="flex-1 glass border border-white/10 rounded-2xl py-3 px-4 text-xs font-black text-cyan-400 hover:border-cyan-500/40 transition-all uppercase tracking-wide"
            >
              🔧 Ver piezas compatibles
            </button>
          )}
          {onCallExpert && (
            <button
              onClick={onCallExpert}
              className="flex-1 glass border border-white/10 rounded-2xl py-3 px-4 text-xs font-black text-purple-400 hover:border-purple-500/40 transition-all uppercase tracking-wide"
            >
              👨‍🔧 Hablar con experto
            </button>
          )}
        </div>
      )}

      {/* Pending image preview */}
      {pendingImage && (
        <div className="flex items-center gap-3 mb-3 glass border border-white/10 rounded-xl px-3 py-2">
          <img
            src={`data:${pendingImage.mimeType};base64,${pendingImage.data}`}
            className="w-10 h-10 rounded-lg object-cover"
            alt="adjunto"
          />
          <span className="text-xs text-gray-400 flex-1">Imagen adjunta</span>
          <button onClick={() => setPendingImage(null)} className="text-gray-600 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Input bar */}
      <div className="glass border border-white/10 rounded-2xl p-3 flex gap-3 sticky bottom-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Pregunta lo que sea sobre tu carro..."
          disabled={isSending}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-700 min-w-0"
        />
        <button
          onClick={() => chatImageRef.current?.click()}
          className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all flex-shrink-0"
        >
          <CameraIcon className="w-4 h-4" />
        </button>
        <button
          onClick={toggleListening}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            isListening ? 'bg-red-500 text-white' : 'glass border border-white/10 text-gray-500 hover:text-white'
          }`}
        >
          <MicrophoneIcon className="w-4 h-4" isListening={isListening} />
        </button>
        <button
          onClick={sendMessage}
          disabled={isSending || (!input.trim() && !pendingImage)}
          className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center text-white hover:bg-cyan-500 transition-all disabled:opacity-40 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
        <input ref={chatImageRef} type="file" accept="image/*" hidden onChange={handleChatImage} />
      </div>
    </div>
  );
};

export default VINAdvisor;
