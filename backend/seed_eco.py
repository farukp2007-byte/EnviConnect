import datetime
from database import SessionLocal
from models import (
    User, VolunteerDrive, GreenPerk, EcoTransaction, VolunteerEnrollment, PerkRedemption
)

def seed_eco_data():
    db = SessionLocal()

    # 1. Update citizen user's initial wallet and score if needed
    citizen = db.query(User).filter(User.email == "citizen@envi.gov").first()
    if citizen:
        citizen.eco_credits = 380
        citizen.green_score = 785
        citizen.tier = "Prakrithi Mitra"
        citizen.certificate_id = "AP-MCT-EC-2026-88421"
        db.commit()

    # 2. Seed Volunteer Drives
    if db.query(VolunteerDrive).count() == 0:
        drives = [
            VolunteerDrive(
                title="Seshachalam Biosphere Reserve Afforestation & Drone Patrol",
                department="AP Forest Department & TUDA",
                category="Afforestation & Wildlife Protection",
                date_time="Saturday, 24 Oct 2026 • 07:00 AM - 12:00 PM",
                location="Alipiri Foothills Basecamp, Kapila Theertham Sector",
                points_reward=150,
                score_boost=30,
                min_score=500,
                max_volunteers=40,
                enrolled_count=26,
                perks="Official AP Forest Volunteer Badge, Plantation Certificate, High-Tea & Field Kit",
                description="Join forest range officers and eco-guards in planting 500 indigenous medicinal saplings along the bio-reserve buffer zone and assisting in drone-based red sanders surveillance."
            ),
            VolunteerDrive(
                title="Swachh Swarnamukhi River Cleanup & Water Quality Sampling",
                department="Municipal Corporation of Tirupati (MCT) & APPCB",
                category="Waterway Conservation",
                date_time="Sunday, 25 Oct 2026 • 06:30 AM - 10:30 AM",
                location="Swarnamukhi Causeway Bridge, Settipalli Ghat",
                points_reward=120,
                score_boost=25,
                min_score=450,
                max_volunteers=60,
                enrolled_count=38,
                perks="APPCB Citizen Water Tester Kit, Safety Overalls & Gloves, Breakfast Voucher",
                description="Community-driven removal of single-use plastics and floating silt from the riverbed alongside APPCB scientists conducting live pH and Dissolved Oxygen testing."
            ),
            VolunteerDrive(
                title="Zero-Waste Pilgrimage Corridor Plastic Audit",
                department="Tirumala Tirupati Devasthanams (TTD) & MCT",
                category="Waste Management & Segregation",
                date_time="Wednesday, 28 Oct 2026 • 08:00 AM - 01:00 PM",
                location="Alipiri Footpath Checkpost & Toll Plaza",
                points_reward=100,
                score_boost=20,
                min_score=400,
                max_volunteers=50,
                enrolled_count=31,
                perks="TTD Special Darshan Volunteer Token, Eco-Jute Carry Bags, Certificate",
                description="Assisting municipal sanitation squads in monitoring pilgrim waste segregation, distributing cloth bags, and preventing single-use plastic bottles entering eco-sensitive hill tracks."
            ),
            VolunteerDrive(
                title="Ward 14 Community Noise & Air Surveillance Volunteer Corps",
                department="Andhra Pradesh Pollution Control Board (APPCB)",
                category="Air & Noise Monitoring",
                date_time="Saturday, 31 Oct 2026 • 05:00 PM - 09:00 PM",
                location="Gandhi Road Commercial Precinct & RTC Central Bus Stand",
                points_reward=140,
                score_boost=25,
                min_score=550,
                max_volunteers=30,
                enrolled_count=18,
                perks="Citizen Air Quality Sensor Pass, Official Observer Cap, Honorarium Voucher",
                description="Field deployment of handheld calibrated particulate (PM2.5/PM10) and decibel meters during peak evening traffic to record baseline acoustic pollution data."
            )
        ]
        db.add_all(drives)
        db.commit()
        print("Volunteer drives seeded successfully!")

    # 3. Seed Government Perks
    if db.query(GreenPerk).count() == 0:
        perks = [
            GreenPerk(
                title="5% Municipal Property Tax Green Rebate Token",
                issuer="Municipal Corporation of Tirupati (MCT)",
                category="Tax Rebate",
                cost_coins=250,
                min_score=650,
                validity="Financial Year 2026-27",
                description="Official token authorized under Andhra Pradesh Municipal Green Citizen Incentive Scheme. Deducts 5% directly from annual residential property tax assessment.",
                icon="ReceiptPercent"
            ),
            GreenPerk(
                title="APSRTC Electric City Bus Green Commuter Monthly Pass",
                issuer="Andhra Pradesh State Road Transport Corp (APSRTC)",
                category="Public Transit",
                cost_coins=200,
                min_score=600,
                validity="30 Days from Activation",
                description="Unlimited zero-emission travel across all electric intra-city bus routes in Tirupati, Renigunta, and Chandragiri corridors.",
                icon="Bus"
            ),
            GreenPerk(
                title="Fast-Track Civic Grievance Priority Dispatch Flag",
                issuer="Municipal Corporation of Tirupati (MCT)",
                category="Priority Grievance",
                cost_coins=150,
                min_score=550,
                validity="Single Incident Fast-Track",
                description="Upgrades any reported municipal violation (drainage, waste, open burning) to Tier-1 Rapid Response. Municipal team dispatched within 4 hours guaranteed.",
                icon="Zap"
            ),
            GreenPerk(
                title="Sacred Medicinal Saplings Pack (5 Species)",
                issuer="AP Forest Department & TTD Social Forestry",
                category="Nursery Saplings",
                cost_coins=80,
                min_score=400,
                validity="Valid for 6 Months",
                description="Collect 5 mature medicinal and native shade plants (Neem, Tulsi, Bilva, Red Sandalwood, Peepal) from Kapila Theertham Government Nursery with planting guidance.",
                icon="Trees"
            ),
            GreenPerk(
                title="VIP Green Citizen Delegate Pass — Annual Eco Expo 2026",
                issuer="Tirupati Urban Development Authority (TUDA)",
                category="Event Access",
                cost_coins=100,
                min_score=500,
                validity="November 14-16, 2026",
                description="All-access delegate badge for the Southern Regional Renewable & Environmental Summit at SVU Convention Center, including dinner reception.",
                icon="Ticket"
            )
        ]
        db.add_all(perks)
        db.commit()
        print("Government perks seeded successfully!")

    # 4. Seed initial transaction history for citizen Rajesh Sharma
    if citizen and db.query(EcoTransaction).filter(EcoTransaction.user_id == citizen.id).count() == 0:
        txs = [
            EcoTransaction(
                user_id=citizen.id,
                amount=50,
                score_change=15,
                action_type="report_created",
                title="Violation Reported: ENV-2026-0001",
                description="Reported overflowing municipal waste at Gandhi Road vegetable market with EXIF GPS proof.",
                reference_id="ENV-2026-0001",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=6)
            ),
            EcoTransaction(
                user_id=citizen.id,
                amount=30,
                score_change=12,
                action_type="feedback_audit",
                title="Citizen Verification Audit: ENV-2026-0001",
                description="Inspected site and confirmed MCT sanitation squad cleared 4-ton waste completely with 5★ rating.",
                reference_id="ENV-2026-0001",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            ),
            EcoTransaction(
                user_id=citizen.id,
                amount=20,
                score_change=10,
                action_type="evidence_merged",
                title="Co-Report Evidence Merged: ENV-2026-0006",
                description="Added secondary photographic evidence for scrap plastic burning at Auto Nagar.",
                reference_id="ENV-2026-0006",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            EcoTransaction(
                user_id=citizen.id,
                amount=100,
                score_change=20,
                action_type="volunteer_signup",
                title="Volunteer Enrolled: Kapila Theertham Catchment Patrol",
                description="Enrolled in AP Forest Department community bio-reserve monitoring initiative.",
                reference_id="VOL-FOREST-8841",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            ),
            EcoTransaction(
                user_id=citizen.id,
                amount=50,
                score_change=15,
                action_type="report_created",
                title="Violation Reported: ENV-2026-0008",
                description="Reported unauthorized sand mining along Swarnamukhi riverbed.",
                reference_id="ENV-2026-0008",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
            )
        ]
        db.add_all(txs)
        db.commit()
        print("Sample transactions seeded successfully!")

    # 5. Seed one active enrollment and one redeemed perk for demo
    if citizen:
        drive = db.query(VolunteerDrive).first()
        if drive and db.query(VolunteerEnrollment).filter(VolunteerEnrollment.user_id == citizen.id).count() == 0:
            enr = VolunteerEnrollment(
                drive_id=drive.id,
                user_id=citizen.id,
                status="enrolled",
                verification_code="VOL-FOREST-92841"
            )
            db.add(enr)
            db.commit()

        perk = db.query(GreenPerk).filter(GreenPerk.category == "Nursery Saplings").first()
        if perk and db.query(PerkRedemption).filter(PerkRedemption.user_id == citizen.id).count() == 0:
            red = PerkRedemption(
                user_id=citizen.id,
                perk_id=perk.id,
                coupon_code="APF-GREEN-2026-SAP55",
                is_used=False
            )
            db.add(red)
            db.commit()

    db.close()
    print("Eco seeding complete!")

if __name__ == "__main__":
    seed_eco_data()
