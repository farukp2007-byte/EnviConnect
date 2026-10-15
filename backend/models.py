import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen", nullable=False)  # citizen, authority, ngo, admin
    authority_id = Column(Integer, ForeignKey("authorities.id"), nullable=True)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    eco_credits = Column(Integer, default=340)  # Green Coins / EcoCoins balance
    green_score = Column(Integer, default=765)  # 300 to 900 Civic Environmental Credit Score
    tier = Column(String(50), default="Prakrithi Mitra")  # Eco Sentinel, Green Guardian, Prakrithi Mitra, Distinguished Steward
    certificate_id = Column(String(100), default="AP-MCT-EC-2026-78421")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    authority = relationship("Authority", back_populates="officers")
    evidences = relationship("ReportEvidence", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    eco_transactions = relationship("EcoTransaction", back_populates="user", cascade="all, delete-orphan", order_by="desc(EcoTransaction.created_at)")
    volunteer_enrollments = relationship("VolunteerEnrollment", back_populates="user", cascade="all, delete-orphan")
    perk_redemptions = relationship("PerkRedemption", back_populates="user", cascade="all, delete-orphan")


class Authority(Base):
    __tablename__ = "authorities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)  # MCT, APPCB, FOREST, TUDA
    department = Column(String(255), nullable=False)
    jurisdiction = Column(String(500), nullable=False)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    logo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    officers = relationship("User", back_populates="authority")
    incidents = relationship("Incident", back_populates="authority")
    routing_rules = relationship("RoutingRule", back_populates="authority")


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    ward_numbers = Column(String(255), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=3.0)
    description = Column(Text, nullable=True)

    incidents = relationship("Incident", back_populates="zone")
    routing_rules = relationship("RoutingRule", back_populates="zone")


class RoutingRule(Base):
    __tablename__ = "routing_rules"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)  # illegal_dumping, air_pollution, etc.
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    authority_id = Column(Integer, ForeignKey("authorities.id"), nullable=False)
    priority = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    zone = relationship("Zone", back_populates="routing_rules")
    authority = relationship("Authority", back_populates="routing_rules")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # illegal_dumping, air_pollution, water_pollution, deforestation, noise, other
    severity = Column(String(50), nullable=False)  # low, medium, high, critical
    status = Column(String(50), default="submitted", nullable=False)  # submitted, assigned, in_progress, resolved, closed
    reporters_count = Column(Integer, default=1)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    assigned_authority_id = Column(Integer, ForeignKey("authorities.id"), nullable=True)

    primary_image_url = Column(String(500), nullable=True)
    after_image_url = Column(String(500), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

    is_escalated = Column(Boolean, default=False)
    escalation_count = Column(Integer, default=0)

    ai_predicted_category = Column(String(100), nullable=True)
    ai_predicted_severity = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    zone = relationship("Zone", back_populates="incidents")
    authority = relationship("Authority", back_populates="incidents")
    evidences = relationship("ReportEvidence", back_populates="incident", cascade="all, delete-orphan", order_by="desc(ReportEvidence.created_at)")
    history = relationship("StatusHistory", back_populates="incident", cascade="all, delete-orphan", order_by="desc(StatusHistory.created_at)")
    feedbacks = relationship("Feedback", back_populates="incident", cascade="all, delete-orphan", order_by="desc(Feedback.created_at)")


class ReportEvidence(Base):
    __tablename__ = "report_evidences"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String(255), nullable=False)
    reporter_contact = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=False)
    video_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    has_exif_gps = Column(Boolean, default=False)
    exif_lat = Column(Float, nullable=True)
    exif_lng = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="evidences")
    user = relationship("User", back_populates="evidences")


class StatusHistory(Base):
    __tablename__ = "status_histories"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_by_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="history")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    citizen_name = Column(String(255), nullable=False)
    was_fixed = Column(Boolean, nullable=False)
    rating = Column(Integer, default=5)
    comments = Column(Text, nullable=True)
    proof_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # status_change, new_assignment, duplicate_merged, escalation, feedback
    link_id = Column(Integer, nullable=True)  # incident id
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class EcoTransaction(Base):
    __tablename__ = "eco_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # e.g. +50, +30, -100
    score_change = Column(Integer, default=0) # e.g. +15, +10
    action_type = Column(String(50), nullable=False)  # report_created, evidence_merged, feedback_audit, volunteer_signup, perk_redeemed
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    reference_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="eco_transactions")


class VolunteerDrive(Base):
    __tablename__ = "volunteer_drives"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)  # AP Forest Dept, Tirupati Municipal Corporation, APPCB, TUDA
    category = Column(String(100), nullable=False)  # Afforestation, River Cleanliness, Air Surveillance, Bio-Waste Management
    date_time = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    points_reward = Column(Integer, default=100)
    score_boost = Column(Integer, default=20)
    min_score = Column(Integer, default=400)
    max_volunteers = Column(Integer, default=50)
    enrolled_count = Column(Integer, default=12)
    perks = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    enrollments = relationship("VolunteerEnrollment", back_populates="drive", cascade="all, delete-orphan")


class VolunteerEnrollment(Base):
    __tablename__ = "volunteer_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("volunteer_drives.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="enrolled")  # enrolled, attended, certified
    verification_code = Column(String(50), nullable=False)  # e.g. "VOL-TMC-8812"
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    drive = relationship("VolunteerDrive", back_populates="enrollments")
    user = relationship("User", back_populates="volunteer_enrollments")


class GreenPerk(Base):
    __tablename__ = "green_perks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)  # Municipal Corporation of Tirupati, APSRTC, AP Forest Dept
    category = Column(String(100), nullable=False)  # Tax Rebate, Public Transit, Priority Grievance, Nursery Saplings
    cost_coins = Column(Integer, nullable=False)  # e.g. 250
    min_score = Column(Integer, default=600)
    validity = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), default="award")  # Lucide icon identifier
    is_active = Column(Boolean, default=True)

    redemptions = relationship("PerkRedemption", back_populates="perk", cascade="all, delete-orphan")


class PerkRedemption(Base):
    __tablename__ = "perk_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    perk_id = Column(Integer, ForeignKey("green_perks.id"), nullable=False)
    coupon_code = Column(String(100), unique=True, nullable=False)  # e.g. "MCT-REBATE-2026-X839"
    redeemed_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="perk_redemptions")
    perk = relationship("GreenPerk", back_populates="redemptions")

