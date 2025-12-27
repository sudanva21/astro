"""
AI Orchestrator Router
Provides AI-based horoscope analysis endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from auth import get_current_active_user
from models import User
import sys
import os
from pathlib import Path

router = APIRouter()

class AnalyzeRequest(BaseModel):
    request_id: str
    analysis_type: str = "full"  # full, summary, birth_chart, dasha, d_series

class AnalyzeResponse(BaseModel):
    status: str
    analysis: Dict[str, Any]
    tokens_used: Optional[int] = None

@router.get("/")
async def ai_status():
    """AI Orchestrator service status"""
    return {
        "service": "AI Orchestrator",
        "status": "operational",
        "version": "1.0.0"
    }

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_horoscope(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze horoscope using AI orchestrator
    Requires authentication
    """
    try:
        # Import AI orchestrator runtime
        ai_path = Path(__file__).parent / "ai_orchestrator"
        if str(ai_path) not in sys.path:
            sys.path.insert(0, str(ai_path))
        
        from astro_orchestrator import runtime
        
        # Get horoscope data from storage
        from horoscope_service import get_user_horoscope
        
        horoscope_data = await get_user_horoscope(
            user_email=current_user.email,
            request_id=request.request_id
        )
        
        if not horoscope_data:
            raise HTTPException(
                status_code=404,
                detail=f"Horoscope {request.request_id} not found for user {current_user.email}"
            )
        
        # Run AI analysis (placeholder - integrate actual runtime)
        # This would call the runtime.py orchestrator with the horoscope data
        analysis_result = {
            "request_id": request.request_id,
            "analysis_type": request.analysis_type,
            "user": current_user.email,
            "status": "AI analysis integration pending",
            "note": "AI orchestrator integration requires full runtime setup"
        }
        
        return AnalyzeResponse(
            status="success",
            analysis=analysis_result,
            tokens_used=0
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )

@router.get("/models")
async def list_ai_models():
    """List available AI models"""
    return {
        "models": [
            {"name": "gpt-4", "provider": "openai", "status": "available"},
            {"name": "gemini-pro", "provider": "google", "status": "available"}
        ]
    }
