# =============================================================================
# File: explore_data.py
# Purpose: Explore the structure of the NetCDF data file
# Author: Keyuri Ramani
# Date: September 2026
#
# What this code does:
# - Opens the sample_air_temp.nc file we downloaded
# - Shows us the data structure (dimensions, variables, coordinates)
# - Helps us understand what data we're working with
# - This is like "exploratory data analysis" for NetCDF files
# =============================================================================

# Import xarray library for working with multi-dimensional scientific data
import xarray as xr

print("=" * 60)
print("EXPLORING NETCDF DATA STRUCTURE")
print("=" * 60)

# Open the NetCDF file we downloaded earlier
# This file contains air temperature data (similar to ocean temperature)
ds = xr.open_dataset("sample_air_temp.nc")

# Display the complete dataset structure
print("\n=== COMPLETE DATASET STRUCTURE ===")
print(ds)

# Show what variables are available in the dataset
print("\n=== AVAILABLE VARIABLES (Data we can use) ===")
print(ds.data_vars)

# Show the dimensions of the data (size of each axis)
print("\n=== DIMENSIONS (Shape of the data) ===")
print(ds.dims)

# Show the coordinates (latitude, longitude, time values)
print("\n=== COORDINATES (Grid points and timestamps) ===")
print(ds.coords)

# Show data types and some sample values
print("\n=== DATA TYPES AND SAMPLE VALUES ===")
for variable in ds.data_vars:
    print(f"\n{variable}:")
    print(f"  Data type: {ds[variable].dtype}")
    print(f"  Shape: {ds[variable].shape}")
    print(f"  Sample value: {ds[variable].values.flat[0]}")

print("\n" + "=" * 60)
print("✅ Data exploration complete!")
print("=" * 60)
print("\nNext step: We'll extract specific data (e.g., temperature at a specific time)")