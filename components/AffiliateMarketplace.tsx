
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PARTS_CATALOG, REGIONAL_PLATFORMS, getLabels } from '../constants';
import type { EnrichedPartRecommendation, Language, DiagnosticGuide, AuditScenario, Part } from '../types';
import { identifyPartKeywords, getEnhancedPartRecommendations, generateDiagnosticGuide, analyzeIntent } from '../services/geminiService';
import {
  captureSession,
  capturePartSearch,
  buildSessionFromDiagnostic,
  buildPartSearchFromResults,
} from '../services/dataIntelligenceService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import MicrophoneIcon from './icons/MicrophoneIcon';
import CameraIcon from './icons/CameraIcon';
import SearchIcon from './icons/SearchIcon';
import EnhancedPartCard from './EnhancedPartCard';
import DiagnosticResultCard from './DiagnosticResultCard';
import SparklesIcon from './icons/SparklesIcon';
import VerifiedIcon from './icons/VerifiedIcon';

interface AffiliateMarketplaceProps {
  initialSearch?: string;
  userLanguage?: Language;
}

const COMMON_MAKES = ['Volkswagen', 'Toyota', 'Ford', 'Chevrolet', 'Nissan', 'Honda', 'Mazda', 'BMW', 'Mercedes-Benz', 'Audi'];
const COMMON_PARTS = ['Sensores de Transmisión', 'Solenoide de Presión', 'Bomba de Gasolina', 'Kit de Embrague', 'Radiador de Enfriamiento'];

const AffiliateMarketplace: React.FC<AffiliateMarketplaceProps> = ({ initialSearch, userLanguage = 'es' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLog, setLoadingLog] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [enrichedResults, setEnrichedResults] = useState<EnrichedPartRecommendation[]>([]);
  const [diagnosticGuide, setDiagnosticGuide] = useState<DiagnosticGuide | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [activeScenario, setActiveScenario] = useState<AuditScenario | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    engine: '',
    transmission: '',
    part: initialSearch || ''
  });

  const [activeField, setActiveField] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const labels = useMemo(() => getLabels(userLanguage), [userLanguage]);

  useEffect(() => {
    if (initialSearch) {
      setVehicleData(prev => ({ ...prev, part: initialSearch }));
    }
  }, [initialSearch]);

  const handleVoiceInput = useCallback((transcript: string) => {
    if (activeField) {
      setVehicleData(prev => ({ ...prev, [activeField]: transcript }));
      setActiveField(null);
    }
  }, [activeField]);

  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceInput);

  const handlePublicSearch = async () => {
    if (!vehicleData.make || !vehicleData.model || !vehicleData.part) {
      setError('Faltan datos de ADN (Marca/Modelo/Pieza) para garantizar compatibilidad.');
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);
    setError(null);
    setDiagnosticGuide(null);
    
    // Neuro-Sync Loading Simulation
    const logs = labels.marketplace.loading_messages || [
      "Sincronizando...",
      "Decodificando ADN...",
      "Escaneando...",
      "Validando Stock...",
      "Generando Guía..."
    ];
    let logIdx = 0;
    setLoadingLog(logs[0]);
    const logInterval = setInterval(() => {
      setLoadingLog(logs[logIdx % logs.length]);
      logIdx++;
    }, 1200);

    try {
      const fullADN = `${vehicleData.make} ${vehicleData.model} ${vehicleData.year} ${vehicleData.engine} ${vehicleData.part}`;
      
      const scenario = await analyzeIntent(fullADN, userLanguage as Language);
      setActiveScenario(scenario);

      const [keywords, guide] = await Promise.all([
        identifyPartKeywords(fullADN, uploadedImage, userLanguage as Language),
        generateDiagnosticGuide(fullADN, scenario, userLanguage as Language)
      ]);

      setDiagnosticGuide(guide);

      // ── Captura de datos para el dataset ──────────────────────────
      const sessionData = buildSessionFromDiagnostic({
        vehicleData,
        rawQuery: fullADN,
        intentScenario: scenario,
        guide,
        language: userLanguage as Language,
        usedVoice: false,
        usedImage: !!uploadedImage,
      });
      const capturedId = await captureSession(sessionData);
      if (capturedId) setSessionId(capturedId);
      // ─────────────────────────────────────────────────────────────

      if (scenario !== 'EDUCATION') {
        const platforms = REGIONAL_PLATFORMS[userLanguage] || REGIONAL_PLATFORMS['es'];
        
        let candidates: Part[] = [];
        const generateMockParts = (platformIndex: number, count: number) => {
          const plat = platforms[platformIndex];
          const results: Part[] = [];
          for (let i = 0; i < count; i++) {
            results.push({
              id: `v-match-${plat.name}-${i}-${Date.now()}`,
              name: `${vehicleData.part} ${['Élite Pro', 'OEM Plus', 'Heavy Duty', 'Standard Gold', 'Performance', 'Eco-Tech'][i] || 'Genérica'}`,
              description: `Opción validada por el motor ConectaX para ${vehicleData.make}. Origen: ${plat.name}.`,
              imageUrl: '',
              affiliateUrl: '#',
              loyaltyCommissionRate: 2,
              salesCommissionRate: 5,
              keywords: keywords,
              compatibility: [fullADN],
              price: 1200 + (Math.random() * 3000),
              stock: 3 + i,
              platform: plat.name
            });
          }
          return results;
        };

        // User requirement: 4 ML, 2 AMZ, 2 AZ
        candidates = [
          ...generateMockParts(0, 4), // Mercado Libre / eBay
          ...generateMockParts(1, 2), // Amazon / RockAuto
          ...generateMockParts(2, 2)  // AutoZone / Amazon
        ];

        const recommendations = await getEnhancedPartRecommendations(fullADN, candidates, userLanguage as Language);
        
        const results = recommendations.map(r => {
          const targetPart = candidates.find(p => p.id === r.partId) || candidates[0];
          return {
            part: targetPart,
            ...r
          };
        });

        setEnrichedResults(results);

        // Captura búsqueda de piezas
        if (capturedId && results.length > 0) {
          const partSearch = buildPartSearchFromResults(capturedId, vehicleData.part, results);
          await capturePartSearch(partSearch);
        }
      } else {
        setEnrichedResults([]);
      }
      
    } catch (err) {
      console.error(err);
      setError('Falla en la Sincronización Global. Reintente.');
    } finally {
      clearInterval(logInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 animate-slide-up space-y-20 pb-40">
      <div className="text-center space-y-4">
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">{labels.marketplace.title} <span className="text-cyan-500 italic">{labels.marketplace.subtitle}</span></h2>
        <div className="flex items-center justify-center gap-4">
            <span className="text-cyan-400 font-black uppercase text-[10px] tracking-[0.4em]">{labels.marketplace.search_active}</span>
            <span className="bg-cyan-500/20 px-3 py-1 rounded-full text-white text-[9px] font-black uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)]">{userLanguage.toUpperCase()} REGION</span>
        </div>
      </div>

      <div className="glass-card border border-white/10 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <PredictiveField name="make" label={labels.marketplace.fields.make} value={vehicleData.make} suggestions={COMMON_MAKES} onChange={v => setVehicleData(p => ({...p, make: v}))} isListening={isListening && activeField === 'make'} onVoice={() => { setActiveField('make'); toggleListening(); }} />
              <PredictiveField name="model" label={labels.marketplace.fields.model} value={vehicleData.model} onChange={v => setVehicleData(p => ({...p, model: v}))} isListening={isListening && activeField === 'model'} onVoice={() => { setActiveField('model'); toggleListening(); }} />
              <PredictiveField name="year" label={labels.marketplace.fields.year} value={vehicleData.year} onChange={v => setVehicleData(p => ({...p, year: v}))} isListening={isListening && activeField === 'year'} onVoice={() => { setActiveField('year'); toggleListening(); }} />
            </div>
            
            <PredictiveField name="part" label={labels.marketplace.fields.part} value={vehicleData.part} suggestions={COMMON_PARTS} onChange={v => setVehicleData(p => ({...p, part: v}))} isListening={isListening && activeField === 'part'} onVoice={() => { setActiveField('part'); toggleListening(); }} />

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <button 
                  onClick={handlePublicSearch} 
                  disabled={isLoading} 
                  className="flex-grow py-6 bg-white text-black font-black text-xs rounded-2xl hover:bg-cyan-600 hover:text-white transition-all shadow-xl uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
                >
                  {labels.marketplace.btn_search}
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-10 py-6 glass-card text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-4"
                >
                  <CameraIcon className="w-5 h-5" /> {labels.marketplace.btn_scan}
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" />
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/5 rounded-[3rem] p-10 border border-white/5 flex flex-col justify-center space-y-8">
            <h4 className="text-white font-black uppercase text-xl tracking-tighter">{labels.marketplace.filter_title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed font-light italic">
              "{labels.marketplace.filter_desc}"
            </p>
            <div className="p-6 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 shadow-inner">
                <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-1">Mando Industrial v5.5</p>
                <p className="text-white text-xs font-bold uppercase tracking-tight italic">Protocolo NutriTaquita Activo</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[250] bg-gray-950/80 backdrop-blur-2xl flex items-center justify-center animate-fade-in">
          <div className="max-w-md w-full p-12 bg-[#020617] border border-white/10 rounded-[3rem] text-center space-y-8 shadow-[0_0_100px_rgba(6,182,212,0.2)]">
            <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <SparklesIcon className="w-8 h-8 text-cyan-500 animate-pulse" />
               </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-black uppercase tracking-[0.5em] text-xs">{labels.marketplace.loading_sync || "Sincronización Neuro-ADN"}</h3>
              <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest animate-pulse h-4">{loadingLog}</p>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {searchPerformed && !isLoading && (
        <div className="space-y-24 animate-slide-up">
          {diagnosticGuide && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px bg-white/10 flex-grow"></div>
                <h3 className="text-sm font-black text-cyan-500 uppercase tracking-[0.5em]">{labels.marketplace.audit_verdict}</h3>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>
              <DiagnosticResultCard guide={diagnosticGuide} />
            </div>
          )}

          {activeScenario !== 'EDUCATION' && enrichedResults.length > 0 && (
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-grow"></div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em]">Catálogo de Sourcing Élite</h3>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {enrichedResults.map((res, i) => (
                  <EnhancedPartCard 
                    key={res.part.id || i} 
                    result={res} 
                    vehicleContext={vehicleData}
                    userLanguage={userLanguage as Language}
                  />
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-rose-500 text-center font-black uppercase text-xs tracking-widest">{error}</p>}
        </div>
      )}
    </div>
  );
};

const PredictiveField: React.FC<{ 
  name: string, 
  label: string, 
  value: string, 
  suggestions?: string[], 
  onChange: (v: string) => void, 
  onVoice: () => void,
  isListening: boolean 
}> = ({ label, value, suggestions = [], onChange, onVoice, isListening }) => (
    <div className="flex flex-col gap-3 relative">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">{label}</label>
      <div className="relative group">
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-bold text-sm placeholder-gray-800"
          placeholder={`${label}...`}
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            onVoice();
          }} 
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-900/40' : 'text-gray-600 hover:text-white bg-white/5'}`}
        >
          <MicrophoneIcon className="w-4 h-4" isListening={isListening} />
        </button>
      </div>
      {suggestions.length > 0 && !value && (
        <div className="flex flex-wrap gap-2 mt-2 ml-2">
           {suggestions.slice(0, 3).map(s => (
             <button key={s} onClick={() => onChange(s)} className="text-[8px] font-black text-cyan-500/50 hover:text-cyan-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 transition-all">
               + {s}
             </button>
           ))}
        </div>
      )}
    </div>
);

export default AffiliateMarketplace;
