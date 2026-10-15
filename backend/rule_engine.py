from typing import Tuple, Optional
from sqlalchemy.orm import Session
from models import Zone, Authority, RoutingRule
from ml_engine import haversine_distance_meters

def find_nearest_or_containing_zone(db: Session, lat: float, lng: float) -> Optional[Zone]:
    """
    Finds the zone that contains the coordinates or is closest to them.
    """
    zones = db.query(Zone).all()
    if not zones:
        return None

    # First check if coordinates fall within any zone's radius
    best_zone = None
    min_dist = float("inf")

    for zone in zones:
        dist_m = haversine_distance_meters(lat, lng, zone.center_lat, zone.center_lng)
        dist_km = dist_m / 1000.0

        if dist_km <= zone.radius_km and dist_m < min_dist:
            min_dist = dist_m
            best_zone = zone

    # If outside all radii, return the geometrically closest zone
    if not best_zone:
        for zone in zones:
            dist_m = haversine_distance_meters(lat, lng, zone.center_lat, zone.center_lng)
            if dist_m < min_dist:
                min_dist = dist_m
                best_zone = zone

    return best_zone


def route_incident_to_authority(
    db: Session,
    category: str,
    zone: Optional[Zone] = None
) -> Optional[Authority]:
    """
    Evaluates routing rules:
    1. Looks for an active rule matching (category, zone_id)
    2. Looks for an active rule matching (category, None) (global fallback)
    3. Code-based fallback routing for known authorities
    """
    zone_id = zone.id if zone else None

    # Specific zone rule
    if zone_id:
        rule = db.query(RoutingRule).filter(
            RoutingRule.category == category,
            RoutingRule.zone_id == zone_id,
            RoutingRule.is_active == True
        ).order_by(RoutingRule.priority.desc()).first()
        if rule and rule.authority:
            return rule.authority

    # Global category rule
    rule = db.query(RoutingRule).filter(
        RoutingRule.category == category,
        RoutingRule.zone_id == None,
        RoutingRule.is_active == True
    ).order_by(RoutingRule.priority.desc()).first()
    if rule and rule.authority:
        return rule.authority

    # Default Code-based Routing
    default_code_map = {
        "illegal_dumping": "MCT",
        "noise": "MCT",
        "air_pollution": "APPCB",
        "water_pollution": "APPCB",
        "deforestation": "FOREST",
        "other": "TUDA"
    }

    target_code = default_code_map.get(category, "TUDA")
    authority = db.query(Authority).filter(Authority.code == target_code).first()
    if not authority:
        authority = db.query(Authority).first()

    return authority
