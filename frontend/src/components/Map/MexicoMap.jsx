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

// Simplified Mexico border outline
const MEXICO_BORDER = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      // Pacific Coast - Baja California
      [-117.12, 32.53], [-116.9, 32.3], [-116.5, 31.9], [-116.0, 31.5], [-115.5, 31.0],
      [-115.0, 30.5], [-114.7, 30.0], [-114.4, 29.5], [-114.2, 29.0], [-114.1, 28.5],
      [-114.0, 28.0], [-113.5, 27.5], [-113.0, 27.0], [-112.5, 26.5], [-112.0, 26.0],
      [-111.5, 25.5], [-111.0, 25.0], [-110.5, 24.5], [-110.0, 24.0], [-109.5, 23.5],
      // Gulf of California to Pacific
      [-109.4, 23.2], [-108.9, 23.3], [-108.5, 23.5], [-108.0, 23.8], [-107.5, 24.0],
      [-107.0, 24.3], [-106.5, 24.6], [-106.0, 25.0], [-105.5, 25.5], [-105.0, 26.0],
      [-104.5, 26.5], [-104.0, 27.0], [-103.5, 27.5], [-103.2, 27.8],
      // North border with US
      [-103.0, 28.5], [-102.5, 29.0], [-102.0, 29.4], [-101.5, 29.7], [-101.0, 29.8],
      [-100.5, 29.8], [-100.0, 29.7], [-99.5, 29.5], [-99.0, 29.2], [-98.5, 28.8],
      [-98.0, 28.4], [-97.5, 28.0], [-97.2, 27.5], [-97.1, 27.0], [-97.2, 26.5],
      [-97.4, 26.0], [-97.8, 25.8],
      // Gulf Coast
      [-98.0, 25.9], [-98.2, 26.0], [-97.8, 25.5], [-97.5, 24.5], [-97.3, 23.5],
      [-97.2, 22.5], [-97.3, 21.5], [-97.5, 20.5], [-97.2, 19.5], [-96.8, 18.5],
      [-96.5, 18.0], [-96.0, 17.5], [-95.5, 17.0], [-95.0, 16.5], [-94.5, 16.2],
      [-94.0, 16.0], [-93.5, 15.8], [-93.0, 15.7], [-92.5, 15.8], [-92.2, 16.0],
      // Guatemala border
      [-91.8, 16.2], [-91.4, 16.5], [-91.0, 16.8], [-90.7, 17.1], [-90.5, 17.5],
      [-90.4, 17.8], [-90.5, 18.2], [-90.7, 18.6], [-91.0, 19.0], [-91.4, 19.3],
      [-91.8, 19.6], [-92.2, 19.8], [-92.5, 20.0], [-92.8, 20.2], [-93.2, 20.3],
      [-93.6, 20.4], [-94.0, 20.5], [-94.5, 20.6], [-95.0, 20.7], [-95.5, 20.9],
      [-96.0, 21.1], [-96.5, 21.4], [-97.0, 21.6], [-97.4, 21.7], [-97.7, 21.6],
      // Back up to Yucatan
      [-97.5, 21.0], [-97.2, 20.5], [-96.8, 20.0], [-96.4, 19.5], [-96.0, 19.2],
      [-95.5, 19.0], [-94.8, 18.5], [-94.2, 18.2], [-93.6, 18.0], [-93.0, 17.8],
      [-92.4, 17.7], [-91.8, 17.8], [-91.4, 18.0], [-91.0, 18.3], [-90.6, 18.6],
      [-90.3, 19.0], [-90.0, 19.5], [-89.8, 20.0], [-89.7, 20.5], [-89.6, 21.0],
      // Yucatan peninsula
      [-89.5, 21.3], [-89.3, 21.5], [-89.0, 21.6], [-88.5, 21.5], [-88.0, 21.4],
      [-87.5, 21.5], [-87.4, 21.3], [-87.5, 20.8], [-87.6, 20.3], [-87.7, 19.8],
      [-87.8, 19.3], [-87.9, 18.8], [-88.1, 18.5], [-88.3, 18.3], [-88.5, 18.5],
      [-88.8, 18.8], [-89.2, 19.2], [-89.6, 19.6], [-90.0, 20.0], [-90.4, 20.4],
      [-90.8, 20.8], [-91.2, 21.2], [-91.6, 21.4], [-92.0, 21.5], [-92.5, 21.6],
      // Back to Pacific
      [-93.0, 21.5], [-93.5, 21.3], [-94.0, 21.0], [-94.5, 20.7], [-95.0, 20.4],
      [-95.5, 20.1], [-96.0, 19.8], [-96.5, 19.5], [-97.0, 19.2], [-97.5, 19.0],
      [-98.0, 18.8], [-98.5, 18.6], [-99.0, 18.5], [-99.5, 18.4], [-100.0, 18.3],
      [-100.5, 18.2], [-101.0, 18.2], [-101.5, 18.3], [-102.0, 18.4], [-102.5, 18.6],
      [-103.0, 18.8], [-103.5, 19.0], [-104.0, 19.2], [-104.5, 19.5], [-105.0, 19.8],
      [-105.5, 20.2], [-106.0, 20.6], [-106.5, 21.0], [-107.0, 21.5], [-107.5, 22.0],
      [-108.0, 22.5], [-108.5, 23.0], [-109.0, 23.5], [-109.5, 24.0], [-110.0, 24.5],
      [-110.5, 25.0], [-111.0, 25.5], [-111.5, 26.0], [-112.0, 26.5], [-112.5, 27.0],
      [-113.0, 27.5], [-113.5, 28.0], [-114.0, 28.5], [-114.5, 29.0], [-115.0, 29.5],
      [-115.5, 30.0], [-116.0, 30.5], [-116.5, 31.0], [-117.0, 31.5], [-117.12, 32.53]
    ]
  }
};

const MexicoMap = ({ onProjectSelect, selectedProject, onProjectClose, searchQuery, filters }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef([]);

  // Get all projects
  const allProjects = getAllProjects();

  // Filter projects based on search and filters
  const filteredProjects = allProjects.filter(project => {
    // Search filter
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && project.compliance !== filters.status) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && project.category !== filters.category) {
      return false;
    }

    // Year filter
    if (filters.year !== 'all') {
      const projectYear = new Date(project.startDate).getFullYear().toString();
      if (projectYear !== filters.year) {
        return false;
      }
    }
    
    return true;
  });

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-102.5528, 23.6345],
      zoom: 5,
      maxBounds: MEXICO_BOUNDS,
      minZoom: 4.5,
      maxZoom: 18
    });

    map.current.on('load', () => {
      // Add Mexico border
      map.current.addSource('mexico-border', {
        type: 'geojson',
        data: MEXICO_BORDER
      });

      map.current.addLayer({
        id: 'mexico-border-line',
        type: 'line',
        source: 'mexico-border',
        paint: {
          'line-color': '#6b9e78',
          'line-width': 3
        }
      });

      setMapLoaded(true);
    });

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
      const coords = project.workZone.geometry.coordinates[0];
      const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
      const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;

      // Create custom marker element
      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.background = getStatusColor(project.compliance);
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.transition = 'none';

      // Add click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onProjectSelect) {
          onProjectSelect(project);
          
          // Zoom to project
          map.current.flyTo({
            center: [centerLng, centerLat],
            zoom: 10,
            duration: 1500
          });
        }
      });

      // Create and add marker
      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([centerLng, centerLat])
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [filteredProjects, mapLoaded, onProjectSelect]);

  const getStatusColor = (compliance) => {
    if (compliance === 'compliant') return '#6b9e78';
    if (compliance === 'warning') return '#e09b3d';
    return '#c84f3f';
  };

  const getStatusText = (compliance) => {
    if (compliance === 'compliant') return 'En Regla';
    if (compliance === 'warning') return 'Advertencia';
    return 'Violación';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '12px' }} />

      {/* Project Sidebar */}
      {selectedProject && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '380px',
          height: '100%',
          background: 'white',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          zIndex: 3,
          overflowY: 'auto',
          animation: 'slideInRight 0.3s ease',
          borderRadius: '0 12px 12px 0'
        }}>
          <div style={{ padding: '0' }}>
            <button
              onClick={onProjectClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--ink-light)',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 10
              }}
            >
              ×
            </button>

            {/* Project Image */}
            {selectedProject.imageUrl && (
              <div style={{
                width: '100%',
                height: '220px',
                overflow: 'hidden',
                borderRadius: '0 12px 0 0'
              }}>
                <img 
                  src={selectedProject.imageUrl} 
                  alt={selectedProject.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            <div style={{ padding: '2rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--earth-dark)',
                marginBottom: '1rem',
                lineHeight: 1.3
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
                  {getStatusText(selectedProject.compliance)}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-light)',
                  marginBottom: '0.35rem'
                }}>Categoría</div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '0.95rem' }}>
                  {selectedProject.category}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-light)',
                  marginBottom: '0.35rem'
                }}>Empresa</div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '0.95rem' }}>
                  {selectedProject.company}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-light)',
                  marginBottom: '0.35rem'
                }}>Estado</div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '0.95rem' }}>
                  {selectedProject.state}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-light)',
                  marginBottom: '0.35rem'
                }}>Área Afectada</div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '0.95rem' }}>
                  {selectedProject.area} hectáreas
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-light)',
                  marginBottom: '0.35rem'
                }}>Descripción</div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--ink-light)' }}>
                  {selectedProject.description}
                </p>
              </div>

              <button
                onClick={() => {
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
                  transition: 'background 0.3s ease'
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
        </div>
      )}
    </div>
  );
};

export default MexicoMap;
