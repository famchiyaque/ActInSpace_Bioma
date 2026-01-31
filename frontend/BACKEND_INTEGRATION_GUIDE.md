# Frontend - Backend Integration Guide

## Overview

The frontend is now fully integrated with the backend API. Instead of using mock data, the application fetches real project data from the database.

## How It Works

### 1. **Project List Loading** (Map View)
- **Endpoint**: `GET /projects`
- **Location**: [src/components/Map/MexicoMap.jsx](src/components/Map/MexicoMap.jsx)
- Projects are fetched and transformed to frontend format
- Falls back to mock data if backend is unavailable
- Status messages show when using demo data vs. real data

### 2. **Project Detail Loading** (Detail View)
- **Endpoint**: `GET /projects/{id}`
- **Locations**: 
  - [src/App.jsx](src/App.jsx) - Hash route handler
  - [src/services/api.js](src/services/api.js) - API call handler
- When a user clicks a project or navigates to `/#/project/{id}`:
  1. Frontend fetches detailed project data from backend
  2. Data is transformed to frontend format
  3. If available, full geometry (geomarkers) is loaded
  4. Latest analysis run data (hectares_change, summary, etc.) is displayed

## Data Transformation

The `transformProjectData()` function in [src/services/api.js](src/services/api.js) maps backend responses to frontend format:

### Backend Response Structure
```json
{
  "project": { /* project metadata */ },
  "geomarkers": { 
    "active": { /* current boundary geometry */ },
    "history": [ /* previous geomarkers */ ]
  },
  "latest_run": { /* most recent analysis */ },
  "reports": [ /* generated reports */ ],
  "run_history": [ /* all runs */ ]
}
```

### Frontend Properties
| Backend | Frontend | Purpose |
|---------|----------|---------|
| `project.id` | `id` | Project identifier |
| `project.name` | `name` | Project name |
| `project.description` | `description` | Project description |
| `project.risk_label` | `riskState`, `compliance` | Risk status (high/medium/low) |
| `project.status` | `status` | Project status |
| `project.monitoring_start_date` | `startDate` | Start date |
| `project.monitoring_end_date` | `monitoringEndDate` | End date |
| `project.company` | `company`, `companyId`, `companyDescription` | Company info |
| `project.region` | `state`, `stateCode`, `regionDescription` | Region info |
| `geomarkers.active.geojson` | `workZone` | Boundary geometry for map display |
| `latest_run.hectares_change` | `vegetationLoss`, `area` | Vegetation loss in hectares |
| `project.updated_at` | `lastUpdated` | Last update timestamp |

## API Service

Located in [src/services/api.js](src/services/api.js):

```javascript
// Get all projects
await projectsApi.getAllProjects()

// Get specific project with full details
await projectsApi.getProjectDetail(projectId)

// Get run status
await runsApi.getRunStatus(runId)

// Get run reports
await runsApi.getRunReports(runId)

// Health check
await healthApi.checkHealth()
```

## Environment Configuration

The backend URL is configured in `frontend/.env.local`:

```dotenv
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZWR1YXJkby1oZGV6IiwiYSI6ImNtbDFkb2ZpeTA2ZWMzbHE0aG1rdTRjamEifQ.x0wzoHYPQONhyrhaxVbgfA
VITE_API_BASE_URL=http://localhost:8000
```

To use a different backend, modify `VITE_API_BASE_URL`.

## Error Handling

- If backend is unavailable, app falls back to mock data
- Error messages displayed to user indicate data source
- API failures are logged to console for debugging

## Testing the Integration

1. **Start the backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test endpoints**:
   - Swagger docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
   - Health: http://localhost:8000/health

4. **View real data**:
   - Navigate to http://localhost:5174
   - Click on any project marker on the map
   - Project details should load from database

## Adding New Data Fields

To display additional backend data:

1. Add field to `transformProjectData()` function
2. Use the property name in React components
3. Update component styling if needed

Example:
```javascript
// In transformProjectData()
newField: backendProject.new_field || 'default'

// In component
<span>{selectedProject.newField}</span>
```

## Next Steps

- Add pagination for large project lists
- Implement real-time updates using WebSockets
- Add project creation/editing forms
- Add filtering by date, company, risk level
- Implement advanced search

