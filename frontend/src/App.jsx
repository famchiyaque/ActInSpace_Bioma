import { useState } from 'react'
import './App.css'
import MexicoMap from './components/Map/MexicoMap'

function App() {
  const [activeView, setActiveView] = useState('landing')
  const [selectedState, setSelectedState] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeRiskFilters, setActiveRiskFilters] = useState({
    high: true,
    medium: true,
    low: true
  })

  const showView = (viewId) => {
    setActiveView(viewId)
    window.scrollTo(0, 0)
  }

  const toggleRiskFilter = (level) => {
    setActiveRiskFilters(prev => ({
      ...prev,
      [level]: !prev[level]
    }))
  }

  const handleStateSelect = (state) => {
    setSelectedState(state)
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    showView('project')
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <div>
            <h1>Bioma - Monitoreo Ambiental</h1>
            <div className="subtitle">Supervisión Transparente de Proyectos</div>
          </div>
          <nav>
            <a href="#" data-view="landing" className={activeView === 'landing' ? 'active' : ''} onClick={(e) => { e.preventDefault(); showView('landing'); setSelectedState(null); }}>Mapa</a>
            <a href="#" data-view="project" className={activeView === 'project' ? 'active' : ''} onClick={(e) => { e.preventDefault(); showView('project'); }}>Proyecto</a>
            <a href="#" data-view="company" className={activeView === 'company' ? 'active' : ''} onClick={(e) => { e.preventDefault(); showView('company'); }}>Empresa</a>
            <a href="#" data-view="region" className={activeView === 'region' ? 'active' : ''} onClick={(e) => { e.preventDefault(); showView('region'); }}>Región</a>
            <a href="#" data-view="report" className={activeView === 'report' ? 'active' : ''} onClick={(e) => { e.preventDefault(); showView('report'); }}>Reporte</a>
          </nav>
        </div>
      </header>

      {/* Landing - Mexico Map View */}
      <div className={`view ${activeView === 'landing' ? 'active' : ''}`}>
        <div className="map-view-container">
          <MexicoMap 
            onStateSelect={handleStateSelect}
            onProjectSelect={handleProjectSelect}
            selectedState={selectedState}
          />
        </div>
      </div>

      {/* Old Map View (keeping for reference) */}
      <div className={`view ${activeView === 'map' ? 'active' : ''}`}>
        <div className="map-container">
          <aside className="sidebar">
            <h2>Explore Projects</h2>
            
            <div className="filter-group">
              <label>Region</label>
              <select>
                <option>All Regions</option>
                <option>Antofagasta Region</option>
                <option>Valparaíso Region</option>
                <option>Metropolitan Region</option>
                <option>Los Lagos Region</option>
                <option>Magallanes Region</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Company / Organization</label>
              <input type="text" placeholder="Search companies..." />
            </div>
            
            <div className="filter-group">
              <label>Environmental Risk Level</label>
              <div className="risk-filters">
                <button className={`risk-badge high ${activeRiskFilters.high ? 'active' : ''}`} onClick={() => toggleRiskFilter('high')}>High</button>
                <button className={`risk-badge medium ${activeRiskFilters.medium ? 'active' : ''}`} onClick={() => toggleRiskFilter('medium')}>Medium</button>
                <button className={`risk-badge low ${activeRiskFilters.low ? 'active' : ''}`} onClick={() => toggleRiskFilter('low')}>Low</button>
              </div>
            </div>
            
            <div className="transparency-note" style={{marginTop: '2rem'}}>
              <p><strong>About this data:</strong> All monitoring data is derived from Sentinel-2 satellite imagery processed through Google Earth Engine. Updates reflect weekly aggregations of 5-day imagery cycles.</p>
            </div>
          </aside>
          
          <div className="map-area">
            <div className="map-overlay"></div>
            <div className="project-markers">
              <div className="project-marker high" style={{top: '20%', left: '15%'}} onClick={() => showView('project')} title="Copper Mining Expansion - Río Verde">1</div>
              <div className="project-marker medium" style={{top: '35%', left: '45%'}} title="Hydroelectric Dam Construction">2</div>
              <div className="project-marker low" style={{top: '60%', left: '30%'}} title="Solar Farm Development">3</div>
              <div className="project-marker high" style={{top: '40%', left: '70%'}} title="Industrial Port Expansion">4</div>
              <div className="project-marker medium" style={{top: '75%', left: '55%'}} title="Forestry Operations">5</div>
              <div className="project-marker low" style={{top: '25%', left: '80%'}} title="Wind Energy Project">6</div>
              <div className="project-marker medium" style={{top: '50%', left: '25%'}} title="Infrastructure Highway">7</div>
              <div className="project-marker high" style={{top: '80%', left: '40%'}} title="Coastal Development">8</div>
            </div>
            
            <div className="map-legend">
              <h3>Risk Levels</h3>
              <div className="legend-item">
                <span className="legend-dot" style={{background: 'var(--alert-high)'}}></span>
                <span>High Impact</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{background: 'var(--alert-medium)'}}></span>
                <span>Medium Impact</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{background: 'var(--alert-low)'}}></span>
                <span>Low Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail View */}
      <div className={`view ${activeView === 'project' ? 'active' : ''}`}>
        <div className="project-detail">
          <div className="breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); showView('landing'); }}>Mapa</a> / {selectedState && <><a href="#" onClick={(e) => { e.preventDefault(); showView('landing'); }}>{selectedState.name}</a> / </>}{selectedProject ? selectedProject.name : 'Copper Mining Expansion - Río Verde'}
          </div>
          
          <div className="project-header">
            <div className="project-title">
              <h2>{selectedProject ? selectedProject.name : 'Copper Mining Expansion - Río Verde'}</h2>
              <div className="project-meta">
                <div className="meta-item">
                  <span className="meta-label">Empresa</span>
                  <span className="meta-value"><a href="#" onClick={(e) => { e.preventDefault(); showView('company'); }} style={{color: 'var(--earth-dark)', textDecoration: 'none'}}>{selectedProject ? selectedProject.company : 'Minera del Norte S.A.'}</a></span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Estado</span>
                  <span className="meta-value">{selectedProject ? selectedProject.state : 'Antofagasta Region'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Monitoreo Desde</span>
                  <span className="meta-value">{selectedProject ? selectedProject.startDate : 'March 2024'}</span>
                </div>
              </div>
            </div>
            
            <div className={`risk-indicator ${selectedProject ? selectedProject.compliance : 'high'}`}>
              <div className="risk-label">Estado Actual</div>
              <div className="risk-level">{selectedProject ? (selectedProject.compliance === 'compliant' ? 'CUMPLIMIENTO' : selectedProject.compliance === 'warning' ? 'ADVERTENCIA' : 'VIOLACIÓN') : 'HIGH RISK'}</div>
            </div>
          </div>
          
          <div className="content-grid">
            <div className="main-content">
              <h3>Description</h3>
              <p style={{marginBottom: '2rem', lineHeight: 1.8}}>
                Expansion of existing copper mining operations in the Río Verde watershed. The project involves opening new extraction zones covering approximately 850 hectares of previously undisturbed terrain, including construction of new access roads and processing facilities.
              </p>
              
              <div className="satellite-timeline">
                <div className="timeline-header">
                  <h3>Satellite Imagery Timeline</h3>
                  <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-light)'}}>Last 12 weeks</span>
                </div>
                
                <div className="timeline-images">
                  <div className="timeline-image">
                    <div className="image-overlay">Oct 2025</div>
                  </div>
                  <div className="timeline-image" onClick={() => showView('report')} style={{cursor: 'pointer'}}>
                    <div className="image-overlay">Dec 2025</div>
                  </div>
                  <div className="timeline-image">
                    <div className="image-overlay">Jan 2026</div>
                  </div>
                </div>
                
                <p style={{marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-light)'}}>
                  Click any image to view detailed comparison reports. Imagery updated weekly based on Sentinel-2 data.
                </p>
              </div>
            </div>
            
            <aside className="metrics-panel">
              <h3 style={{fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem'}}>Impact Metrics</h3>
              
              <div className="metric">
                <div className="metric-label">Affected Area</div>
                <div>
                  <span className="metric-value">847</span>
                  <span className="metric-unit">hectares</span>
                </div>
                <div className="trend">↑ Expanding</div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Vegetation Loss</div>
                <div>
                  <span className="metric-value">32%</span>
                </div>
                <div className="trend">↑ Increasing</div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Water Body Change</div>
                <div>
                  <span className="metric-value">-18%</span>
                </div>
                <div className="trend">↓ Declining</div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Overall Trend</div>
                <div>
                  <span className="metric-value" style={{fontSize: '1.2rem', color: 'var(--alert-high)'}}>Degrading</span>
                </div>
              </div>
              
              <div style={{marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)'}}>
                <button className="download-button" style={{width: '100%'}} onClick={() => showView('report')}>
                  Generate Full Report
                </button>
              </div>
            </aside>
          </div>
          
          <div className="transparency-note">
            <p><strong>Methodology Note:</strong> Risk levels are determined through automated analysis of satellite imagery measuring vegetation cover change, water body alteration, soil disruption, and project footprint expansion. All metrics are calculated using standardized remote sensing indices applied to Sentinel-2 multispectral data.</p>
          </div>
        </div>
      </div>

      {/* Company Profile View */}
      <div className={`view ${activeView === 'company' ? 'active' : ''}`}>
        <div className="company-profile">
          <div className="breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); showView('map'); }}>Map</a> / Companies / Minera del Norte S.A.
          </div>
          
          <div className="company-header">
            <h2>Minera del Norte S.A.</h2>
            <p style={{fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem'}}>
              Mining and resource extraction company operating across multiple regions
            </p>
            
            <div className="company-stats">
              <div className="stat-card">
                <div className="stat-label">Total Projects</div>
                <div className="stat-value">7</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">High Risk</div>
                <div className="stat-value" style={{color: 'var(--alert-high)'}}>3</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Medium Risk</div>
                <div className="stat-value" style={{color: 'var(--alert-medium)'}}>3</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Area</div>
                <div className="stat-value">3,240<span style={{fontSize: '1rem', fontWeight: 400, marginLeft: '0.5rem'}}>ha</span></div>
              </div>
            </div>
          </div>
          
          <h3 style={{fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--earth-dark)', marginBottom: '2rem'}}>
            Monitored Projects
          </h3>
          
          <div className="projects-grid">
            <div className="project-card" onClick={() => showView('project')}>
              <div className="risk-badge high" style={{display: 'inline-block', marginBottom: '1rem'}}>High Risk</div>
              <h4>Copper Mining Expansion - Río Verde</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Expansion covering 847 hectares with significant vegetation loss detected.
              </p>
              <div className="card-meta">
                <span className="card-location">Antofagasta Region</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Mar 2024</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge high" style={{display: 'inline-block', marginBottom: '1rem'}}>High Risk</div>
              <h4>Lithium Extraction Site - Salar Grande</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Active lithium brine extraction operations affecting salt flat ecosystem.
              </p>
              <div className="card-meta">
                <span className="card-location">Tarapacá Region</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Jan 2024</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge medium" style={{display: 'inline-block', marginBottom: '1rem'}}>Medium Risk</div>
              <h4>Gold Mine Operations - Cerro Azul</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Established operations with moderate ongoing environmental footprint.
              </p>
              <div className="card-meta">
                <span className="card-location">Atacama Region</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Jun 2023</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge medium" style={{display: 'inline-block', marginBottom: '1rem'}}>Medium Risk</div>
              <h4>Processing Facility - Valle Sur</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Ore processing plant with visible landscape modification.
              </p>
              <div className="card-meta">
                <span className="card-location">Antofagasta Region</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Sep 2023</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge medium" style={{display: 'inline-block', marginBottom: '1rem'}}>Medium Risk</div>
              <h4>Exploration Site - Quebrada Norte</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Early-stage exploration with road construction and survey activity.
              </p>
              <div className="card-meta">
                <span className="card-location">Coquimbo Region</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Dec 2024</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge low" style={{display: 'inline-block', marginBottom: '1rem'}}>Low Risk</div>
              <h4>Closed Mine Restoration - Pampa Verde</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Rehabilitation project showing positive environmental recovery.
              </p>
              <div className="card-meta">
                <span className="card-location">Atacama Region</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Apr 2024</span>
              </div>
            </div>
          </div>
          
          <div className="transparency-note" style={{marginTop: '3rem'}}>
            <p><strong>Company Profile Purpose:</strong> This view aggregates all projects associated with a single organization to enable pattern recognition and comparative analysis. It allows citizens and oversight bodies to assess cumulative environmental impacts and identify systemic practices.</p>
          </div>
        </div>
      </div>

      {/* Region Overview View */}
      <div className={`view ${activeView === 'region' ? 'active' : ''}`}>
        <div className="region-overview">
          <div className="breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); showView('map'); }}>Map</a> / Regions / Antofagasta Region
          </div>
          
          <div className="region-header">
            <div className="region-map">
              <div className="map-overlay"></div>
              <div className="project-markers">
                <div className="project-marker high" style={{top: '30%', left: '20%'}}></div>
                <div className="project-marker medium" style={{top: '50%', left: '60%'}}></div>
                <div className="project-marker medium" style={{top: '70%', left: '40%'}}></div>
                <div className="project-marker low" style={{top: '40%', left: '75%'}}></div>
              </div>
            </div>
            
            <div className="region-info">
              <h2>Antofagasta Region</h2>
              <p style={{fontSize: '1.1rem', color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: '2rem'}}>
                Northern region with significant mining activity. Known for copper and lithium extraction. Characterized by arid climate and sensitive desert ecosystems.
              </p>
              
              <div className="region-metrics">
                <div className="region-metric">
                  <div className="metric-label">Active Projects</div>
                  <div className="metric-value">12</div>
                </div>
                <div className="region-metric">
                  <div className="metric-label">High Risk</div>
                  <div className="metric-value" style={{color: 'var(--alert-high)'}}>5</div>
                </div>
                <div className="region-metric">
                  <div className="metric-label">Total Affected Area</div>
                  <div>
                    <span className="metric-value" style={{fontSize: '1.8rem'}}>5,420</span>
                    <span className="metric-unit">hectares</span>
                  </div>
                </div>
                <div className="region-metric">
                  <div className="metric-label">Companies Operating</div>
                  <div className="metric-value">8</div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 style={{fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--earth-dark)', marginBottom: '2rem', marginTop: '3rem'}}>
            Projects in This Region
          </h3>
          
          <div className="projects-grid">
            <div className="project-card" onClick={() => showView('project')}>
              <div className="risk-badge high" style={{display: 'inline-block', marginBottom: '1rem'}}>High Risk</div>
              <h4>Copper Mining Expansion - Río Verde</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Major expansion with 847 hectares affected and significant vegetation loss.
              </p>
              <div className="card-meta">
                <span className="card-location">Minera del Norte S.A.</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Mar 2024</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge medium" style={{display: 'inline-block', marginBottom: '1rem'}}>Medium Risk</div>
              <h4>Industrial Port Expansion</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Coastal infrastructure development with marine habitat concerns.
              </p>
              <div className="card-meta">
                <span className="card-location">Puerto Norte Corp.</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Jul 2024</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge medium" style={{display: 'inline-block', marginBottom: '1rem'}}>Medium Risk</div>
              <h4>Solar Farm Development - Pampa Solar</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Large-scale renewable energy installation with land use change.
              </p>
              <div className="card-meta">
                <span className="card-location">Energía Verde S.A.</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Oct 2024</span>
              </div>
            </div>
            
            <div className="project-card">
              <div className="risk-badge low" style={{display: 'inline-block', marginBottom: '1rem'}}>Low Risk</div>
              <h4>Water Treatment Facility</h4>
              <p style={{color: 'var(--ink-light)', margin: '1rem 0'}}>
                Municipal infrastructure with minimal environmental footprint.
              </p>
              <div className="card-meta">
                <span className="card-location">Municipal Government</span>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}>Since Nov 2024</span>
              </div>
            </div>
          </div>
          
          <div className="transparency-note" style={{marginTop: '3rem'}}>
            <p><strong>Regional Analysis Purpose:</strong> Regional views aggregate project data within administrative boundaries to support comparative analysis between regions and identify geographic patterns of environmental change. This enables regional planning authorities and communities to assess cumulative impacts at the territorial level.</p>
          </div>
        </div>
      </div>

      {/* Report View */}
      <div className={`view ${activeView === 'report' ? 'active' : ''}`}>
        <div className="report-container">
          <div className="breadcrumb">
            <a href="#" onClick={(e) => { e.preventDefault(); showView('map'); }}>Map</a> / <a href="#" onClick={(e) => { e.preventDefault(); showView('project'); }}>Copper Mining Expansion - Río Verde</a> / Environmental Monitoring Report
          </div>
          
          <div className="report-header">
            <h2>Environmental Monitoring Report</h2>
            <div style={{marginTop: '1rem'}}>
              <strong style={{fontSize: '1.2rem', color: 'var(--earth-dark)'}}>Copper Mining Expansion - Río Verde</strong>
            </div>
            <div className="report-date">Reporting Period: October 2025 - January 2026</div>
            <div className="report-date">Report Generated: January 30, 2026</div>
          </div>
          
          <div className="report-section">
            <h3>Project Overview</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', margin: '2rem 0'}}>
              <div>
                <div className="metric-label">Responsible Party</div>
                <div style={{fontWeight: 600, color: 'var(--earth-dark)'}}>Minera del Norte S.A.</div>
              </div>
              <div>
                <div className="metric-label">Location</div>
                <div style={{fontWeight: 600, color: 'var(--earth-dark)'}}>Antofagasta Region</div>
              </div>
              <div>
                <div className="metric-label">Monitoring Status</div>
                <div className="risk-badge high" style={{display: 'inline-block'}}>High Risk</div>
              </div>
            </div>
            <p style={{lineHeight: 1.8, marginTop: '1.5rem'}}>
              This report documents observed environmental changes at the Copper Mining Expansion project site over a 3-month monitoring period. Analysis is based on systematic processing of Sentinel-2 satellite imagery captured at 5-day intervals and aggregated into weekly summaries.
            </p>
          </div>
          
          <div className="report-section">
            <h3>Satellite Imagery Comparison</h3>
            <p style={{marginBottom: '2rem', color: 'var(--ink-light)'}}>
              Visual comparison of site conditions at the beginning and end of the monitoring period.
            </p>
            
            <div className="comparison-grid">
              <div className="comparison-image">
                <div className="comparison-label">October 5, 2025</div>
              </div>
              <div className="comparison-image">
                <div className="comparison-label">January 25, 2026</div>
              </div>
            </div>
            
            <p style={{marginTop: '2rem', lineHeight: 1.8}}>
              The imagery reveals substantial expansion of mining operations into previously undisturbed areas. Notable changes include removal of native vegetation cover, construction of new access roads, and expansion of open-pit excavation zones. The affected footprint has grown from approximately 620 hectares to 847 hectares during this period.
            </p>
          </div>
          
          <div className="report-section">
            <h3>Measured Environmental Changes</h3>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', margin: '2rem 0'}}>
              <div style={{border: '2px solid var(--border)', padding: '2rem', borderRadius: '8px'}}>
                <div className="metric-label">Affected Area Expansion</div>
                <div className="metric-value">+227<span className="metric-unit">hectares</span></div>
                <div className="trend" style={{marginTop: '1rem'}}>+36.6% increase</div>
              </div>
              
              <div style={{border: '2px solid var(--border)', padding: '2rem', borderRadius: '8px'}}>
                <div className="metric-label">Vegetation Cover Loss</div>
                <div className="metric-value">32%</div>
                <div className="trend" style={{marginTop: '1rem'}}>Significant reduction</div>
              </div>
              
              <div style={{border: '2px solid var(--border)', padding: '2rem', borderRadius: '8px'}}>
                <div className="metric-label">Surface Water Change</div>
                <div className="metric-value">-18%</div>
                <div className="trend" style={{marginTop: '1rem'}}>Declining</div>
              </div>
              
              <div style={{border: '2px solid var(--border)', padding: '2rem', borderRadius: '8px'}}>
                <div className="metric-label">Soil Disturbance</div>
                <div className="metric-value">High</div>
                <div className="trend" style={{marginTop: '1rem'}}>Extensive excavation</div>
              </div>
            </div>
            
            <p style={{lineHeight: 1.8, marginTop: '2rem'}}>
              Spectral analysis indicates removal of native desert scrub vegetation across expanding work zones. Normalized Difference Vegetation Index (NDVI) values show consistent decline in areas adjacent to mining operations. Surface water bodies in the watershed show reduced extent, likely reflecting altered hydrology from site preparation and water extraction for industrial use.
            </p>
          </div>
          
          <div className="report-section">
            <h3>Methodology</h3>
            <p style={{lineHeight: 1.8}}>
              This report is based on automated analysis of multispectral satellite imagery from the European Space Agency's Sentinel-2 mission, processed through Google Earth Engine. Data collection occurs approximately every 5 days, with public-facing reports aggregating observations into weekly summaries to account for cloud cover and seasonal variation.
            </p>
            <p style={{lineHeight: 1.8, marginTop: '1rem'}}>
              Environmental metrics are derived from standard remote sensing indices including NDVI (vegetation health), NDWI (water content), and supervised classification algorithms trained to detect land use categories. All measurements are compared against baseline conditions established at project monitoring initiation.
            </p>
          </div>
          
          <div className="transparency-note">
            <p><strong>Purpose of Public Reports:</strong> These reports provide factual documentation of observable environmental changes over time. They are designed to serve as evidence-based resources for public accountability, enabling citizens, journalists, researchers, and oversight bodies to access objective information about project impacts. Reports do not make legal determinations or predictive assessments beyond documented observations.</p>
          </div>
          
          <div style={{textAlign: 'center', marginTop: '3rem'}}>
            <button className="download-button">
              Download Full Report (PDF)
            </button>
            <p style={{marginTop: '1rem', color: 'var(--ink-light)', fontSize: '0.9rem'}}>
              This report is publicly accessible and may be freely shared and cited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
