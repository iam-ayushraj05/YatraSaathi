from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID
from app.schemas.place import Coordinate

class CopilotChatRequest(BaseModel):
    message: str = Field(..., description="User message text")
    current_location: Optional[Coordinate] = Field(None, description="User current location coordinates")
    destination: Optional[Coordinate] = Field(None, description="Target destination coordinates if applicable")
    profile_id: Optional[UUID] = Field(None, description="Optional accessibility profile ID")
    conversation_history: Optional[List[Dict[str, str]]] = Field(None, description="Previous messages history")

class CopilotChatResponse(BaseModel):
    response: str
    relevant_places: Optional[List[Dict[str, Any]]] = None
    relevant_accessibility: Optional[Dict[str, Any]] = None
    warnings: Optional[List[str]] = None
    route_info: Optional[Dict[str, Any]] = None

class VoiceProcessRequest(BaseModel):
    transcript: Optional[str] = Field(None, description="Transcribed query text")
    current_location: Optional[Coordinate] = Field(None, description="User coordinates")
    voice_gender: Optional[str] = Field("female", description="Voice gender choice: female or male")
    voice_id: Optional[str] = Field(None, description="Optional custom Murf voice ID")
    conversation_history: Optional[List[Dict[str, str]]] = Field(None, description="Previous voice session messages history")



class VoiceProcessResponse(BaseModel):
    transcript: str
    response: str
    audio: Optional[Dict[str, Any]] = None
    relevant_places: Optional[List[Dict[str, Any]]] = None
    route_info: Optional[Dict[str, Any]] = None
    warnings: Optional[List[str]] = None

