import React, { useState, useMemo } from 'react';
import { PARTS_CATALOG, AGENTS } from '../constants';
import type { Part } from '../types';
import TruckIcon from './icons/TruckIcon';
import PlusIcon from './icons/PlusIcon';
import ChartIcon from './icons/ChartIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import LiveTacticalSession from './LiveTacticalSession';

const FleetInventory: React.FC = () => {
  const [fleetComposition, setFleetComposition] = useState<any[]>([]);
  const [newVehicle, setNewVehicle] = useState({ model: '', count: '' });
  const [activeAudit, setActiveAudit] = useState<boolean>(false);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVehicle.model && newVehicle.count) {
      setFleetComposition(prev => [...prev, { model: newVehicle.model, count: parseInt(newVehicle.count), status: 'operational' }]);
      setNewVehicle({ model: '', count: '' });
    }
  };

  if (activeAudit) {
    return <LiveTacticalSession agent={AGENTS[0]} onClose={() => setActiveAudit(false)} mode="audit" userLanguage="es" />;
  }

  return (
    <div className="max-w-7xl mx-auto py-12 space-y-12 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Gestión de Flotas</h2>
          <p className="text-gray-500 font-light max-w-xl">Optimización de stock y auditoría técnica con validez corporativa. Cero errores, máximo ahorro.</p>
        </div>
        <button 
          onClick={() => setActiveAudit(true)}
          className="flex items-center gap-4 px-10 py-5 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/40 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <VerifiedIcon /> Iniciar Auditoría de Reparación
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card border border-white/5 rounded-[2.5rem] p-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <TruckIcon /> Registro de Unidades
              </h3>
              <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <input name="model" value={newVehicle.model} onChange={e => setNewVehicle(p => ({...p, model: e.target.value}))} placeholder="Modelo de Unidad" className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm" required />
                <input name="count" type="number" value={newVehicle.count} onChange={e => setNewVehicle(p => ({...p, count: e.target.value}))} placeholder="Cantidad" className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm" required />
                <button type="submit" className="bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <PlusIcon /> Añadir
                </button>
              </form>

              <div className="space-y-4">
                {fleetComposition.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center border border-white/10 text-gray-500 group-hover:text-cyan-400">
                        <TruckIcon />
                       </div>
                       <div>
                        <p className="text-white font-bold">{v.model}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{v.count} Unidades en sistema</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Operacional</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4">Ahorro Estimado</h4>
              <p className="text-5xl font-black text-white tracking-tighter mb-2">$14,200<span className="text-sm font-light ml-1">MXN</span></p>
              <p className="text-indigo-200 text-xs leading-relaxed mb-8 italic">Ahorro anual por eliminación de errores técnicos mediante auditoría IA.</p>
              <button className="w-full py-4 bg-white/10 border border-white/20 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all">
                Ver Reporte de Eficiencia
              </button>
           </div>

           <div className="glass-card border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h4 className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Logs de Auditoría</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="w-1 h-10 bg-cyan-500 rounded-full"></div>
                   <div>
                      <p className="text-white text-xs font-bold leading-none mb-1 uppercase tracking-tighter">Sesión de Auditoría #881</p>
                      <p className="text-gray-500 text-[9px] uppercase tracking-widest">Validada por: Mtro. Carlos</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-1 h-10 bg-gray-800 rounded-full"></div>
                   <div>
                      <p className="text-gray-500 text-xs font-bold leading-none mb-1 uppercase tracking-tighter">Sin actividad pendiente</p>
                      <p className="text-gray-600 text-[9px] uppercase tracking-widest">Protocolo de seguridad activo</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FleetInventory;