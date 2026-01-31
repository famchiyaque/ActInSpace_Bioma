// Mock construction projects data for Mexican states
import { generateSyntheticPolygon } from '../utils/polygonGenerator';

// Project definitions with center coordinates - covering all major regions of Mexico
const projectDefinitions = {
  'NL': [ // Nuevo León
    {
      id: 'proj-nl-001',
      name: 'Highway Expansion - Monterrey Norte',
      state: 'Nuevo León',
      stateCode: 'NL',
      status: 'active',
      compliance: 'warning',
      level: 'federal',
      category: 'Infraestructura',
      company: 'Constructora del Norte S.A.',
      startDate: '2024-01-15',
      area: 245,
      riskState: 'warning',
      vegetationLoss: 23,
      carbonFootprint: 1820,
      lastUpdated: '15 Ene 2025',
      regionDescription: 'El corredor norte de Monterrey combina áreas industriales y zonas residenciales en expansión.',
      companyDescription: 'Constructora del Norte S.A. opera proyectos viales en el noreste.',
      description: 'Highway expansion project in northern Monterrey metropolitan area',
      imageUrl: 'https://images.unsplash.com/photo-1621544402532-c62fe9b9f996?w=600',
      centerLng: -100.325,
      centerLat: 25.725,
      protectedZones: []
    },
    {
      id: 'proj-nl-002',
      name: 'Industrial Park Development - Apodaca',
      state: 'Nuevo León',
      stateCode: 'NL',
      status: 'finished',
      compliance: 'compliant',
      category: 'Desarrollo Urbano',
      company: 'Desarrollo Industrial del Norte',
      startDate: '2023-11-20',
      area: 180,
      riskState: 'compliant',
      vegetationLoss: 8,
      carbonFootprint: 740,
      lastUpdated: '02 Dic 2024',
      regionDescription: 'Zona periurbana de Apodaca con crecimiento industrial acelerado.',
      companyDescription: 'Desarrollo Industrial del Norte impulsa parques industriales.',
      description: 'New industrial park near Apodaca',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      centerLng: -100.175,
      centerLat: 25.775,
      protectedZones: []
    }
  ],
  'CDMX': [ // Ciudad de México
    {
      id: 'proj-cdmx-001',
      name: 'Metro Line Extension - Línea 12',
      state: 'Ciudad de México',
      stateCode: 'CDMX',
      status: 'active',
      compliance: 'violation',
      level: 'federal',
      category: 'Transporte',
      company: 'Metro CDMX Construcciones',
      startDate: '2024-03-01',
      area: 320,
      riskState: 'violation',
      vegetationLoss: 45,
      carbonFootprint: 2650,
      lastUpdated: '20 Ene 2025',
      regionDescription: 'El sur de la ciudad concentra zonas arqueológicas y suelos de conservación.',
      companyDescription: 'Metro CDMX Construcciones ejecuta obras de transporte masivo.',
      description: 'Extension of Metro Line 12 through southern districts',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      centerLng: -99.125,
      centerLat: 19.325,
      protectedZones: []
    },
    {
      id: 'proj-cdmx-002',
      name: 'Residential Complex - Santa Fe',
      state: 'Ciudad de México',
      stateCode: 'CDMX',
      status: 'finished',
      compliance: 'compliant',
      category: 'Desarrollo Urbano',
      company: 'Desarrollos Urbanos SA',
      startDate: '2024-02-10',
      area: 150,
      riskState: 'compliant',
      vegetationLoss: 12,
      carbonFootprint: 980,
      lastUpdated: '28 Dic 2024',
      regionDescription: 'Santa Fe es un polo urbano con presión sobre barrancas y áreas verdes.',
      companyDescription: 'Desarrollos Urbanos SA se especializa en proyectos residenciales.',
      description: 'High-rise residential development in Santa Fe',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
      centerLng: -99.265,
      centerLat: 19.365,
      protectedZones: []
    }
  ],
  'JAL': [ // Jalisco
    {
      id: 'proj-jal-001',
      name: 'Airport Expansion - Guadalajara',
      state: 'Jalisco',
      stateCode: 'JAL',
      status: 'active',
      compliance: 'warning',
      level: 'federal',
      category: 'Transporte',
      company: 'Aeropuertos y Servicios',
      startDate: '2023-09-15',
      area: 580,
      riskState: 'warning',
      vegetationLoss: 30,
      carbonFootprint: 2100,
      lastUpdated: '09 Ene 2025',
      regionDescription: 'La zona aeroportuaria de Guadalajara combina áreas logísticas y agrícolas.',
      companyDescription: 'Aeropuertos y Servicios desarrolla infraestructura aeroportuaria.',
      description: 'Expansion of international airport facilities',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600',
      centerLng: -103.315,
      centerLat: 20.525,
      protectedZones: []
    },
    {
      id: 'proj-jal-002',
      name: 'Water Treatment Plant - Tlajomulco',
      state: 'Jalisco',
      stateCode: 'JAL',
      status: 'finished',
      compliance: 'compliant',
      category: 'Medio Ambiente',
      company: 'Servicios Ambientales de Jalisco',
      startDate: '2024-01-05',
      area: 95,
      riskState: 'compliant',
      vegetationLoss: 6,
      carbonFootprint: 520,
      lastUpdated: '18 Dic 2024',
      regionDescription: 'Área metropolitana con retos de calidad de agua.',
      companyDescription: 'Servicios Ambientales de Jalisco ejecuta proyectos de tratamiento.',
      description: 'New water treatment facility for metropolitan area',
      imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d42e3c95e1d?w=600',
      centerLng: -103.385,
      centerLat: 20.635,
      protectedZones: []
    }
  ],
  'VER': [ // Veracruz
    {
      id: 'proj-ver-001',
      name: 'Port Expansion - Veracruz',
      state: 'Veracruz',
      stateCode: 'VER',
      status: 'active',
      compliance: 'violation',
      level: 'federal',
      category: 'Infraestructura',
      company: 'Puerto de Veracruz SA',
      startDate: '2023-10-20',
      area: 420,
      riskState: 'violation',
      vegetationLoss: 52,
      carbonFootprint: 3100,
      lastUpdated: '12 Ene 2025',
      regionDescription: 'La costa de Veracruz presenta manglares y humedales críticos.',
      companyDescription: 'Puerto de Veracruz SA opera expansión portuaria.',
      description: 'Expansion of port facilities and container terminals',
      imageUrl: 'https://images.unsplash.com/photo-1605880329287-8f5e39bd04f8?w=600',
      centerLng: -96.125,
      centerLat: 19.20,
      protectedZones: []
    }
  ],
  'QROO': [ // Quintana Roo
    {
      id: 'proj-qroo-001',
      name: 'Tourist Resort Development - Tulum',
      state: 'Quintana Roo',
      stateCode: 'QROO',
      status: 'active',
      compliance: 'warning',
      level: 'municipal',
      category: 'Turismo',
      company: 'Desarrollos Turísticos del Caribe',
      startDate: '2024-02-01',
      area: 280,
      riskState: 'warning',
      vegetationLoss: 27,
      carbonFootprint: 1650,
      lastUpdated: '22 Ene 2025',
      regionDescription: 'Tulum concentra selva baja y cenotes con fuerte presión turística.',
      companyDescription: 'Desarrollos Turísticos del Caribe construye complejos turísticos.',
      description: 'New eco-resort development near Tulum',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
      centerLng: -87.475,
      centerLat: 20.225,
      protectedZones: []
    },
    {
      id: 'proj-qroo-002',
      name: 'Tren Maya - Tramo Cancún-Tulum',
      state: 'Quintana Roo',
      stateCode: 'QROO',
      status: 'active',
      compliance: 'violation',
      level: 'federal',
      category: 'Transporte',
      company: 'FONATUR',
      startDate: '2023-06-15',
      area: 850,
      riskState: 'violation',
      vegetationLoss: 120,
      carbonFootprint: 5200,
      lastUpdated: '28 Ene 2025',
      regionDescription: 'Selva maya con alta biodiversidad y zonas arqueológicas.',
      companyDescription: 'FONATUR desarrolla el proyecto Tren Maya.',
      description: 'Section of Tren Maya railway project',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600',
      centerLng: -87.125,
      centerLat: 20.50,
      protectedZones: []
    }
  ],
  'YUC': [ // Yucatán
    {
      id: 'proj-yuc-001',
      name: 'Tren Maya - Estación Mérida',
      state: 'Yucatán',
      stateCode: 'YUC',
      status: 'active',
      compliance: 'warning',
      level: 'federal',
      category: 'Transporte',
      company: 'FONATUR',
      startDate: '2023-08-01',
      area: 320,
      riskState: 'warning',
      vegetationLoss: 35,
      carbonFootprint: 2100,
      lastUpdated: '25 Ene 2025',
      regionDescription: 'Zona de cenotes y vestigios mayas en la periferia de Mérida.',
      companyDescription: 'FONATUR desarrolla infraestructura ferroviaria turística.',
      description: 'Mérida main station for Tren Maya',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      centerLng: -89.625,
      centerLat: 20.975,
      protectedZones: []
    }
  ],
  'CHI': [ // Chihuahua
    {
      id: 'proj-chi-001',
      name: 'Wind Farm - Chihuahua Desert',
      state: 'Chihuahua',
      stateCode: 'CHI',
      status: 'active',
      compliance: 'compliant',
      level: 'federal',
      category: 'Medio Ambiente',
      company: 'Energía Renovable del Norte',
      startDate: '2024-04-01',
      area: 450,
      riskState: 'compliant',
      vegetationLoss: 5,
      carbonFootprint: -1200,
      lastUpdated: '20 Ene 2025',
      regionDescription: 'Desierto de Chihuahua con alto potencial eólico.',
      companyDescription: 'Energía Renovable del Norte desarrolla proyectos de energía limpia.',
      description: 'Large-scale wind energy project',
      imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600',
      centerLng: -106.125,
      centerLat: 28.635,
      protectedZones: []
    }
  ],
  'SON': [ // Sonora
    {
      id: 'proj-son-001',
      name: 'Solar Park - Hermosillo',
      state: 'Sonora',
      stateCode: 'SON',
      status: 'finished',
      compliance: 'compliant',
      level: 'federal',
      category: 'Medio Ambiente',
      company: 'Solar del Pacífico',
      startDate: '2023-07-01',
      area: 380,
      riskState: 'compliant',
      vegetationLoss: 3,
      carbonFootprint: -2500,
      lastUpdated: '15 Dic 2024',
      regionDescription: 'Desierto de Sonora con máxima radiación solar.',
      companyDescription: 'Solar del Pacífico desarrolla parques solares a gran escala.',
      description: 'Large photovoltaic solar park',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
      centerLng: -110.975,
      centerLat: 29.125,
      protectedZones: []
    }
  ],
  'BC': [ // Baja California
    {
      id: 'proj-bc-001',
      name: 'Desalination Plant - Tijuana',
      state: 'Baja California',
      stateCode: 'BC',
      status: 'active',
      compliance: 'warning',
      level: 'federal',
      category: 'Infraestructura',
      company: 'Agua de Baja California',
      startDate: '2024-01-20',
      area: 85,
      riskState: 'warning',
      vegetationLoss: 8,
      carbonFootprint: 950,
      lastUpdated: '18 Ene 2025',
      regionDescription: 'Costa del Pacífico con escasez de agua potable.',
      companyDescription: 'Agua de Baja California opera plantas de desalinización.',
      description: 'Seawater desalination plant for Tijuana',
      imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d42e3c95e1d?w=600',
      centerLng: -117.025,
      centerLat: 32.525,
      protectedZones: []
    }
  ],
  'OAX': [ // Oaxaca
    {
      id: 'proj-oax-001',
      name: 'Wind Farm - Istmo de Tehuantepec',
      state: 'Oaxaca',
      stateCode: 'OAX',
      status: 'active',
      compliance: 'violation',
      level: 'federal',
      category: 'Medio Ambiente',
      company: 'Eólica del Sur',
      startDate: '2023-05-15',
      area: 720,
      riskState: 'violation',
      vegetationLoss: 65,
      carbonFootprint: -800,
      lastUpdated: '22 Ene 2025',
      regionDescription: 'Corredor eólico del Istmo con comunidades indígenas.',
      companyDescription: 'Eólica del Sur desarrolla proyectos en el corredor eólico.',
      description: 'Large wind energy project in Isthmus region',
      imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600',
      centerLng: -95.025,
      centerLat: 16.425,
      protectedZones: []
    }
  ],
  'CHIS': [ // Chiapas
    {
      id: 'proj-chis-001',
      name: 'Hydroelectric Dam - Chicoasén II',
      state: 'Chiapas',
      stateCode: 'CHIS',
      status: 'active',
      compliance: 'warning',
      level: 'federal',
      category: 'Infraestructura',
      company: 'CFE',
      startDate: '2023-09-01',
      area: 560,
      riskState: 'warning',
      vegetationLoss: 85,
      carbonFootprint: 1200,
      lastUpdated: '19 Ene 2025',
      regionDescription: 'Cañón del Sumidero con alta biodiversidad.',
      companyDescription: 'CFE opera infraestructura hidroeléctrica nacional.',
      description: 'Expansion of Chicoasén hydroelectric complex',
      imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600',
      centerLng: -93.125,
      centerLat: 16.925,
      protectedZones: []
    }
  ],
  'TAB': [ // Tabasco
    {
      id: 'proj-tab-001',
      name: 'Refinería Dos Bocas',
      state: 'Tabasco',
      stateCode: 'TAB',
      status: 'active',
      compliance: 'violation',
      level: 'federal',
      category: 'Infraestructura',
      company: 'PEMEX',
      startDate: '2023-01-01',
      area: 680,
      riskState: 'violation',
      vegetationLoss: 150,
      carbonFootprint: 8500,
      lastUpdated: '26 Ene 2025',
      regionDescription: 'Costa de Tabasco con humedales y manglares.',
      companyDescription: 'PEMEX opera la nueva refinería Olmeca.',
      description: 'New oil refinery in Dos Bocas',
      imageUrl: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600',
      centerLng: -93.225,
      centerLat: 18.425,
      protectedZones: []
    }
  ],
  'SIN': [ // Sinaloa
    {
      id: 'proj-sin-001',
      name: 'Puerto Comercial - Mazatlán',
      state: 'Sinaloa',
      stateCode: 'SIN',
      status: 'active',
      compliance: 'warning',
      level: 'federal',
      category: 'Infraestructura',
      company: 'API Mazatlán',
      startDate: '2024-02-15',
      area: 195,
      riskState: 'warning',
      vegetationLoss: 22,
      carbonFootprint: 1850,
      lastUpdated: '20 Ene 2025',
      regionDescription: 'Costa del Pacífico con ecosistemas marinos.',
      companyDescription: 'API Mazatlán administra el puerto comercial.',
      description: 'Commercial port expansion project',
      imageUrl: 'https://images.unsplash.com/photo-1605880329287-8f5e39bd04f8?w=600',
      centerLng: -106.425,
      centerLat: 23.225,
      protectedZones: []
    }
  ],
  'PUE': [ // Puebla
    {
      id: 'proj-pue-001',
      name: 'Automotive Factory - Volkswagen Expansion',
      state: 'Puebla',
      stateCode: 'PUE',
      status: 'finished',
      compliance: 'compliant',
      level: 'federal',
      category: 'Desarrollo Urbano',
      company: 'Volkswagen de México',
      startDate: '2023-06-01',
      area: 125,
      riskState: 'compliant',
      vegetationLoss: 8,
      carbonFootprint: 620,
      lastUpdated: '10 Dic 2024',
      regionDescription: 'Zona industrial de Puebla con vocación automotriz.',
      companyDescription: 'Volkswagen de México produce vehículos para Norteamérica.',
      description: 'Factory expansion for electric vehicle production',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      centerLng: -98.225,
      centerLat: 19.025,
      protectedZones: []
    }
  ],
  'GRO': [ // Guerrero
    {
      id: 'proj-gro-001',
      name: 'Hotel Zone - Acapulco Diamante',
      state: 'Guerrero',
      stateCode: 'GRO',
      status: 'active',
      compliance: 'warning',
      level: 'municipal',
      category: 'Turismo',
      company: 'Desarrollos Acapulco',
      startDate: '2024-03-01',
      area: 145,
      riskState: 'warning',
      vegetationLoss: 18,
      carbonFootprint: 920,
      lastUpdated: '15 Ene 2025',
      regionDescription: 'Costa del Pacífico con ecosistemas costeros frágiles.',
      companyDescription: 'Desarrollos Acapulco reconstruye la zona hotelera.',
      description: 'Post-hurricane hotel reconstruction project',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
      centerLng: -99.875,
      centerLat: 16.825,
      protectedZones: []
    }
  ]
};

// Generate workZone for each project using synthetic polygons
function buildProjectWithWorkZone(projectDef) {
  const workZone = generateSyntheticPolygon(
    projectDef.id,
    projectDef.centerLng,
    projectDef.centerLat,
    projectDef.area
  );
  
  // Add properties to workZone
  workZone.properties = {
    name: projectDef.name,
    compliance: projectDef.compliance
  };
  
  return {
    ...projectDef,
    workZone,
    hasCoordinates: true, // Flag for MexicoMap compatibility
    hasGeometry: true
  };
}

// Build the mock projects with synthetic polygons
export const mockProjects = Object.fromEntries(
  Object.entries(projectDefinitions).map(([stateCode, projects]) => [
    stateCode,
    projects.map(buildProjectWithWorkZone)
  ])
);

// Helper function to get projects by state code
export const getProjectsByState = (stateCode) => {
  return mockProjects[stateCode] || [];
};

// Helper function to get project counts by state
export const getStateProjectSummary = (stateCode) => {
  const projects = getProjectsByState(stateCode);
  const activeCount = projects.filter(project => project.status === 'active').length;
  const finishedCount = projects.filter(project => project.status === 'finished').length;
  return {
    activeCount,
    finishedCount,
    total: projects.length
  };
};

// Helper function to get all projects
export const getAllProjects = () => {
  return Object.values(mockProjects).flat();
};

// Helper function to get project by ID
export const getProjectById = (projectId) => {
  const allProjects = getAllProjects();
  return allProjects.find(project => project.id === projectId);
};
