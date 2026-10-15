from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Authority, Zone, RoutingRule, User
from schemas import (
    AuthorityOut, AuthorityCreate, ZoneOut, ZoneCreate,
    RoutingRuleOut, RoutingRuleCreate, UserOut
)
from auth import require_role

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- Authorities ---
@router.get("/authorities", response_model=List[AuthorityOut])
def list_authorities(db: Session = Depends(get_db)):
    return db.query(Authority).all()

@router.post("/authorities", response_model=AuthorityOut)
def create_authority(auth_in: AuthorityCreate, db: Session = Depends(get_db)):
    existing = db.query(Authority).filter(Authority.code == auth_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Authority code already exists")
    auth = Authority(
        name=auth_in.name,
        code=auth_in.code.upper(),
        department=auth_in.department,
        jurisdiction=auth_in.jurisdiction,
        contact_email=auth_in.contact_email,
        phone=auth_in.phone,
        description=auth_in.description
    )
    db.add(auth)
    db.commit()
    db.refresh(auth)
    return auth

# --- Zones ---
@router.get("/zones", response_model=List[ZoneOut])
def list_admin_zones(db: Session = Depends(get_db)):
    return db.query(Zone).all()

@router.post("/zones", response_model=ZoneOut)
def create_zone(zone_in: ZoneCreate, db: Session = Depends(get_db)):
    existing = db.query(Zone).filter(Zone.code == zone_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zone code already exists")
    zone = Zone(
        name=zone_in.name,
        code=zone_in.code.upper(),
        ward_numbers=zone_in.ward_numbers,
        center_lat=zone_in.center_lat,
        center_lng=zone_in.center_lng,
        radius_km=zone_in.radius_km,
        description=zone_in.description
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

# --- Routing Rules ---
@router.get("/routing-rules", response_model=List[RoutingRuleOut])
def list_routing_rules(db: Session = Depends(get_db)):
    rules = db.query(RoutingRule).all()
    results = []
    for r in rules:
        results.append({
            "id": r.id,
            "category": r.category,
            "zone_id": r.zone_id,
            "authority_id": r.authority_id,
            "priority": r.priority,
            "is_active": r.is_active,
            "authority_name": r.authority.name if r.authority else None,
            "zone_name": r.zone.name if r.zone else "All Zones (Global)"
        })
    return results

@router.post("/routing-rules", response_model=RoutingRuleOut)
def create_routing_rule(rule_in: RoutingRuleCreate, db: Session = Depends(get_db)):
    rule = RoutingRule(
        category=rule_in.category,
        zone_id=rule_in.zone_id,
        authority_id=rule_in.authority_id,
        priority=rule_in.priority,
        is_active=rule_in.is_active
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return {
        "id": rule.id,
        "category": rule.category,
        "zone_id": rule.zone_id,
        "authority_id": rule.authority_id,
        "priority": rule.priority,
        "is_active": rule.is_active,
        "authority_name": rule.authority.name if rule.authority else None,
        "zone_name": rule.zone.name if rule.zone else "All Zones (Global)"
    }

@router.patch("/routing-rules/{id}/toggle")
def toggle_routing_rule(id: int, db: Session = Depends(get_db)):
    rule = db.query(RoutingRule).filter(RoutingRule.id == id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    return {"id": id, "is_active": rule.is_active}

# --- Users ---
@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
