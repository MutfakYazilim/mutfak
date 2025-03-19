from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.db import get_db
from app.models.models import Restaurant, Feedback, Complaint, Platform, RatingStatistics, StarClickStatistics
from app.schemas.schemas import FeedbackCreate, Feedback as FeedbackSchema, ComplaintCreate, Complaint as ComplaintSchema, FeedbackStats, Platform as PlatformSchema, Restaurant as RestaurantSchema
from app.core.auth import get_restaurant_id_from_host
from sqlalchemy import func
from datetime import datetime
from app.core.email import send_low_rating_notification
from app.core.config import settings
import logging
from app.services.email_service import process_low_rating_feedback

router = APIRouter()

# Logger yapılandırması
logger = logging.getLogger("customer_router")

def get_restaurant_from_host(host: Optional[str] = Header(None), db: Session = Depends(get_db)):
    restaurant_id = get_restaurant_id_from_host(host)
    if not restaurant_id:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return restaurant

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantSchema)
async def get_restaurant_details(restaurant_id: int, db: Session = Depends(get_db)):
    """Get restaurant details by ID"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/restaurants/subdomain/{subdomain}", response_model=RestaurantSchema)
async def get_restaurant_by_subdomain(subdomain: str, db: Session = Depends(get_db)):
    """Get restaurant details by subdomain"""
    restaurant = db.query(Restaurant).filter(Restaurant.subdomain == subdomain).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.post("/feedbacks", response_model=FeedbackSchema)
async def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    """
    Müşteri geri bildirimi oluşturur
    """
    # Restoranın varlığını kontrol et
    restaurant = db.query(Restaurant).filter(Restaurant.id == feedback.restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    # Ortalama puanı hesapla
    average_rating = (feedback.food_rating + feedback.service_rating + feedback.atmosphere_rating) / 3
    
    # Feedback oluştur
    db_feedback = Feedback(
        name=feedback.name,
        email=feedback.email,
        phone=feedback.phone,
        food_rating=feedback.food_rating,
        service_rating=feedback.service_rating,
        atmosphere_rating=feedback.atmosphere_rating,
        average_rating=round(average_rating, 1),
        comment=feedback.comment,
        restaurant_id=feedback.restaurant_id
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    # Düşük puan ise e-posta bildirimi gönder (3 yıldızdan düşük)
    if db_feedback.average_rating < 3:
        try:
            # Email service fonksiyonunu çağır
            process_result = process_low_rating_feedback(db, db_feedback.id, "feedback")
            if process_result:
                logger.info(f"Düşük puanlı geri bildirim bildirimi başarıyla gönderildi. Feedback ID: {db_feedback.id}")
            else:
                logger.error(f"Düşük puanlı geri bildirim bildirimi gönderilemedi. Feedback ID: {db_feedback.id}")
        except Exception as e:
            logger.error(f"E-posta bildirimi işlenirken hata oluştu: {str(e)}")
    
    return db_feedback

@router.get("/feedbacks/stats", response_model=FeedbackStats)
async def get_feedback_stats(db: Session = Depends(get_db)):
    """Get feedback statistics"""
    # Get rating distribution
    rating_distribution = {}
    for i in range(1, 6):
        count = db.query(func.count(Feedback.id)).filter(
            func.round(Feedback.average_rating) == i
        ).scalar() or 0
        rating_distribution[f"{i} Yıldız"] = count
    
    # Get satisfaction data
    satisfaction_data = {
        "Memnun (4-5)": db.query(func.count(Feedback.id)).filter(
            Feedback.average_rating >= 4
        ).scalar() or 0,
        "Orta (3)": db.query(func.count(Feedback.id)).filter(
            Feedback.average_rating >= 3,
            Feedback.average_rating < 4
        ).scalar() or 0,
        "Memnun Değil (1-2)": db.query(func.count(Feedback.id)).filter(
            Feedback.average_rating < 3
        ).scalar() or 0,
    }
    
    return {
        "rating_distribution": rating_distribution,
        "satisfaction_data": satisfaction_data,
    }

@router.post("/complaints", response_model=ComplaintSchema)
async def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Müşteri şikayeti oluşturur
    """
    # Restoranın varlığını kontrol et
    restaurant = db.query(Restaurant).filter(Restaurant.id == complaint.restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    # Ortalama puanı hesapla
    average_rating = (complaint.food_rating + complaint.service_rating + complaint.atmosphere_rating) / 3
    
    # Şikayet oluştur
    db_complaint = Complaint(
        name=complaint.name,
        email=complaint.email,
        phone=complaint.phone,
        food_rating=complaint.food_rating,
        service_rating=complaint.service_rating,
        atmosphere_rating=complaint.atmosphere_rating,
        average_rating=round(average_rating, 1),
        comment=complaint.comment,
        restaurant_id=complaint.restaurant_id
    )
    
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    # E-posta bildirimi gönder
    try:
        # Şikayetler her zaman bildirim olarak gönderilmeli
        process_result = process_low_rating_feedback(db, db_complaint.id, "complaint")
        if process_result:
            logger.info(f"Şikayet bildirimi başarıyla gönderildi. Şikayet ID: {db_complaint.id}")
        else:
            logger.error(f"Şikayet bildirimi gönderilemedi. Şikayet ID: {db_complaint.id}")
    except Exception as e:
        logger.error(f"E-posta bildirimi işlenirken hata oluştu: {str(e)}")
    
    return db_complaint

@router.get("/{restaurant_id}/feedbacks", response_model=List[FeedbackSchema])
async def get_restaurant_feedbacks(restaurant_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get feedbacks for a restaurant"""
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get feedbacks
    feedbacks = db.query(Feedback).filter(Feedback.restaurant_id == restaurant_id).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
    
    return feedbacks

@router.get("/{restaurant_id}/analytics")
async def get_restaurant_analytics(restaurant_id: int, db: Session = Depends(get_db)):
    """Get analytics for a restaurant"""
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get total feedbacks
    total_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.restaurant_id == restaurant_id).scalar() or 0
    
    # Get average rating
    avg_rating = db.query(func.avg(Feedback.average_rating)).filter(Feedback.restaurant_id == restaurant_id).scalar() or 0
    
    # Get rating distribution
    rating_distribution = {}
    for i in range(1, 6):
        count = db.query(func.count(Feedback.id)).filter(
            Feedback.restaurant_id == restaurant_id,
            func.round(Feedback.average_rating) == i
        ).scalar() or 0
        rating_distribution[f"{i} Yıldız"] = count
    
    # Get detailed rating statistics
    detailed_stats = {
        'food': {},
        'service': {},
        'atmosphere': {}
    }
    
    stats = db.query(RatingStatistics).filter(
        RatingStatistics.restaurant_id == restaurant_id
    ).all()
    
    for stat in stats:
        detailed_stats[stat.rating_type][stat.rating_value] = stat.count
    
    # Calculate percentages for each rating type
    rating_percentages = {}
    for rating_type in detailed_stats:
        total = sum(detailed_stats[rating_type].values())
        if total > 0:
            rating_percentages[rating_type] = {
                rating: (count / total) * 100
                for rating, count in detailed_stats[rating_type].items()
            }
        else:
            rating_percentages[rating_type] = {i: 0 for i in range(1, 6)}
    
    # Get satisfaction data
    satisfaction_data = {
        "Memnun (4-5)": db.query(func.count(Feedback.id)).filter(
            Feedback.restaurant_id == restaurant_id,
            Feedback.average_rating >= 4
        ).scalar() or 0,
        "Orta (3)": db.query(func.count(Feedback.id)).filter(
            Feedback.restaurant_id == restaurant_id,
            Feedback.average_rating >= 3,
            Feedback.average_rating < 4
        ).scalar() or 0,
        "Memnun Değil (1-2)": db.query(func.count(Feedback.id)).filter(
            Feedback.restaurant_id == restaurant_id,
            Feedback.average_rating < 3
        ).scalar() or 0,
    }
    
    return {
        "total_feedbacks": total_feedbacks,
        "average_rating": round(avg_rating, 1) if avg_rating else 0,
        "rating_distribution": rating_distribution,
        "satisfaction_data": satisfaction_data,
        "detailed_stats": detailed_stats,
        "rating_percentages": rating_percentages
    }

@router.get("/{restaurant_id}/platforms", response_model=List[PlatformSchema])
async def get_restaurant_platforms(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Restoran için platformları getirir
    """
    # Restoranın varlığını kontrol et
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    # Platformları getir
    platforms = db.query(Platform).filter(Platform.restaurant_id == restaurant_id).all()
    return platforms

@router.post("/test-email")
async def send_test_email(restaurant_id: int, email: str, db: Session = Depends(get_db)):
    """
    Test e-postası gönderir
    """
    try:
        # Restoranın varlığını kontrol et
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restoran bulunamadı"
            )
        
        # SMTP ayarlarını logla
        logger.error(f"SMTP Ayarları: Server={settings.SMTP_SERVER}, Port={settings.SMTP_PORT}, "
                    f"TLS={settings.SMTP_TLS}, Username={settings.SMTP_USERNAME}, "
                    f"From={settings.SMTP_FROM}, Notifications Enabled={settings.ENABLE_EMAIL_NOTIFICATIONS}")
        
        # Test feedback verileri oluştur
        feedback_data = {
            "id": 9999,
            "name": "Test Müşteri",
            "email": "test@example.com",
            "phone": "5551234567",
            "food_rating": 2,
            "service_rating": 1,
            "atmosphere_rating": 2,
            "average_rating": 1.7,
            "comment": "Bu bir test yorumudur. Lütfen dikkate almayınız.",
            "created_at": datetime.utcnow().strftime("%d.%m.%Y %H:%M"),
            "restaurant_id": restaurant.id,
            "restaurant_name": restaurant.name,
            "type": "feedback"
        }
        
        # AWS SES için doğrulanmış e-posta kullan
        original_from_email = settings.SMTP_FROM
        
        try:
            # AWS SES kullanılıyorsa doğrulanmış e-posta adresi kullan
            is_aws_ses = "aws" in settings.SMTP_SERVER.lower() or "amazon" in settings.SMTP_SERVER.lower()
            
            if is_aws_ses:
                logger.info(f"AWS SES için doğrulanmış e-posta kullanılıyor: contact@mutfakyazilim.com")
                settings.SMTP_FROM = "contact@mutfakyazilim.com"
            
            # E-posta gönder
            result = send_low_rating_notification(email, feedback_data)
            
            # Orijinal e-posta adresini geri yükle
            if is_aws_ses:
                settings.SMTP_FROM = original_from_email
            
            if result:
                logger.info(f"Test e-postası başarıyla gönderildi: {email}")
                return {"success": True, "message": f"Test e-postası başarıyla gönderildi: {email}"}
            else:
                logger.error(f"E-posta gönderilirken hata oluştu (send_low_rating_notification False döndü)")
                return {"success": False, "message": "E-posta gönderilirken bir hata oluştu, lütfen logları kontrol edin"}
        except Exception as mail_error:
            # Hata durumunda orijinal e-posta adresini geri yükle
            if is_aws_ses:
                settings.SMTP_FROM = original_from_email
                
            logger.error(f"E-posta gönderilirken hata: {str(mail_error)}")
            return {
                "success": False, 
                "message": f"E-posta gönderilirken hata: {str(mail_error)}",
                "details": {
                    "smtp_server": settings.SMTP_SERVER,
                    "smtp_port": settings.SMTP_PORT,
                    "smtp_username": settings.SMTP_USERNAME[:3] + "***" + settings.SMTP_USERNAME[-3:],
                    "smtp_from": settings.SMTP_FROM,
                    "email_notifications_enabled": settings.ENABLE_EMAIL_NOTIFICATIONS
                }
            }
    
    except Exception as e:
        logger.error(f"Genel hata: {str(e)}")
        return {"success": False, "message": f"Hata: {str(e)}"}

@router.post("/restaurants/{restaurant_id}/star-click")
async def track_star_click(restaurant_id: int, star_value: int, db: Session = Depends(get_db)):
    """Track star click statistics"""
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Validate star value
    if star_value < 1 or star_value > 5:
        raise HTTPException(status_code=400, detail="Invalid star value")
    
    # Get or create statistics
    stat = db.query(StarClickStatistics).filter(
        StarClickStatistics.restaurant_id == restaurant_id,
        StarClickStatistics.star_value == star_value
    ).first()
    
    if not stat:
        stat = StarClickStatistics(
            restaurant_id=restaurant_id,
            star_value=star_value,
            count=1
        )
        db.add(stat)
    else:
        stat.count += 1
        stat.updated_at = datetime.utcnow()
    
    db.commit()
    return {"success": True, "message": "Star click tracked successfully"}

@router.get("/restaurants/{restaurant_id}/star-clicks")
async def get_star_click_stats(restaurant_id: int, db: Session = Depends(get_db)):
    """Get star click statistics for a restaurant"""
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get statistics
    stats = db.query(StarClickStatistics).filter(
        StarClickStatistics.restaurant_id == restaurant_id
    ).all()
    
    # Format statistics
    stats_dict = {i: 0 for i in range(1, 6)}  # Initialize with all star values
    total_clicks = 0
    
    for stat in stats:
        stats_dict[stat.star_value] = stat.count
        total_clicks += stat.count
    
    # Calculate percentages
    percentages = {}
    for star, count in stats_dict.items():
        percentages[star] = (count / total_clicks * 100) if total_clicks > 0 else 0
    
    return {
        "total_clicks": total_clicks,
        "stats": stats_dict,
        "percentages": percentages
    }

# Restoran detayları için endpoint ekle (frontend uyumluluğu için)
@router.get("/restaurant/details/{restaurant_id}", response_model=RestaurantSchema)
async def get_restaurant_details_redirect(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Belirli bir restoranın detaylarını getirir (frontend uyumluluğu için)
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
        
    return restaurant 