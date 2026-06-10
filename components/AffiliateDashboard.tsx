
import React, { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import StarIcon from './icons/StarIcon';

const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);

const AffiliateDashboard: React.FC = () => {
    const [isCopied, setIsCopied] = useState(false);
    const referralLink = 'https://autosocio.com/ref/PRO123XYZ';

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Ganancias por Lealtad" value="$354.20" description="Acumulado este año" />
                <StatCard title="Ganancias por Ventas" value="$1,289.50" description="Acumulado este año" />
                <StatCard title="Ganancias Totales" value="$1,643.70" description="Lealtad + Ventas" />
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Tu Enlace de Afiliado Único</h3>
                <p className="text-gray-400 mb-4 text-sm">
                    Comparte este enlace con colegas, en tus redes o en tu taller. Ganarás una comisión de hasta 10% en cada compra que se realice a través de él.
                </p>
                <div className="flex items-center gap-2">
                    <input type="text" readOnly value={referralLink} className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-3 text-cyan-300 font-mono text-sm" />
                    <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition">
                       <ClipboardIcon copied={isCopied} />
                        <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                         <div className="bg-cyan-900/50 p-2 rounded-full"><StarIcon /></div>
                        <h4 className="text-lg font-bold text-white">Gana 2% por Lealtad</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                       Como miembro Pro, recibes automáticamente un 2% de comisión en todas las piezas que compres para tu propia flota a través de nuestro buscador. Es nuestra forma de agradecer tu confianza y ayudarte a reducir costos operativos.
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                     <div className="flex items-center gap-3 mb-3">
                         <div className="bg-yellow-900/50 p-2 rounded-full"><MegaphoneIcon /></div>
                        <h4 className="text-lg font-bold text-white">Gana hasta 10% por Venta</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Conviértete en un socio de Autosocio. Utiliza tu enlace de afiliado para recomendar piezas a otros. Cuando compren, ganarás una comisión de hasta el 10% sobre el valor de la venta. Ideal para talleres, mecánicos y gestores de flotas influyentes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AffiliateDashboard;
