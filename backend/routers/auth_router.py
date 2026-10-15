from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Authority
from schemas import UserRegister, UserLogin, UserOut, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role=user_in.role or "citizen",
        authority_id=user_in.authority_id,
        phone=user_in.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/demo-users")
def get_demo_users():
    """
    Returns pre-configured demo user accounts for rapid testing and 1-click evaluation.
    """
    return [
        {
            "role": "citizen",
            "name": "Rajesh Sharma (Active Citizen)",
            "email": "citizen@envi.gov",
            "password": "citizen123",
            "badge": "Citizen Reporter",
            "description": "Reports incidents with GPS evidence, tracks complaint status, and validates fixes"
        },
        {
            "role": "authority",
            "name": "Dr. K. Srinivas Rao (MCT Zonal Officer)",
            "email": "mct.officer@tirupati.gov",
            "password": "mct123",
            "badge": "Municipal Corporation",
            "description": "Handles garbage dumping, solid waste, and urban noise violations across Tirupati"
        },
        {
            "role": "authority",
            "name": "P. V. Ramana (APPCB Environmental Engineer)",
            "email": "appcb.officer@appcb.gov",
            "password": "appcb123",
            "badge": "Pollution Control Board",
            "description": "Investigates industrial air pollution, river effluents, and factory emissions"
        },
        {
            "role": "ngo",
            "name": "Ananya Deshmukh (Green Action Alliance)",
            "email": "ngo@greenaction.org",
            "password": "ngo123",
            "badge": "NGO Analyst",
            "description": "Read-only access to GIS heatmaps, regional analytics, and resolution metrics"
        },
        {
            "role": "admin",
            "name": "System Administrator",
            "email": "admin@envi.gov",
            "password": "admin123",
            "badge": "Super Admin",
            "description": "Configures automated routing rules, municipal zones, and authority departments"
        }
    ]
