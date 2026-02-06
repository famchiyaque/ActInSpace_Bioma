# MONVI — Monitoreo de Vigilancia Ambiental

**Real-time environmental monitoring platform for construction projects in Mexico**

---

## Overview

> 🚀 **Hackathon Project** — Originally developed during **ActInSpace 2026**, this project is still under active development and may receive future updates and improvements.

**MONVI** (Monitoreo de Vigilancia Ambiental) is an environmental monitoring system designed to track construction projects across Mexico and ensure compliance with environmental regulations. By leveraging satellite imagery and predictive AI models, MONVI provides authorities, companies, and citizens with transparent data about construction activities and their environmental impact.

### Key Capabilities

- 🛰️ **Satellite Image Analysis** — Compare before/after imagery to detect land use changes
- 🗺️ **Interactive Mapping** — Visualize all monitored projects on an interactive map of Mexico
- 🤖 **AI Risk Prediction** — Predictive model calculates compliance risk scores (1-100)
- 📊 **Environmental Metrics** — Track vegetation loss, carbon footprint, and affected areas
- ⚠️ **Alert System** — Automatic detection when projects violate protected zones
- 📄 **Report Generation** — Generate detailed compliance reports for projects, companies, or regions

---

## Architecture

```
actinspace-2026/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/            # REST API routes
│   │   ├── db/             # Database models & queries
│   │   ├── schemas/        # Pydantic data schemas
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Helper utilities
│   ├── main.py             # FastAPI application entry
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components (Map views)
│   │   ├── services/       # API client services
│   │   ├── utils/          # Risk model & polygon utilities
│   │   └── data/           # Mock data & GeoJSON files
│   └── package.json        # Node dependencies
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python** 3.12+
- **Node.js** 18+
- **Supabase** account (for database)
- **Mapbox** API key (for map visualization)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
echo "VITE_MAPBOX_TOKEN=your_mapbox_token" >> .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🤖 AI Risk Model

MONVI uses a weighted risk scoring system that considers multiple variables:

| Factor | Weight | Description |
|--------|--------|-------------|
| Red Zone Events | 15% | Incursions into prohibited areas |
| Historical Risk | 15% | Past compliance history |
| Temporal Trend | 13% | Risk trajectory over time |
| Expansion Velocity | 12% | Rate of project expansion |
| Sensitive Zone Proximity | 12% | Distance to protected areas |
| Exit Frequency | 10% | Frequency of boundary exits |
| Affected Surface | 10% | Total impact area |
| Yellow Zone Events | 8% | Warning zone incursions |
| Project Duration | 5% | Time since project start |

### Risk Levels

| Score | Level | Description |
|-------|-------|-------------|
| 1-29 | 🟢 Low | Compliant, routine monitoring |
| 30-59 | 🟡 Medium | Preventive inspection recommended |
| 60-79 | 🟠 High | Immediate intervention required |
| 80-100 | 🔴 Critical | Urgent corrective action needed |

---

## Features

### Interactive Map
- Pan and zoom across all Mexican states
- Filter projects by status, category, and year
- Click markers to view project details
- Visualize work zones and protected areas

### Project Detail View
- Satellite imagery comparison (baseline vs current)
- AI risk score with breakdown of contributing factors
- Environmental metrics (vegetation loss, carbon footprint)
- Company and region context

### Report Generation
- Project-level compliance reports
- Company-wide metrics and history
- Regional environmental analysis
- Export to PDF, Excel, or Word

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — Modern Python web framework
- **[Supabase](https://supabase.com/)** — PostgreSQL database with real-time subscriptions
- **[Pydantic](https://docs.pydantic.dev/)** — Data validation and settings management
- **[Uvicorn](https://www.uvicorn.org/)** — ASGI server

### Frontend
- **[React 19](https://react.dev/)** — UI component library
- **[Vite 7](https://vitejs.dev/)** — Next-generation build tool
- **[Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/)** — Interactive map visualization
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework

---

## Environmental Impact

MONVI was created to address the critical need for environmental oversight in construction projects. By providing:

- **Transparency** — Open access to project compliance data
- **Accountability** — Track companies' environmental records
- **Prevention** — Early detection of potential violations
- **Data-Driven Decisions** — Evidence-based regulatory enforcement

---

## License & Status

This project was originally developed during the **ActInSpace 2026** hackathon to address **Challenge CNES #6: Green Space: Protecting forests from above**.

⚠️ **Development Status**: This is a hackathon prototype that is still in possible development. Features may be incomplete, and the codebase may undergo significant changes. Contributions and feedback are welcome!

---

## 👥 Team

Built with 💚 for a sustainable Mexico.