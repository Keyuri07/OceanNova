# =============================================================================
# File: download_data.py
# Purpose: Download sample ocean temperature data for testing
# Author: Keyuri Ramani
# Date: September 2026
# 
# What this code does:
# - Uses xarray's built-in sample dataset (air temperature)
# - Saves it as a NetCDF file for our project
# - This simulates real ocean model data from INCOIS/Copernicus
# =============================================================================

# Import xarray library for working with multi-dimensional data
import xarray as xr

print("=" * 60)
print("STEP 1: Downloading sample dataset...")
print("=" * 60)

# Load a sample dataset that comes with xarray
# This is air temperature data (similar structure to ocean temperature data)
air_temperature = xr.tutorial.open_dataset("air_temperature")

# Display basic information about the dataset
print("\nDataset loaded successfully!")
print("\nDataset Information:")
print(air_temperature)

# Save the dataset as a NetCDF file in our project folder
print("\n" + "=" * 60)
print("STEP 2: Saving data as NetCDF file...")
print("=" * 60)

air_temperature.to_netcdf("sample_air_temp.nc")

print("\n✅ Success! Data saved to: sample_air_temp.nc")
print("\nYou can now use this file for testing the backend API.")
print("=" * 60)