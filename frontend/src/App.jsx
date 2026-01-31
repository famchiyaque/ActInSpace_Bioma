import { useState, useRef, useEffect, useMemo } from 'react'
import './App.css'
import MexicoMap from './components/Map/MexicoMap'
import ProjectDetailMap from './components/Map/ProjectDetailMap'
import { getProjectById } from './data/mock-projects'
import { projectsApi, transformProjectData } from './services/api'
import { predictRisk } from './utils/riskModel'

// Project Detail Content Component with AI Risk Integration
function ProjectDetailContent({ project, getRiskLabel }) {
  // Calculate AI risk prediction for current state (day 0)
  const aiRiskPrediction = useMemo(() => {
    return predictRisk(project, 0)
  }, [project])

  const riskIcons = {
    low: '✅',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨'
  }

  return (
    <>
      <div className="project-detail-header">
        <h1 className="project-title">{project.name}</h1>
        <p className="project-subtitle">
          {project.state} · {project.category}
        </p>
      </div>
      <div className="project-detail-grid">
        <div className="project-detail-map">
          <ProjectDetailMap project={project} />
        </div>
        <div className="project-detail-kpis">
          {/* AI Risk Score Card - Primary */}
          <div className="kpi-card kpi-card-ai" style={{
            background: `linear-gradient(135deg, ${aiRiskPrediction.riskLevel.color}15 0%, ${aiRiskPrediction.riskLevel.color}05 100%)`,
            borderLeft: `4px solid ${aiRiskPrediction.riskLevel.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>🤖</span>
                AI Risk Score
              </span>
              <span style={{ fontSize: '1.2rem' }}>{riskIcons[aiRiskPrediction.riskLevel.level]}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="kpi-value" style={{ 
                fontSize: '2rem', 
                fontWeight: '700',
                color: aiRiskPrediction.riskLevel.color 
              }}>
                {aiRiskPrediction.riskScore}
              </span>
              <span style={{ 
                fontSize: '0.85rem', 
                color: aiRiskPrediction.riskLevel.color,
                fontWeight: '600'
              }}>
                / 100 — {aiRiskPrediction.riskLevel.label}
              </span>
            </div>
            <div style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.7rem', 
              opacity: 0.7,
              display: 'flex',
              gap: '1rem'
            }}>
              <span>Tipo: {aiRiskPrediction.workType.name}</span>
              <span>Expansión: +{((aiRiskPrediction.expansionFactor - 1) * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Original Compliance Status */}
          <div className="kpi-card">
            <span className="kpi-label">Compliance Status</span>
            <span className={`kpi-value risk-${project.riskState}`}>
              {getRiskLabel(project.riskState)}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Affected area (vegetation loss)</span>
            <span className="kpi-value">
              {project.vegetationLoss == null ? 'N/A' : `${project.vegetationLoss} ha`}
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Carbon footprint</span>
            <span className="kpi-value">
              {project.carbonFootprint == null ? 'N/A' : `${project.carbonFootprint} t CO2e`}
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Last updated</span>
            <span className="kpi-value">{project.lastUpdated}</span>
          </div>

          {/* AI Risk Variables Summary */}
          <div className="kpi-card" style={{ gridColumn: '1 / -1' }}>
            <span className="kpi-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
              📊 AI Risk Factors
            </span>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                <span>🟡 Yellow Events</span>
                <strong>{aiRiskPrediction.variables.yellowZoneEvents}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                <span>🔴 Red Events</span>
                <strong>{aiRiskPrediction.variables.redZoneEvents}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                <span>📈 Expansion</span>
                <strong>{aiRiskPrediction.variables.expansionVelocity} m²/d</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                <span>🛡️ Sensitive Zone</span>
                <strong>{(aiRiskPrediction.variables.sensitiveZoneProximity * 100).toFixed(0)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                <span>📋 Historical Risk</span>
                <strong>{(aiRiskPrediction.variables.historicalRisk * 100).toFixed(0)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                <span>📆 Duration</span>
                <strong>{aiRiskPrediction.variables.projectDuration} days</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="project-detail-context">
        <div className="context-card">
          <h3 className="context-title">Region description</h3>
          <p className="context-text">{project.regionDescription}</p>
        </div>
        <div className="context-card">
          <h3 className="context-title">Company description</h3>
          <p className="context-text">{project.companyDescription}</p>
        </div>
        {/* AI Risk Interpretation Card */}
        <div className="context-card" style={{
          background: `linear-gradient(135deg, ${aiRiskPrediction.riskLevel.color}10 0%, transparent 100%)`,
          borderLeft: `4px solid ${aiRiskPrediction.riskLevel.color}`
        }}>
          <h3 className="context-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🤖</span> AI Risk Assessment
          </h3>
          <p className="context-text">
            {aiRiskPrediction.riskScore < 30 && 
              'The project maintains a work pace within permitted parameters. Routine monitoring is recommended. Current indicators show low probability of environmental violations.'}
            {aiRiskPrediction.riskScore >= 30 && aiRiskPrediction.riskScore < 60 && 
              'Indicators of possible expansion outside the authorized area are detected. Preventive inspection is recommended. The project shows a moderate trend that requires attention.'}
            {aiRiskPrediction.riskScore >= 60 && aiRiskPrediction.riskScore < 80 && 
              'High risk of limit violation. The project shows significant expansive tendency. Immediate intervention is required to prevent environmental damage.'}
            {aiRiskPrediction.riskScore >= 80 && 
              'Critical risk of environmental damage. Multiple indicators at alert levels. Urgent corrective action is necessary. Consider suspension of activities until compliance is verified.'}
          </p>
        </div>
      </div>
    </>
  )
}

function App() {
  const [activeView, setActiveView] = useState('landing')
  const [selectedProject, setSelectedProject] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    year: 'all'
  })
  const [loadingProject, setLoadingProject] = useState(false)
  const [projectError, setProjectError] = useState(null)

  // Refs for scrolling
  const mapSectionRef = useRef(null)
  const aboutSectionRef = useRef(null)
  const featuresSectionRef = useRef(null)
  const uploadSectionRef = useRef(null)

  const showView = (view) => {
    setActiveView(view)
    setSelectedProject(null)
    if (view === 'landing') {
      window.location.hash = ''
      return
    }
    window.location.hash = `/${view}`
  }

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const navigateToSection = (ref) => {
    showView('landing')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(ref)
      })
    })
  }

  useEffect(() => {
    const handleHashChange = async () => {
      const rawHash = window.location.hash.replace(/^#/, '')
      if (!rawHash) {
        setActiveView('landing')
        setSelectedProject(null)
        return
      }

      const normalized = rawHash.startsWith('/') ? rawHash.slice(1) : rawHash
      const [route, projectId] = normalized.split('/')

      if (route === 'project') {
        if (projectId) {
          setLoadingProject(true)
          setProjectError(null)
          
          try {
            // Try fetching from backend API first
            const projectDetail = await projectsApi.getProjectDetail(projectId)
            const transformedProject = transformProjectData(projectDetail)
            setSelectedProject(transformedProject)
            setActiveView('project')
          } catch (error) {
            console.warn('Failed to fetch project from API, trying mock data:', error.message)
            // Fallback to mock data
            const project = getProjectById(projectId)
            if (project) {
              setSelectedProject(project)
              setActiveView('project')
            } else {
              setProjectError('Proyecto no encontrado')
              setSelectedProject(null)
              setActiveView('project')
            }
          } finally {
            setLoadingProject(false)
          }
          return
        }
        setSelectedProject(null)
        setActiveView('project')
        return
      }

      setSelectedProject(null)
      setActiveView(route)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleProjectClick = async (project) => {
    // If project has basic info, set it immediately for UI responsiveness
    setSelectedProject(project)
    
    // Then try to fetch full details from API
    if (project.id) {
      try {
        const projectDetail = await projectsApi.getProjectDetail(project.id)
        const transformedProject = transformProjectData(projectDetail)
        setSelectedProject(transformedProject)
      } catch (error) {
        console.warn('Failed to fetch full project details:', error.message)
        // Keep the basic project info that was already set
      }
    }
  }

  const handleProjectClose = () => {
    setSelectedProject(null)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const getRiskLabel = (riskState) => {
    const normalized = (riskState || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')

    if (normalized === 'compliant') return 'Compliant'
    if (normalized === 'warning' || normalized === 'advertencia') return 'Warning'
    if (normalized === 'violation' || normalized === 'violacion') return 'Violation'
    if (normalized === 'high' || normalized === 'alto') return 'High'
    if (normalized === 'medium' || normalized === 'medio') return 'Medium'
    if (normalized === 'low' || normalized === 'bajo') return 'Low'
    if (!normalized || normalized === 'unknown') return 'No data'
    return riskState
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <div className="header-brand">
<img 
              src="/monvi_logo.png" 
              alt="MONVI Logo" 
              className="header-logo"
            />
            <div className="header-titles">
              <h1>MONVI</h1>
              <div className="subtitle">Monitoreo de Vigilancia Ambiental</div>
            </div>
          </div>
          <nav>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection(mapSectionRef); }}>Mapa</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection(aboutSectionRef); }}>Acerca</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection(featuresSectionRef); }}>Características</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection(uploadSectionRef); }}>Subir Proyecto</a>
          </nav>
        </div>
      </header>

      <main>
        {activeView === 'landing' && (
          <div className="landing-page">
            {/* Map Section */}
            <section className="map-section" ref={mapSectionRef}>
              <div className="section-container">
                <h2 className="section-title">Explora Proyectos en México</h2>
                
                {/* Search and Filters */}
                <div className="search-filters-bar">
                  <input
                    type="text"
                    placeholder="Buscar proyecto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  
                  <select 
                    value={filters.status} 
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Estado: Todos</option>
                    <option value="compliant">En Regla</option>
                    <option value="warning">Advertencia</option>
                    <option value="violation">Violación</option>
                  </select>

                  <select 
                    value={filters.category} 
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Categoría: Todas</option>
                    <option value="Infraestructura">Infraestructura</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Desarrollo Urbano">Desarrollo Urbano</option>
                    <option value="Medio Ambiente">Medio Ambiente</option>
                    <option value="Turismo">Turismo</option>
                  </select>

                  <select 
                    value={filters.year} 
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Año: Todos</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                {/* Map Container */}
                <div className="map-wrapper">
                  <MexicoMap 
                    onProjectSelect={handleProjectClick}
                    selectedProject={selectedProject}
                    onProjectClose={handleProjectClose}
                    searchQuery={searchQuery}
                    filters={filters}
                  />
                </div>
              </div>
            </section>

            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-content">
                <h2>Monitoreo en Tiempo Real de Proyectos de Construcción</h2>
                <p>Utilizamos imágenes satelitales y tecnología de punta para garantizar que los proyectos de construcción cumplan con regulaciones ambientales y respeten zonas protegidas.</p>
              </div>
            </section>

            {/* About Section */}
            <section className="about-section" ref={aboutSectionRef}>
              <div className="section-container">
                <h2 className="section-title">Nuestra Misión</h2>
                <div className="about-grid">
                  <div className="about-card">
                    <div className="about-icon">🌍</div>
                    <h3>Protección Ambiental</h3>
                    <p>Limitamos la destrucción ambiental mediante el monitoreo constante de proyectos de construcción y su cumplimiento con regulaciones establecidas.</p>
                  </div>
                  <div className="about-card">
                    <div className="about-icon">🛰️</div>
                    <h3>Tecnología Satelital</h3>
                    <p>Utilizamos imágenes satelitales de alta resolución para rastrear el progreso de construcciones y detectar violaciones a zonas protegidas.</p>
                  </div>
                  <div className="about-card">
                    <div className="about-icon">📊</div>
                    <h3>Transparencia Total</h3>
                    <p>Proporcionamos datos abiertos y transparentes sobre el estado de proyectos, permitiendo a ciudadanos y autoridades tomar decisiones informadas.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="features-section" ref={featuresSectionRef}>
              <div className="section-container">
                <h2 className="section-title">Características Principales</h2>
                <div className="features-grid">
                  <div className="feature-item">
                    <h3>🗺️ Mapeo Interactivo</h3>
                    <p>Visualiza todos los proyectos de construcción en un mapa interactivo de México con filtros personalizables.</p>
                  </div>
                  <div className="feature-item">
                    <h3>📸 Imágenes Satelitales</h3>
                    <p>Accede a imágenes satelitales actualizadas de cada proyecto para verificar su progreso y cumplimiento.</p>
                  </div>
                  <div className="feature-item">
                    <h3>⚠️ Alertas Automáticas</h3>
                    <p>Recibe notificaciones cuando un proyecto entra en zonas protegidas o viola regulaciones ambientales.</p>
                  </div>
                  <div className="feature-item">
                    <h3>📄 Generación de Reportes</h3>
                    <p>Genera reportes detallados sobre el estado de proyectos, áreas afectadas y cumplimiento normativo.</p>
                  </div>
                  <div className="feature-item">
                    <h3>🔍 Búsqueda Avanzada</h3>
                    <p>Encuentra proyectos específicos por nombre, ubicación, empresa o nivel de cumplimiento.</p>
                  </div>
                  <div className="feature-item">
                    <h3>📈 Análisis Histórico</h3>
                    <p>Revisa el historial completo de un proyecto y compara imágenes satelitales a través del tiempo.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Upload Section */}
            <section className="upload-section" ref={uploadSectionRef}>
              <div className="section-container">
                <h2 className="section-title">Subir Nuevo Proyecto</h2>
                <div className="upload-content">
                  <p className="upload-description">
                    ¿Tienes información sobre un nuevo proyecto de construcción? Ayúdanos a mantener nuestra base de datos actualizada.
                  </p>
                  <div className="upload-card">
                    <div className="upload-icon">📁</div>
                    <h3>Sube Documentación del Proyecto</h3>
                    <p>Acepta formatos: PDF, DOC, DOCX, XLS, XLSX</p>
                    <button className="upload-button" onClick={() => showView('upload')}>
                      Iniciar Carga de Proyecto
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
              <div className="section-container">
                <div className="footer-content">
                  <div className="footer-section">
                    <h4>Bioma</h4>
                    <p>Monitoreo ambiental transparente para un México sostenible.</p>
                  </div>
                  <div className="footer-section">
                    <h4>Contacto</h4>
                    <p>contacto@bioma.mx</p>
                    <p>+52 (55) 1234 5678</p>
                  </div>
                  <div className="footer-section">
                    <h4>Enlaces</h4>
                    <p><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection(aboutSectionRef); }}>Acerca</a></p>
                  </div>
                </div>
                <div className="footer-bottom">
                  <p>&copy; 2026 Bioma. Todos los derechos reservados.</p>
                </div>
              </div>
            </footer>
          </div>
        )}

        {activeView === 'project' && (
          <div className="view-content project-detail-view" id="project-view">
            {loadingProject ? (
              <div className="project-loading-state">
                <div className="spinner" />
                <h2>Loading project...</h2>
              </div>
            ) : projectError ? (
              <div className="project-error-state">
                <h2>⚠️ Error</h2>
                <p>{projectError}</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => window.location.hash = '#'}
                >
                  Back to map
                </button>
              </div>
            ) : selectedProject ? (
              <ProjectDetailContent 
                project={selectedProject} 
                getRiskLabel={getRiskLabel}
              />
            ) : (
              <div className="project-empty-state">
                <h2>Select a project on the map</h2>
                <p>Click a marker to see full details.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'company' && (
          <div className="view-content company-view" id="company-view">
            {/* Keep original company view structure */}
            <div className="company-header-section">
              <div className="company-profile">
                <div className="company-avatar-large">CN</div>
                <div>
                  <h1>Constructora del Norte S.A.</h1>
                  <p className="company-tagline">Empresa de construcción e infraestructura</p>
                  <div className="company-badges">
                    <span className="badge">Certificada SEMARNAT</span>
                    <span className="badge badge-warning">En Supervisión</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <section className="section">
                <h2 className="section-heading">Información General</h2>
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">RFC</span>
                    <span className="meta-value">CDN850315AB2</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Fundada</span>
                    <span className="meta-value">1985</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Sede</span>
                    <span className="meta-value">Monterrey, Nuevo León</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Empleados</span>
                    <span className="meta-value">~500</span>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Métricas de Cumplimiento</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <span className="metric-label">Proyectos Totales</span>
                    <span className="metric-value">42</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Activos</span>
                    <span className="metric-value">12</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Completados</span>
                    <span className="metric-value">28</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Tasa de Cumplimiento</span>
                    <span className="metric-value status-warning">78%</span>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Proyectos Activos</h2>
                <div className="project-list">
                  <div className="project-item">
                    <div className="project-item-header">
                      <h3>Carretera Federal 85 - Tramo Norte</h3>
                      <span className="status-badge status-warning">Advertencia</span>
                    </div>
                    <p className="project-item-detail">Nuevo León · 245 hectáreas · Activo desde Ene 2024</p>
                  </div>
                  <div className="project-item">
                    <div className="project-item-header">
                      <h3>Puente Vehicular Sur</h3>
                      <span className="status-badge status-active">En Regla</span>
                    </div>
                    <p className="project-item-detail">Tamaulipas · 120 hectáreas · Activo desde Mar 2024</p>
                  </div>
                  <div className="project-item">
                    <div className="project-item-header">
                      <h3>Desarrollo Residencial Las Palmas</h3>
                      <span className="status-badge status-active">En Regla</span>
                    </div>
                    <p className="project-item-detail">Nuevo León · 85 hectáreas · Activo desde Feb 2024</p>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Historial de Violaciones</h2>
                <div className="alert alert-violation">
                  <div className="alert-icon">✕</div>
                  <div className="alert-content">
                    <h3 className="alert-title">Violación Ambiental</h3>
                    <p className="alert-message">
                      Proyecto "Autopista del Sol" excedió límites de zona de trabajo aprobada por 12 hectáreas.
                    </p>
                    <span className="alert-time">Septiembre 2023 · Multa aplicada: $2,500,000 MXN</span>
                  </div>
                </div>
                <div className="alert alert-warning">
                  <div className="alert-icon">⚠</div>
                  <div className="alert-content">
                    <h3 className="alert-title">Advertencia de Cumplimiento</h3>
                    <p className="alert-message">
                      Construcción cercana a zona protegida en "Parque Industrial Norte".
                    </p>
                    <span className="alert-time">Marzo 2024 · En revisión</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeView === 'region' && (
          <div className="view-content region-view" id="region-view">
            {/* Keep original region view structure */}
            <div className="region-header">
              <h1>Nuevo León</h1>
              <div className="region-stats">
                <div className="stat-pill">
                  <span className="stat-pill-value">18</span>
                  <span className="stat-pill-label">Proyectos Activos</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill-value">3</span>
                  <span className="stat-pill-label">En Violación</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill-value">1,240 ha</span>
                  <span className="stat-pill-label">Área Impactada</span>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <section className="section">
                <h2 className="section-heading">Zonas Protegidas</h2>
                <div className="protected-zones-list">
                  <div className="zone-card">
                    <h3>Parque Nacional Cumbres de Monterrey</h3>
                    <p className="zone-detail">177,395 hectáreas · Federal</p>
                    <div className="zone-status">
                      <span className="status-badge status-violation">2 proyectos cercanos en violación</span>
                    </div>
                  </div>
                  <div className="zone-card">
                    <h3>Área Natural Protegida La Estanzuela</h3>
                    <p className="zone-detail">550 hectáreas · Estatal</p>
                    <div className="zone-status">
                      <span className="status-badge status-active">Sin amenazas detectadas</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Proyectos por Municipio</h2>
                <div className="municipality-grid">
                  <div className="municipality-card">
                    <h3>Monterrey</h3>
                    <div className="municipality-stats">
                      <span>7 proyectos activos</span>
                      <span className="status-warning">1 advertencia</span>
                    </div>
                  </div>
                  <div className="municipality-card">
                    <h3>San Pedro Garza García</h3>
                    <div className="municipality-stats">
                      <span>4 proyectos activos</span>
                      <span className="status-active">Todos en regla</span>
                    </div>
                  </div>
                  <div className="municipality-card">
                    <h3>Apodaca</h3>
                    <div className="municipality-stats">
                      <span>5 proyectos activos</span>
                      <span className="status-violation">2 violaciones</span>
                    </div>
                  </div>
                  <div className="municipality-card">
                    <h3>Guadalupe</h3>
                    <div className="municipality-stats">
                      <span>2 proyectos activos</span>
                      <span className="status-active">Todos en regla</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Alertas Recientes</h2>
                <div className="alerts-timeline">
                  <div className="alert alert-violation">
                    <div className="alert-icon">✕</div>
                    <div className="alert-content">
                      <h3 className="alert-title">Violación Detectada</h3>
                      <p className="alert-message">
                        Proyecto en Apodaca excedió límites aprobados e ingresó a zona de amortiguamiento.
                      </p>
                      <span className="alert-time">Hace 3 días</span>
                    </div>
      </div>
                  <div className="alert alert-warning">
                    <div className="alert-icon">⚠</div>
                    <div className="alert-content">
                      <h3 className="alert-title">Advertencia de Proximidad</h3>
                      <p className="alert-message">
                        Construcción en Monterrey se aproxima a límite de zona protegida.
                      </p>
                      <span className="alert-time">Hace 1 semana</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeView === 'report' && (
          <div className="view-content report-view" id="report-view">
            {/* Keep original report view structure */}
            <div className="report-header">
              <h1>Generar Reporte</h1>
              <p className="report-subtitle">Crea reportes personalizados sobre proyectos y cumplimiento ambiental</p>
            </div>

            <div className="report-form">
              <section className="section">
                <h2 className="section-heading">Tipo de Reporte</h2>
                <div className="radio-group">
                  <label className="radio-card">
                    <input type="radio" name="reportType" value="project" defaultChecked />
                    <div className="radio-card-content">
                      <h3>Reporte de Proyecto</h3>
                      <p>Análisis detallado de un proyecto específico</p>
                    </div>
                  </label>
                  <label className="radio-card">
                    <input type="radio" name="reportType" value="company" />
                    <div className="radio-card-content">
                      <h3>Reporte de Empresa</h3>
                      <p>Historial y métricas de una empresa constructora</p>
                    </div>
                  </label>
                  <label className="radio-card">
                    <input type="radio" name="reportType" value="region" />
                    <div className="radio-card-content">
                      <h3>Reporte Regional</h3>
                      <p>Análisis de proyectos en un estado o región</p>
                    </div>
                  </label>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Parámetros</h2>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="reportEntity">Entidad</label>
                    <select id="reportEntity" className="form-select">
                      <option>Seleccionar proyecto...</option>
                      <option>Carretera Federal 85 - Tramo Norte</option>
                      <option>Metro Línea 12 Extension</option>
                      <option>Puente Vehicular Sur</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="reportPeriod">Período</label>
                    <select id="reportPeriod" className="form-select">
                      <option>Último mes</option>
                      <option>Últimos 3 meses</option>
                      <option>Últimos 6 meses</option>
                      <option>Último año</option>
                      <option>Todo el historial</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Incluir en Reporte</h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked /> Resumen ejecutivo
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked /> Imágenes satelitales
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked /> Análisis de cumplimiento
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" /> Comparativa histórica
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" /> Datos de zonas protegidas
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" /> Recomendaciones
                  </label>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Formato de Exportación</h2>
                <div className="radio-group-inline">
                  <label className="radio-label">
                    <input type="radio" name="format" value="pdf" defaultChecked /> PDF
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="format" value="excel" /> Excel
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="format" value="word" /> Word
                  </label>
                </div>
              </section>

              <div className="form-actions">
                <button className="btn btn-secondary">Vista Previa</button>
                <button className="btn btn-primary">
                  <span>Generar Reporte</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'upload' && (
          <div className="view-content upload-view" id="upload-view">
            <div className="report-header">
              <h1>Subir Nuevo Proyecto</h1>
              <p className="report-subtitle">Proporciona la documentación del proyecto para agregarlo al sistema de monitoreo</p>
            </div>

            <div className="report-form">
              <section className="section">
                <h2 className="section-heading">Información Básica</h2>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="projectName">Nombre del Proyecto</label>
                    <input type="text" id="projectName" className="form-input" placeholder="Ej: Carretera Federal 85" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="projectCompany">Empresa Responsable</label>
                    <input type="text" id="projectCompany" className="form-input" placeholder="Nombre de la empresa" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="projectState">Estado</label>
                    <select id="projectState" className="form-select">
                      <option>Seleccionar estado...</option>
                      <option>Nuevo León</option>
                      <option>Ciudad de México</option>
                      <option>Jalisco</option>
                      <option>Veracruz</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="projectCategory">Categoría</label>
                    <select id="projectCategory" className="form-select">
                      <option>Seleccionar categoría...</option>
                      <option>Infraestructura</option>
                      <option>Transporte</option>
                      <option>Desarrollo Urbano</option>
                      <option>Medio Ambiente</option>
                      <option>Turismo</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2 className="section-heading">Cargar Documentos</h2>
                <div className="upload-zone">
                  <div className="upload-icon-large">📁</div>
                  <h3>Arrastra archivos aquí</h3>
                  <p>o haz clic para seleccionar</p>
                  <button className="btn btn-secondary" style={{marginTop: '1rem'}}>Seleccionar Archivos</button>
                  <p className="upload-hint">Formatos aceptados: PDF, DOC, DOCX, XLS, XLSX (máx. 50MB)</p>
                </div>
              </section>

              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => showView('landing')}>Cancelar</button>
                <button className="btn btn-primary">
                  <span>Enviar Proyecto</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
