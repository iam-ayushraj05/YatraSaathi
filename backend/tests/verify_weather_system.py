import asyncio
import sys
import os
from httpx import AsyncClient, ASGITransport

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

async def test_weather_system():
    print("=" * 60)
    print("VERIFYING YATRASAATHI LOCATION-BASED WEATHER SYSTEM")
    print("=" * 60)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Location 1: Patna, Bihar (25.5941, 85.1376)
        print("\n[TEST 1] Querying Weather for Patna (25.5941, 85.1376)...")
        resp1 = await client.get("/api/v1/context/weather?lat=25.5941&lng=85.1376")
        print(f" -> Status Code: {resp1.status_code}")
        assert resp1.status_code == 200, f"Patna weather query failed: {resp1.text}"
        data1 = resp1.json()["data"]
        print(f" -> Provider: {data1.get('provider')}")
        print(f" -> Condition: {data1.get('condition')}")
        print(f" -> Temperature: {data1.get('temperature_c')}°C")
        print(f" -> Wind Speed: {data1.get('wind_speed_kph')} km/h")
        print(f" -> Raw Metadata: {data1.get('raw_metadata')}")
        assert data1.get('provider') in ("open-meteo", "openweathermap"), "Provider should be open-meteo or openweathermap"

        # Location 2: New Delhi (28.6139, 77.2090)
        print("\n[TEST 2] Querying Weather for New Delhi (28.6139, 77.2090)...")
        resp2 = await client.get("/api/v1/context/weather?lat=28.6139&lng=77.2090")
        print(f" -> Status Code: {resp2.status_code}")
        assert resp2.status_code == 200, f"Delhi weather query failed: {resp2.text}"
        data2 = resp2.json()["data"]
        print(f" -> Provider: {data2.get('provider')}")
        print(f" -> Condition: {data2.get('condition')}")
        print(f" -> Temperature: {data2.get('temperature_c')}°C")
        print(f" -> Wind Speed: {data2.get('wind_speed_kph')} km/h")
        print(f" -> Raw Metadata: {data2.get('raw_metadata')}")
        assert data2.get('provider') in ("open-meteo", "openweathermap")

        # Location 3: Mumbai (19.0760, 72.8777)
        print("\n[TEST 3] Querying Weather for Mumbai (19.0760, 72.8777)...")
        resp3 = await client.get("/api/v1/context/weather?lat=19.0760&lng=72.8777")
        print(f" -> Status Code: {resp3.status_code}")
        assert resp3.status_code == 200, f"Mumbai weather query failed: {resp3.text}"
        data3 = resp3.json()["data"]
        print(f" -> Provider: {data3.get('provider')}")
        print(f" -> Temperature: {data3.get('temperature_c')}°C")

        # Location 4: Invalid coordinates validation
        print("\n[TEST 4] Querying Weather with Invalid Coordinates (100.0, 200.0)...")
        resp_inv = await client.get("/api/v1/context/weather?lat=100.0&lng=200.0")
        print(f" -> Status Code: {resp_inv.status_code} (Expected 400)")
        assert resp_inv.status_code == 400, "Invalid coordinates should return 400 HTTP error"

        print("\n" + "=" * 60)
        print("ALL WEATHER SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_weather_system())
