import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr

# User Schemas
class UserRegister(BaseModel):
    email: str
    full_name: str
    password: str
    role: Optional[str] = "citizen"
    authority_id: Optional[int] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    authority_id: Optional[int] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# AI Schemas
class AIPredictRequest(BaseModel):
    text: str

class AIPredictResponse(BaseModel):
    category: str
    severity: str
    confidence: float
    category_confidence: float
    severity_confidence: float
    keywords: List[str]

# Authority & Zone
class AuthorityOut(BaseModel):
    id: int
    name: str
    code: str
    department: str
    jurisdiction: str
    contact_email: str
    phone: str
    logo_url: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AuthorityCreate(BaseModel):
    name: str
    code: str
    department: str
    jurisdiction: str
    contact_email: str
    phone: str
    description: Optional[str] = None

class ZoneOut(BaseModel):
    id: int
    name: str
    code: str
    ward_numbers: str
    center_lat: float
    center_lng: float
    radius_km: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ZoneCreate(BaseModel):
    name: str
    code: str
    ward_numbers: str
    center_lat: float
    center_lng: float
    radius_km: float = 3.0
    description: Optional[str] = None

class RoutingRuleOut(BaseModel):
    id: int
    category: str
    zone_id: Optional[int]
    authority_id: int
    priority: int
    is_active: bool
    authority_name: Optional[str] = None
    zone_name: Optional[str] = None

    class Config:
        from_attributes = True

class RoutingRuleCreate(BaseModel):
    category: str
    zone_id: Optional[int] = None
    authority_id: int
    priority: int = 1
    is_active: bool = True

class ZoneTrendingOut(BaseModel):
    zone_id: int
    zone_name: str
    zone_code: str
    center_lat: float
    center_lng: float
    radius_km: float
    open_count: int
    resolved_count: int
    total_count: int
    critical_count: int
    risk_score: float
    risk_level: str  # green, yellow, orange, red

# Incident Evidence & Timeline
class ReportEvidenceOut(BaseModel):
    id: int
    incident_id: int
    user_id: Optional[int]
    reporter_name: str
    reporter_contact: Optional[str]
    image_url: str
    video_url: Optional[str]
    latitude: float
    longitude: float
    has_exif_gps: bool
    exif_lat: Optional[float]
    exif_lng: Optional[float]
    notes: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StatusHistoryOut(BaseModel):
    id: int
    incident_id: int
    old_status: Optional[str]
    new_status: str
    changed_by_name: Optional[str]
    notes: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FeedbackOut(BaseModel):
    id: int
    incident_id: int
    citizen_name: str
    was_fixed: bool
    rating: int
    comments: Optional[str]
    proof_image_url: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    was_fixed: bool
    rating: Optional[int] = 5
    comments: Optional[str] = None

class IncidentOut(BaseModel):
    id: int
    incident_number: str
    title: str
    description: str
    category: str
    severity: str
    status: str
    reporters_count: int
    latitude: float
    longitude: float
    address: str
    zone_id: Optional[int]
    assigned_authority_id: Optional[int]
    primary_image_url: Optional[str]
    after_image_url: Optional[str]
    resolution_notes: Optional[str]
    resolved_at: Optional[datetime.datetime]
    closed_at: Optional[datetime.datetime]
    is_escalated: bool
    escalation_count: int
    ai_predicted_category: Optional[str]
    ai_predicted_severity: Optional[str]
    ai_confidence: Optional[float]
    created_at: datetime.datetime
    updated_at: datetime.datetime
    authority_name: Optional[str] = None
    zone_name: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentDetailOut(IncidentOut):
    evidences: List[ReportEvidenceOut] = []
    history: List[StatusHistoryOut] = []
    feedbacks: List[FeedbackOut] = []
    is_matched_duplicate: Optional[bool] = False
    duplicate_message: Optional[str] = None

class IncidentSubmissionResponse(BaseModel):
    incident: IncidentOut
    is_duplicate: bool
    reporters_count: int
    message: str
    linked_evidence_id: Optional[int] = None

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link_id: Optional[int]
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
