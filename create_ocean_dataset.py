# =============================================================================
# File: create_ocean_dataset.py
# Purpose: Create synthetic ocean temperature data with depth dimension
# Author: Keyuri Ramani
# Date: September 2026
# =============================================================================

import numpy as np
import xarray as xr
from datetime import datetime, timedelta

print("=" * 60)
print("CREATING SYNTHETIC OCEAN TEMPERATURE DATASET")
print("=" * 60)

# Define dimensions
print("\nDefining grid dimensions...")

# Latitude: Arabian Sea region (10°N to 25°N)
latitudes = np.linspace(10, 25, 16)  # 16 points
print(f"  Latitude: {latitudes[0]}°N to {latitudes[-1]}°N ({len(latitudes)} points)")

# Longitude: Arabian Sea region (65°E to 80°E)
longitudes = np.linspace(65, 80, 16)  # 16 points
print(f"  Longitude: {longitudes[0]}°E to {longitudes[-1]}°E ({len(longitudes)} points)")

# Depth: Ocean depths (0 to 1000m)
depths = np.array([0, 10, 20, 50, 100, 200, 300, 500, 750, 1000])  # 10 depth levels
print(f"  Depth: {depths[0]}m to {depths[-1]}m ({len(depths)} levels)")

# Time: 5 days (6-hour intervals)
start_time = datetime(2025, 1, 1, 0, 0, 0)
times = [start_time + timedelta(hours=6*i) for i in range(20)]  # 20 time steps
print(f"  Time: {times[0]} to {times[-1]} ({len(times)} steps)")

print("\nGenerating temperature data...")

# Create 4D temperature array (time, depth, lat, lon)
temperature = np.zeros((len(times), len(depths), len(latitudes), len(longitudes)))

# Generate realistic ocean temperature profile
for t_idx in range(len(times)):
    for d_idx, depth in enumerate(depths):
        for lat_idx, lat in enumerate(latitudes):
            for lon_idx, lon in enumerate(longitudes):
                
                # Surface temperature (varies with latitude and time)
                surface_temp = 28 - 0.3 * (lat - 10)
                
                # Add daily variation
                daily_variation = 0.5 * np.sin(2 * np.pi * t_idx / 20)
                
                # Temperature decreases with depth (thermocline structure)
                if depth < 100:
                    depth_temp = surface_temp - 0.02 * depth
                elif depth < 500:
                    depth_temp = surface_temp - 2 - 0.01 * (depth - 100)
                else:
                    depth_temp = 4 + 0.001 * (1000 - depth)
                
                # Combine all effects
                temp = depth_temp + daily_variation
                
                # Add small random noise
                temp += np.random.normal(0, 0.1)
                
                temperature[t_idx, d_idx, lat_idx, lon_idx] = temp

print(f"  Temperature range: {temperature.min():.2f}°C to {temperature.max():.2f}°C")

# Create xarray Dataset
print("\nCreating xarray Dataset...")

ds = xr.Dataset(
    data_vars={
        'temperature': (['time', 'depth', 'lat', 'lon'], temperature, {
            'long_name': 'Sea Water Temperature',
            'units': 'degC',
            'standard_name': 'sea_water_temperature'
        })
    },
    coords={
        'time': times,
        'depth': depths,
        'lat': latitudes,
        'lon': longitudes
    },
    attrs={
        'title': 'Synthetic Ocean Temperature Data',
        'description': 'Synthetic ocean temperature data for Arabian Sea region',
        'source': 'Created for OceanView3D - Smart India Hackathon 2026',
        'region': 'Arabian Sea (10-25°N, 65-80°E)'
    }
)

print("\nDataset structure:")
print(ds)

# Save to NetCDF
print("\n" + "=" * 60)
print("SAVING TO NETCDF FILE...")
print("=" * 60)

ds.to_netcdf("ocean_temperature.nc")

print("\n✅ SUCCESS! Dataset saved to: ocean_temperature.nc")
print(f"\nDataset summary:")
print(f"  Variables: temperature")
print(f"  Dimensions: time ({len(times)}), depth ({len(depths)}), lat ({len(latitudes)}), lon ({len(longitudes)})")
print(f"  Grid size: {len(times)} × {len(depths)} × {len(latitudes)} × {len(longitudes)} = {temperature.size:,} data points")
print(f"  File size: ~{ds.nbytes / 1024:.1f} KB")

print("\n" + "=" * 60)
print("Next step: Update FastAPI backend to use this new dataset!")
print("=" * 60)