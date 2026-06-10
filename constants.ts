
import type { Agent, Mentorship, AcademyCourse, Language } from './types';

export interface MarketplacePlatform {
  name: string;
  baseUrl: string;
  searchParam: string;
  color: string;
}

export const REGIONAL_PLATFORMS: Record<Language, MarketplacePlatform[]> = {
  es: [
    { name: 'Mercado Libre', baseUrl: 'https://listado.mercadolibre.com.mx/', searchParam: '', color: 'bg-yellow-400 text-black' },
    { name: 'Amazon MX', baseUrl: 'https://www.amazon.com.mx/s?k=', searchParam: '', color: 'bg-white text-black' },
    { name: 'NativoZone', baseUrl: 'https://www.autozone.com.mx/searchresult?searchText=', searchParam: '', color: 'bg-orange-600 text-white' }
  ],
  en: [
    { name: 'eBay Motors', baseUrl: 'https://www.ebay.com/sch/i.html?_nkw=', searchParam: '', color: 'bg-blue-600 text-white' },
    { name: 'RockAuto', baseUrl: 'https://www.rockauto.com/en/partsearch/?partname=', searchParam: '', color: 'bg-red-700 text-white' },
    { name: 'Amazon US', baseUrl: 'https://www.amazon.com/s?k=', searchParam: '', color: 'bg-white text-black' }
  ],
  pt: [
    { name: 'Mercado Livre BR', baseUrl: 'https://lista.mercadolivre.com.br/', searchParam: '', color: 'bg-yellow-400 text-black' },
    { name: 'AutoZ', baseUrl: 'https://www.autoz.com.br/busca?q=', searchParam: '', color: 'bg-blue-800 text-white' },
    { name: 'Amazon BR', baseUrl: 'https://www.amazon.com.br/s?k=', searchParam: '', color: 'bg-white text-black' }
  ],
  fr: [
    { name: 'Oscaro', baseUrl: 'https://www.oscaro.com/search?q=', searchParam: '', color: 'bg-blue-600 text-white' },
    { name: 'Cdiscount', baseUrl: 'https://www.cdiscount.com/search/10/', searchParam: '.html?NavigationSearch=true&kwd=', color: 'bg-orange-500 text-white' },
    { name: 'Amazon FR', baseUrl: 'https://www.amazon.fr/s?k=', searchParam: '', color: 'bg-white text-black' }
  ],
  de: [
    { name: 'AutoDoc', baseUrl: 'https://www.autodoc.de/search?keyword=', searchParam: '', color: 'bg-yellow-500 text-black' },
    { name: 'eBay DE', baseUrl: 'https://www.ebay.de/sch/i.html?_nkw=', searchParam: '', color: 'bg-blue-600 text-white' },
    { name: 'Amazon DE', baseUrl: 'https://www.amazon.de/s?k=', searchParam: '', color: 'bg-white text-black' }
  ],
  zh: [
    { name: 'AliExpress', baseUrl: 'https://www.aliexpress.com/wholesale?SearchText=', searchParam: '', color: 'bg-orange-600 text-white' },
    { name: 'Tmall', baseUrl: 'https://list.tmall.com/search_product.htm?q=', searchParam: '', color: 'bg-red-600 text-white' },
    { name: 'JD.com', baseUrl: 'https://search.jd.com/Search?keyword=', searchParam: '', color: 'bg-red-700 text-white' }
  ],
  ja: [
    { name: 'Rakuten', baseUrl: 'https://search.rakuten.co.jp/search/mall/', searchParam: '/', color: 'bg-red-600 text-white' },
    { name: 'Yahoo Auctions', baseUrl: 'https://auctions.yahoo.co.jp/search/search?p=', searchParam: '', color: 'bg-red-500 text-white' },
    { name: 'Amazon JP', baseUrl: 'https://www.amazon.co.jp/s?k=', searchParam: '', color: 'bg-white text-black' }
  ]
};

export const UI_LABELS: Record<string, any> = {
  es: {
    nav: { marketplace: 'ADN Piezas', experts: 'Expertos', courses: 'Cursos' },
    marketplace: {
      title: 'Marketplace',
      subtitle: 'ADN',
      search_active: 'Búsqueda Profunda:',
      fields: { make: 'Marca', model: 'Modelo', year: 'Año', part: 'Pieza Requerida' },
      btn_search: 'EJECUTAR BÚSQUEDA ADN',
      btn_scan: 'ESCANEAR',
      filter_title: 'Filtro de Precisión',
      filter_desc: 'Analizando fuentes directas y validando stock forense.',
    },
    agent_card: {
      btn_start: 'Iniciar Mando Pro',
      protocol: 'Protocolo de seguridad activo'
    },
    modal: {
      btn_call: 'Iniciar Llamada',
      btn_call_sub: 'Voz y Visión 1-a-1',
      placeholder: 'Redacte su consulta o inicie llamada...',
      sync: 'Sincronización'
    }
  },
  en: {
    nav: { marketplace: 'DNA Parts', experts: 'Experts', courses: 'Courses' },
    marketplace: {
      title: 'Marketplace',
      subtitle: 'DNA',
      search_active: 'Deep Search:',
      fields: { make: 'Make', model: 'Model', year: 'Year', part: 'Required Part' },
      btn_search: 'RUN DNA SEARCH',
      btn_scan: 'SCAN',
      filter_title: 'Precision Filter',
      filter_desc: 'Analyzing direct sources and validating forensic stock.',
    },
    agent_card: {
      btn_start: 'Start Command Pro',
      protocol: 'Security protocol active'
    },
    modal: {
      btn_call: 'Start Call',
      btn_call_sub: 'Voice & Vision 1-on-1',
      placeholder: 'Type query or start call...',
      sync: 'Synchronization'
    }
  },
  fr: {
    nav: { marketplace: 'Pièces ADN', experts: 'Experts', courses: 'Cours' },
    marketplace: {
      title: 'Marketplace',
      subtitle: 'ADN',
      search_active: 'Recherche Profonde:',
      fields: { make: 'Marque', model: 'Modèle', year: 'Année', part: 'Pièce Requise' },
      btn_search: 'LANCER RECHERCHE ADN',
      btn_scan: 'SCANNER',
      filter_title: 'Filtre de Précision',
      filter_desc: 'Analyse des sources directes et validation du stock.',
    },
    agent_card: {
      btn_start: 'Lancer Commande Pro',
      protocol: 'Protocole de sécurité actif'
    },
    modal: {
      btn_call: 'Lancer Appel',
      btn_call_sub: 'Voix & Vision 1-à-1',
      placeholder: 'Rédigez ou appelez...',
      sync: 'Synchronisation'
    }
  },
  pt: {
    nav: { marketplace: 'Peças DNA', experts: 'Especialistas', courses: 'Cursos' },
    marketplace: {
      title: 'Marketplace',
      subtitle: 'DNA',
      search_active: 'Busca Profunda:',
      fields: { make: 'Marca', model: 'Modelo', year: 'Ano', part: 'Peça Necessária' },
      btn_search: 'EXECUTAR BUSCA DNA',
      btn_scan: 'ESCANEAR',
      filter_title: 'Filtro de Precisão',
      filter_desc: 'Analisando fontes diretas e validando estoque forense.',
    },
    agent_card: {
      btn_start: 'Iniciar Comando Pro',
      protocol: 'Protocolo de segurança ativo'
    },
    modal: {
      btn_call: 'Iniciar Chamada',
      btn_call_sub: 'Voz e Visão 1-a-1',
      placeholder: 'Digite ou inicie chamada...',
      sync: 'Sincronização'
    }
  },
  de: {
     nav: { marketplace: 'DNA Teile', experts: 'Experten', courses: 'Kurse' },
     marketplace: {
        title: 'Marktplatz',
        subtitle: 'DNA',
        search_active: 'Tiefensuche:',
        fields: { make: 'Marke', model: 'Modell', year: 'Jahr', part: 'Benötigtes Teil' },
        btn_search: 'DNA-SUCHE AUSFÜHREN',
        btn_scan: 'SCANNEN',
        filter_title: 'Präzisionsfilter',
        filter_desc: 'Analyse direkter Quellen und Validierung des forensischen Bestands.',
      },
      agent_card: {
        btn_start: 'Kommando Pro starten',
        protocol: 'Sicherheitsprotokoll aktiv'
      },
      modal: {
        btn_call: 'Anruf starten',
        btn_call_sub: 'Stimme & Vision 1-zu-1',
        placeholder: 'Geben Sie Ihre Anfrage ein oder starten Sie einen Anruf...',
        sync: 'Synchronisierung'
      }
  }
};

export const getLabels = (lang: Language) => {
    // Default to 'es' if lang not found, or 'en' as fallback
    return UI_LABELS[lang] || UI_LABELS['es'];
};

export const SUPPORTED_LANGUAGES: { code: Language, label: string, flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇲🇽' },
  { code: 'en', label: 'English (US)', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文 (China)', flag: '🇨🇳' },
  { code: 'ja', label: '日本語 (Japan)', flag: '🇯🇵' },
];

const generateMentorships = (category: string): Mentorship[] => [
  { id: `m1-${category}`, title: `Fundamentos ${category}`, description: 'Principios técnicos y normativa OEM.', isFree: true, level: 1, duration: '4h' },
  { id: `m2-${category}`, title: `Diagnóstico Avanzado`, description: 'Detección de fallas complejas.', isFree: true, level: 2, duration: '6h' },
  { id: `m3-${category}`, title: `Certificación Master`, description: 'Aval técnico industrial.', isFree: false, price: 1200, level: 7, duration: '40h' },
];

export const AGENTS: Agent[] = [
  {
    id: 100,
    name: 'Ing. Roberto',
    title: 'Área Automotriz Integral',
    description: 'Consultoría técnica global e ingeniería de planta.',
    indication: "Analizando sistemas integrales. Perspectiva de ingeniería automotriz.",
    prompt: "Eres el ING. ROBERTO. Ingeniero automotriz senior. Tu enfoque es el vehículo como un sistema integral. Respondes dudas sobre arquitectura, diseño y funcionamiento global.",
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    expertise: ['Ingeniería Automotriz', 'Arquitectura Vehicular', 'Sistemas Globales'],
    mentorships: generateMentorships('Ingeniería Automotriz'),
    communitySize: 15000,
    reputation: { rating: 5.0, reviewCount: 8900, successRate: 100, status: 'Elite' }
  },
  {
    id: 101,
    name: 'Carlos Tactical',
    title: 'Mecánica General',
    description: 'Diagnóstico de motor, transmisión y sistemas mecánicos.',
    indication: "Auditoría de motor activa. Diagnóstico forense mecánico.",
    prompt: "Eres CARLOS TACTICAL. Experto en Mecánica General. Te enfocas en motor, transmisión, suspensión y frenos. Tu tono es directo y técnico.",
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200',
    expertise: ['Motor', 'Transmisión', 'Suspensión', 'Frenos'],
    mentorships: generateMentorships('Mecánica General'),
    communitySize: 12500,
    reputation: { rating: 4.9, reviewCount: 7500, successRate: 99, status: 'Maestro del Mes' }
  },
  {
    id: 102,
    name: 'Mtra. Carla',
    title: 'Pintura Automotriz',
    description: 'Acabados, igualación de color y restauración de carrocería.',
    indication: "Auditando capas de pintura y acabados. Estética industrial.",
    prompt: "Eres CARLA. Experta en Pintura y Carrocería. Enseñas sobre preparación de superficies, códigos de color y técnicas de aplicación.",
    avatar: 'https://i.pravatar.cc/150?img=47',
    expertise: ['Pintura', 'Hojalatería', 'Detailing'],
    mentorships: generateMentorships('Pintura Automotriz'),
    communitySize: 9800,
    reputation: { rating: 4.9, reviewCount: 5200, successRate: 98, status: 'Elite' }
  },
  {
    id: 103,
    name: 'Ing. Electro',
    title: 'Electrónica',
    description: 'Módulos de control, cableado y sistemas de confort.',
    indication: "Rastreando continuidad y señales lógicas. Diagnóstico electrónico.",
    prompt: "Eres EL ING. ELECTRO. Especialista en electrónica automotriz pura. ECUs, BCMs, redes de comunicación y diagramas eléctricos.",
    avatar: 'https://i.pravatar.cc/150?img=12',
    expertise: ['ECU', 'Diagramas', 'Redes CAN'],
    mentorships: generateMentorships('Electrónica'),
    communitySize: 8400,
    reputation: { rating: 5.0, reviewCount: 4100, successRate: 100, status: 'Cero Errores' }
  },
  {
    id: 104,
    name: 'Dr. Sensor',
    title: 'Sensores',
    description: 'Diagnóstico de sensores (O2, MAF, ABS) y actuadores.',
    indication: "Interpretando voltajes y oscilogramas. Análisis de sensores.",
    prompt: "Eres el DR. SENSOR. Tu especialidad es única: Sensores y Actuadores. Sabes todo sobre CKP, CMP, MAF, MAP, O2 y cómo probarlos con osciloscopio.",
    avatar: 'https://i.pravatar.cc/150?img=52',
    expertise: ['Sensores', 'Osciloscopio', 'Actuadores'],
    mentorships: generateMentorships('Diagnóstico de Sensores'),
    communitySize: 7600,
    reputation: { rating: 4.8, reviewCount: 3800, successRate: 97, status: 'Referente' }
  },
  {
    id: 105,
    name: 'Dr. Sebastian',
    title: 'Autos Híbridos y Eléctricos',
    description: 'Baterías de alta tensión, inversores y motores eléctricos.',
    indication: "Protocolo de Alta Tensión activo. Seguridad EV.",
    prompt: "Eres SEBASTIAN. Experto en movilidad eléctrica. Híbridos y EVs. Tu prioridad es la seguridad en alta tensión y diagnóstico de baterías.",
    avatar: 'https://i.pravatar.cc/150?img=68',
    expertise: ['Baterías HV', 'Inversores', 'Motores Eléctricos'],
    mentorships: generateMentorships('Vehículos Eléctricos'),
    communitySize: 6200,
    reputation: { rating: 5.0, reviewCount: 2900, successRate: 100, status: 'Elite' }
  },
  {
    id: 106,
    name: 'Capitán Diesel',
    title: 'Camiones Pesados',
    description: 'Diesel Heavy Duty, sistemas neumáticos y carga.',
    indication: "Analizando inyección diesel y sistemas neumáticos. Heavy Duty.",
    prompt: "Eres el CAPITÁN DIESEL. Especialista en tractocamiones y equipo pesado. Motores diesel grandes, frenos de aire y transmisiones de carga.",
    avatar: 'https://i.pravatar.cc/150?img=33',
    expertise: ['Diesel', 'Neumática', 'Heavy Duty'],
    mentorships: generateMentorships('Heavy Duty'),
    communitySize: 11000,
    reputation: { rating: 4.9, reviewCount: 6100, successRate: 99, status: 'Maestro del Mes' }
  }
];

export const ACADEMY_COURSES: AcademyCourse[] = [
  { id: 'c-1', agentId: 101, title: 'Diagnóstico Forense de Motor', duration: '120h', level: 'Certificación Titan', category: 'Mecánica General', enrolled: 1200, rating: 5.0, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Reducción de garantías en un 40%.', isHighTicket: true },
  { id: 'c-2', agentId: 102, title: 'Colorimetría y Acabados Premium', duration: '80h', level: 'Avanzado', category: 'Pintura', enrolled: 800, rating: 4.9, image: 'https://images.unsplash.com/photo-1595152230535-0201948408f6?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Incremento del valor estético.', isHighTicket: true },
  { id: 'c-3', agentId: 103, title: 'Lectura de Diagramas y Redes CAN', duration: '100h', level: 'Avanzado', category: 'Electrónica', enrolled: 950, rating: 5.0, image: 'https://images.unsplash.com/photo-1517420812314-8b17179f59f8?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Diagnósticos electrónicos en minutos.', isHighTicket: true },
  { id: 'c-4', agentId: 104, title: 'Master en Sensores y Osciloscopio', duration: '60h', level: 'Intermedio', category: 'Sensores', enrolled: 1500, rating: 4.8, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Cero cambios de piezas innecesarios.', isHighTicket: false },
  { id: 'c-5', agentId: 105, title: 'Certificación Seguridad Alta Tensión', duration: '150h', level: 'Certificación Titan', category: 'EV & Híbridos', enrolled: 450, rating: 5.0, image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Acceso a mercado de alta rentabilidad.', isHighTicket: true },
  { id: 'c-6', agentId: 106, title: 'Sistemas Neumáticos y Diesel HD', duration: '90h', level: 'Avanzado', category: 'Heavy Duty', enrolled: 1100, rating: 4.9, image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Mantenimiento preventivo de flotas.', isHighTicket: true },
  { id: 'c-7', agentId: 100, title: 'Ingeniería de Planta para Talleres', duration: '40h', level: 'Básico', category: 'Ingeniería', enrolled: 2000, rating: 4.7, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800', roiEstimate: 'Estandarización de procesos.', isHighTicket: false }
];

export const PARTS_CATALOG = [
  {
    id: 'titan-scanner-01',
    name: 'Ecosistema de Mando AutoSocio',
    description: 'Suscripción anual a la infraestructura de inteligencia comercial.',
    imageUrl: 'https://images.unsplash.com/photo-1595152230535-0201948408f6?auto=format&fit=crop&q=80&w=400',
    affiliateUrl: '#',
    loyaltyCommissionRate: 5,
    salesCommissionRate: 15,
    keywords: ['Suscripción', 'IA', 'Ventas'],
    compatibility: ['Empresas', 'Talleres'],
    price: 15000.00,
    stock: 999
  }
];
