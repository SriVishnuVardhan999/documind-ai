from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(user.password)

    print("=" * 50)
    print("Original Password :", user.password)
    print("Hashed Password   :", hashed_password)
    print("=" * 50)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Signup Successful"
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    print("=" * 50)
    print("Entered Password :", user.password)
    print("Stored Password  :", db_user.password)
    print("=" * 50)

    try:
        password_match = verify_password(
            user.password,
            db_user.password
        )
    except Exception as e:
        print("Password Verify Error :", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    if not password_match:
        raise HTTPException(
            status_code=401,
            detail="Wrong Password"
        )

    token = create_access_token(
        {
            "sub": db_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "name": db_user.name,
        "email": db_user.email
    }