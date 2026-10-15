from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Zone, Incident
from schemas import ZoneOut, ZoneTrendingOut

router = APIRouter(prefix="/api/zones", tags=["zones"])

@router.get("", response_model=List[ZoneOut])
def list_zones(db: Session = Depends(get_db)):
    return db.query(Zone).all()

@router.get("/trending", response_model=List[ZoneTrendingOut])
def get_trending_zones(db: Session = Depends(get_db)):
    """
    Computes zone severity and risk levels (green/yellow/orange/red)
    based on report density, severity weights, and escalation status.
    """
    zones = db.query(Zone).all()
    results = []

    for z in zones:
        incidents = db.query(Incident).filter(Incident.zone_id == z.id).all()
        total = len(incidents)
        open_incs = [i for i in incidents if i.status in ["submitted", "assigned", "in_progress"]]
        resolved_incs = [i for i in incidents if i.status in ["resolved", "closed"]]
        critical_incs = [i for i in open_incs if i.severity == "critical"]
        high_incs = [i for i in open_incs if i.severity == "high"]
        escalated_incs = [i for i in open_incs if i.is_escalated]

        # Risk score calculation
        # Base weight on open incidents, higher weights for critical, high severity, and re-escalated violations
        score = (len(open_incs) * 1.5) + (len(critical_incs) * 3.5) + (len(high_incs) * 2.0) + (len(escalated_incs) * 3.0)

        if score >= 12.0 or len(critical_incs) >= 2:
            level = "red"
        elif score >= 7.0 or len(critical_incs) >= 1:
            level = "orange"
        elif score >= 3.0:
            level = "yellow"
        else:
            level = "green"

        results.append({
            "zone_id": z.id,
            "zone_name": z.name,
            "zone_code": z.code,
            "center_lat": z.center_lat,
            "center_lng": z.center_lng,
            "radius_km": z.radius_km,
            "open_count": len(open_incs),
            "resolved_count": len(resolved_incs),
            "total_count": total,
            "critical_count": len(critical_incs),
            "risk_score": round(score, 1),
            "risk_level": level
        })

    # Sort by risk score descending
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results
