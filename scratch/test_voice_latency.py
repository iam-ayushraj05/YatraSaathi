import sys
import os
import time
import asyncio
sys.path.insert(0, os.path.abspath("backend"))
from dotenv import load_dotenv

load_dotenv("backend/.env")



from app.services.voice_service import VoiceService
from app.services.copilot_service import CopilotService

async def main():
    copilot_service = CopilotService()
    voice_service = VoiceService(copilot_service=copilot_service)
    
    print("\n==========================================")
    print("--- BENCHMARK 1: 'Hello' ---")
    print("==========================================")
    t0 = time.perf_counter()
    res1 = await voice_service.process_voice_pipeline(
        transcript_text="Hello",
        current_location={"lat": 28.6129, "lng": 77.2295}
    )
    t1 = time.perf_counter()
    print(f"Total time for 'Hello': {(t1-t0)*1000:.2f} ms")
    print(f"Response: {res1.get('response')[:100]}...")
    print(f"Audio URL: {res1.get('audio')}")

    print("\n==========================================")
    print("--- BENCHMARK 2: 'Find an accessible route to India Gate.' ---")
    print("==========================================")
    t2 = time.perf_counter()
    res2 = await voice_service.process_voice_pipeline(
        transcript_text="Find an accessible route to India Gate.",
        current_location={"lat": 28.6129, "lng": 77.2295}
    )
    t3 = time.perf_counter()
    print(f"Total time for route query: {(t3-t2)*1000:.2f} ms")
    print(f"Response: {res2.get('response')[:100]}...")
    print(f"Audio URL: {res2.get('audio')}")

if __name__ == "__main__":
    asyncio.run(main())
