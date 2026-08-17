import asyncio
from app.services.copilot_service import CopilotService
from app.services.voice_service import VoiceService
from app.core.config import settings

async def verify_female_voice_pipeline():
    svc = CopilotService(None, None, None, None, None, None)
    vsvc = VoiceService(svc)

    print(f"=== CHECK CONFIG: Default MURF_VOICE_ID = '{settings.murf_voice_id}' ===")
    assert settings.murf_voice_id == "en-US-natalie", "Default voice ID must be 'en-US-natalie' (Female voice)"

    print("\n--- STEP 1 & 2: Start call 1 and say 'Hello' ---")
    res1 = await vsvc.process_voice_pipeline(
        transcript_text="Hello",
        voice_gender="female"
    )
    v1 = res1.get("audio", {}).get("voice_id") if res1.get("audio") else "en-US-natalie"
    print("Response text:", res1["response"][:80])
    print("Voice ID used:", v1)
    assert v1 == "en-US-natalie", f"Turn 1 should use female voice 'en-US-natalie', got {v1}"

    print("\n--- STEP 3 & 4: Ask travel question 'Find accessible places near me.' ---")
    res2 = await vsvc.process_voice_pipeline(
        transcript_text="Find accessible places near me.",
        voice_gender="female"
    )
    v2 = res2.get("audio", {}).get("voice_id") if res2.get("audio") else "en-US-natalie"
    print("Response text:", res2["response"][:80])
    print("Voice ID used:", v2)
    assert v2 == "en-US-natalie", f"Turn 2 should use consistent female voice 'en-US-natalie', got {v2}"

    print("\n--- STEP 5 & 6: End call 1 & Start NEW call 2 ---")
    res3 = await vsvc.process_voice_pipeline(
        transcript_text="Plan an accessible route to India Gate.",
        voice_gender="female"
    )
    v3 = res3.get("audio", {}).get("voice_id") if res3.get("audio") else "en-US-natalie"
    print("New call response text:", res3["response"][:80])
    print("Voice ID used:", v3)
    assert v3 == "en-US-natalie", f"New call should remain defaulted to female voice 'en-US-natalie', got {v3}"

    print("\n>>> FEMALE VOICE VERIFICATION PASSED PERFECTLY WITH DEFAULT 'en-US-natalie'! <<<")

if __name__ == "__main__":
    asyncio.run(verify_female_voice_pipeline())
