from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Literal
from datetime import datetime
from app.models.models import UserRole

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    restaurant_id: Optional[int] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    restaurant_id: Optional[int] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = UserRole.RESTAURANT_OWNER
    restaurant_id: Optional[int] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    role: str
    is_active: bool
    restaurant_id: Optional[int] = None

    class Config:
        from_attributes = True

# Restaurant schemas
class RestaurantBase(BaseModel):
    name: str
    subdomain: str

class RestaurantCreate(RestaurantBase):
    owner_email: EmailStr
    owner_password: str

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    subdomain: Optional[str] = None
    owner_email: Optional[EmailStr] = None
    owner_password: Optional[str] = None

class Restaurant(RestaurantBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RestaurantWithOwner(Restaurant):
    owner: Optional[User] = None

    class Config:
        from_attributes = True

# Feedback schemas
class FeedbackBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    food_rating: int
    service_rating: int
    atmosphere_rating: int
    comment: Optional[str] = None

    @validator('food_rating', 'service_rating', 'atmosphere_rating')
    def rating_must_be_between_1_and_5(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class FeedbackCreate(FeedbackBase):
    restaurant_id: int

class Feedback(FeedbackBase):
    id: int
    average_rating: float
    restaurant_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Complaint schemas
class ComplaintBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    food_rating: int
    service_rating: int
    atmosphere_rating: int
    comment: str

class ComplaintCreate(ComplaintBase):
    restaurant_id: int

class Complaint(ComplaintBase):
    id: int
    average_rating: float
    restaurant_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Platform schemas
class PlatformBase(BaseModel):
    name: str
    url: str

class PlatformCreate(PlatformBase):
    restaurant_id: int

class PlatformUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None

class Platform(PlatformBase):
    id: int
    restaurant_id: int

    class Config:
        from_attributes = True

# Login schemas
class Login(BaseModel):
    email: EmailStr
    password: str

# Dashboard schemas
class DashboardData(BaseModel):
    total_feedbacks: int
    average_rating: float
    latest_feedback_date: Optional[datetime] = None
    rating_distribution: dict
    satisfaction_data: dict
    recent_comments: List[dict]  # Feedback ve Complaint karışık olduğu için dict kullanıyoruz

# Stats schemas
class FeedbackStats(BaseModel):
    rating_distribution: dict
    satisfaction_data: dict

# QR Code schemas
class QRCodeCreate(BaseModel):
    restaurant_id: int
    size: int = 180

class QRCode(BaseModel):
    restaurant_id: int
    url: str
    size: int

# Email Alert schemas
class EmailAlertCreate(BaseModel):
    email: EmailStr
    restaurant_id: Optional[int] = None  # None means all restaurants
    notify_on_low_rating: bool = True
    notify_on_new_feedback: bool = True

class EmailAlert(EmailAlertCreate):
    id: int

class WaitlistCreate(BaseModel):
    email: EmailStr

class WaitlistResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Star Click schemas
class StarClickCreate(BaseModel):
    restaurant_id: int
    star_value: int
    
    @validator('star_value')
    def star_value_must_be_between_1_and_5(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Star value must be between 1 and 5')
        return v

class StarClick(StarClickCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class StarClickStats(BaseModel):
    restaurant_id: int
    total_clicks: int
    star_distribution: dict
    percentages: dict
    
    class Config:
        from_attributes = True 