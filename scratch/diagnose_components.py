import time
import os
import asyncio
import httpx
from dotenv import load_dotenv
load_dotenv(".env")

# 1. Test Gemini API latency
async def test_gemini():
    gemini_key = os.getenv("GEMINI_API_KEY")
    key_disp = gemini_key[:10] if gemini_key else "None"
    print(f"\n[DIAGNOSTIC] Testing Gemini API with key: {key_disp}...")

    if not gemini_key:
        print("No GEMINI_API_KEY")
        return
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        t0 = time.perf_counter()
        resp = await asyncio.wait_for(
            asyncio.to_thread(model.generate_content, "Say hello in 3 words."),
            timeout=5.0
        )
        t1 = time.perf_counter()
        print(f"Gemini API SUCCESS in {(t1-t0)*1000:.2f} ms: {resp.text}")
    except Exception as e:
        print(f"Gemini API ERROR/TIMEOUT: {e}")

# 2. Test Murf TTS API latency
async def test_murf():
    murf_key = os.getenv("MURF_API_KEY")
    print(f"\n[DIAGNOSTIC] Testing Murf TTS API with key: {murf_key[:10]}...")
    if not murf_key:
        print("No MURF_API_KEY")
        return
    url = "https://api.murf.ai/v1/speech/generate"
    headers = {"api-key": murf_key, "Content-Type": "application/json"}
    payload = {
        "voiceId": "en-US-natalie",
        "text": "Hello, how can I help you?",
        "style": "Conversational",
        "sampleRate": 24000,
        "format": "MP3"
    }
    t0 = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            t1 = time.perf_counter()
            print(f"Murf TTS API Status {resp.status_code} in {(t1-t0)*1000:.2f} ms")
            if resp.status_code == 200:
                print(f"Audio URL: {resp.json().get('audioFile')[:50]}...")
    except Exception as e:
        print(f"Murf TTS ERROR/TIMEOUT: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv("backend/.env")
    asyncio.run(test_gemini())
    asyncio.run(test_murf())
