
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import MegaphoneIcon from './icons/MegaphoneIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import SearchIcon from './icons/SearchIcon';

const MarketingStudio: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  const canvaPrompts = [
    {
      title: "ADN Sourcing & Deep Link",
      prompt: "High-tech cinematic close-up of a luxury car engine, glowing cyan digital DNA holographic strands intertwining with mechanical parts, futuristic HUD interface overlays with technical data, midnight blue background, industrial lighting, 8k resolution, photorealistic, cyber-industrial style."
    },
    {
      title: "La Academia (Mecánica y EV)",
      prompt: "Professional master mechanic wearing tactical gear, using a futuristic holographic tablet to diagnose a Tesla battery pack, neon indigo and cyan lighting, workshop of the future, high-contrast, sharp focus, technical atmosphere, cinematic photography."
    },
    {
      title: "Mystery Shopping & ROI",
      prompt: "A sharp businessman standing in a modern automotive showroom, looking through AR glasses that reveal floating profit charts and technical audit scores over the cars, rose and silver color palette, sophisticated, high-end commercial aesthetic, 35mm lens."
    },
    {
      title: "Sourcing Global",
      prompt: "Abstract 3D render of a futuristic globe with glowing digital lines connecting major cities (Mexico, USA, China, Japan), automotive parts (turbos, sensors, gears) floating in a digital vortex, deep blue and electric cyan colors, high-tech logistics concept, ultra-detailed."
    }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const generatePromoVideo = async () => {
    // Check for API key selection
    if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceed after opening dialog
      }
    }

    setIsVideoLoading(true);
    setLoadingMessage("Iniciando infraestructura Veo 3.1...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const messages = [
        "Sincronizando modelos de alta ingeniería...",
        "Renderizando HUDs tácticos en 1080p...",
        "Simulando flujos de gestión de flotas...",
        "Inyectando ADN AutoSocio en el motor de video...",
        "Finalizando texturas cyber-industriales..."
      ];
      
      let msgIdx = 0;
      const interval = setInterval(() => {
        setLoadingMessage(messages[msgIdx % messages.length]);
        msgIdx++;
      }, 5000);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A high-end cinematic promotional video for AutoSocio. A futuristic automotive workshop with holographic HUD displays. A robotic arm precision-tuning a car engine while digital data streams in neon cyan. Transitions to a global map showing fleet logistics with glowing paths. Professional, industrial, 8k aesthetic, sleek motion graphics.',
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      clearInterval(interval);
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        // Reset key logic could go here if needed
        alert("Error de clave API. Por favor, seleccione una clave válida de un proyecto con facturación activa.");
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 space-y-16 animate-slide-up pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <MegaphoneIcon className="w-4 h-4 text-rose-500" />
            <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em]">AI Marketing Studio v2.0</span>
          </div>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Generador de <br/><span className="text-rose-500 italic">Contenido Élite</span></h2>
          <p className="text-gray-500 font-light max-w-2xl text-lg italic">
            "Sincronizando la potencia de Veo y Gemini para dominar el mercado automotriz."
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* VIDEO SECTION */}
        <div className="lg:col-span-7 space-y-12">
          <div className="bg-[#020617] border border-white/10 rounded-[4rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 blur-[120px] -z-10"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
               <div className="space-y-4">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-rose-900/40 shadow-2xl">
                      <span className="text-white font-black italic text-xl">V</span>
                    </div>
                     Veo Promo Video
                 </h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Generación cinemática 1080p</p>
               </div>
               
               <button 
                onClick={generatePromoVideo}
                disabled={isVideoLoading}
                className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isVideoLoading ? 'bg-gray-800 text-gray-500' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-900/40 active:scale-95'}`}
              >
                {isVideoLoading ? 'Generando...' : 'Generar Video Promo'}
              </button>
            </div>

            <div className="aspect-video bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
                {videoUrl ? (
                    <video src={videoUrl} controls className="w-full h-full object-cover rounded-[2.5rem]" />
                ) : isVideoLoading ? (
                    <div className="text-center space-y-6 p-10">
                        <div className="w-16 h-16 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-rose-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">{loadingMessage}</p>
                        <p className="text-[9px] text-gray-600 font-light italic">Esto puede tomar hasta 2 minutos. No cierre la pestaña.</p>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <SparklesIcon className="w-16 h-16 text-white/5 mx-auto" />
                        <p className="text-gray-700 font-black uppercase text-[10px] tracking-widest">Previsualización del Master</p>
                    </div>
                )}
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-[8px] text-rose-400 font-black uppercase tracking-[0.4em] mb-4 italic">Script de Generación</p>
                <p className="text-xs text-gray-400 font-light leading-relaxed italic">
                    "Futuristic automotive workshop, holographic HUD displays, robotic arm precision-tuning car engine, neon cyan digital streams, global map logistics. 1080p, 8k aesthetic."
                </p>
            </div>
          </div>
        </div>

        {/* CANVA PROMPTS SECTION */}
        <div className="lg:col-span-5 space-y-12">
          <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 space-y-10 shadow-2xl">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                    <span className="font-black italic">C</span>
                </div>
                <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter">Canva Magic Suite</h4>
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Prompts de Alta Conversión</p>
                </div>
             </div>

             <div className="space-y-6">
                {canvaPrompts.map((p, i) => (
                    <div key={i} className="group bg-[#020617] border border-white/5 rounded-3xl p-6 hover:border-rose-500/30 transition-all space-y-4">
                        <div className="flex justify-between items-center">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{p.title}</h5>
                            <button 
                                onClick={() => handleCopy(p.prompt, i)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-all"
                            >
                                <ClipboardIcon copied={copiedPrompt === i} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 font-light leading-relaxed line-clamp-2 italic group-hover:line-clamp-none transition-all">
                            {p.prompt}
                        </p>
                    </div>
                ))}
             </div>

             <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                    <VerifiedIcon className="w-4 h-4 text-rose-500" />
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Estrategia de CTA</span>
                </div>
                <ul className="space-y-2">
                    <li className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">1. "INICIAR PROTOCOLO TÁCTICO"</li>
                    <li className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">2. "SINCRONIZAR ADN"</li>
                    <li className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">3. "EJECUTAR AUDITORÍA FORENSE"</li>
                </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingStudio;
