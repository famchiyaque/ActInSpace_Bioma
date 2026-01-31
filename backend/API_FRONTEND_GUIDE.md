# Bioma Backend API

## API Base URL

The backend API runs on: **`http://localhost:8000`**

## Frontend Integration

### API Endpoints

Your frontend should use these endpoints:

#### Projects
- **GET** `http://localhost:8000/projects` - Get all projects
- **POST** `http://localhost:8000/projects` - Create new project
- **GET** `http://localhost:8000/projects/{id}` - Get project details
- **POST** `http://localhost:8000/projects/{id}/runs` - Create analysis run

#### Runs
- **GET** `http://localhost:8000/runs/{id}` - Get run status/results
- **GET** `http://localhost:8000/runs/{id}/reports` - Get generated reports

#### Health
- **GET** `http://localhost:8000/health` - Health check

### API Documentation

Interactive API docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Example Frontend Code

#### JavaScript/TypeScript (Fetch)
```javascript
// Base URL for API
const API_BASE_URL = 'http://localhost:8000';

// Get all projects
async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  const data = await response.json();
  return data.projects;
}

// Create new project
async function createProject(projectData) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData)
  });
  return await response.json();
}

// Create run
async function createRun(projectId, runData) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(runData)
  });
  return await response.json();
}

// Get run status (for polling)
async function getRunStatus(runId) {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}`);
  return await response.json();
}
```

#### React Example
```tsx
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    fetch(`${API_BASE_URL}/projects`)
      .then(res => res.json())
      .then(data => setProjects(data.projects));
  }, []);
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>Risk: {project.risk_label}</p>
          <p>Carbon: {project.carbon_footprint_tonnes} tonnes CO2</p>
        </div>
      ))}
    </div>
  );
}
```

### CORS Configuration

CORS is already configured in `main.py` to allow:
- `http://localhost:3000` (React/Next.js)
- `http://localhost:5173` (Vite)
- `http://localhost:8080` (Vue)

**For production**: Add your production frontend URL to the `allow_origins` list in `main.py`.

### Environment Variables

Create `.env` file in your frontend with:
```env
VITE_API_BASE_URL=http://localhost:8000
# or for React:
REACT_APP_API_BASE_URL=http://localhost:8000
# or for Next.js:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Starting the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000

### GEE Pipeline Integration

The GEE pipeline should POST results to:
```
POST http://localhost:8000/runs/{run_id}/gee-result
```

For production, replace `localhost:8000` with your deployed backend URL.
