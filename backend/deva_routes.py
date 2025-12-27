"""
Deva Agent Router
Connects AI Astrology frontend to Deva Agent backend
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
from auth import get_current_active_user
from models import User
from mongo import mongo_db
from horoscope_service import get_user_horoscope
import sys
import os
from pathlib import Path
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

# Add deva-agent to Python path
deva_agent_path = Path(__file__).parent / "deva-agent-deva_wow" / "deva-agent"
if str(deva_agent_path) not in sys.path:
    sys.path.insert(0, str(deva_agent_path))

class ChatRequest(BaseModel):
    question: str
    request_id: Optional[str] = None  # Horoscope request ID

class ChatResponse(BaseModel):
    status: str
    response: str
    conversation_id: str
    has_horoscope_data: bool
    questions_remaining: int
    total_questions_asked: int

class BirthDetailsRequest(BaseModel):
    date_of_birth: str  # Format: YYYY-MM-DD
    time_of_birth: str  # Format: HH:MM
    place_of_birth: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class QuestionFeedbackRequest(BaseModel):
    question_id: str
    rating: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = None

@router.get("/")
async def deva_status():
    """Deva Agent service status"""
    return {
        "service": "Deva Agent",
        "status": "operational",
        "version": "1.0.0",
        "description": "AI Astrology agent powered by horoscope data"
    }

@router.post("/chat", response_model=ChatResponse)
async def deva_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Chat with Deva Agent
    Requires user authentication and horoscope data
    """
    try:
        logger.info(f"[DEVA] Chat request from user: {current_user.email}, question: {request.question[:50]}...")
        
        # Step 0: Check question limit
        limit_check = await check_and_update_question_limit(current_user.email)
        
        if not limit_check["allowed"]:
            return ChatResponse(
                status="limit_reached",
                response="You've reached your question limit. Please provide feedback on a previous question to unlock more questions.",
                conversation_id="",
                has_horoscope_data=False,
                questions_remaining=0,
                total_questions_asked=limit_check["total_asked"]
            )
        
        # Step 1: Find user's most recent horoscope if request_id not provided
        if not request.request_id:
            logger.info(f"[DEVA] No request_id provided, fetching most recent horoscope for {current_user.email}")
            horoscopes = await mongo_db.db.horoscopes.find({
                "user_email": current_user.email
            }).sort("created_at", -1).limit(1).to_list(length=1)
            
            if not horoscopes:
                logger.warning(f"[DEVA] No horoscopes found for user {current_user.email}")
                
                # Check if user has saved birth details
                birth_details = await mongo_db.db.user_birth_details.find_one({
                    "user_email": current_user.email
                })
                
                if birth_details:
                    logger.info(f"[DEVA] User has birth details but no horoscope, providing basic analysis")
                    # Provide analysis based on birth details
                    response_text = await run_basic_astrology_analysis(
                        question=request.question,
                        birth_details=birth_details,
                        user_email=current_user.email
                    )
                    
                    logger.info(f"[DEVA] Basic analysis response generated, length: {len(response_text)}")
                    
                    # Store conversation
                    conversation_id = await store_conversation(
                        user_email=current_user.email,
                        request_id="birth_details_only",
                        question=request.question,
                        response=response_text
                    )
                    
                    logger.info(f"[DEVA] Conversation stored with ID: {conversation_id}")
                    
                    if not conversation_id:
                        logger.error(f"[DEVA] Failed to store conversation - empty ID returned")
                    
                    return ChatResponse(
                        status="success",
                        response=response_text,
                        conversation_id=conversation_id,
                        has_horoscope_data=False,
                        questions_remaining=limit_check["remaining"],
                        total_questions_asked=limit_check["total_asked"]
                    )
                
                # No horoscope and no birth details
                return ChatResponse(
                    status="no_data",
                    response="Please provide your birth details or generate your full horoscope first. You can add birth details using the 'Add Birth Details' button above, or visit the Horoscope page to create your complete birth chart.",
                    conversation_id="",
                    has_horoscope_data=False,
                    questions_remaining=limit_check["remaining"],
                    total_questions_asked=limit_check["total_asked"]
                )
            
            request.request_id = horoscopes[0]["request_id"]
            logger.info(f"[DEVA] Using request_id: {request.request_id}")
        
        # Step 2: Fetch horoscope chunks from MongoDB
        logger.info(f"[DEVA] Fetching horoscope data for request_id: {request.request_id}")
        horoscope_data = await get_user_horoscope(
            user_email=current_user.email,
            request_id=request.request_id
        )
        
        if not horoscope_data:
            logger.warning(f"[DEVA] Horoscope data not found for request_id: {request.request_id}")
            return ChatResponse(
                status="no_data",
                response="Horoscope data not found. Please generate your horoscope first.",
                conversation_id="",
                has_horoscope_data=False,
                questions_remaining=limit_check["remaining"],
                total_questions_asked=limit_check["total_asked"]
            )
        
        logger.info(f"[DEVA] Horoscope data retrieved, keys: {list(horoscope_data.keys())}")
        
        # Step 3: Convert horoscope chunks to Deva Agent format
        chart_data = convert_to_deva_format(horoscope_data)
        logger.info(f"[DEVA] Horoscope converted to Deva format")
        
        # Step 4: Run Deva Agent analysis
        logger.info(f"[DEVA] Running Deva Agent analysis")
        response_text = await run_deva_agent(
            question=request.question,
            chart_data=chart_data,
            user_email=current_user.email,
            request_id=request.request_id
        )
        
        logger.info(f"[DEVA] Agent analysis completed")
        
        # Step 5: Store conversation in MongoDB
        conversation_id = await store_conversation(
            user_email=current_user.email,
            request_id=request.request_id,
            question=request.question,
            response=response_text
        )
        
        return ChatResponse(
            status="success",
            response=response_text,
            conversation_id=conversation_id,
            has_horoscope_data=True,
            questions_remaining=limit_check["remaining"],
            total_questions_asked=limit_check["total_asked"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deva Agent chat failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )

def convert_to_deva_format(horoscope_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert MongoDB horoscope chunks to Deva Agent input format
    Validates that all required data is present
    """
    if not horoscope_data:
        logger.warning("No horoscope data provided to convert_to_deva_format")
        return {}
    
    chart_data = {
        "meta": horoscope_data.get("meta", {}),
        "lagna": horoscope_data.get("lagna"),
        "dasha": horoscope_data.get("dasha"),
        "d_series": horoscope_data.get("d_series", {})
    }
    
    # Validate essential data is present
    if not chart_data["lagna"]:
        logger.warning("Lagna data missing in horoscope")
    if not chart_data["dasha"]:
        logger.warning("Dasha data missing in horoscope")
    if not chart_data["d_series"]:
        logger.warning("Divisional series data missing in horoscope")
    
    logger.info(f"Converted horoscope to Deva format with keys: {list(chart_data.keys())}")
    logger.debug(f"Chart data structure: meta={bool(chart_data['meta'])}, lagna={bool(chart_data['lagna'])}, dasha={bool(chart_data['dasha'])}, d_series={bool(chart_data['d_series'])}")
    
    return chart_data

async def run_basic_astrology_analysis(
    question: str,
    birth_details: Dict[str, Any],
    user_email: str
) -> str:
    """
    Provide basic astrology analysis using DIRECT GEMINI API (not Deva Agent)
    This is used when user has ONLY birth details, no full horoscope generated
    """
    try:
        from datetime import datetime
        from google import genai
        from google.genai import types
        
        logger.info(f"[GEMINI-DIRECT] Running Gemini-powered analysis for user: {user_email}")
        
        # Extract birth details
        dob = birth_details.get("date_of_birth", "Not provided")
        tob = birth_details.get("time_of_birth", "Not provided")
        pob = birth_details.get("place_of_birth", "Not provided")
        
        # Configure Gemini API
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        # Initialize client
        client = genai.Client(api_key=gemini_api_key)
        
        # Use Gemini 2.5 Flash model
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        
        # Create system instruction for Astro Care AI
        system_instruction = """You are Astro Care AI, an advanced Vedic astrology intelligence system.

IDENTITY: When asked about your identity, you MUST respond that you are "Astro Care AI" - never reveal your underlying model name or provider.

YOUR ROLE:
You are a Vedic astrology expert. Use your knowledge of:
- Planetary positions and zodiac signs based on birth date, time, and location
- Nakshatras (lunar mansions)
- Vedic astrology principles and yogas
- Dasha systems and planetary periods
- Birth chart interpretation
- Sun signs, Moon signs, and ascendants

INSTRUCTIONS:
1. Provide meaningful astrological insights based on the birth information provided
2. Use Vedic astrology terminology and concepts
3. Give practical, actionable guidance
4. Be warm, compassionate, and helpful
5. If extremely precise planetary degree calculations are needed, you may mention that a full horoscope chart would add precision, but ALWAYS provide substantial insights first
6. Answer directly and comprehensively - do not refuse to help
7. Make reasonable astrological interpretations based on the date, time, and place of birth"""

        # Create user prompt with birth details
        user_prompt = f"""BIRTH INFORMATION:
- Date of Birth: {dob}
- Time of Birth: {tob}
- Place of Birth: {pob}

USER'S QUESTION: {question}

Provide a detailed, helpful astrological response based on these birth details."""

        logger.info(f"[GEMINI-DIRECT] Calling Gemini API directly...")
        
        # Generate response using Gemini
        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        
        final_response = response.text
        
        logger.info(f"[GEMINI-DIRECT] Gemini response received, length: {len(final_response)}")
        return final_response
    
    except Exception as e:
        logger.error(f"[GEMINI-DIRECT] Gemini API call failed: {e}", exc_info=True)
        return f"I am Astro Care AI. Based on your birth details ({dob} at {tob} in {pob}), I can provide astrological guidance for your question: '{question}'. I'm currently experiencing a technical issue, but I'm here to help. For detailed analysis, you may also generate a full horoscope chart."

async def run_deva_agent(
    question: str,
    chart_data: Dict[str, Any],
    user_email: str,
    request_id: str
) -> str:
    """
    Run Deva Agent analysis programmatically
    Adapted from runtime.py to work as async API
    """
    try:
        import asyncio
        from datetime import datetime
        
        # Validate chart data
        logger.info(f"[DEVA] Starting agent analysis for user: {user_email}, request_id: {request_id}")
        logger.info(f"[DEVA] Chart data keys: {list(chart_data.keys())}")
        logger.info(f"[DEVA] Chart data - meta: {bool(chart_data.get('meta'))}, lagna: {bool(chart_data.get('lagna'))}, dasha: {bool(chart_data.get('dasha'))}, d_series: {bool(chart_data.get('d_series'))}")
        
        if not chart_data or not any([chart_data.get('lagna'), chart_data.get('dasha')]):
            logger.warning(f"[DEVA] Incomplete chart data for request {request_id}")
            logger.debug(f"[DEVA] Full chart_data: {json.dumps(chart_data, default=str, indent=2)}")
        
        # Import Deva Agent components
        from agents.specialists import lagna_pati, kala_purusha, varga_vizier
        from agents.principals import maha_rishi
        from autogen_agentchat.teams import RoundRobinGroupChat
        
        # Construct context message
        today = datetime.now()
        date_str = today.strftime("%Y-%m-%d")
        
        context_message = f"""
SYSTEM CONTEXT: TIME ANCHOR
-----------------------------------
CURRENT DATE (TODAY): {date_str}
(All predictions must be relative to this date. Dashas before this are PAST. Dashas after this are FUTURE.)
-----------------------------------

EXISTING CHART DATA
-----------------------------------
{json.dumps(chart_data, indent=2, default=str)}
-----------------------------------

USER QUESTION: {question}

INSTRUCTIONS FOR COUNCIL:
1. LagnaPati: Analyze the D1 strength and planetary positions from the provided chart data.
2. KalaPurusha: Check the current Dasha from the provided data. CRITICAL: Compare every date to TODAY ({date_str}).
3. VargaVizier: Check the D10 Career strength if relevant from the divisional series data.
4. MahaRishi (Astro Care AI): Synthesize everything into a final answer based on the provided chart data. Remember you are Astro Care AI.
"""
        
        logger.debug(f"[DEVA] Context message prepared with length: {len(context_message)}")
        
        # Create council (Round Robin group chat)
        council = RoundRobinGroupChat(
            participants=[lagna_pati, kala_purusha, varga_vizier, maha_rishi],
            max_turns=4
        )
        
        # Collect all messages
        messages = []
        async for msg in council.run_stream(task=context_message):
            source = getattr(msg, "source", "Unknown")
            content = getattr(msg, "content", str(msg))
            messages.append({
                "source": source,
                "content": content
            })
            logger.debug(f"[DEVA] Message from {source}: {content[:100]}...")
        
        # Extract final response from MahaRishi
        final_response = ""
        for msg in reversed(messages):
            if msg["source"] == "MahaRishi":
                final_response = msg["content"]
                logger.info(f"[DEVA] Final response from MahaRishi extracted")
                break
        
        # Fallback to last message if no MahaRishi response
        if not final_response and messages:
            final_response = messages[-1]["content"]
            logger.info(f"[DEVA] Using fallback response from last message")
        
        logger.info(f"[DEVA] Agent analysis completed successfully")
        return final_response or "Unable to generate response. Please try again."
    
    except Exception as e:
        logger.error(f"[DEVA] Deva Agent execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Deva Agent analysis failed: {str(e)}"
        )

async def store_conversation(
    user_email: str,
    request_id: str,
    question: str,
    response: str
) -> str:
    """
    Store Deva Agent conversation in MongoDB
    Returns conversation ID for feedback tracking
    """
    if mongo_db.db is None:
        logger.error("Database not initialized - cannot store conversation")
        return ""
    
    try:
        logger.info(f"[STORE] Attempting to store conversation for user: {user_email}")
        conversation_doc = {
            "user_email": user_email,
            "request_id": request_id,
            "question": question,
            "response": response,
            "created_at": datetime.utcnow(),
            "agent": "deva",
            "status": "completed"
        }
        
        logger.info(f"[STORE] Inserting document into deva_conversations collection")
        result = await mongo_db.db.deva_conversations.insert_one(conversation_doc)
        conversation_id = str(result.inserted_id)
        logger.info(f"[STORE] Conversation stored successfully with ID: {conversation_id}")
        return conversation_id
    
    except Exception as e:
        logger.error(f"[STORE] Failed to store conversation: {e}", exc_info=True)
        # Return empty string on error but log the issue
        return ""

async def check_and_update_question_limit(user_email: str) -> Dict[str, int]:
    """
    Check user's question limit and update count
    Returns: {allowed: bool, remaining: int, total_asked: int}
    """
    if mongo_db.db is None:
        raise Exception("Database not initialized")
    
    try:
        tracking = await mongo_db.db.chat_question_tracking.find_one({"user_email": user_email})
        
        if not tracking:
            tracking = {
                "user_email": user_email,
                "questions_asked": 0,
                "feedback_given": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await mongo_db.db.chat_question_tracking.insert_one(tracking)
        
        questions_asked = tracking.get("questions_asked", 0)
        feedback_given = tracking.get("feedback_given", 0)
        
        base_limit = 3
        bonus_questions = feedback_given
        total_limit = base_limit + bonus_questions
        remaining = total_limit - questions_asked
        
        if remaining <= 0:
            return {
                "allowed": False,
                "remaining": 0,
                "total_asked": questions_asked,
                "feedback_needed": True
            }
        
        await mongo_db.db.chat_question_tracking.update_one(
            {"user_email": user_email},
            {
                "$inc": {"questions_asked": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {
            "allowed": True,
            "remaining": remaining - 1,
            "total_asked": questions_asked + 1,
            "feedback_needed": False
        }
    
    except Exception as e:
        logger.error(f"Failed to check question limit: {e}")
        raise

async def submit_question_feedback(
    user_email: str,
    question_id: str,
    rating: int,
    feedback_text: Optional[str] = None
) -> bool:
    """
    Submit feedback for a question and unlock additional question
    """
    if mongo_db.db is None:
        raise Exception("Database not initialized")
    
    try:
        existing_feedback = await mongo_db.db.question_feedback.find_one({
            "user_email": user_email,
            "question_id": question_id
        })
        
        if existing_feedback:
            return False
        
        feedback_doc = {
            "user_email": user_email,
            "question_id": question_id,
            "rating": rating,
            "feedback_text": feedback_text,
            "created_at": datetime.utcnow()
        }
        
        await mongo_db.db.question_feedback.insert_one(feedback_doc)
        
        await mongo_db.db.chat_question_tracking.update_one(
            {"user_email": user_email},
            {
                "$inc": {"feedback_given": 1},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        logger.info(f"Feedback submitted for question {question_id} by {user_email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to submit question feedback: {e}")
        raise

@router.get("/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_active_user),
    limit: int = 50,
    skip: int = 0
):
    """
    List user's Deva Agent conversations
    """
    if mongo_db.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        cursor = mongo_db.db.deva_conversations.find({
            "user_email": current_user.email
        }).sort("created_at", -1).skip(skip).limit(limit)
        
        conversations = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for conv in conversations:
            conv["_id"] = str(conv["_id"])
        
        return {
            "conversations": conversations,
            "count": len(conversations)
        }
    
    except Exception as e:
        logger.error(f"Failed to list conversations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve conversations: {str(e)}"
        )

@router.get("/horoscope/status")
async def check_horoscope_status(
    current_user: User = Depends(get_current_active_user)
):
    """
    Check if user has horoscope data available
    """
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
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check horoscope status: {str(e)}"
        )

@router.post("/birth-details")
async def save_birth_details(
    details: BirthDetailsRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Save user's birth details for AI astrology
    """
    if mongo_db.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        birth_details = {
            "user_email": current_user.email,
            "date_of_birth": details.date_of_birth,
            "time_of_birth": details.time_of_birth,
            "place_of_birth": details.place_of_birth,
            "latitude": details.latitude,
            "longitude": details.longitude,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await mongo_db.db.user_birth_details.update_one(
            {"user_email": current_user.email},
            {"$set": birth_details},
            upsert=True
        )
        
        logger.info(f"Birth details saved for user: {current_user.email}")
        return {
            "status": "success",
            "message": "Birth details saved successfully"
        }
    
    except Exception as e:
        logger.error(f"Failed to save birth details: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save birth details: {str(e)}"
        )

@router.get("/birth-details")
async def get_birth_details(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user's saved birth details
    """
    if mongo_db.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        details = await mongo_db.db.user_birth_details.find_one({
            "user_email": current_user.email
        })
        
        if not details:
            return {
                "has_details": False,
                "details": None
            }
        
        return {
            "has_details": True,
            "details": {
                "date_of_birth": details.get("date_of_birth"),
                "time_of_birth": details.get("time_of_birth"),
                "place_of_birth": details.get("place_of_birth"),
                "latitude": details.get("latitude"),
                "longitude": details.get("longitude")
            }
        }
    
    except Exception as e:
        logger.error(f"Failed to get birth details: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get birth details: {str(e)}"
        )

@router.post("/question-feedback")
async def submit_feedback(
    feedback: QuestionFeedbackRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit feedback for a question to unlock more questions
    """
    try:
        success = await submit_question_feedback(
            user_email=current_user.email,
            question_id=feedback.question_id,
            rating=feedback.rating,
            feedback_text=feedback.feedback_text
        )
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail="Feedback already submitted for this question"
            )
        
        tracking = await mongo_db.db.chat_question_tracking.find_one({
            "user_email": current_user.email
        })
        
        questions_asked = tracking.get("questions_asked", 0)
        feedback_given = tracking.get("feedback_given", 0)
        remaining = (3 + feedback_given) - questions_asked
        
        return {
            "status": "success",
            "message": "Thank you for your feedback! You've unlocked 1 more question.",
            "questions_remaining": max(0, remaining),
            "feedback_count": feedback_given
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit question feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.get("/question-status")
async def get_question_status(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user's question tracking status
    """
    if mongo_db.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        tracking = await mongo_db.db.chat_question_tracking.find_one({
            "user_email": current_user.email
        })
        
        if not tracking:
            return {
                "questions_asked": 0,
                "feedback_given": 0,
                "questions_remaining": 3,
                "total_limit": 3
            }
        
        questions_asked = tracking.get("questions_asked", 0)
        feedback_given = tracking.get("feedback_given", 0)
        total_limit = 3 + feedback_given
        remaining = max(0, total_limit - questions_asked)
        
        conversations = await mongo_db.db.deva_conversations.find({
            "user_email": current_user.email
        }).sort("created_at", -1).limit(10).to_list(length=10)
        
        feedback_map = {}
        for conv in conversations:
            conv_id = str(conv["_id"])
            feedback = await mongo_db.db.question_feedback.find_one({
                "user_email": current_user.email,
                "question_id": conv_id
            })
            feedback_map[conv_id] = feedback is not None
        
        return {
            "questions_asked": questions_asked,
            "feedback_given": feedback_given,
            "questions_remaining": remaining,
            "total_limit": total_limit,
            "recent_conversations": [
                {
                    "id": str(conv["_id"]),
                    "question": conv.get("question", ""),
                    "has_feedback": feedback_map.get(str(conv["_id"]), False),
                    "created_at": conv.get("created_at")
                }
                for conv in conversations
            ]
        }
    
    except Exception as e:
        logger.error(f"Failed to get question status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get question status: {str(e)}"
        )
