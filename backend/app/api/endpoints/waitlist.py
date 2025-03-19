from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.db import get_db
from app.models.models import Waitlist
from app.schemas.schemas import WaitlistCreate, WaitlistResponse
from app.core.auth import get_admin_user

router = APIRouter()

@router.post("/", response_model=WaitlistResponse)
async def add_to_waitlist(data: WaitlistCreate, db: Session = Depends(get_db)):
    """
    Waitlist'e yeni bir e-posta ekler
    """
    # E-posta adresi zaten var mı kontrol et
    existing = db.query(Waitlist).filter(Waitlist.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi zaten waitlist'te mevcut"
        )
    
    # Yeni waitlist kaydı oluştur
    new_waitlist = Waitlist(
        email=data.email,
        created_at=datetime.now()
    )
    
    # Veritabanına kaydet
    db.add(new_waitlist)
    db.commit()
    db.refresh(new_waitlist)
    
    return new_waitlist

@router.get("/", response_model=List[WaitlistResponse])
async def get_waitlist(db: Session = Depends(get_db)):
    """
    Tüm waitlist e-postalarını döner
    """
    waitlist = db.query(Waitlist).all()
    return waitlist 