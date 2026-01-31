import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAllProjects } from '../../data/mock-projects';

// Set your Mapbox token here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYmlvbWEtbWFwIiwiYSI6ImNtNWRlZjBkZjBhcWYya3M3NzVhZDJhZWYifQ.placeholder';

// Mexico bounds
const MEXICO_BOUNDS = [
  [-118.4, 14.5], // Southwest coordinates
  [-86.7, 32.7]   // Northeast coordinates
];

const MexicoMap = ({ onProjectSelect, selectedProject, onProjectClose }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    federal: true,
    state: true,
    municipal: true,
    green: true,
    yellow: true,
    red: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const markersRef = useRef([]);

  // Get all projects
  const allProjects = getAllProjects();

  // Filter projects based on search and filters
  const filteredProjects = allProjects.filter(project => {
    // Search filter
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Level filter
    const levelKey = project.level || 'state'; // default to state if not specified
    if (!filters[levelKey]) {
      return false;
    }
    
    // Status filter
    const statusKey = project.compliance === 'compliant' ? 'green' : 
                      project.compliance === 'warning' ? 'yellow' : 'red';
    if (!filters[statusKey]) {
      return false;
    }
    
    return true;
  });

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-102.5528, 23.6345], // Center of Mexico
      zoom: 5,
      maxBounds: MEXICO_BOUNDS, // Restrict panning to Mexico
      minZoom: 4.5,
      maxZoom: 18
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when filtered projects change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for filtered projects
    filteredProjects.forEach(project => {
      // Get center of work zone
      const coords = project.workZone.geometry.coordinates[0];
      const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
      const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';
      
      // Set shape based on level
      const level = project.level || 'state';
      if (level === 'federal') {
        // Square
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.background = getStatusColor(project.compliance);
        el.style.borderRadius = '2px';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      } else if (level === 'municipal') {
        // Triangle
        el.style.width = '0';
        el.style.height = '0';
        el.style.borderLeft = '10px solid transparent';
        el.style.borderRight = '10px solid transparent';
        el.style.borderBottom = `18px solid ${getStatusColor(project.compliance)}`;
        el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
      } else {
        // Circle (state)
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.background = getStatusColor(project.compliance);
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      }

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Add click handler
      el.addEventListener('click', () => {
        if (onProjectSelect) {
          onProjectSelect(project);
        }
      });

      // Create and add marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([centerLng, centerLat])
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [filteredProjects, mapLoaded, onProjectSelect]);

  const getStatusColor = (compliance) => {
    if (compliance === 'compliant') return '#6b9e78'; // green
    if (compliance === 'warning') return '#e09b3d'; // yellow
    return '#c84f3f'; // red
  };

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Search Bar */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        width: '90%',
        maxWidth: '500px'
      }}>
        <input
          type="text"
          placeholder="Buscar proyecto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: 'var(--font-body)'
          }}
        />
      </div>

      {/* Filter Button & Panel */}
      <div style={{
        position: 'absolute',
        top: '5rem',
        left: '1rem',
        zIndex: 2
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--earth-dark)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Filtros</span>
          <span>{showFilters ? '▼' : '▶'}</span>
        </button>

        {showFilters && (
          <div style={{
            marginTop: '0.5rem',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            border: '2px solid var(--border)',
            minWidth: '200px'
          }}>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              marginBottom: '1rem',
              color: 'var(--earth-dark)'
            }}>Nivel</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.federal} onChange={() => toggleFilter('federal')} />
              <span style={{ fontSize: '0.9rem' }}>■ Federal</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.state} onChange={() => toggleFilter('state')} />
              <span style={{ fontSize: '0.9rem' }}>● Estatal</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.municipal} onChange={() => toggleFilter('municipal')} />
              <span style={{ fontSize: '0.9rem' }}>▲ Municipal</span>
            </label>

            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              marginBottom: '1rem',
              color: 'var(--earth-dark)'
            }}>Estado</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.green} onChange={() => toggleFilter('green')} />
              <span style={{ fontSize: '0.9rem', color: '#6b9e78' }}>● En regla</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.yellow} onChange={() => toggleFilter('yellow')} />
              <span style={{ fontSize: '0.9rem', color: '#e09b3d' }}>● Advertencia</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.red} onChange={() => toggleFilter('red')} />
              <span style={{ fontSize: '0.9rem', color: '#c84f3f' }}>● Violación</span>
            </label>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Project Sidebar */}
      {selectedProject && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '350px',
          height: '100%',
          background: 'white',
          boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
          zIndex: 3,
          overflowY: 'auto',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{ padding: '2rem' }}>
            <button
              onClick={onProjectClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--ink-light)'
              }}
            >
              ×
            </button>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--earth-dark)',
              marginBottom: '1rem',
              paddingRight: '2rem'
            }}>
              {selectedProject.name}
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: getStatusColor(selectedProject.compliance),
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {selectedProject.compliance === 'compliant' ? 'En Regla' :
                 selectedProject.compliance === 'warning' ? 'Advertencia' : 'Violación'}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ink-light)',
                marginBottom: '0.25rem'
              }}>Empresa</div>
              <div style={{ fontWeight: '600', color: 'var(--ink)' }}>
                {selectedProject.company}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ink-light)',
                marginBottom: '0.25rem'
              }}>Estado</div>
              <div style={{ fontWeight: '600', color: 'var(--ink)' }}>
                {selectedProject.state}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ink-light)',
                marginBottom: '0.25rem'
              }}>Área Afectada</div>
              <div style={{ fontWeight: '600', color: 'var(--ink)' }}>
                {selectedProject.area} hectáreas
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ink-light)',
                marginBottom: '0.25rem'
              }}>Descripción</div>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--ink-light)' }}>
                {selectedProject.description}
              </p>
            </div>

            <button
              onClick={() => {
                // Navigate to full project view
                window.location.hash = 'project';
              }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--earth-dark)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--earth-mid)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--earth-dark)';
              }}
            >
              Ver Detalles Completos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MexicoMap;
