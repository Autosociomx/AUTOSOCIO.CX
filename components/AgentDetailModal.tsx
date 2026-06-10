
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Agent, Language } from '../types';
import { sendMessageToAgent } from '../services/geminiService';
import CloseIcon from './icons/CloseIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import MicrophoneIcon from './icons/MicrophoneIcon';
import CameraIcon from './icons/CameraIcon';
import LiveTacticalSession from './LiveTacticalSession';
import VerifiedIcon from './icons/VerifiedIcon';
import SparklesIcon from './icons/SparklesIcon';
import { getLabels } from '../constants';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

interface AgentDetailModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  uploadedImage: { data: string; mimeType: string } | null;
  initialScenario: string;
  onSearchInMarketplace: (query: string) => void;
  userLanguage: Language;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, isOpen, onClose, uploadedImage, initialScenario, userLanguage }) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [protocolProgress, setProtocolProgress] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(() => getLabels(userLanguage), [userLanguage]);
  const isMainframe = agent.id === 0;

  useEffect(() => {
    if (initialScenario && chatHistory.length === 0) {
      setInputValue(initialScenario);
    }
  }, [initialScenario]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const { isListening, toggleListening } = useSpeechRecognition((t) => setInputValue(p => `${p} ${t}`.trim()));

  const handleSendMessage = async (textOverride?: string) => {
    const userMessage = textOverride || inputValue;
    
    if (textOverride === "Iniciar Llamada de Mando") {
      setIsLiveSessionActive(true);
      return;
    }

    if (!userMessage.trim() && !uploadedImage) return;

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendMessageToAgent(agent, userMessage, userLanguage, uploadedImage);
      setChatHistory(prev => [...prev, { role: 'agent', content: responseText }]);
      setProtocolProgress(prev => Math.min(prev + 15, 100));
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError('El Mainframe está saturado. Reintente en un momento.');
      } else {
        setError('Interrupción en el enlace. Reintente ahora.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isLiveSessionActive) {
    return <LiveTacticalSession agent={agent} onClose={() => setIsLiveSessionActive(false)} userLanguage={userLanguage} />;
  }

  return (
    <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-2xl z-[160] flex justify-center p-0 md:p-6" onClick={onClose}>
      <div className={`bg-[#020617] border-x md:border ${isMainframe ? 'border-cyan-500/20 shadow-[0_0_100px_rgba(6,182,212,0.1)]' : 'border-white/5'} rounded-none md:rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-7xl h-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        
        {/* SIDEBAR TÁCTICO */}
        <div className={`hidden lg:flex lg:col-span-4 ${isMainframe ? 'bg-cyan-950/10' : 'bg-black/40'} p-10 border-r border-white/5 flex flex-col space-y-10 overflow-y-auto`}>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Mando Comercial</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed italic">{agent.title}</p>
          </div>

          <div className="space-y-8">
            {/* BOTÓN PRINCIPAL DE LLAMADA */}
            <button 
              onClick={() => setIsLiveSessionActive(true)}
              className="w-full flex items-center justify-center gap-6 py-8 bg-gradient-to-tr from-cyan-600 to-indigo-700 text-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(6,182,212,0.3)] hover:scale-[1.03] transition-all group border border-white/20 active:scale-95"
            >
              <div className="p-4 bg-white/20 rounded-full group-hover:animate-pulse">
                <MicrophoneIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-black uppercase tracking-widest leading-none">{labels.modal.btn_call}</p>
                <p className="text-[9px] font-bold uppercase tracking-tighter opacity-70 mt-2">{labels.modal.btn_call_sub}</p>
              </div>
            </button>

            <div className={`p-8 ${isMainframe ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'} border rounded-[2rem] space-y-6`}>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{labels.modal.sync}</p>
                <span className="text-[10px] font-black text-white">{protocolProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: `${protocolProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-400 font-light italic leading-relaxed">
                "Usa la llamada de mando para discutir estrategias de alta densidad sin escribir largos informes."
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Facultad de Expertise</p>
              {agent.expertise.map((exp, idx) => (
                <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/30 transition-all">
                  <VerifiedIcon className="text-cyan-600 w-4 h-4" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase">{exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT DE INTERVENCIÓN */}
        <div className="lg:col-span-8 flex flex-col h-full relative">
          <div className={`p-8 border-b border-white/5 flex justify-between items-center ${isMainframe ? 'bg-cyan-950/20' : 'bg-black/20'} backdrop-blur-md`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={agent.avatar} className="w-14 h-14 rounded-2xl border border-white/10 object-cover" alt={agent.name} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#020617] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{agent.name}</h2>
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Sesión Comercial Activa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsLiveSessionActive(true)} className="hidden sm:flex items-center gap-3 px-8 py-4 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500 shadow-xl transition-all active:scale-95">
                <MicrophoneIcon className="w-4 h-4 text-white" /> {labels.modal.btn_call}
              </button>
              <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-white rounded-full transition-all border border-white/5">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-10 space-y-8 scrollbar-hide">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40 px-10">
                <div className="p-8 bg-cyan-500/10 rounded-full border border-cyan-500/20 shadow-[inset_0_0_30px_rgba(6,182,212,0.1)]">
                   <SparklesIcon className="w-20 h-20 text-cyan-400" />
                </div>
                <div className="space-y-3">
                  <p className="text-[14px] font-black text-white uppercase tracking-[0.5em]">Sistema de Estrategia Listo</p>
                  <p className="text-xs text-gray-500 font-light max-w-sm leading-relaxed italic">
                    Utilice el botón de llamada para una consultoría 1-a-1 de alta densidad o envíe su consulta técnica por escrito.
                  </p>
                </div>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-8 rounded-[3rem] text-sm leading-relaxed shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none border border-white/10' 
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none font-light'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] rounded-tl-none">
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-10 border-t border-white/5 bg-black/40">
            <div className="relative group">
              <div className="relative flex items-end gap-6 bg-white/5 border border-white/10 rounded-[3rem] p-4 focus-within:border-cyan-500/50 transition-all shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder={labels.modal.placeholder}
                  className="flex-grow bg-transparent border-none outline-none text-white text-sm p-6 resize-none max-h-48 min-h-[70px] font-light placeholder-gray-700"
                  rows={1}
                />
                <div className="flex items-center gap-3 mb-2 mr-3">
                  <button onClick={toggleListening} className={`p-5 rounded-2xl transition-all active:scale-90 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-900/40' : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'}`}>
                    <MicrophoneIcon className="w-6 h-6" isListening={isListening} />
                  </button>
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || (!inputValue.trim() && !uploadedImage)}
                    className="p-5 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-500 transition-all shadow-2xl disabled:opacity-30 active:scale-90"
                  >
                    <VerifiedIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.4em] text-center mt-6">Infraestructura AutoSocio | Enlace Táctico Persistente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailModal;
