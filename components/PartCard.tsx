
import React from 'react';
import type { Part } from '../types';
import VerifiedIcon from './icons/VerifiedIcon';
import StarIcon from './icons/StarIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';

interface PartCardProps {
  part: Part;
}

const PartCard: React.FC<PartCardProps> = ({ part }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col transition-shadow hover:shadow-lg hover:shadow-cyan-500/10">
      <img className="h-40 w-full object-cover" src={part.imageUrl} alt={part.name} />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-white">{part.name}</h3>
        <p className="text-xs text-gray-400 mt-2 flex-grow">
            <span className="font-semibold text-gray-300">Compatible con:</span> {part.compatibility.join(', ')}
        </p>
        <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/50 rounded-full px-3 py-1 w-fit">
                <VerifiedIcon />
                <span>Proveedor Verificado</span>
            </div>
             <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-900/50 rounded-full px-3 py-1 w-fit">
                <StarIcon />
                <span><span className="font-bold">{part.loyaltyCommissionRate}%</span> Recompensa por Lealtad</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/50 rounded-full px-3 py-1 w-fit">
                <MegaphoneIcon />
                <span><span className="font-bold">{part.salesCommissionRate}%</span> Comisión por Venta</span>
            </div>
        </div>
      </div>
       <div className="p-4 bg-gray-900/50 border-t border-gray-700">
         <a 
            href={part.affiliateUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full block text-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition"
        >
            Ver en Proveedor Verificado
        </a>
       </div>
    </div>
  );
};

export default PartCard;
