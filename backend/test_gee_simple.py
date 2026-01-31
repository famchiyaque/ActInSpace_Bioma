"""Simple GEE test to verify setup"""
import ee
from app.config import settings

print("Initializing Earth Engine...")
ee.Initialize(project=settings.gee_project_id)
print("✓ EE initialized")

# Test basic query
print("\nTesting Sentinel-2 query...")
geometry = ee.Geometry.Rectangle([-60.0, -3.0, -59.9, -2.9])
collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
    .filterBounds(geometry) \
    .filterDate('2023-01-01', '2023-06-30') \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 80))

count = collection.size().getInfo()
print(f"✓ Found {count} Sentinel-2 images")

if count > 0:
    first = collection.first()
    props = first.propertyNames().getInfo()
    print(f"✓ Image properties: {props[:5]}...")
    print("\n✅ GEE integration working!")
else:
    print("\n⚠ No images found - try different location/dates")
