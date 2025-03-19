import logging
from sqlalchemy.orm import Session
from app.models.models import Feedback, Complaint, Restaurant, User
from app.core.email import send_low_rating_notification
from app.core.config import settings
from datetime import datetime
from sqlalchemy import func

# Logger yapılandırması
logger = logging.getLogger("email_service")

def process_low_rating_feedback(db: Session, feedback_id: int, feedback_type: str = "feedback"):
    """
    Düşük puanlı yorumu işler ve bildirim e-postası gönderir
    
    Args:
        db: Veritabanı oturumu
        feedback_id: Yorum ID'si
        feedback_type: Yorum tipi ("feedback" veya "complaint")
    
    Returns:
        bool: İşlem başarılı ise True, değilse False
    """
    try:
        # Bildirim ayarı kapalıysa işlem yapma
        if not settings.NOTIFY_ON_LOW_RATING:
            logger.info("Düşük puan bildirimi devre dışı bırakıldı.")
            return False
        
        # Yorumu al
        if feedback_type == "feedback":
            feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        else:  # complaint
            feedback = db.query(Complaint).filter(Complaint.id == feedback_id).first()
        
        if not feedback:
            logger.error(f"{feedback_type.capitalize()} ID {feedback_id} bulunamadı.")
            return False
        
        # Puan eşiğini kontrol et - Şikayetler için eşik kontrolü yapma, her zaman bildir
        if feedback_type == "feedback" and feedback.average_rating > settings.LOW_RATING_THRESHOLD:
            logger.info(f"{feedback_type.capitalize()} ID {feedback_id} düşük puanlı değil. Puan: {feedback.average_rating}")
            return False
        
        # Restoranı al
        restaurant = db.query(Restaurant).filter(Restaurant.id == feedback.restaurant_id).first()
        if not restaurant:
            logger.error(f"Restoran ID {feedback.restaurant_id} bulunamadı.")
            return False
        
        # Restoran sahibini al
        restaurant_owner = db.query(User).filter(
            User.restaurant_id == restaurant.id,
            User.role == "restaurant_owner"
        ).first()
        
        if not restaurant_owner:
            logger.error(f"Restoran ID {restaurant.id} için sahip bulunamadı.")
            return False
        
        # Yorum verilerini hazırla
        feedback_data = {
            "id": feedback.id,
            "name": feedback.name,
            "email": feedback.email,
            "phone": feedback.phone,
            "food_rating": feedback.food_rating,
            "service_rating": feedback.service_rating,
            "atmosphere_rating": feedback.atmosphere_rating,
            "average_rating": feedback.average_rating,
            "comment": feedback.comment,
            "created_at": feedback.created_at.strftime("%d.%m.%Y %H:%M") if feedback.created_at else "",
            "restaurant_id": feedback.restaurant_id,
            "restaurant_name": restaurant.name,
            "type": feedback_type
        }
        
        # AWS SES için doğrulanmış e-posta kullan
        original_from_email = settings.SMTP_FROM
        
        # AWS SES kullanılıyorsa doğrulanmış e-posta adresi kullan
        is_aws_ses = "aws" in settings.SMTP_SERVER.lower() or "amazon" in settings.SMTP_SERVER.lower()
        
        # Restoran sahibinin e-posta adresini kullan
        to_email = restaurant_owner.email
        
        # Güvenlik/test kontrolü - AWS SES'te doğrulanmamış e-posta adresi sorun yaratabilir
        # Bu nedenle geçici olarak doğrulanmış e-posta adresini kullanabiliriz
        if is_aws_ses and "@yazilim.com" not in to_email and "@mutfakyazilim.com" not in to_email:
            logger.warning(f"AWS SES kullanılıyor ve restoran sahibinin e-posta adresi ({to_email}) doğrulanmamış. Contact@mutfakyazilim.com adresine yönlendiriliyor.")
            to_email = "contact@mutfakyazilim.com"
        
        logger.info(f"E-posta bildirimi gönderiliyor: {to_email} (Restoran ID: {restaurant.id}, Restoran Adı: {restaurant.name})")
        
        try:
            if is_aws_ses:
                logger.info(f"AWS SES için doğrulanmış e-posta kullanılıyor: contact@mutfakyazilim.com")
                settings.SMTP_FROM = "contact@mutfakyazilim.com"
            
            # E-posta gönder
            from app.core.email import send_low_rating_notification
            result = send_low_rating_notification(to_email, feedback_data)
            
            # Orijinal e-posta adresini geri yükle
            if is_aws_ses:
                settings.SMTP_FROM = original_from_email
            
            if result:
                logger.info(f"Düşük puanlı {feedback_type} bildirimi başarıyla gönderildi. ID: {feedback_id}, Alıcı: {to_email}")
            else:
                logger.error(f"Düşük puanlı {feedback_type} bildirimi gönderilemedi. ID: {feedback_id}, Alıcı: {to_email}")
            
            return result
            
        except Exception as mail_error:
            # Hata durumunda orijinal e-posta adresini geri yükle
            if is_aws_ses:
                settings.SMTP_FROM = original_from_email
                
            logger.error(f"E-posta gönderilirken hata: {str(mail_error)}")
            return False
    
    except Exception as e:
        logger.error(f"Düşük puanlı yorum işlenirken hata oluştu: {str(e)}")
        return False

def process_all_low_ratings(db: Session, hours: int = 24):
    """
    Belirli bir süre içindeki tüm düşük puanlı yorumları işler
    
    Args:
        db: Veritabanı oturumu
        hours: Kaç saat öncesine kadar olan yorumları işleyeceği
    
    Returns:
        int: İşlenen yorum sayısı
    """
    try:
        # Son X saat içindeki düşük puanlı yorumları al
        time_threshold = datetime.utcnow() - datetime.timedelta(hours=hours)
        
        # Feedbacks tablosundan düşük puanlı yorumları al
        low_rated_feedbacks = db.query(Feedback).filter(
            Feedback.average_rating <= settings.LOW_RATING_THRESHOLD,
            Feedback.created_at >= time_threshold
        ).all()
        
        # Complaints tablosundan düşük puanlı yorumları al
        low_rated_complaints = db.query(Complaint).filter(
            Complaint.average_rating <= settings.LOW_RATING_THRESHOLD,
            Complaint.created_at >= time_threshold
        ).all()
        
        processed_count = 0
        
        # Feedbacks için bildirim gönder
        for feedback in low_rated_feedbacks:
            if process_low_rating_feedback(db, feedback.id, "feedback"):
                processed_count += 1
        
        # Complaints için bildirim gönder
        for complaint in low_rated_complaints:
            if process_low_rating_feedback(db, complaint.id, "complaint"):
                processed_count += 1
        
        logger.info(f"Toplam {processed_count} düşük puanlı yorum işlendi.")
        return processed_count
    
    except Exception as e:
        logger.error(f"Düşük puanlı yorumlar işlenirken hata oluştu: {str(e)}")
        return 0 