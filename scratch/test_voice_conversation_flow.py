import sys
import os
import asyncio
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath("backend"))
load_dotenv("backend/.env")

from app.services.voice_service import VoiceService
from app.services.copilot_service import CopilotService

async def test_manual_sequence():
    copilot_service = CopilotService()
    voice_service = VoiceService(copilot_service=copilot_service)
    
    conversation_history = []
    
    test_queries = [
        "Hello",
        "Help me plan an accessible trip",
        "Noida to Delhi",
        "India Gate",
        "Are there wheelchair accessible facilities there?"
    ]

    print("\n=======================================================")
    print("RUNNING 5-STEP MULTI-TURN CONVERSATION TEST SEQUENCE")
    print("=======================================================\n")

    for idx, query in enumerate(test_queries, 1):
        print(f"--- TEST STEP {idx}: User says '{query}' ---")
        
        res = await voice_service.process_voice_pipeline(
            transcript_text=query,
            current_location={"lat": 28.6129, "lng": 77.2295},
            voice_gender="female",
            conversation_history=conversation_history
        )

        resp_text = res.get("response", "")
        audio_info = res.get("audio")
        
        print(f"Assistant Response:\n{resp_text}")
        print(f"Audio payload: {audio_info}")
        print("-------------------------------------------------------\n")
        
        # Append turn to history
        conversation_history.append({"role": "user", "content": query})
        conversation_history.append({"role": "assistant", "content": resp_text})

if __name__ == "__main__":
    asyncio.run(test_manual_sequence())
