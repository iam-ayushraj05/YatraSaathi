import os
import logging
import httpx
from typing import Optional, Dict, Any, List


from app.core.config import settings
from app.services.copilot_service import CopilotService

logger = logging.getLogger(__name__)

MURF_VOICE_MAP = {
    "en": {"female": "en-US-natalie", "male": "en-US-marcus"},
    "hi": {"female": "hi-IN-shweta", "male": "hi-IN-rahul"},
    "hinglish": {"female": "hi-IN-shweta", "male": "hi-IN-rahul"},
    "bn": {"female": "bn-IN-ishani", "male": "bn-IN-abhik"},
    "or": {"female": "hi-IN-shweta", "male": "hi-IN-rahul"}  # Odia fallback voice
}


def detect_input_language(text: str) -> str:
    import re
    text_lower = text.lower()
    # Check Odia script (\u0B00-\u0B7F)
    if any('\u0b00' <= char <= '\u0b7f' for char in text):
        return "or"
    # Check Bengali script (\u0980-\u09FF)
    if any('\u0980' <= char <= '\u09ff' for char in text):
        return "bn"
    # Check Devanagari Hindi script (\u0900-\u097F)
    if any('\u0900' <= char <= '\u097f' for char in text):
        return "hi"
    # Check Hinglish keywords (Romanized Hindi)
    cleaned_words = [re.sub(r'[^\w\s]', '', w) for w in text_lower.split()]
    hinglish_words = ["hai", "dhundo", "batao", "kya", "paas", "kahan", "suvidha", "kaisa", "karen", "chahiye", "karain", "ho", "kaise"]
    if any(w in cleaned_words for w in hinglish_words):
        return "hinglish"
    return "en"


class VoiceService:
    """
    Voice Travel Copilot Pipeline Service:
    Audio Input / LiveKit -> Deepgram STT -> yatrasaathi Travel Copilot (Gemini + Backend Services) -> Murf TTS -> LiveKit / Audio Output.
    """

    def __init__(self, copilot_service: CopilotService):
        self.copilot_service = copilot_service
        self.livekit_url = settings.livekit_url
        self.livekit_key = settings.livekit_api_key
        self.livekit_secret = settings.livekit_api_secret
        self.deepgram_key = settings.deepgram_api_key or os.getenv("DEEPGRAM_API_KEY")
        self.murf_key = settings.murf_api_key or os.getenv("MURF_API_KEY")

    async def transcribe_audio_deepgram(self, audio_bytes: bytes) -> Optional[str]:
        """
        Transcribe raw user microphone audio using Deepgram STT (multilingual enabled).
        """
        if not self.deepgram_key:
            logger.info("DEEPGRAM_API_KEY not configured. Falling back to frontend STT.")
            return None

        url = "https://api.deepgram.com/v1/listen?model=nova-2-general&detect_language=true&smart_format=true"
        headers = {
            "Authorization": f"Token {self.deepgram_key}",
            "Content-Type": "audio/wav"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, content=audio_bytes)
                if response.status_code == 200:
                    data = response.json()
                    transcript = data["results"]["channels"][0]["alternatives"][0]["transcript"]
                    detected_lang = data["results"]["channels"][0]["alternatives"][0].get("language", "en")
                    logger.info(f"Deepgram STT success (detected '{detected_lang}'): '{transcript}'")
                    return transcript
                else:
                    logger.warning(f"Deepgram STT failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"Deepgram STT Exception: {e}")

        return None

    async def synthesize_speech_murf(self, text: str, voice_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Synthesize Travel Copilot text response into speech audio using Murf TTS.
        """
        if not self.murf_key:
            logger.info("MURF_API_KEY not configured. Falling back to browser text-to-speech.")
            return None

        selected_voice = voice_id or getattr(settings, "murf_voice_id", "en-US-natalie")

        url = "https://api.murf.ai/v1/speech/generate"
        headers = {
            "api-key": self.murf_key,
            "Content-Type": "application/json"
        }
        payload = {
            "voiceId": selected_voice,
            "text": text,
            "style": "Conversational",
            "rate": 0,
            "pitch": 0,
            "sampleRate": 24000,
            "format": "MP3"
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(url, headers=headers, json=payload)

                if response.status_code == 200:
                    data = response.json()
                    audio_file = data.get("audioFile") or data.get("encodedAudio")
                    logger.info(f"Murf TTS audio generated with voice '{selected_voice}'.")
                    return {
                        "audio_url": audio_file,
                        "format": "MP3",
                        "provider": "murf",
                        "voice_id": selected_voice
                    }
                else:
                    logger.warning(f"Murf TTS failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"Murf TTS Exception: {e}")

        return None

    async def process_voice_pipeline(
        self,
        audio_bytes: Optional[bytes] = None,
        transcript_text: Optional[str] = None,
        current_location: Optional[Dict[str, float]] = None,
        user_id: Optional[Any] = None,
        voice_gender: Optional[str] = "female",
        voice_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end multilingual voice pipeline:
        Audio -> Deepgram STT -> CopilotService (Gemini + Places/Routes/Barriers/Weather) -> Multilingual Murf TTS -> Response Payload.
        """
        user_query = transcript_text

        # 1. Transcribe audio with Deepgram if raw audio provided
        if audio_bytes and not user_query:
            deepgram_text = await self.transcribe_audio_deepgram(audio_bytes)
            if deepgram_text:
                user_query = deepgram_text

        if not user_query:
            user_query = "hello"

        import time
        t_req_start = time.perf_counter()
        logger.info(f"[VOICE TIMING] request received: '{user_query}'")

        # Detect spoken language
        detected_lang = detect_input_language(user_query)
        logger.info(f"[VOICE] User speech received: '{user_query}' (Detected Language: {detected_lang})")

        # 2. Run Travel Copilot AI Intelligence with backend domain context
        t_copilot_start = time.perf_counter()
        logger.info("[VOICE TIMING] copilot chat start")
        copilot_res = await self.copilot_service.chat(
            message=user_query,
            current_location=current_location or {"lat": 28.6129, "lng": 77.2295},
            user_id=user_id,
            conversation_history=conversation_history
        )
        t_copilot_end = time.perf_counter()
        logger.info(f"[VOICE TIMING] copilot chat finished: {(t_copilot_end - t_copilot_start)*1000:.2f} ms")

        response_text = copilot_res.get("response", "")

        # Always enforce female voice configuration
        voice_gender = "female"
        lang_voices = MURF_VOICE_MAP.get(detected_lang, MURF_VOICE_MAP["en"])
        target_voice = voice_id or lang_voices["female"]

        # 3. Generate speech audio with Murf female TTS
        t_tts_start = time.perf_counter()
        logger.info(f"[VOICE TIMING] TTS start (voice_id='{target_voice}', gender='female')")
        tts_res = await self.synthesize_speech_murf(response_text, voice_id=target_voice)
        t_tts_end = time.perf_counter()
        logger.info(f"[VOICE TIMING] TTS finished: {(t_tts_end - t_tts_start)*1000:.2f} ms")



        t_total_end = time.perf_counter()
        logger.info(f"[VOICE TIMING] total: {(t_total_end - t_req_start)*1000:.2f} ms")

        is_end_call = copilot_res.get("is_end_call", False)
        return {
            "transcript": user_query,
            "response": response_text,
            "audio": tts_res,
            "relevant_places": copilot_res.get("relevant_places", []),
            "route_info": copilot_res.get("route_info"),
            "warnings": copilot_res.get("warnings", []),
            "is_end_call": is_end_call
        }



