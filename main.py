# =============================================================================
# File: main.py
# Purpose: FastAPI backend to serve ocean temperature data with DEPTH dimension
# Author: Keyuri Ramani
# Date: September 2026
#
# What this code does:
# - Loads ocean temperature data (time, depth, lat, lon, temperature)
# - Provides API endpoint: /api/temperature?depth=100&time=...
# - Returns temperature grid at specified depth and time
# - This is what Person 2's frontend will call for 3D visualization
# =============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import xarray as xr
import numpy as np

# Create FastAPI application
app = FastAPI(
    title="OceanView3D API",
    description="Backend API for 3D Ocean Data Visualization - Ocean Temperature with Depth",
    version="2.0.0"
)

# Add CORS middleware (allows frontend to call API from different domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ocean dataset when server starts
print("=" * 60)
print("LOADING OCEAN TEMPERATURE DATASET...")
print("=" * 60)

try:
    ds = xr.open_dataset("ocean_temperature.nc")
    print(f"✅ Dataset loaded successfully!")
    print(f"   Variables: {list(ds.data_vars)}")
    print(f"   Dimensions: {dict(ds.dims)}")
    print(f"   Depth levels: {ds.depth.values}")
    print(f"   Time steps: {len(ds.time)}")
    print(f"   Grid: {len(ds.lat)} × {len(ds.lon)}")
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    print("Make sure ocean_temperature.nc file exists in the same folder!")
    raise

print("=" * 60)

# Root endpoint
@app.get("/")
def read_root():
    """
    Welcome message and API documentation
    """
    return {
        "message": "Welcome to OceanView3D API v2.0!",
        "description": "Ocean temperature data with depth dimension",
        "documentation": "/docs",
        "endpoints": {
            "temperature_at_depth": "/api/temperature?depth=100&time=2025-01-01T00:00:00",
            "available_depths": "/api/available_depths",
            "available_times": "/api/available_times"
        }
    }

# Main endpoint: Get temperature at specific depth and time
@app.get("/api/temperature")
def get_temperature(depth: float = 100, time: str = "2025-01-01T00:00:00"):
    """
    Get ocean temperature at a specific depth and time.
    
    Parameters:
    - depth: Depth in meters (e.g., 0, 100, 500, 1000)
    - time: Timestamp in ISO format (e.g., '2025-01-01T00:00:00')
    
    Returns:
    - JSON with temperature grid (latitude, longitude, temperature values)
    """
    try:
        # Select data at requested depth and time
        temp_data = ds['temperature'].sel(depth=depth, time=time, method='nearest')
        
        # Get coordinate values
        latitudes = temp_data.lat.values.tolist()
        longitudes = temp_data.lon.values.tolist()
        temperature = temp_data.values.tolist()
        
        # Prepare response
        response = {
            "depth": float(depth),
            "time": str(temp_data.time.values),
            "variable": "sea_water_temperature",
            "units": "degC",
            "shape": {
                "latitude": len(latitudes),
                "longitude": len(longitudes)
            },
            "data": {
                "latitude": latitudes,
                "longitude": longitudes,
                "temperature": temperature
            },
            "stats": {
                "min_temp": float(np.nanmin(temp_data.values)),
                "max_temp": float(np.nanmax(temp_data.values)),
                "mean_temp": float(np.nanmean(temp_data.values))
            }
        }
        
        return response
        
    except Exception as e:
        return {
            "error": f"Failed to retrieve data: {str(e)}",
            "available_depths": ds.depth.values.tolist(),
            "available_times": [str(t.values) for t in ds.time.values[:5]]
        }

# Endpoint: Get list of available depths
@app.get("/api/available_depths")
def get_available_depths():
    """
    Get list of all available depth levels.
    
    Returns:
    - List of depth values in meters
    """
    depths = ds.depth.values.tolist()
    
    return {
        "total_depths": len(depths),
        "min_depth": depths[0],
        "max_depth": depths[-1],
        "depths": depths
    }

# Endpoint: Get list of available times
@app.get("/api/available_times")
def get_available_times():
    """
    Get list of all available timestamps.
    
    Returns:
    - List of timestamps (ISO format strings)
    """
    times = [str(t.values) for t in ds.time.values]
    
    return {
        "total_times": len(times),
        "first_time": times[0],
        "last_time": times[-1],
        "sample_times": times[:10]
    }

# Run server: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)