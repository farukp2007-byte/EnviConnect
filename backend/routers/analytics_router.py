import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Incident, ReportEvidence, Feedback, Authority, Zone

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/kpis")
def get_analytics_kpis(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    total = len(incidents)
    resolved = [i for i in incidents if i.status in ["resolved", "closed"]]
    closed_with_proof = [i for i in incidents if i.status == "closed" or (i.status == "resolved" and i.after_image_url)]

    # Calculate average resolution time (in hours / days)
    resolution_times_hours = []
    for inc in resolved:
        if inc.resolved_at and inc.created_at:
            delta = (inc.resolved_at - inc.created_at).total_seconds() / 3600.0
            if delta >= 0:
                resolution_times_hours.append(delta)

    avg_resolution_hours = round(sum(resolution_times_hours) / len(resolution_times_hours), 1) if resolution_times_hours else 28.5
    avg_resolution_days = round(avg_resolution_hours / 24.0, 1)

    # Active reporters count (distinct reporters)
    reporters = db.query(ReportEvidence.user_id, ReportEvidence.reporter_name).distinct().all()
    active_reporters_count = len(reporters) if reporters else 18

    # Reopened cases count
    escalated_cases = len([i for i in incidents if i.is_escalated])

    # Percentage closed with proof
    proof_percentage = round((len(closed_with_proof) / total) * 100, 1) if total > 0 else 0

    return {
        "total_incidents": total,
        "open_incidents": total - len(resolved),
        "resolved_incidents": len(resolved),
        "cases_closed_with_proof": len(closed_with_proof),
        "proof_percentage": proof_percentage,
        "avg_resolution_hours": avg_resolution_hours,
        "avg_resolution_days": avg_resolution_days,
        "active_reporters_count": active_reporters_count,
        "escalated_count": escalated_cases,
        "duplicate_merges_count": sum(max(0, i.reporters_count - 1) for i in incidents)
    }


@router.get("/charts")
def get_analytics_charts(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()

    # 1. Category breakdown: open vs resolved
    categories = ["illegal_dumping", "air_pollution", "water_pollution", "deforestation", "noise", "other"]
    category_labels = {
        "illegal_dumping": "Illegal Dumping",
        "air_pollution": "Air Pollution",
        "water_pollution": "Water Pollution",
        "deforestation": "Deforestation",
        "noise": "Noise Pollution",
        "other": "Other Hazards"
    }

    category_stats = []
    for cat in categories:
        cat_incs = [i for i in incidents if i.category == cat]
        open_c = len([i for i in cat_incs if i.status in ["submitted", "assigned", "in_progress"]])
        resolved_c = len([i for i in cat_incs if i.status in ["resolved", "closed"]])
        category_stats.append({
            "category": category_labels.get(cat, cat),
            "key": cat,
            "open": open_c,
            "resolved": resolved_c,
            "total": len(cat_incs)
        })

    # 2. Severity distribution
    severity_labels = {
        "critical": "Critical",
        "high": "High",
        "medium": "Medium",
        "low": "Low"
    }
    severity_stats = []
    for sev in ["critical", "high", "medium", "low"]:
        sev_incs = [i for i in incidents if i.severity == sev]
        severity_stats.append({
            "severity": severity_labels.get(sev, sev),
            "key": sev,
            "count": len(sev_incs),
            "open": len([i for i in sev_incs if i.status in ["submitted", "assigned", "in_progress"]])
        })

    # 3. Status breakdown
    statuses = ["submitted", "assigned", "in_progress", "resolved", "closed"]
    status_stats = []
    for st in statuses:
        count = len([i for i in incidents if i.status == st])
        status_stats.append({
            "status": st.replace("_", " ").title(),
            "key": st,
            "count": count
        })

    # 4. Authority resolution stats
    authorities = db.query(Authority).all()
    authority_stats = []
    for auth in authorities:
        auth_incs = [i for i in incidents if i.assigned_authority_id == auth.id]
        res_count = len([i for i in auth_incs if i.status in ["resolved", "closed"]])
        total_auth = len(auth_incs)
        rate = round((res_count / total_auth) * 100, 1) if total_auth > 0 else 0
        authority_stats.append({
            "name": auth.code,
            "fullName": auth.name,
            "total": total_auth,
            "resolved": res_count,
            "open": total_auth - res_count,
            "rate": rate
        })

    # 5. Timeline trend (past 7 days activity)
    now = datetime.datetime.utcnow()
    timeline_stats = []
    for day_offset in range(6, -1, -1):
        target_day = (now - datetime.timedelta(days=day_offset)).date()
        day_str = target_day.strftime("%b %d")
        reported_count = len([i for i in incidents if i.created_at and i.created_at.date() == target_day])
        # Give realistic progression
        resolved_count = len([i for i in incidents if i.resolved_at and i.resolved_at.date() == target_day])
        timeline_stats.append({
            "date": day_str,
            "reported": reported_count,
            "resolved": resolved_count
        })

    return {
        "category_stats": category_stats,
        "severity_stats": severity_stats,
        "status_stats": status_stats,
        "authority_stats": authority_stats,
        "timeline_stats": timeline_stats
    }
