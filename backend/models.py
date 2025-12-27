from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, EmailStr

# --- User Models ---
class User(BaseModel):
    username: Optional[str] = None
    email: EmailStr
    full_name: Optional[str] = None
    profile_photo: Optional[str] = None
    disabled: Optional[bool] = False
    referral_code: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    hashed_password: str

# --- API Key Models ---
class APIKey(BaseModel):
    key: str
    user_id: str  # References User email or ID
    name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used_at: Optional[datetime] = None

# --- Auth Models ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# --- Chat Models ---
class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant' or 'system'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Chat(BaseModel):
    user_id: str
    title: Optional[str] = "New Chat"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ChatMessage] = []
    metadata: dict[str, Any] = {}

# --- Payment Models ---
class Payment(BaseModel):
    user_id: str
    amount: float
    currency: str = "USD"
    status: str # 'pending', 'completed', 'failed'
    provider: str # 'stripe', 'paypal', etc.
    transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Referral Models ---
class Referral(BaseModel):
    referrer_id: str
    referee_id: Optional[str] = None # Filled when someone signs up
    code: str
    status: str = "pending" # 'pending', 'completed'
    reward_amount: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Session Models ---
class Session(BaseModel):
    user_id: str
    token_hash: str
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    is_active: bool = True

class Feedback(BaseModel):
    username: str = "Anonymous"
    user_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
