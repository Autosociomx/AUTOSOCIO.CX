
import React, { useMemo } from 'react';
import type { Agent, Language } from '../types';
import StarIcon from './icons/StarIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import SparklesIcon from './icons/SparklesIcon';
import { getLabels } from '../constants';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  language?: Language;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, language = 'es' }) => {
  const labels = useMemo(() => getLabels(language), [language]);
  
  const getStatusColor = (status: string) => {
    if (status === 'Cero Errores') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Maestro del Mes') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  };

  return (
    <div
      className="group bg-[#0f172a]/40 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-pointer flex flex-col relative"
      onClick={() => onSelect(agent)}
    >
      <div className={`absolute top-5 right-5 z-10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(agent.reputation.status)} backdrop-blur-md`}>
        {agent.reputation.status}
      </div>

      <div className="p-10 flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-cyan-500 rounded-3xl blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <img src={agent.avatar} className="relative w-32 h-32 rounded-3xl border-2 border-white/10 shadow-lg object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
          <div className="absolute -bottom-2 -right-2 bg-cyan-600 p-2 rounded-xl border-2 border-[#020617] shadow-xl">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter group-hover:text-cyan-400 transition-colors leading-none">{agent.name}</h3>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{agent.title}</p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-5 py-2 rounded-full border border-white/5 mb-8">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <StarIcon className="w-4 h-4" />
            <span className="text-xs font-black text-white">{agent.reputation.rating}</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">ROI Validado</span>
        </div>

        <p className="text-gray-400 text-[11px] leading-relaxed italic opacity-70 group-hover:opacity-100 transition-opacity line-clamp-3 px-2 font-light">
          "{agent.description}"
        </p>
      </div>

      <div className="px-10 pb-10 mt-auto">
        <button className="w-full bg-white text-black group-hover:bg-cyan-600 group-hover:text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98]">
          {labels.agent_card.btn_start}
        </button>
        <p className="mt-4 text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] text-center">{labels.agent_card.protocol}</p>
      </div>
    </div>
  );
};

export default AgentCard;
