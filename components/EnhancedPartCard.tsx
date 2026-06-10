
import React from 'react';
import { REGIONAL_PLATFORMS } from '../constants';
import type { EnrichedPartRecommendation, Language } from '../types';

interface EnhancedPartCardProps {
  result: EnrichedPartRecommendation;
  vehicleContext: {
    make: string;
    model: string;
    year: string;
    engine: string;
    transmission: string;
    part: string;
  };
  userLanguage?: Language;
}

const ViabilityScoreBar: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 10;
    const color = score >= 9 ? 'bg-cyan-500' : score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-rose-500';
    return (
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className={`${color} h-full transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor]`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const EnhancedPartCard: React.FC<EnhancedPartCardProps> = ({ result, vehicleContext, userLanguage = 'es' }) => {
  const { part, recommendation, viabilityScore, isMostRecommended } = result;
  
  const queryADN = `${vehicleContext.make} ${vehicleContext.model} ${vehicleContext.year} ${vehicleContext.engine} ${part.name}`;
  const encodedQuery = encodeURIComponent(queryADN);

  const displayImage = part.imageUrl || `https://placehold.co/600x400/020617/0f172a?text=${encodeURIComponent(part.name)}`;

  const platforms = REGIONAL_PLATFORMS[userLanguage] || REGIONAL_PLATFORMS['es'];
  const sourcePlatform = platforms.find(p => p.name === part.platform) || platforms[0];

  return (
    <div className={`glass-card border rounded-[3rem] flex flex-col h-full transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_50px_100px_rgba(0,0,0,0.7)] ${isMostRecommended ? 'border-cyan-500/50 ring-1 ring-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]' : 'border-white/5'}`}>
        <div className="relative overflow-hidden rounded-t-[3rem] aspect-[16/10]">
             <img className="h-full w-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000" src={displayImage} alt={part.name} />
             <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
             
             <div className="absolute top-6 left-6 flex flex-col gap-2">
                {isMostRecommended && (
                    <div className="bg-cyan-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-2xl animate-pulse">
                      RECOMENDACIÓN ÉLITE
                    </div>
                )}
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${sourcePlatform.color} shadow-lg`}>
                  ORIGEN: {part.platform || sourcePlatform.name}
                </div>
             </div>

            <div className="absolute bottom-6 left-8">
                <p className="text-white font-black text-2xl tracking-tighter">
                  ${part.price.toLocaleString()} <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">MXN/EQ</span>
                </p>
            </div>
        </div>
     
      <div className="p-10 flex flex-col flex-grow space-y-8">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-2">{part.name}</h3>
          <div className="flex flex-wrap gap-2 opacity-60">
            <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{vehicleContext.make} {vehicleContext.model}</span>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 relative group min-h-[90px]">
             <p className="text-[8px] uppercase tracking-[0.4em] text-cyan-400 font-black mb-3 italic">Dictamen de Auditoría</p>
             <p className="text-[11px] text-gray-300 leading-relaxed font-light italic">"{recommendation}"</p>
        </div>

        <div className="mt-auto space-y-8">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Viabilidad Técnica</p>
                    <p className="text-sm font-black text-white">{viabilityScore}/10</p>
                </div>
                <ViabilityScoreBar score={viabilityScore} />
            </div>

            <div className="pt-6 border-t border-white/5">
                <a 
                  href={`${sourcePlatform.baseUrl}${encodedQuery}${sourcePlatform.searchParam}`} 
                  target="_blank" rel="noopener noreferrer" 
                  className={`w-full flex justify-between items-center px-6 py-4 ${sourcePlatform.color} text-[10px] font-black rounded-xl hover:opacity-90 transition-all uppercase tracking-[0.2em] shadow-xl active:scale-95`}
                >
                  <span>COMPRAR EN {sourcePlatform.name.toUpperCase()}</span>
                  <span className="text-xl">→</span>
                </a>
                <p className="text-[7px] text-gray-700 font-black uppercase tracking-[0.4em] text-center mt-4">Enlace Sincronizado por AutoSocio</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPartCard;
