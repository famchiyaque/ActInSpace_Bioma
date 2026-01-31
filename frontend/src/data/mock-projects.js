// Mock construction projects data for Mexican states
export const mockProjects = {
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
      description: 'Highway expansion project in northern Monterrey metropolitan area',
      imageUrl: 'https://images.unsplash.com/photo-1621544402532-c62fe9b9f996?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-100.35, 25.75],
            [-100.30, 25.75],
            [-100.30, 25.70],
            [-100.35, 25.70],
            [-100.35, 25.75]
          ]]
        },
        properties: {
          name: 'Highway Expansion - Monterrey Norte',
          compliance: 'warning'
        }
      },
      protectedZones: []
    },
    {
      id: 'proj-nl-002',
      name: 'Industrial Park Development',
      state: 'Nuevo León',
      stateCode: 'NL',
      status: 'finished',
      compliance: 'compliant',
      category: 'Desarrollo Urbano',
      company: 'Desarrollo Industrial del Norte',
      startDate: '2023-11-20',
      area: 180,
      description: 'New industrial park near Apodaca',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-100.20, 25.80],
            [-100.15, 25.80],
            [-100.15, 25.75],
            [-100.20, 25.75],
            [-100.20, 25.80]
          ]]
        },
        properties: {
          name: 'Industrial Park Development',
          compliance: 'compliant'
        }
      },
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
      description: 'Extension of Metro Line 12 through southern districts',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-99.15, 19.35],
            [-99.10, 19.35],
            [-99.10, 19.30],
            [-99.15, 19.30],
            [-99.15, 19.35]
          ]]
        },
        properties: {
          name: 'Metro Line Extension - Línea 12',
          compliance: 'violation'
        }
      },
      protectedZones: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-99.13, 19.33],
              [-99.11, 19.33],
              [-99.11, 19.31],
              [-99.13, 19.31],
              [-99.13, 19.33]
            ]]
          },
          properties: {
            name: 'Archaeological Zone',
            type: 'protected'
          }
        }
      ]
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
      description: 'High-rise residential development in Santa Fe',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-99.28, 19.38],
            [-99.25, 19.38],
            [-99.25, 19.35],
            [-99.28, 19.35],
            [-99.28, 19.38]
          ]]
        },
        properties: {
          name: 'Residential Complex - Santa Fe',
          compliance: 'compliant'
        }
      },
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
      description: 'Expansion of international airport facilities',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-103.35, 20.55],
            [-103.28, 20.55],
            [-103.28, 20.50],
            [-103.35, 20.50],
            [-103.35, 20.55]
          ]]
        },
        properties: {
          name: 'Airport Expansion - Guadalajara',
          compliance: 'warning'
        }
      },
      protectedZones: []
    },
    {
      id: 'proj-jal-002',
      name: 'Water Treatment Plant',
      state: 'Jalisco',
      stateCode: 'JAL',
      status: 'finished',
      compliance: 'compliant',
      category: 'Medio Ambiente',
      company: 'Servicios Ambientales de Jalisco',
      startDate: '2024-01-05',
      area: 95,
      description: 'New water treatment facility for metropolitan area',
      imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d42e3c95e1d?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-103.40, 20.65],
            [-103.37, 20.65],
            [-103.37, 20.62],
            [-103.40, 20.62],
            [-103.40, 20.65]
          ]]
        },
        properties: {
          name: 'Water Treatment Plant',
          compliance: 'compliant'
        }
      },
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
      description: 'Expansion of port facilities and container terminals',
      imageUrl: 'https://images.unsplash.com/photo-1605880329287-8f5e39bd04f8?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-96.15, 19.22],
            [-96.10, 19.22],
            [-96.10, 19.18],
            [-96.15, 19.18],
            [-96.15, 19.22]
          ]]
        },
        properties: {
          name: 'Port Expansion - Veracruz',
          compliance: 'violation'
        }
      },
      protectedZones: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-96.13, 19.21],
              [-96.11, 19.21],
              [-96.11, 19.19],
              [-96.13, 19.19],
              [-96.13, 19.21]
            ]]
          },
          properties: {
            name: 'Coastal Mangrove Reserve',
            type: 'protected'
          }
        }
      ]
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
      description: 'New eco-resort development near Tulum',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
      workZone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-87.50, 20.25],
            [-87.45, 20.25],
            [-87.45, 20.20],
            [-87.50, 20.20],
            [-87.50, 20.25]
          ]]
        },
        properties: {
          name: 'Tourist Resort Development - Tulum',
          compliance: 'warning'
        }
      },
      protectedZones: []
    }
  ]
};

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
