# =============================================================================
# File: main.py
# Purpose: FastAPI backend to serve ocean temperature data via REST API
# Author: Keyuri Ramani
# Date: September 2026
#
# What this code does:
# - Creates a web API using FastAPI
# - Loads NetCDF data when server starts
# - Provides endpoints to query temperature data at specific times
# - Returns data in JSON format for the frontend to use
# - This is the backend that Person 2's frontend will call
# =============================================================================

# Import FastAPI for creating the web API
from fastapi import FastAPI
# Import xarray for working with NetCDF data
import xarray as xr
# Import json for data conversion
import json

# Create the FastAPI application
app = FastAPI(
    title="OceanView3D API",
    description="Backend API for 3D Ocean Data Visualization Platform",
    version="1.0.0"
)

# Load the dataset once when the server starts
# This avoids reloading the file for every API request (faster performance)
print("=" * 60)
print("LOADING DATASET...")
ds = xr.open_dataset("sample_air_temp.nc")
print(f"✅ Dataset loaded successfully!")
print(f"   Variables: {list(ds.data_vars)}")
print(f"   Time steps: {len(ds.time)}")
print(f"   Grid size: {len(ds.lat)} x {len(ds.lon)}")
print("=" * 60)

# Define the root endpoint (homepage)
@app.get("/")
def read_root():
    """
    Root endpoint - Welcome message
    """
    return {
        "message": "Welcome to OceanView3D API!",
        "documentation": "/docs",
        "endpoints": {
            "temperature": "/api/temperature?time=2013-01-01T00:00:00"
        }
    }

# Define the temperature data endpoint
@app.get("/api/temperature")
def get_temperature(time: str = "2013-01-01T00:00:00"):
    """
    Get air temperature data at a specific time.
    
    Parameters:
    - time: Timestamp in ISO format (e.g., '2013-01-01T00:00:00')
    
    Returns:
    - JSON object with temperature data (latitude, longitude, temperature values)
    """
    try:
        # Select data at the requested time
        air_temp = ds['air'].sel(time=time)
        
        # Convert temperature from Kelvin to Celsius
        temp_celsius = air_temp.values - 273.15
        
        # Prepare response in JSON format
        response = {
            "time": str(air_temp.time.values),
            "variable": "air_temperature",
            "units": "Celsius",
            "shape": {
                "latitude": len(air_temp.lat.values),
                "longitude": len(air_temp.lon.values)
            },
            "data": {
                "latitude": air_temp.lat.values.tolist(),
                "longitude": air_temp.lon.values.tolist(),
                "temperature_celsius": temp_celsius.tolist()
            }
        }
        
        return response
        
    except Exception as e:
        # Handle errors (e.g., invalid time)
        return {
            "error": f"Failed to retrieve data: {str(e)}",
            "available_times": [
                "2013-01-01T00:00:00",
                "2013-01-01T06:00:00",
                "2013-01-01T12:00:00"
            ]
        }

# Define an endpoint to list available times
@app.get("/api/available_times")
def get_available_times():
    """
    Get list of all available timestamps in the dataset.
    
    Returns:
    - List of timestamps (ISO format strings)
    """
    # Convert datetime64 to strings
    times = [str(t.values) for t in ds.time.values]
    
    return {
        "total_times": len(times),
        "first_time": times[0],
        "last_time": times[-1],
        "sample_times": times[:10]  # First 10 times as examples
    }

# This code runs when you start the server with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)