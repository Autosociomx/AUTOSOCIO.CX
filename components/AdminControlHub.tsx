
import React, { useState } from 'react';
import ChartIcon from './icons/ChartIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import SparklesIcon from './icons/SparklesIcon';
import CloseIcon from './icons/CloseIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import { AGENTS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import type { AuditResult } from '../types';

interface AdminControlHubProps {
  lastAudit?: string;
}

const AdminControlHub: React.FC<AdminControlHubProps> = ({ lastAudit }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [simulatedPersona, setSimulatedPersona] = useState('Mecánico Escéptico');

  const runMysteryShopperAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    setAuditLogs([
      `Iniciando simulación de persona: ${simulatedPersona}...`,
      "Mapeando flujos de usuario en AutoSocio...",
      "Auditando transparencia de precios y stocks...",
      "Evaluando factor 'Cero Humo' en las recomendaciones..."
    ]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Actúa como un Mystery Shopper de élite con el perfil: ${simulatedPersona}. 
      Evalúa la plataforma AutoSocio enfocada en desmantelamiento e inteligencia de refacciones.
      Analiza: 
      1. ¿La información técnica es confiable o parece inventada? 
      2. ¿Hay fricción que me haga desconfiar de pagar una pieza cara? 
      3. ¿La escalabilidad comercial es real o es una fantasía técnica?
      
      Dame un reporte estructurado en JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "Eres un auditor forense de negocios. Tu meta es encontrar errores que matan la rentabilidad. No seas complaciente. Sé brutalmente honesto.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['FRICTION', 'OPPORTUNITY', 'RISK'] },
                    severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'CRITICAL'] },
                    description: { type: Type.STRING },
                    fixAction: { type: Type.STRING }
                  },
                  required: ['type', 'severity', 'description', 'fixAction']
                }
              },
              summary: { type: Type.STRING },
              commercialViability: { type: Type.STRING }
            },
            required: ['score', 'findings', 'summary', 'commercialViability']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAuditLogs(prev => [...prev, "Analizando impacto financiero...", "Generando hoja de ruta de corrección...", "Auditoría completada."]);
      setAuditResult(result);
    } catch (error) {
      setAuditLogs(prev => [...prev, "ERROR: Interrupción de enlace con el Mainframe de Auditoría."]);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 space-y-16 animate-slide-up pb-40">
      <header className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
            <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em]">Mystery Shopper Engine v1.0</span>
          </div>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Mando de <br/><span className="text-rose-500 italic">Auditoría UX/ROI</span></h2>
          <p className="text-gray-500 font-light max-w-2xl text-lg italic">
            "Detectando fallas, eliminando humo, maximizando rentabilidad sostenible."
          </p>
        </div>
        <div className="flex gap-6">
          <StatBox label="Audit Health" value={auditResult ? `${auditResult.score}/10` : '---'} color="text-rose-400" />
          <StatBox label="ROI Potential" value="92%" color="text-cyan-400" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          
          <div className="bg-[#020617] border border-white/10 rounded-[4rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 blur-[120px] -z-10"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
               <div className="space-y-4">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-rose-900/40 shadow-2xl">
                      <span className="text-white font-black italic text-xl">A</span>
                    </div>
                     Mystery Shop Live
                 </h3>
                 <div className="flex gap-2">
                   {['Mecánico Escéptico', 'Inversionista', 'Dueño de Flota'].map(p => (
                     <button 
                      key={p} 
                      onClick={() => setSimulatedPersona(p)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${simulatedPersona === p ? 'bg-rose-600 border-rose-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                     >
                       {p}
                     </button>
                   ))}
                 </div>
               </div>
               
               <button 
                onClick={runMysteryShopperAudit}
                disabled={isAuditing}
                className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isAuditing ? 'bg-gray-800 text-gray-500' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-900/40 active:scale-95'}`}
              >
                {isAuditing ? 'Auditando...' : 'Ejecutar Auditoría Forense'}
              </button>
            </div>

            {isAuditing && (
              <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 font-mono text-[10px] text-rose-400 space-y-2 animate-pulse">
                {auditLogs.map((log, i) => <p key={i}>> {log}</p>)}
              </div>
            )}

            {auditResult && (
              <div className="space-y-10 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                     <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Viabilidad Comercial</p>
                     <p className="text-xs text-white font-bold leading-relaxed">"{auditResult.commercialViability}"</p>
                  </div>
                  <div className="md:col-span-2 p-8 bg-white/5 rounded-3xl border border-white/5">
                     <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-2">Resumen Crítico</p>
                     <p className="text-xs text-gray-300 font-light leading-relaxed italic">"{auditResult.summary}"</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <SparklesIcon className="w-4 h-4 text-rose-500" /> Hallazgos Tácticos
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {auditResult.findings.map((finding, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-8 group hover:bg-white/[0.08] transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                              finding.type === 'FRICTION' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 
                              finding.type === 'RISK' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 
                              'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            }`}>
                              {finding.type}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                              finding.severity === 'CRITICAL' ? 'text-rose-500' : 'text-gray-500'
                            }`}>
                              SEVERIDAD: {finding.severity}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-white font-bold mb-4">"{finding.description}"</p>
                        <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                          <VerifiedIcon className="w-4 h-4 text-emerald-500" />
                          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Acción de Mejora: {finding.fixAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONECTAX STRATEGIC CONCLUSION VIEW */}
            <div className="pt-12 border-t border-white/5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <ChartIcon />
                </div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Conclusión Estratégica <span className="text-indigo-500">ConectaX</span></h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <p className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">ConectaX ya no es idea:</p>
                  <ul className="space-y-4">
                    {['Pricing defendible', 'Prompts industriales', 'Arquitectura escalable', 'Modelo de ingresos limpio'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <p className="text-gray-300 text-sm">tiene <span className="font-black text-white">{item}</span></p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                   <p className="text-amber-400 font-black uppercase text-[10px] tracking-widest">👉 Próximo paso recomendado:</p>
                   <ul className="space-y-4">
                    <li className="text-gray-300 text-sm flex items-start gap-3">
                       <span className="font-black text-white">A)</span> 
                       <div>
                        Convertir prompts en <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">system + function calling</span>
                       </div>
                    </li>
                    <li className="text-gray-300 text-sm flex items-start gap-3">
                       <span className="font-black text-white">B)</span> Diseñar <span className="font-black text-white">MVP técnico</span> en código
                    </li>
                    <li className="text-gray-300 text-sm flex items-start gap-3">
                       <span className="font-black text-white">C)</span> Preparar <span className="font-black text-white">pitch para inversores</span>
                    </li>
                   </ul>
                </div>
              </div>

              <div className="p-10 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem] text-center">
                 <p className="text-indigo-300 font-black uppercase tracking-widest text-lg">Dime A, B o C y seguimos sin freno.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 space-y-8 shadow-2xl">
             <div className="flex items-center gap-4">
                <VerifiedIcon className="w-6 h-6 text-rose-400" />
                <h4 className="text-lg font-black text-white uppercase tracking-tighter">Status de Auditoría</h4>
             </div>
             <div className="space-y-6">
                <StatusItem label="Factor Cero Humo" value="VALIDANDO" color="text-amber-400" />
                <StatusItem label="Integridad de Datos" value="99.9%" color="text-emerald-400" />
                <StatusItem label="UX Friction" value="LOW" color="text-indigo-400" />
             </div>
          </div>
          
          <div className="p-10 bg-rose-500/5 border border-rose-500/10 rounded-[3.5rem] space-y-6">
             <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Infraestructura ConectaX</p>
             <p className="text-xs text-gray-400 leading-relaxed font-light italic">
               "Automatizando el flujo de sourcing técnico mediante el Intent Analyzer y el motor de Escenarios 1, 2 y 3."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusItem: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5">
    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    <span className={`text-[10px] font-black ${color} uppercase tracking-tighter`}>{value}</span>
  </div>
);

const StatBox: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="glass-bezel p-8 rounded-[2.5rem] text-center min-w-[180px] shadow-2xl border-white/10">
    <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">{label}</p>
  </div>
);

export default AdminControlHub;
