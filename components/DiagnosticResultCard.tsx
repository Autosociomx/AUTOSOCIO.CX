
import React, { useMemo } from 'react';
import type { DiagnosticGuide } from '../types';
import { PARTS_CATALOG } from '../constants';
import PartCard from './PartCard';
import LocationIcon from './icons/LocationIcon';
import WrenchIcon from './icons/WrenchIcon';
import SearchIcon from './icons/SearchIcon';
import CartIcon from './icons/CartIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import SparklesIcon from './icons/SparklesIcon';

interface DiagnosticResultCardProps {
  guide: DiagnosticGuide;
}

const TechnicalBadge: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-cyan-400" }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    <span className={`text-[10px] font-bold uppercase tracking-tighter ${color}`}>{value}</span>
  </div>
);

const NutriFact: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-end border-b border-black/20 py-2">
    <p className="text-[10px] font-black uppercase text-gray-900">{label}</p>
    <p className="text-[11px] font-black text-gray-950 uppercase">{value} <span className="text-[8px] text-gray-700">{unit}</span></p>
  </div>
);

const DiagnosticResultCard: React.FC<DiagnosticResultCardProps> = ({ guide }) => {
    const { nutriTaquita } = guide;

    const recommendedParts = useMemo(() => {
        const keywords = (guide.recommendedPartKeywords || []).map(k => k.toLowerCase());
        return PARTS_CATALOG.filter(part =>
            keywords.some(keyword => part.keywords.some(pk => pk.toLowerCase().includes(keyword)))
        );
    }, [guide.recommendedPartKeywords]);

  return (
    <div className="space-y-12 animate-slide-up">
      {/* HEADER DE AUDITORÍA INDUSTRIAL */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gradient-to-r from-[#020617] to-[#0f172a] border border-white/10 p-12 rounded-[4rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5"><SparklesIcon /></div>
         <div className="space-y-6 z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">
               <VerifiedIcon className="w-4 h-4" /> MANDO INDUSTRIAL ACTIVADO
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{guide.title}</h2>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.4em] italic">Dictamen Forense AutoSocio v5.5</p>
         </div>
         <div className="flex flex-wrap gap-12 border-l border-white/10 pl-12 z-10">
            <TechnicalBadge label="Estatus" value="Auditado" color="text-emerald-400" />
            <TechnicalBadge label="Protocolo" value="OEM Validated" />
            <TechnicalBadge label="Élite" value="Master Bypass" color="text-amber-400" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* COLUMNA IZQUIERDA: SÍNTOMAS Y ANATOMÍA */}
        <div className="lg:col-span-8 space-y-10">
           {/* CUADRO CLÍNICO DE SÍNTOMAS */}
           <div className="bg-[#020617] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-12 w-32 h-1 bg-rose-600 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.8)]"></div>
              <div className="flex items-center gap-6 mb-12">
                <div className="p-4 bg-rose-600/10 rounded-2xl text-rose-500 border border-rose-600/20 shadow-xl">
                   <SearchIcon className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Sintomatología Crítica</h3>
                   <p className="text-[9px] text-rose-500 font-black uppercase tracking-[0.3em] mt-1">Indicadores detectados por Neuro-ADN</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(guide.symptoms || []).map((symptom, i) => (
                  <div key={i} className="flex items-start gap-5 p-6 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:bg-rose-900/10 hover:border-rose-900/30 transition-all duration-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1.5 shadow-[0_0_15px_rgba(225,29,72,1)] group-hover:scale-125 transition-transform"></div>
                    <p className="text-sm text-gray-300 font-light leading-relaxed italic group-hover:text-white">
                      {symptom}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-rose-600/10 border border-rose-600/20 rounded-[2.5rem] flex items-center gap-6 shadow-inner">
                 <div className="p-5 bg-rose-600 rounded-3xl text-white shadow-2xl flex-shrink-0 animate-pulse"><VerifiedIcon className="w-6 h-6" /></div>
                 <p className="text-[11px] text-rose-100 font-bold leading-relaxed uppercase tracking-widest italic">
                    RECOMENDACIÓN ÉLITE: Proceder con desmantelamiento preventivo. El riesgo de falla catastrófica es inminente según el cuadro clínico auditado.
                 </p>
              </div>
           </div>

           {/* PROTOCOLO DE INTERVENCIÓN */}
           <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.6em] flex items-center gap-4">
                <WrenchIcon className="w-5 h-5" /> Protocolo de Intervención Técnica
              </h3>
              <div className="space-y-10">
                {(guide.diagnosticSteps || []).map((step, i) => (
                  <div key={i} className="flex gap-10 group">
                     <div className="flex-shrink-0 w-14 h-14 rounded-[1.5rem] bg-gray-950 border border-white/10 flex items-center justify-center text-lg font-black text-white group-hover:bg-cyan-600 group-hover:border-transparent transition-all shadow-2xl">
                       {i + 1}
                     </div>
                     <div className="pt-2">
                        <p className="text-[16px] text-gray-300 font-light leading-relaxed italic group-hover:text-white transition-colors">"{step}"</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* COLUMNA DERECHA: NUTRI TAQUITA */}
        <div className="lg:col-span-4 space-y-10">
           {/* NUTRI TAQUITA (TECHNICAL NUTRITION) */}
           <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-gray-950 font-sans border-t-8 border-gray-950">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
              <div className="border-b-4 border-gray-950 pb-4 mb-4 text-center">
                 <h4 className="text-4xl font-black uppercase tracking-tighter leading-none italic">Nutri Taquita</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-1">Technical Facts / Porción: 1 Refacción</p>
              </div>
              
              <div className="space-y-2 mb-6">
                <NutriFact label="Potencial Energético" value={nutriTaquita?.calories || 'High'} unit="CAL" />
                <NutriFact label="Fibra Técnica" value={nutriTaquita?.technicalFiber || '98%'} unit="DUR" />
                <NutriFact label="Pureza OEM" value={nutriTaquita?.purity || '100%'} unit="CERT" />
                <NutriFact label="Vitamina ROI" value={nutriTaquita?.roiVitamin || '$4.5k'} unit="PROFIT" />
              </div>

              <div className="border-t-2 border-gray-950 pt-4 space-y-3">
                 <p className="text-[8px] font-black uppercase leading-tight italic">
                    * El % de Pureza OEM se basa en una arquitectura vehicular auditada contra el manual de taller de planta. 
                    Tus resultados pueden variar dependiendo del uso de herramientas piratas.
                 </p>
                 <div className="flex items-center gap-2 pt-2">
                    <VerifiedIcon className="w-3 h-3 text-gray-950" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Sello de Calidad AutoSocio Élite</span>
                 </div>
              </div>
           </div>

           {/* UBICACIÓN ADN */}
           <div className="bg-[#020617] border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 text-cyan-500"><LocationIcon /></div>
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em]">Ubicación ADN</h3>
              <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-black/60 group-hover:border-cyan-500/40 transition-all duration-700">
                <img 
                  src={`https://placehold.co/800x800/020617/1e293b?text=DNA+MAP+${encodeURIComponent(guide.title)}`} 
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-all duration-1000" 
                  alt="Ubicación ADN"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 border-2 border-cyan-500 rounded-full animate-ping opacity-20"></div>
                    <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,1)]"></div>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 font-light leading-relaxed italic border-l-2 border-cyan-500/30 pl-6">
                "{guide.locationDescription}"
              </p>
           </div>
        </div>
      </div>

      <div className="text-center py-12 border-t border-white/5 opacity-40">
        <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.8em]">Fin de Protocolo de Mando Industrial &bull; AutoSocio Forensic Engine v5.5</p>
      </div>
    </div>
  );
};

export default DiagnosticResultCard;
