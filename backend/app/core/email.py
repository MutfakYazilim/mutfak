import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from app.core.config import settings

# E-posta şablonları için Jinja2 ortamını yapılandır
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(templates_dir))

# Logger yapılandırması
logger = logging.getLogger("email_service")

def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """
    SMTP kullanarak e-posta gönderir
    
    Args:
        to_email: Alıcı e-posta adresi
        subject: E-posta konusu
        html_content: HTML formatında e-posta içeriği
        text_content: Düz metin formatında e-posta içeriği (opsiyonel)
    
    Returns:
        bool: E-posta gönderimi başarılı ise True, değilse False
    """
    try:
        # SMTP ayarlarını logla
        logger.error(f"[DEBUG] send_email başlangıç: to={to_email}, subject={subject}")
        logger.error(f"[DEBUG] SMTP Ayarları: Server={settings.SMTP_SERVER}, Port={settings.SMTP_PORT}, "
                    f"TLS={settings.SMTP_TLS}, Username={settings.SMTP_USERNAME}, "
                    f"From={settings.SMTP_FROM}, Email Enabled={settings.ENABLE_EMAIL_NOTIFICATIONS}")
        
        # E-posta bildirimleri devre dışı bırakılmışsa, hemen çık
        if not settings.ENABLE_EMAIL_NOTIFICATIONS:
            logger.warning("E-posta bildirimleri devre dışı bırakıldı. Gönderim yapılmıyor.")
            return False

        # E-posta mesajını oluştur
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.SMTP_FROM
        message["To"] = to_email
        
        logger.error(f"[DEBUG] E-posta mesaj oluşturuldu: {message['Subject']}")
        
        # Düz metin içeriği ekle (HTML içeriği yoksa)
        if text_content is None:
            # HTML içeriğinden basit bir düz metin oluştur
            text_content = html_content.replace("<br>", "\n").replace("</p>", "\n").replace("<p>", "")
            # HTML etiketlerini temizle
            import re
            text_content = re.sub(r'<[^>]*>', '', text_content)
        
        # İçerikleri ekle
        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        message.attach(part1)
        message.attach(part2)
        
        logger.error("[DEBUG] İçerikler eklendi")
        
        # SMTP sunucusuna bağlan
        logger.error(f"[DEBUG] SMTP sunucusuna bağlanılıyor: {settings.SMTP_SERVER}:{settings.SMTP_PORT}")
        
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            logger.error("[DEBUG] SMTP bağlantısı kuruldu")
            
            if settings.SMTP_TLS:
                logger.error("[DEBUG] TLS başlatılıyor")
                server.starttls()
                logger.error("[DEBUG] TLS başlatıldı")
            
            # Giriş yap
            logger.error(f"[DEBUG] SMTP giriş yapılıyor: {settings.SMTP_USERNAME}")
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            logger.error("[DEBUG] SMTP giriş başarılı")
            
            # E-postayı gönder
            logger.error(f"[DEBUG] E-posta gönderiliyor: {to_email}")
            server.sendmail(settings.SMTP_FROM, to_email, message.as_string())
            logger.error("[DEBUG] E-posta gönderildi")
            
        logger.info(f"E-posta başarıyla gönderildi: {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"E-posta gönderilirken hata oluştu: {str(e)}")
        import traceback
        logger.error(f"Hata stack trace: {traceback.format_exc()}")
        return False

def send_low_rating_notification(restaurant_email: str, feedback_data: dict):
    """
    Düşük puanlı yorum için bildirim e-postası gönderir
    
    Args:
        restaurant_email: Restoran e-posta adresi
        feedback_data: Yorum verileri (dict)
    
    Returns:
        bool: E-posta gönderimi başarılı ise True, değilse False
    """
    try:
        # E-posta şablonunu yükle
        template = env.get_template("low_rating_notification.html")
        
        # Şablonu render et
        html_content = template.render(
            restaurant_name=feedback_data.get("restaurant_name", ""),
            customer_name=feedback_data.get("name", "Anonim Müşteri"),
            rating=feedback_data.get("average_rating", 0),
            food_rating=feedback_data.get("food_rating", 0),
            service_rating=feedback_data.get("service_rating", 0),
            atmosphere_rating=feedback_data.get("atmosphere_rating", 0),
            comment=feedback_data.get("comment", "Yorum yok"),
            date=feedback_data.get("created_at", ""),
            feedback_id=feedback_data.get("id", ""),
            feedback_type=feedback_data.get("type", "feedback")
        )
        
        # E-postayı gönder
        subject = f"Düşük Puanlı Yorum Bildirimi - {feedback_data.get('average_rating')} Yıldız"
        return send_email(restaurant_email, subject, html_content)
    
    except Exception as e:
        logger.error(f"Düşük puan bildirimi gönderilirken hata oluştu: {str(e)}")
        return False 