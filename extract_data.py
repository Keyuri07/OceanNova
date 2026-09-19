# =============================================================================
# File: extract_data.py
# Purpose: Extract temperature data at a specific time and location
# Author: Keyuri Ramani
# Date: September 2026
#
# What this code does:
# - Opens the NetCDF file
# - Selects data at a specific time (e.g., January 1, 2013)
# - Extracts temperature values at that time
# - Converts data to a format we can use in our API
# - This simulates what our API will do when users request data
# =============================================================================

# Import xarray for working with NetCDF data
import xarray as xr
# Import json for converting data to API format
import json

print("=" * 60)
print("EXTRACTING DATA AT SPECIFIC TIME")
print("=" * 60)

# Open the NetCDF file
ds = xr.open_dataset("sample_air_temp.nc")

# Show available times in the dataset
print("\n=== AVAILABLE TIMESTEPS IN DATASET ===")
print(f"First 5 times: {ds.time.values[:5]}")
print(f"Total timesteps: {len(ds.time)}")

# Select data at a specific time
# This is what our API will do when a user requests data for a specific date
selected_time = "2013-01-01T00:00:00"
print(f"\n=== SELECTING DATA AT: {selected_time} ===")

# Use .sel() to select by coordinate value (time in this case)
air_temp = ds['air'].sel(time=selected_time)

# Display the selected data
print(f"\nExtracted data shape: {air_temp.shape}")
print(f"Latitude range: {air_temp.lat.values[0]} to {air_temp.lat.values[-1]}")
print(f"Longitude range: {air_temp.lon.values[0]} to {air_temp.lon.values[-1]}")
print(f"Temperature range: {air_temp.values.min():.2f}K to {air_temp.values.max():.2f}K")

# Convert temperature from Kelvin to Celsius (more intuitive for users)
temp_celsius = air_temp.values - 273.15
print(f"Temperature in Celsius: {temp_celsius.min():.2f}°C to {temp_celsius.max():.2f}°C")

# Prepare data in JSON format (what our API will return)
print("\n=== CONVERTING TO JSON FORMAT FOR API ===")

api_response = {
    "time": str(air_temp.time.values),
    "variable": "air_temperature",
    "units": "Celsius",
    "data": {
        "latitude": air_temp.lat.values.tolist(),
        "longitude": air_temp.lon.values.tolist(),
        "temperature_celsius": temp_celsius.tolist()
    }
}

# Print a sample of the JSON (first 500 characters)
print("\nJSON Response (first 500 chars):")
print(json.dumps(api_response, indent=2)[:500] + "...")

# Save to a JSON file (optional, for testing)
with open("sample_api_response.json", "w") as f:
    json.dump(api_response, f, indent=2)

print("\n✅ Full JSON response saved to: sample_api_response.json")
print("=" * 60)
print("\nNext step: We'll create the FastAPI backend to serve this data!")