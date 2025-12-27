"""
Deva Agent Router - Simplified version for testing
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from auth import get_current_active_user
from models import User
from mongo import mongo_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    request_id: Optional[str] = None

class ChatResponse(BaseModel):
    status: str
    response: str
    conversation_id: str
    has_horoscope_data: bool

@router.get("/")
async def deva_status():
    """Deva Agent service status"""
    return {
        "service": "Deva Agent",
        "status": "operational",
        "version": "1.0.0"
    }

@router.post("/chat", response_model=ChatResponse)
async def deva_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Simplified chat endpoint for testing"""
    try:
        # Check if user has horoscope data
        if not request.request_id and mongo_db.db:
            horoscopes = await mongo_db.db.horoscopes.find({
                "user_email": current_user.email
            }).sort("created_at", -1).limit(1).to_list(length=1)
            
            if not horoscopes:
                return ChatResponse(
                    status="no_data",
                    response="Please generate your horoscope first before asking questions.",
                    conversation_id="",
                    has_horoscope_data=False
                )
            
            request.request_id = horoscopes[0]["request_id"]
        
        # Return placeholder response for now
        return ChatResponse(
            status="success",
            response=f"Deva Agent received your question: '{request.question}'. Full integration is being configured.",
            conversation_id="test-123",
            has_horoscope_data=True
        )
    
    except Exception as e:
        logger.error(f"Deva chat failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/horoscope/status")
async def check_horoscope_status(
    current_user: User = Depends(get_current_active_user)
):
    """Check if user has horoscope data"""
    if mongo_db.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        horoscope = await mongo_db.db.horoscopes.find_one({
            "user_email": current_user.email
        })
        
        return {
            "has_horoscope": horoscope is not None,
            "request_id": horoscope.get("request_id") if horoscope else None,
            "created_at": horoscope.get("created_at") if horoscope else None
        }
    
    except Exception as e:
        logger.error(f"Failed to check horoscope status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
