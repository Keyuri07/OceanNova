# 🌊 OceanView3D

## Interactive 3D Visualization Platform for Ocean Model Data and In-Situ Observations

OceanView3D is a web-based interactive 3D visualization platform developed for **Smart India Hackathon (SIH) 2026 – Problem Statement 26067**.

The platform allows users to explore ocean temperature data through an interactive 3D globe using depth and time controls, along with visualization of in-situ observation points such as Argo floats.

---

## 🎯 Problem Statement

**SIH 2026 – Problem Statement 26067**

Develop a web-based interactive 3D visualization platform integrating numerical ocean model outputs and in-situ observations.

---

## 💡 Project Overview

OceanView3D provides an interactive interface for exploring ocean temperature data spatially and temporally.

Users can:

- 🌍 Explore the ocean using a 3D globe
- 🌡️ Visualize ocean temperature as a heatmap
- 📏 Change ocean depth levels
- ⏱️ Explore different time steps
- ▶️ Play temperature changes as an animation
- 🚀 Adjust animation speed
- 📍 View Argo observation markers
- 📊 View temperature ranges through the color bar

---

## ✨ Key Features

### 🌍 Interactive 3D Globe

CesiumJS is used to provide an interactive 3D Earth visualization.

### 🌡️ Ocean Temperature Visualization

Temperature values are displayed over the Arabian Sea region using a smooth color-based heatmap.

### 📏 Depth Control

Users can explore different ocean depth levels including:

- 0 m
- 10 m
- 20 m
- 50 m
- 100 m
- 200 m
- 300 m
- 500 m
- 750 m
- 1000 m

### ⏱️ Time Control

Users can move through available model time steps using the time slider.

### ▶️ Time Animation

The Play/Pause control allows users to observe temperature changes over time.

### 🚀 Animation Speed

Users can control the animation speed from 1x to 10x.

### 📍 Argo Float Visualization

Argo observation points are displayed as interactive markers on the globe.

Clicking a marker displays information such as:

- Float ID
- Location
- Depth
- Temperature
- Observation time

---

## 🏗️ System Architecture

```text
                 Ocean Temperature Dataset
                           │
                           ▼
                    Python / xarray
                           │
                           ▼
                     FastAPI Backend
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              Temperature API   Argo API
                    │             │
                    └──────┬──────┘
                           ▼
                      Web Frontend
                           │
                           ▼
                        CesiumJS
                           │
                           ▼
                  Interactive 3D Globe
```

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| 3D Visualization | CesiumJS |
| Backend | Python, FastAPI |
| Data Processing | xarray, NumPy |
| Data Format | NetCDF |
| API | REST API |
| Backend Deployment | Render |
| Frontend Deployment | Netlify |
| Version Control | Git & GitHub |

---

## 🔌 API Endpoints

| Endpoint | Purpose |
|---|---|
| `/` | Backend status |
| `/api/temperature` | Get temperature data for selected depth and time |
| `/api/available_depths` | Get available depth levels |
| `/api/available_times` | Get available time steps |
| `/api/argo_floats` | Get Argo observation points |
| `/docs` | FastAPI interactive API documentation |

---

## 📊 Current Dataset

The current MVP uses a **synthetic ocean temperature dataset** covering a region of the Arabian Sea.

### Dataset Characteristics

- **Time steps:** 20
- **Depth levels:** 10
- **Latitude points:** 16
- **Longitude points:** 16
- **Region:** approximately 10°N–25°N and 65°E–80°E
- **Temperature variable:** Ocean temperature
- **Unit:** °C

The current Argo markers are also sample/synthetic observation data used for MVP demonstration.

---

## 🌐 Live Demo

### Frontend

https://ocennova.netlify.app

### Backend API

https://oceannova-y07i.onrender.com

### API Documentation

https://oceannova-y07i.onrender.com/docs

---

## 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Krupali-02/OceanNova.git
cd OceanNova
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the FastAPI backend

```bash
python -m uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### 4. Open the frontend

Open `index.html` using a local web server or suitable development environment.

---

## 📁 Project Structure

```text
OceanNova/
│
├── main.py
├── create_ocean_dataset.py
├── ocean_temperature.nc
├── requirements.txt
├── index.html
├── script.js
├── style.css
└── README.md
```

---

## 🔄 Visualization Workflow

```text
                         User
                           │
                           ▼
                  Select Depth + Time
                           │
                           ▼
                Frontend API Request
                           │
                           ▼
                    FastAPI Backend
                           │
                           ▼
                 xarray reads NetCDF
                           │
                           ▼
              Temperature Data as JSON
                           │
                           ▼
                   CesiumJS Rendering
                           │
                           ▼
                Interactive 3D Ocean View
```

---

## 🎓 Project Objective

The objective of OceanView3D is to provide an intuitive visual interface for exploring multidimensional ocean data and observation points.

The platform demonstrates how numerical ocean model outputs and in-situ observations can be presented through an interactive 3D web application.

---

## 🔬 Main Functional Modules

### 1. Ocean Temperature Module

Provides temperature visualization for the selected depth and time.

### 2. Depth Exploration Module

Allows users to explore temperature conditions at multiple ocean depths.

### 3. Time Exploration Module

Allows users to move between available model time steps.

### 4. Animation Module

Provides Play/Pause functionality and adjustable animation speed.

### 5. Argo Observation Module

Displays sample Argo float observations as interactive markers.

### 6. Visualization Module

Uses CesiumJS to present the data on an interactive 3D globe.

### 7. Backend API Module

FastAPI provides REST endpoints for serving ocean and observation data to the frontend.

---

## 🔮 Future Scope

Future versions can include:

- Real-time ocean data integration
- Real Argo observation datasets
- Larger numerical ocean model datasets
- Additional ocean parameters such as salinity and currents
- More advanced spatial analysis
- Real-time data updates
- Improved data filtering
- Additional visualization layers
- Cloud-based data processing
- Integration with authoritative ocean-data sources

---

## 👥 Team

### Team Name

**Blue Nexux**

### Project

**OceanView3D**

### Event

**Smart India Hackathon 2026**

---

## ⚠️ MVP Data Note

The current demonstration version uses **synthetic/sample ocean temperature and Argo observation data** for development and visualization purposes.

It is not presented as live operational ocean observation data.

---

## 📌 Project Status

The current MVP includes:

- ✅ Interactive 3D globe
- ✅ Ocean temperature heatmap
- ✅ Depth selection
- ✅ Time selection
- ✅ Play/Pause animation
- ✅ Animation speed control
- ✅ Argo observation markers
- ✅ FastAPI backend
- ✅ NetCDF dataset
- ✅ Render deployment
- ✅ Netlify deployment

---

## 📜 License

This project is developed as an academic and hackathon project for **Smart India Hackathon 2026**.
