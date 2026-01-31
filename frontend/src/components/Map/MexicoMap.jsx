import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAllProjects } from '../../data/mock-projects';
import { projectsApi, transformProjectData } from '../../services/api';
import mexicoGeometry from '../../data/mexico-geometry.json';

// Set your Mapbox token here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYmlvbWEtbWFwIiwiYSI6ImNtNWRlZjBkZjBhcWYya3M3NzVhZDJhZWYifQ.placeholder';

// Mexico bounds
const MEXICO_BOUNDS = [
  [-118.4, 14.5], // Southwest coordinates
  [-86.7, 32.7]   // Northeast coordinates
];

// Mexico border using actual coordinates from countries.geojson
const MEXICO_BORDER = {
  type: 'Feature',
  geometry: mexicoGeometry
};

const MexicoMap = ({ onProjectSelect, selectedProject, onProjectClose, searchQuery, filters }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useBackend, setUseBackend] = useState(true);

  // Fetch projects from backend or use mock data
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from backend first
        const response = await projectsApi.getAllProjects();
        const transformedProjects = response.projects.map(transformProjectData);
        
        // Check if any projects have coordinates
        const projectsWithCoordinates = transformedProjects.filter(p => p.hasCoordinates);
        
        if (projectsWithCoordinates.length === 0 && transformedProjects.length > 0) {
          // Backend has projects but none have coordinates
          console.warn('Backend projects found but none have coordinates. Falling back to mock data.');
          const mockProjects = getAllProjects();
          setProjects(mockProjects);
          setUseBackend(false);
          setError(`${transformedProjects.length} proyectos en BD sin coordenadas. Usando datos demo.`);
        } else {
          setProjects(transformedProjects);
          setUseBackend(true);
          if (projectsWithCoordinates.length < transformedProjects.length) {
            setError(`${transformedProjects.length - projectsWithCoordinates.length} proyectos sin coordenadas`);
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable, falling back to mock data:', err.message);
        // Fall back to mock data if backend is unavailable
        const mockProjects = getAllProjects();
        setProjects(mockProjects);
        setUseBackend(false);
        setError('Backend no disponible. Usando datos demo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Use fetched projects instead of mock data
  const allProjects = projects;

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

      // Add Mexico fill layer
      map.current.addLayer({
        id: 'mexico-fill',
        type: 'fill',
        source: 'mexico-border',
        paint: {
          'fill-color': '#f0f7f2',
          'fill-opacity': 0.3
        }
      });

      // Add Mexico border line
      map.current.addLayer({
        id: 'mexico-border-line',
        type: 'line',
        source: 'mexico-border',
        paint: {
          'line-color': '#6b9e78',
          'line-width': 2
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
      // Skip projects without coordinates
      if (!project.hasCoordinates) {
        console.warn(`Project "${project.name}" has no coordinates, skipping map marker`);
        return;
      }

      const centerLng = project.centerLng;
      const centerLat = project.centerLat;

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

  const normalizeStatus = (value) => (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  const getStatusColor = (compliance) => {
    const normalized = normalizeStatus(compliance);
    if (normalized === 'compliant') return '#6b9e78';
    if (normalized === 'warning' || normalized === 'advertencia') return '#e09b3d';
    if (normalized === 'violation' || normalized === 'violacion') return '#c84f3f';
    if (normalized === 'high' || normalized === 'alto') return '#c84f3f';
    if (normalized === 'medium' || normalized === 'medio') return '#e09b3d';
    if (normalized === 'low' || normalized === 'bajo') return '#6b9e78';
    return '#9ca3af';
  };

  const getStatusText = (compliance) => {
    const normalized = normalizeStatus(compliance);
    if (normalized === 'compliant') return 'Compliant';
    if (normalized === 'warning' || normalized === 'advertencia') return 'Warning';
    if (normalized === 'violation' || normalized === 'violacion') return 'Violation';
    if (normalized === 'high' || normalized === 'alto') return 'High';
    if (normalized === 'medium' || normalized === 'medio') return 'Medium';
    if (normalized === 'low' || normalized === 'bajo') return 'Low';
    return 'No data';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '12px' }} />

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          zIndex: 5
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid var(--earth-dark)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', color: 'var(--ink)', fontWeight: '500' }}>
            Cargando proyectos...
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fef3c7',
          color: '#92400e',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 4,
          fontSize: '0.9rem',
          maxWidth: '90%'
        }}>
          ⚠️ {error}
        </div>
      )}

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
                  window.location.hash = `/project/${selectedProject.id}`;
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
