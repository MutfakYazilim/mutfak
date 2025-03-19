from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.db import get_db
from app.models.models import User, Restaurant, Feedback, Complaint, Platform, StarClick, StarClickStatistics
from app.schemas.schemas import Login, Token, UserUpdate, Platform as PlatformSchema, PlatformCreate, PlatformUpdate, DashboardData, Feedback as FeedbackSchema, Restaurant as RestaurantSchema
from app.core.auth import get_restaurant_owner, get_password_hash, authenticate_user, create_access_token
from datetime import timedelta
from app.core.config import settings
from sqlalchemy import func
from datetime import datetime

router = APIRouter()

@router.post("/login", response_model=Token)
async def restaurant_login(login: Login, db: Session = Depends(get_db)):
    user = authenticate_user(db, login.email, login.password)
    if not user or user.role != "restaurant_owner":
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

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    """
    Get dashboard data for the current restaurant
    """
    restaurant_id = current_user.restaurant_id
    
    # Get total feedbacks (including complaints)
    feedbacks_count = db.query(func.count(Feedback.id)).filter(Feedback.restaurant_id == restaurant_id).scalar() or 0
    complaints_count = db.query(func.count(Complaint.id)).filter(Complaint.restaurant_id == restaurant_id).scalar() or 0
    total_feedbacks = feedbacks_count + complaints_count
    
    # Get average rating (including complaints)
    avg_feedback_rating = db.query(func.avg(Feedback.average_rating)).filter(Feedback.restaurant_id == restaurant_id).scalar() or 0
    avg_complaint_rating = db.query(func.avg(Complaint.average_rating)).filter(Complaint.restaurant_id == restaurant_id).scalar() or 0
    
    # Calculate weighted average
    if feedbacks_count + complaints_count > 0:
        avg_rating = (avg_feedback_rating * feedbacks_count + avg_complaint_rating * complaints_count) / (feedbacks_count + complaints_count)
    else:
        avg_rating = 0
    
    # Get latest feedback date (including complaints)
    latest_feedback = db.query(Feedback).filter(Feedback.restaurant_id == restaurant_id).order_by(Feedback.created_at.desc()).first()
    latest_complaint = db.query(Complaint).filter(Complaint.restaurant_id == restaurant_id).order_by(Complaint.created_at.desc()).first()
    
    latest_feedback_date = None
    if latest_feedback and latest_complaint:
        latest_feedback_date = max(latest_feedback.created_at, latest_complaint.created_at)
    elif latest_feedback:
        latest_feedback_date = latest_feedback.created_at
    elif latest_complaint:
        latest_feedback_date = latest_complaint.created_at
    
    # Get rating distribution (including complaints)
    rating_distribution = {}
    for i in range(1, 6):
        feedback_count = db.query(func.count(Feedback.id)).filter(
            Feedback.restaurant_id == restaurant_id,
            func.round(Feedback.average_rating) == i
        ).scalar() or 0
        
        complaint_count = db.query(func.count(Complaint.id)).filter(
            Complaint.restaurant_id == restaurant_id,
            func.round(Complaint.average_rating) == i
        ).scalar() or 0
        
        rating_distribution[f"{i} Yıldız"] = feedback_count + complaint_count
    
    # Get satisfaction data (including complaints)
    satisfaction_data = {
        "Memnun (4-5)": (
            db.query(func.count(Feedback.id)).filter(
                Feedback.restaurant_id == restaurant_id,
                Feedback.average_rating >= 4
            ).scalar() or 0
        ) + (
            db.query(func.count(Complaint.id)).filter(
                Complaint.restaurant_id == restaurant_id,
                Complaint.average_rating >= 4
            ).scalar() or 0
        ),
        "Orta (3)": (
            db.query(func.count(Feedback.id)).filter(
                Feedback.restaurant_id == restaurant_id,
                Feedback.average_rating >= 3,
                Feedback.average_rating < 4
            ).scalar() or 0
        ) + (
            db.query(func.count(Complaint.id)).filter(
                Complaint.restaurant_id == restaurant_id,
                Complaint.average_rating >= 3,
                Complaint.average_rating < 4
            ).scalar() or 0
        ),
        "Memnun Değil (1-2)": (
            db.query(func.count(Feedback.id)).filter(
                Feedback.restaurant_id == restaurant_id,
                Feedback.average_rating < 3
            ).scalar() or 0
        ) + (
            db.query(func.count(Complaint.id)).filter(
                Complaint.restaurant_id == restaurant_id,
                Complaint.average_rating < 3
            ).scalar() or 0
        ),
    }
    
    # Get recent comments (including complaints)
    recent_feedbacks = db.query(Feedback).filter(Feedback.restaurant_id == restaurant_id).order_by(Feedback.created_at.desc()).limit(5).all()
    recent_complaints = db.query(Complaint).filter(Complaint.restaurant_id == restaurant_id).order_by(Complaint.created_at.desc()).limit(5).all()
    
    # Combine and sort recent comments
    recent_comments = []
    for feedback in recent_feedbacks:
        recent_comments.append({
            "id": feedback.id,
            "name": feedback.name,
            "email": feedback.email,
            "average_rating": feedback.average_rating,
            "comment": feedback.comment,
            "created_at": feedback.created_at
        })
    
    for complaint in recent_complaints:
        recent_comments.append({
            "id": complaint.id,
            "name": complaint.name,
            "email": complaint.email,
            "average_rating": complaint.average_rating,
            "comment": complaint.comment,
            "created_at": complaint.created_at
        })
    
    # Sort by created_at and limit to 5
    recent_comments = sorted(recent_comments, key=lambda x: x["created_at"], reverse=True)[:5]
    
    return {
        "total_feedbacks": total_feedbacks,
        "average_rating": round(avg_rating, 1) if avg_rating else 0,
        "latest_feedback_date": latest_feedback_date,
        "rating_distribution": rating_distribution,
        "satisfaction_data": satisfaction_data,
        "recent_comments": recent_comments,
    }

@router.patch("/settings", response_model=None)
async def update_settings(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    # Update user
    if user_update.email:
        # Check if email already exists
        existing_email = db.query(User).filter(User.email == user_update.email, User.id != current_user.id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
    
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    if user_update.is_active is not None:
        current_user.is_active = user_update.is_active
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Settings updated successfully"}

@router.get("/platforms", response_model=List[PlatformSchema])
async def get_platforms(db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    platforms = db.query(Platform).filter(Platform.restaurant_id == current_user.restaurant_id).all()
    return platforms

@router.post("/platforms", response_model=PlatformSchema)
async def create_platform(platform: PlatformCreate, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    # Admin can add platforms for any restaurant, restaurant owner only for their own
    if current_user.role == "restaurant_owner":
        if not current_user.restaurant_id or platform.restaurant_id != current_user.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to add platforms for this restaurant"
            )
    
    try:
        db_platform = Platform(**platform.dict())
        db.add(db_platform)
        db.commit()
        db.refresh(db_platform)
        return db_platform
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating platform: {str(e)}"
        )

@router.patch("/platforms/{platform_id}", response_model=PlatformSchema)
async def update_platform(platform_id: int, platform: PlatformUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    db_platform = db.query(Platform).filter(Platform.id == platform_id, Platform.restaurant_id == current_user.restaurant_id).first()
    if not db_platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    if platform.name:
        db_platform.name = platform.name
    if platform.url:
        db_platform.url = platform.url
    
    db.add(db_platform)
    db.commit()
    db.refresh(db_platform)
    return db_platform

@router.delete("/platforms/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform(platform_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    db_platform = db.query(Platform).filter(Platform.id == platform_id, Platform.restaurant_id == current_user.restaurant_id).first()
    if not db_platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    db.delete(db_platform)
    db.commit()
    return None

@router.get("/feedbacks", response_model=List[FeedbackSchema])
async def get_feedbacks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    feedbacks = db.query(Feedback).filter(Feedback.restaurant_id == current_user.restaurant_id).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
    return feedbacks

@router.get("/complaints", response_model=List[FeedbackSchema])
async def get_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    complaints = db.query(Complaint).filter(Complaint.restaurant_id == current_user.restaurant_id).order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()
    return complaints

@router.delete("/feedbacks/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(feedback_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id, Feedback.restaurant_id == current_user.restaurant_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db.delete(feedback)
    db.commit()
    return None

@router.delete("/complaints/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_complaint(complaint_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_restaurant_owner)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.restaurant_id == current_user.restaurant_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db.delete(complaint)
    db.commit()
    return None

@router.get("/{restaurant_id}/star-clicks", response_model=dict)
async def get_star_click_stats(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    """
    Belirli bir restoran için yıldız tıklama istatistiklerini getirir
    """
    # Restoranın varlığını kontrol et
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    # Veritabanından star click istatistiklerini getir
    # Toplam tıklama sayısını getir
    total_clicks = db.query(func.count(StarClick.id)).filter(
        StarClick.restaurant_id == restaurant_id
    ).scalar() or 0
    
    # Yıldız dağılımını getir
    star_distribution = {}
    percentages = {}
    
    for star in range(1, 6):
        # Veritabanından her yıldız değeri için tıklama sayısını getir
        count = db.query(func.count(StarClick.id)).filter(
            StarClick.restaurant_id == restaurant_id,
            StarClick.star_value == star
        ).scalar() or 0
        
        star_distribution[str(star)] = count
        
        # İstatistik tablosunu güncelle veya oluştur
        star_stat = db.query(StarClickStatistics).filter(
            StarClickStatistics.restaurant_id == restaurant_id,
            StarClickStatistics.star_value == star
        ).first()
        
        if star_stat:
            star_stat.count = count
            star_stat.updated_at = datetime.now()
            db.add(star_stat)
        else:
            new_stat = StarClickStatistics(
                restaurant_id=restaurant_id,
                star_value=star,
                count=count
            )
            db.add(new_stat)
    
    # Değişiklikleri kaydet
    db.commit()
    
    # Yüzde hesaplamalarını yap
    if total_clicks > 0:
        for star, count in star_distribution.items():
            percentages[star] = round((count / total_clicks) * 100, 1)
    
    return {
        "restaurant_id": restaurant_id,
        "total_clicks": total_clicks,
        "star_distribution": star_distribution,
        "percentages": percentages
    }

@router.post("/{restaurant_id}/star-click")
async def track_star_click(
    restaurant_id: int, 
    star_value: int,
    db: Session = Depends(get_db)
):
    """
    Kullanıcının bir yıldıza tıklamasını kaydeder
    """
    # Restoranın varlığını kontrol et
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
        
    # Geçerli bir yıldız değeri olup olmadığını kontrol et
    if star_value < 1 or star_value > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yıldız değeri 1-5 arasında olmalıdır"
        )
    
    # StarClick tablosuna yeni bir kayıt ekle
    new_star_click = StarClick(
        restaurant_id=restaurant_id,
        star_value=star_value
    )
    
    db.add(new_star_click)
    db.commit()
    db.refresh(new_star_click)
    
    return {
        "success": True,
        "message": f"{restaurant_id} ID'li restoran için {star_value} yıldız tıklaması kaydedildi"
    }

# Restaurant detaylarını getir
@router.get("/details/{restaurant_id}", response_model=RestaurantSchema)
async def get_restaurant_details(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    """
    Belirli bir restoranın detaylarını getirir
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
        
    return restaurant 