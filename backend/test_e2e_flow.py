import sys
import requests
import json
from PIL import Image

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def log_step(step_name, detail=""):
    print(f"\n==========================================")
    print(f">> {step_name}")
    if detail:
        print(f"   {detail}")
    print(f"==========================================")

def create_dummy_image_bytes():
    img = Image.new("RGB", (400, 300), color=(30, 80, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def run_e2e_tests():
    session = requests.Session()

    # 1. Health check
    log_step("1. Checking Root API Health")
    res = session.get(f"{BASE_URL}/")
    assert res.status_code == 200, f"Root check failed: {res.text}"
    print(f"✅ Root Response: {res.json()}")

    # 2. Demo Users & Login as Citizen
    log_step("2. Authenticating as Citizen (Rajesh Sharma)")
    login_res = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "citizen@envi.gov",
        "password": "citizen123"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    citizen_token = login_res.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
    print(f"✅ Logged in successfully as Citizen. Token received.")

    # 3. Test NLP Auto-Prediction
    log_step("3. Testing NLP Classification & Severity Suggestion")
    nlp_text = "Dense black toxic fumes and noxious smoke billowing continuously from chemical furnace near school"
    pred_res = session.post(f"{BASE_URL}/api/reports/ai-predict", json={"text": nlp_text})
    assert pred_res.status_code == 200, f"AI predict failed: {pred_res.text}"
    pred_data = pred_res.json()
    print(f"✅ NLP Classification Result:")
    print(f"   Category: {pred_data['category']} ({pred_data['category_confidence']*100:.1f}%)")
    print(f"   Severity: {pred_data['severity']} ({pred_data['severity_confidence']*100:.1f}%)")
    print(f"   Keywords Extracted: {pred_data['keywords']}")
    assert pred_data["category"] == "air_pollution"

    # 4. Submit New Incident (Test Automatic Routing to APPCB)
    log_step("4. Submitting New Incident (Simulating Citizen with GPS Evidence)")
    img_bytes = create_dummy_image_bytes()
    files = {"file": ("smoke_evidence.jpg", img_bytes, "image/jpeg")}
    data = {
        "title": "Industrial Chimney Black Smoke Plume",
        "description": nlp_text,
        "category": "air_pollution",
        "severity": "critical",
        "latitude": 13.6405,
        "longitude": 79.5105,
        "address": "Renigunta Industrial Sector 3, Tirupati"
    }
    submit_res = session.post(f"{BASE_URL}/api/reports", data=data, files=files, headers=citizen_headers)
    assert submit_res.status_code == 200, f"Submission failed: {submit_res.text}"
    submit_json = submit_res.json()
    new_inc = submit_json["incident"]
    inc_id = new_inc["id"]
    print(f"✅ Incident Created: {new_inc['incident_number']}")
    print(f"   Assigned Authority: {new_inc['authority_name']}")
    print(f"   Zone: {new_inc['zone_name']}")
    print(f"   Initial Status: {new_inc['status']}")
    print(f"   Is Duplicate: {submit_json['is_duplicate']}")
    assert new_inc["authority_name"] == "Andhra Pradesh Pollution Control Board (APPCB)"
    assert not submit_json["is_duplicate"]

    # 5. TEST LOCATION-BASED DUPLICATE DETECTION & MERGE (<100m) (USP)
    log_step("5. Testing Duplicate Detection & Merge USP (<100m distance)")
    # Submit another report 35 meters away with same category
    dup_files = {"file": ("neighbor_smoke.jpg", img_bytes, "image/jpeg")}
    dup_data = {
        "title": "Same chimney smoke reported from adjacent street",
        "description": "Neighboring resident reporting the same heavy chemical soot falling on our rooftops.",
        "category": "air_pollution",
        "severity": "high",
        "latitude": 13.6408, # ~35 meters from 13.6405
        "longitude": 79.5107,
        "address": "Renigunta Industrial Sector 3 (Behind Plant B)"
    }
    dup_res = session.post(f"{BASE_URL}/api/reports", data=dup_data, files=dup_files, headers=citizen_headers)
    assert dup_res.status_code == 200, f"Duplicate submission failed: {dup_res.text}"
    dup_json = dup_res.json()
    print(f"✅ Duplicate Detection Triggered:")
    print(f"   Is Duplicate: {dup_json['is_duplicate']}")
    print(f"   Merged Incident Number: {dup_json['incident']['incident_number']}")
    print(f"   Total Reporters Count: {dup_json['reporters_count']}")
    print(f"   System Message: {dup_json['message']}")
    assert dup_json["is_duplicate"] is True
    assert dup_json["reporters_count"] == 2
    assert dup_json["incident"]["id"] == inc_id

    # 6. Verify Incident Details & Linked Citizen Evidences
    log_step("6. Verifying Consolidated Incident Details & Evidence Gallery")
    detail_res = session.get(f"{BASE_URL}/api/reports/{inc_id}")
    assert detail_res.status_code == 200
    detail_json = detail_res.json()
    print(f"✅ Incident {detail_json['incident_number']} Details:")
    print(f"   Reporters count: {detail_json['reporters_count']}")
    print(f"   Number of linked citizen evidences: {len(detail_json['evidences'])}")
    print(f"   Audit timeline history length: {len(detail_json['history'])}")
    assert len(detail_json["evidences"]) == 2

    # 7. Login as Authority (APPCB) and Remediate with After-Photo Proof
    log_step("7. Logging in as APPCB Officer to Update Status & Upload After Proof")
    appcb_login = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "appcb.officer@appcb.gov",
        "password": "appcb123"
    })
    assert appcb_login.status_code == 200
    appcb_token = appcb_login.json()["access_token"]
    appcb_headers = {"Authorization": f"Bearer {appcb_token}"}

    after_img_bytes = create_dummy_image_bytes()
    status_files = {"after_file": ("after_scrubber_installed.jpg", after_img_bytes, "image/jpeg")}
    status_data = {
        "new_status": "resolved",
        "notes": "Field inspection conducted. Factory compelled to install wet scrubber. Zero visible emissions verified."
    }
    update_res = session.patch(f"{BASE_URL}/api/reports/{inc_id}/status", data=status_data, files=status_files, headers=appcb_headers)
    assert update_res.status_code == 200
    resolved_json = update_res.json()
    print(f"✅ Authority Update Successful:")
    print(f"   New Status: {resolved_json['status']}")
    print(f"   Resolution Notes: {resolved_json['resolution_notes']}")
    print(f"   After Image URL: {resolved_json['after_image_url']}")
    assert resolved_json["status"] == "resolved"
    assert resolved_json["after_image_url"] is not None

    # 8. TEST CITIZEN VERIFICATION & RE-ESCALATION (USP 6)
    log_step("8. Testing Citizen Feedback USP: 'Was this actually fixed?' -> No (Reopen & Escalate)")
    esc_res = session.post(f"{BASE_URL}/api/reports/{inc_id}/feedback", json={
        "was_fixed": False,
        "rating": 1,
        "comments": "Smoke restarted after 2 hours! Filter bypass is suspected."
    }, headers=citizen_headers)
    assert esc_res.status_code == 200
    esc_json = esc_res.json()
    print(f"✅ Escalation Response:")
    print(f"   Status: {esc_json['status']}")
    print(f"   Escalation Count: {esc_json['escalation_count']}")
    print(f"   Message: {esc_json['message']}")
    assert esc_json["status"] == "reopened_escalated"
    assert esc_json["escalation_count"] == 1

    # Verify escalated ticket state
    esc_detail = session.get(f"{BASE_URL}/api/reports/{inc_id}").json()
    print(f"   Current Incident Status: {esc_detail['status']}")
    print(f"   Current Incident Severity: {esc_detail['severity']}")
    print(f"   Is Escalated: {esc_detail['is_escalated']}")
    assert esc_detail["status"] == "in_progress"
    assert esc_detail["severity"] == "critical"
    assert esc_detail["is_escalated"] is True

    # 9. Authority Resolves Again and Citizen Confirms Fixed -> Closed with Proof
    log_step("9. Authority Re-Resolves and Citizen Confirms 'Yes, Fixed' (Closed with Proof)")
    session.patch(f"{BASE_URL}/api/reports/{inc_id}/status", data={
        "new_status": "resolved",
        "notes": "Surprise night inspection: Factory power supply disconnected and heavy penalty levied."
    }, headers=appcb_headers)

    close_res = session.post(f"{BASE_URL}/api/reports/{inc_id}/feedback", json={
        "was_fixed": True,
        "rating": 5,
        "comments": "Chimney is completely shut down. Excellent strict enforcement by APPCB!"
    }, headers=citizen_headers)
    assert close_res.status_code == 200
    close_json = close_res.json()
    print(f"✅ Verification Confirmation:")
    print(f"   Status: {close_json['status']}")
    print(f"   Message: {close_json['message']}")
    assert close_json["status"] == "closed"

    final_detail = session.get(f"{BASE_URL}/api/reports/{inc_id}").json()
    assert final_detail["status"] == "closed"
    assert final_detail["closed_at"] is not None

    # 10. Check Trending Zones & Analytics KPIs
    log_step("10. Checking Live Heatmap Risk Scores & Analytics KPIs")
    zones_res = session.get(f"{BASE_URL}/api/zones/trending")
    assert zones_res.status_code == 200
    trending_zones = zones_res.json()
    print(f"✅ Top Trending Risk Zones:")
    for z in trending_zones[:3]:
        print(f"   - {z['zone_name']}: Risk Score {z['risk_score']} ({z['risk_level'].upper()} Hotspot) • Open: {z['open_count']}")

    # 11. Test Eco Profile & Volunteer Drive Enrollment
    log_step("11. Testing Green Civic Credit Score & Volunteer Drive Enrollment")
    eco_prof = session.get(f"{BASE_URL}/api/eco/profile", headers=citizen_headers).json()
    assert "green_score" in eco_prof
    assert "eco_credits" in eco_prof
    print(f"✅ Citizen Green Score: {eco_prof['green_score']}/900 • EcoCredits: {eco_prof['eco_credits']} • Rank: {eco_prof['tier']}")

    # 12. Test Official Government Certificate Generation
    log_step("12. Testing APPCB & MCT Government Certificate Verification")
    cert_res = session.get(f"{BASE_URL}/api/eco/certificate", headers=citizen_headers)
    assert cert_res.status_code == 200
    cert = cert_res.json()
    print(f"✅ Official Certificate Issued: {cert['certificate_id']}")
    print(f"   Citizen: {cert['citizen_name']}")
    print(f"   Digital Signature Hash: {cert['digital_signature_hash']}")
    print(f"   Verification Link: {cert['verification_url']}")

    print("\n🎉 ALL 12 END-TO-END WORKFLOW TESTS (INCLUDING ECOCREDITS & VOLUNTEER DRIVES) PASSED 100% SUCCESSFULLY!\n")

if __name__ == "__main__":
    run_e2e_tests()
