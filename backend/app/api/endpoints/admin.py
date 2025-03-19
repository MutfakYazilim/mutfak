from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.db import get_db
from app.models.models import User, Restaurant, UserRole
from app.schemas.schemas import RestaurantCreate, Restaurant as RestaurantSchema, RestaurantUpdate, Login, Token, RestaurantWithOwner, QRCode, QRCodeCreate, EmailAlert, EmailAlertCreate
from app.core.auth import get_admin_user, get_password_hash, authenticate_user, create_access_token
from datetime import timedelta
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
async def admin_login(login: Login, db: Session = Depends(get_db)):
    user = authenticate_user(db, login.email, login.password)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires,
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "restaurant_id": None,
    }

@router.post("/restaurants", response_model=RestaurantSchema)
async def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # Check if subdomain already exists
    db_restaurant = db.query(Restaurant).filter(Restaurant.subdomain == restaurant.subdomain).first()
    if db_restaurant:
        raise HTTPException(status_code=400, detail="Subdomain already registered")
    
    # Check if owner email already exists
    db_user = db.query(User).filter(User.email == restaurant.owner_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create restaurant
    db_restaurant = Restaurant(
        name=restaurant.name,
        subdomain=restaurant.subdomain,
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    
    # Create restaurant owner
    db_user = User(
        email=restaurant.owner_email,
        hashed_password=get_password_hash(restaurant.owner_password),
        role=UserRole.RESTAURANT_OWNER,
        restaurant_id=db_restaurant.id,
    )
    db.add(db_user)
    db.commit()
    
    return db_restaurant

@router.get("/restaurants", response_model=List[RestaurantWithOwner])
async def read_restaurants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    restaurants = db.query(Restaurant).offset(skip).limit(limit).all()
    
    # Manually create response with owner details
    result = []
    for restaurant in restaurants:
        owner = db.query(User).filter(User.restaurant_id == restaurant.id, User.role == UserRole.RESTAURANT_OWNER).first()
        restaurant_dict = {
            "id": restaurant.id,
            "name": restaurant.name,
            "subdomain": restaurant.subdomain,
            "created_at": restaurant.created_at,
            "updated_at": restaurant.updated_at,
            "owner": {
                "id": owner.id if owner else None,
                "email": owner.email if owner else None,
                "role": owner.role if owner else None,
                "is_active": owner.is_active if owner else None
            } if owner else None
        }
        result.append(restaurant_dict)
    
    return result

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantWithOwner)
async def read_restaurant(restaurant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get owner details
    owner = db.query(User).filter(User.restaurant_id == restaurant_id, User.role == UserRole.RESTAURANT_OWNER).first()
    
    # Create response with owner details
    result = {
        "id": db_restaurant.id,
        "name": db_restaurant.name,
        "subdomain": db_restaurant.subdomain,
        "created_at": db_restaurant.created_at,
        "updated_at": db_restaurant.updated_at,
        "owner": {
            "id": owner.id if owner else None,
            "email": owner.email if owner else None,
            "role": owner.role if owner else None,
            "is_active": owner.is_active if owner else None
        } if owner else None
    }
    
    return result

@router.patch("/restaurants/{restaurant_id}", response_model=RestaurantSchema)
async def update_restaurant(restaurant_id: int, restaurant: RestaurantUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Update restaurant
    if restaurant.name:
        db_restaurant.name = restaurant.name
    if restaurant.subdomain:
        # Check if subdomain already exists
        existing_subdomain = db.query(Restaurant).filter(Restaurant.subdomain == restaurant.subdomain, Restaurant.id != restaurant_id).first()
        if existing_subdomain:
            raise HTTPException(status_code=400, detail="Subdomain already registered")
        db_restaurant.subdomain = restaurant.subdomain
    
    # Update owner if provided
    if restaurant.owner_email or restaurant.owner_password:
        db_owner = db.query(User).filter(User.restaurant_id == restaurant_id, User.role == UserRole.RESTAURANT_OWNER).first()
        if db_owner:
            if restaurant.owner_email:
                # Check if email already exists
                existing_email = db.query(User).filter(User.email == restaurant.owner_email, User.id != db_owner.id).first()
                if existing_email:
                    raise HTTPException(status_code=400, detail="Email already registered")
                db_owner.email = restaurant.owner_email
            if restaurant.owner_password:
                db_owner.hashed_password = get_password_hash(restaurant.owner_password)
            db.add(db_owner)
    
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.delete("/restaurants/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Delete restaurant owner
    db_owner = db.query(User).filter(User.restaurant_id == restaurant_id, User.role == UserRole.RESTAURANT_OWNER).first()
    if db_owner:
        db.delete(db_owner)
    
    # Delete restaurant
    db.delete(db_restaurant)
    db.commit()
    return None

# QR Kod Yönetimi API'leri
@router.post("/qrcode", response_model=QRCode)
async def create_qrcode(qrcode: QRCodeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # Check if restaurant exists
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == qrcode.restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Create QR code
    db_qrcode = QRCode(
        restaurant_id=qrcode.restaurant_id,
        url=f"{settings.FRONTEND_URL}/user-feedback?restaurant={qrcode.restaurant_id}",
        size=qrcode.size
    )
    
    return db_qrcode

@router.get("/qrcode", response_model=List[QRCode])
async def read_qrcodes(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # In a real implementation, we would store QR codes in the database
    # For now, we'll return a list of QR codes for all restaurants
    restaurants = db.query(Restaurant).all()
    qrcodes = []
    
    for restaurant in restaurants:
        qrcodes.append(QRCode(
            restaurant_id=restaurant.id,
            url=f"{settings.FRONTEND_URL}/user-feedback?restaurant={restaurant.id}",
            size=180
        ))
    
    return qrcodes

# E-posta Bildirim API'leri
@router.post("/email-alerts", response_model=EmailAlert)
async def create_email_alert(email_alert: EmailAlertCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # In a real implementation, we would store email alerts in the database
    # For now, we'll just return the created email alert
    return EmailAlert(
        id=1,
        email=email_alert.email,
        restaurant_id=email_alert.restaurant_id,
        notify_on_low_rating=email_alert.notify_on_low_rating,
        notify_on_new_feedback=email_alert.notify_on_new_feedback
    )

@router.get("/email-alerts", response_model=List[EmailAlert])
async def read_email_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # In a real implementation, we would fetch email alerts from the database
    # For now, we'll return a mock list
    return [
        EmailAlert(
            id=1,
            email="admin@mutfakyazilim.com",
            restaurant_id=None,  # None means all restaurants
            notify_on_low_rating=True,
            notify_on_new_feedback=True
        )
    ] 