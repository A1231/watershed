# Watershed Backend API

A Django REST API for watershed analysis that connects to Supabase for 12-digit HUC subwatershed data. This API serves as the backend for an interactive React frontend that visualizes North Carolina watersheds on a map.

## Features

- **Find watershed by coordinates** (latitude/longitude)
- **Get watershed data by HUC code** (8, 10, or 12 digit)
- **Get all watersheds in a specific basin** (case-insensitive search)
- **Get watersheds by HUC-12 name** (case-insensitive search with autocomplete)
- **Autocomplete suggestions** for basin names and HUC-12 names
- **Geographic queries** using PostGIS/GeoDjango
- **CORS support** for React frontend integration

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Setup
Create a `.env` file in the backend directory:
```bash
DEBUG=True
SUPABASE_DB_NAME=your-db-name
SUPABASE_USER=your-username
SUPABASE_PASSWORD=your-password
SUPABASE_HOST=your-project-ref.supabase.co
```

### 3. Run the Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### 1. Get Watershed by HUC Code
**GET** `/watershed/huc/{huc_code}/`

Get watershed data by HUC code (8, 10, or 12 digit).

**Example:**
```
GET /watershed/huc/030300010101/
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "type": "Feature",
        "properties": {
            "huc_12": "030300010101",
            "hu_12_name": "Cape Fear River Basin",
            "dwq_basin": "Cape Fear",
            "area": 45.2,
            "population": 1500,
            "acres": 11168.5
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [...]
        }
    },
    "message": "Found watershed: Cape Fear River Basin"
}
```

### 2. Get Watersheds in Basin
**GET** `/watersheds/basin/{basin_name}/`

Get all watersheds in a specific basin (case-insensitive).

**Example:**
```
GET /watersheds/basin/cape fear/
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "type": "FeatureCollection",
        "features": [...]
    },
    "count": 15,
    "message": "Found 15 watersheds in cape fear basin"
}
```

### 3. Get Watersheds by HUC-12 Name
**GET** `/watersheds/hu12name/{hu_12_name}/`

Get all watersheds matching a HUC-12 name (case-insensitive).

**Example:**
```
GET /watersheds/hu12name/cape fear/
```

### 4. Autocomplete Endpoints

#### Basin Names Autocomplete
**GET** `/autocomplete/basin/?q={query}`

Get autocomplete suggestions for basin names.

**Example:**
```
GET /autocomplete/basin/?q=ca
```

**Response:**
```json
{
    "status": "success",
    "data": ["Cape Fear", "Catawba"],
    "count": 2,
    "message": "Found 2 basin names matching \"ca\""
}
```

#### HUC-12 Names Autocomplete
**GET** `/autocomplete/hu12name/?q={query}`

Get autocomplete suggestions for HUC-12 names.

**Example:**
```
GET /autocomplete/hu12name/?q=cape
```

## Frontend Integration

This API is designed to work with the React frontend located in the `frontend/` directory. The frontend provides:

- **Interactive map** with Leaflet/React-Leaflet
- **Search functionality** with autocomplete dropdowns
- **Real-time suggestions** as users type
- **Polygon visualization** of watershed boundaries
- **Responsive design** for mobile and desktop

### CORS Configuration

The API is configured to allow requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)
- Production frontend URL (set via `FRONTEND_URL` environment variable)

## Model Structure

The `Watersheds` model includes:
- **HUC codes**: 8, 10, and 12 digit identifiers
- **Geographic boundaries**: PostGIS geometry field
- **Area and population data**: Current and historical
- **Basin information**: DWQ basin names
- **HUC-12 names**: Descriptive watershed names

## Production Deployment

### Environment Variables
Set these in your production environment:
```bash
DEBUG=False
FRONTEND_URL=https://your-vercel-app.vercel.app
SUPABASE_DB_NAME=your-production-db
SUPABASE_USER=your-production-user
SUPABASE_PASSWORD=your-production-password
SUPABASE_HOST=your-production-host
```

### Running in Production
```bash
gunicorn watershed_backend.wsgi:application
```

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:
- **400**: Bad Request (missing/invalid parameters)
- **404**: Not Found (no watershed found)
- **500**: Internal Server Error

## Development Notes

- **Model Management**: Uses `managed = False` since the table is managed by Supabase
- **GeoDjango**: Used for spatial queries and coordinate transformations
- **CORS**: Configured for React frontend integration
- **Autocomplete**: Debounced search with 300ms delay
- **Coordinate Transformation**: Handles Web Mercator to WGS84 conversion

## Tech Stack

- **Backend**: Django 5.2.6 + Django REST Framework
- **Database**: PostgreSQL with PostGIS extension
- **Frontend**: React + Vite + Leaflet
- **Deployment**: Backend on Render/Railway, Frontend on Vercel
- **Database Hosting**: Supabase
