# =============================================================================
# File: download_real_ocean_data.py
# Purpose: Download REAL ocean temperature data from Copernicus Marine API
# Author: Keyuri Ramani
# Date: September 2026
#
# What this code does:
# - Downloads real ocean model data from Copernicus Marine Service
# - Data includes: latitude, longitude, depth, time, temperature
# - Covers Arabian Sea region (near India)
# - Saves as NetCDF file for our backend
# =============================================================================

import xarray as xr
import cdsapi  # Copernicus Data Store API
import os

print("=" * 60)
print("DOWNLOADING REAL OCEAN DATA FROM COPERNICUS MARINE")
print("=" * 60)

# Check if CDS API key is configured
cds_api_key = os.getenv('CDSAPI_KEY')

if cds_api_key is None:
    print("\n❌ CDS API key not found!")
    print("\nTo download real data, you need to:")
    print("1. Register at: https://data.marine.copernicus.eu/")
    print("2. Get your API key from your profile")
    print("3. Set environment variable: CDSAPI_KEY=your_key_here")
    print("\nFor now, we'll create synthetic data as a placeholder...")
    print("\n" + "=" * 60)
    
    # Fall back to synthetic data
    import numpy as np
    from datetime import datetime, timedelta
    
    print("\nCreating synthetic ocean data (placeholder)...")
    
    # Define dimensions
    latitudes = np.linspace(10, 25, 16)
    longitudes = np.linspace(65, 80, 16)
    depths = np.array([0, 10, 20, 50, 100, 200, 300, 500, 750, 1000])
    start_time = datetime(2025, 1, 1, 0, 0, 0)
    times = [start_time + timedelta(hours=6*i) for i in range(20)]
    
    # Create temperature data
    temperature = np.zeros((len(times), len(depths), len(latitudes), len(longitudes)))
    
    for t_idx in range(len(times)):
        for d_idx, depth in enumerate(depths):
            for lat_idx, lat in enumerate(latitudes):
                for lon_idx, lon in enumerate(longitudes):
                    surface_temp = 28 - 0.3 * (lat - 10)
                    if depth < 100:
                        depth_temp = surface_temp - 0.02 * depth
                    elif depth < 500:
                        depth_temp = surface_temp - 2 - 0.01 * (depth - 100)
                    else:
                        depth_temp = 4 + 0.001 * (1000 - depth)
                    temp = depth_temp + 0.5 * np.sin(2 * np.pi * t_idx / 20)
                    temp += np.random.normal(0, 0.1)
                    temperature[t_idx, d_idx, lat_idx, lon_idx] = temp
    
    # Create dataset
    ds = xr.Dataset(
        data_vars={
            'temperature': (['time', 'depth', 'lat', 'lon'], temperature, {
                'long_name': 'Sea Water Temperature',
                'units': 'degC'
            })
        },
        coords={
            'time': times,
            'depth': depths,
            'lat': latitudes,
            'lon': longitudes
        },
        attrs={
            'title': 'Synthetic Ocean Temperature Data (Placeholder)',
            'description': 'Synthetic data - Replace with real Copernicus Marine data',
            'source': 'OceanView3D - Smart India Hackathon 2026'
        }
    )
    
    ds.to_netcdf("ocean_temperature.nc")
    print("\n✅ Synthetic data saved to: ocean_temperature.nc")
    print("\nNote: This is PLACEHOLDER data. For real data, register at Copernicus Marine.")
    
else:
    print("\n✅ CDS API key found! Downloading real data...")
    
    # Initialize CDS API client
    c = cdsapi.Client()
    
    # Download ocean temperature data
    print("\nRequesting data from Copernicus Marine...")
    print("This may take 2-5 minutes...")
    
    data = c.retrieve(
        'cmems_mod_glo_phy_my_0.083deg_P1D-m',
        {
            'variable': 'sea_water_temperature',
            'product_type': 'reanalysis',
            'year': '2025',
            'month': '01',
            'day': ['01', '02', '03', '04', '05'],
            'time': ['00:00', '06:00', '12:00', '18:00'],
            'depth': ['0', '10', '20', '50', '100', '200', '300', '500', '750', '1000'],
            'area': [25, 65, 10, 80],  # North, West, South, East (Arabian Sea)
            'data_format': 'netcdf',
            'download_format': 'unarchived'
        },
        'ocean_temperature.nc'
    )
    
    print("\n✅ Real data downloaded successfully!")
    print("Saved to: ocean_temperature.nc")
    
    # Open and verify
    ds = xr.open_dataset("ocean_temperature.nc")
    print("\nDataset info:")
    print(ds)

print("\n" + "=" * 60)