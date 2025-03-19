from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from app.db.db import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RESTAURANT_OWNER = "restaurant_owner"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.RESTAURANT_OWNER)
    is_active = Column(Boolean, default=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)
    
    restaurant = relationship("Restaurant", back_populates="owner")

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subdomain = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="restaurant")
    feedbacks = relationship("Feedback", back_populates="restaurant")
    complaints = relationship("Complaint", back_populates="restaurant")
    platforms = relationship("Platform", back_populates="restaurant")
    rating_statistics = relationship("RatingStatistics", back_populates="restaurant")
    star_click_stats = relationship("StarClickStatistics", back_populates="restaurant")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    food_rating = Column(Integer)
    service_rating = Column(Integer)
    atmosphere_rating = Column(Integer)
    average_rating = Column(Float)
    comment = Column(Text, nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    restaurant = relationship("Restaurant", back_populates="feedbacks")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    food_rating = Column(Integer)
    service_rating = Column(Integer)
    atmosphere_rating = Column(Integer)
    average_rating = Column(Float)
    comment = Column(Text)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    restaurant = relationship("Restaurant", back_populates="complaints")

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    url = Column(String)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    
    restaurant = relationship("Restaurant", back_populates="platforms")

class RatingStatistics(Base):
    __tablename__ = "rating_statistics"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    rating_type = Column(String)  # food, service, atmosphere
    rating_value = Column(Integer)  # 1-5 arası yıldız değeri
    count = Column(Integer, default=0)  # Bu yıldıza verilen oy sayısı
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    restaurant = relationship("Restaurant", back_populates="rating_statistics")

class StarClickStatistics(Base):
    __tablename__ = "star_click_statistics"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    star_value = Column(Integer)  # Tıklanan yıldız değeri (1-5)
    count = Column(Integer, default=0)  # Tıklanma sayısı
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    restaurant = relationship("Restaurant", back_populates="star_click_stats")

class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StarClick(Base):
    __tablename__ = "star_clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    star_value = Column(Integer)  # Tıklanan yıldız değeri (1-5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    restaurant = relationship("Restaurant", backref="star_clicks") 