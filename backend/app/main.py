from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

from app.core.config import settings
from app.db.db import get_db, engine, Base
from app.models.models import User, UserRole
from app.schemas.schemas import Token, Login
from app.core.auth import authenticate_user, create_access_token, get_password_hash
from app.api.api import api_router
from app.services.email_service import process_all_low_ratings

# Logger yapılandırması
logger = logging.getLogger("api")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için tüm originlere izin veriyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ana API router'ı uygulamaya ekle
app.include_router(api_router, prefix="/api")

# Background task to process low ratings
def process_low_ratings_task():
    try:
        db = next(get_db())
        processed_count = process_all_low_ratings(db, hours=24)
        logger.info(f"Scheduled task: {processed_count} düşük puanlı yorum işlendi.")
    except Exception as e:
        logger.error(f"Scheduled task error: {str(e)}")

# Initialize scheduler
scheduler = BackgroundScheduler()

@app.on_event("startup")
async def startup_db_client():
    # Create admin user if not exists
    db = next(get_db())
    admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin_user:
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    
    # Start scheduler for low rating notifications
    if settings.ENABLE_EMAIL_NOTIFICATIONS:
        try:
            scheduler.add_job(
                process_low_ratings_task,
                IntervalTrigger(hours=1),  # Her saat çalıştır
                id="process_low_ratings",
                replace_existing=True
            )
            scheduler.start()
            logger.info("Düşük puanlı yorum işleme zamanlayıcısı başlatıldı.")
        except Exception as e:
            logger.error(f"Zamanlayıcı başlatılırken hata oluştu: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    # Shutdown scheduler
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Zamanlayıcı durduruldu.")

@app.post("/token", response_model=Token)
async def login_for_access_token(login: Login, db: Session = Depends(get_db)):
    user = authenticate_user(db, login.email, login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "restaurant_id": user.restaurant_id},
        expires_delta=access_token_expires,
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "restaurant_id": user.restaurant_id,
    }

@app.get("/")
async def root():
    return {"message": "Mutfak Yazılım API'ye Hoş Geldiniz"}

@app.get("/process-low-ratings")
async def process_low_ratings(db: Session = Depends(get_db)):
    """
    Düşük puanlı yorumları işler ve bildirim e-postaları gönderir
    """
    try:
        processed_count = process_all_low_ratings(db, hours=24)
        return {"message": f"{processed_count} düşük puanlı yorum işlendi."}
    except Exception as e:
        logger.error(f"Düşük puanlı yorumlar işlenirken hata oluştu: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Düşük puanlı yorumlar işlenirken hata oluştu: {str(e)}"
        ) 