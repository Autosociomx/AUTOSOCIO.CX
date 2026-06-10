
import React, { useState, useMemo } from 'react';
import AcademicIcon from './icons/AcademicIcon';
import StarIcon from './icons/StarIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import { ACADEMY_COURSES, AGENTS } from '../constants';
import type { AcademyCourse, UserProfile } from '../types';

interface AcademyPortalProps {
  user: UserProfile | null;
  onSelectAgent: (agentId: number) => void;
}

const AcademyPortal: React.FC<AcademyPortalProps> = ({ user, onSelectAgent }) => {
  const [activeTab, setActiveTab] = useState<'explorar' | 'mis-cursos' | 'certificaciones'>('explorar');
  const [filterType, setFilterType] = useState<'category' | 'mentor'>('mentor');
  const [selectedMentorId, setSelectedMentorId] = useState<number | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(ACADEMY_COURSES.map(c => c.category)))], []);

  const filteredCourses = useMemo(() => {
    let result = ACADEMY_COURSES;
    if (filterType === 'mentor' && selectedMentorId !== 'all') {
      result = result.filter(c => c.agentId === selectedMentorId);
    } else if (filterType === 'category' && filterCategory !== 'All') {
      result = result.filter(c => c.category === filterCategory);
    }
    return result;
  }, [filterType, selectedMentorId, filterCategory]);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-slide-up space-y-16 pb-40">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600/10 rounded-[2rem] text-indigo-400 border border-indigo-500/20 shadow-2xl shadow-indigo-900/20">
              <AcademicIcon className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Academia <span className="text-indigo-500 italic">AutoSocio</span></h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">Especialización Técnica & Mystery Shopping</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl font-light leading-relaxed">
            Prioridad en ADN Automotriz: Mecánica, Estética y Electrónica avanzada. Complementada con gestión de flotas y auditoría rentabilizada.
          </p>
        </div>
        
        <div className="flex items-center bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 self-start md:self-auto backdrop-blur-3xl shadow-2xl">
          {['explorar', 'mis-cursos', 'certificaciones'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                activeTab === tab ? 'bg-white text-black shadow-2xl' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'explorar' && (
        <>
          <div className="space-y-10">
            <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setFilterType('mentor'); setSelectedMentorId('all'); }}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterType === 'mentor' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  Filtrar por Facultades
                </button>
                <button 
                  onClick={() => { setFilterType('category'); setFilterCategory('All'); }}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterType === 'category' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  Filtrar por Especialidad
                </button>
            </div>

            {filterType === 'mentor' ? (
               <div className="flex flex-wrap justify-center gap-4 pb-4">
                  <button 
                    onClick={() => setSelectedMentorId('all')}
                    className={`flex items-center gap-3 px-6 py-3 rounded-[2rem] border transition-all ${selectedMentorId === 'all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Todos los Mentores</span>
                  </button>
                  {AGENTS.map(agent => (
                    <button 
                      key={agent.id}
                      onClick={() => setSelectedMentorId(agent.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-[2rem] border transition-all group ${selectedMentorId === agent.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
                    >
                      <img src={agent.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white/10 group-hover:border-white/30 transition-all" />
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{agent.name}</p>
                        <p className={`text-[7px] font-black uppercase tracking-[0.2em] mt-1 ${selectedMentorId === agent.id ? 'text-indigo-200' : 'text-gray-600'}`}>{agent.title}</p>
                      </div>
                    </button>
                  ))}
               </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      filterCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onStart={() => onSelectAgent(course.agentId)} />
            ))}
          </div>
        </>
      )}

      {(activeTab === 'mis-cursos' || activeTab === 'certificaciones') && (
        <div className="text-center py-40 space-y-8 animate-fade-in">
          <div className="w-24 h-24 bg-indigo-500/5 rounded-[2rem] flex items-center justify-center mx-auto border border-indigo-500/10 text-gray-700 shadow-inner">
            <AcademicIcon className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Trayectoria <span className="text-indigo-500">Activa</span></h3>
            <p className="text-gray-500 font-light uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto leading-relaxed">Seleccione un diplomado en el catálogo para iniciar su proceso de acreditación técnica.</p>
          </div>
          <button onClick={() => setActiveTab('explorar')} className="px-10 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">
            Explorar Facultades
          </button>
        </div>
      )}
    </div>
  );
};

const CourseCard: React.FC<{ course: AcademyCourse; onStart: () => void }> = ({ course, onStart }) => {
  const agent = AGENTS.find(a => a.id === course.agentId);
  
  return (
    <div className="group bg-[#020617] border border-white/5 rounded-[3.5rem] overflow-hidden transition-all duration-700 hover:border-indigo-500/40 hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col h-full relative">
      <div className="relative h-72 overflow-hidden">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-80 transition-all duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
        
        <div className="absolute top-8 left-8 flex flex-col gap-2">
            <div className="px-5 py-2 bg-black/80 backdrop-blur-xl rounded-full text-[9px] font-black text-white border border-white/10 shadow-2xl uppercase tracking-[0.2em]">
              {course.category}
            </div>
            {course.isHighTicket && (
              <div className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                ALTO VALOR
              </div>
            )}
        </div>

        <div className="absolute bottom-8 right-8">
           <div className={`px-5 py-2.5 backdrop-blur-3xl rounded-2xl border ${course.level === 'Certificación Titan' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'}`}>
             <span className="text-[10px] font-black uppercase tracking-widest italic">
               {course.level}
             </span>
           </div>
        </div>
      </div>

      <div className="p-10 space-y-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="relative">
                <img src={agent?.avatar} className="w-10 h-10 rounded-xl border border-white/10 object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-0.5 rounded-md border border-[#020617]">
                  <VerifiedIcon className="w-2.5 h-2.5 text-white" />
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{agent?.name}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{agent?.title}</span>
             </div>
          </div>
          <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{course.title}</h3>
        </div>

        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 italic">Impacto y Retorno (ROI)</p>
            <p className="text-xs text-gray-300 font-light leading-relaxed italic">"{course.roiEstimate}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
              <p className="text-lg font-black text-white tracking-tighter">{course.duration}</p>
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Intensidad</p>
           </div>
           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
              <p className="text-lg font-black text-white tracking-tighter">{course.enrolled}</p>
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Especialistas</p>
           </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
          <div className="flex flex-col">
             <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Satisfacción</span>
             <div className="flex items-center gap-1.5 text-amber-500">
               <StarIcon />
               <span className="text-sm font-black text-white">{course.rating}</span>
             </div>
          </div>
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3 group/btn"
          >
            Iniciar Capacitación
            <span className="text-lg group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademyPortal;
