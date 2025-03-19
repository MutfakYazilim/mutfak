from fastapi import APIRouter
from app.api.endpoints import restaurant, customer, admin, waitlist

api_router = APIRouter()

# Restaurant API route'larını ekle
api_router.include_router(restaurant.router, prefix="/restaurant", tags=["restaurant"])

# Customer API route'larını ekle
api_router.include_router(customer.router, prefix="/customer", tags=["customer"])

# Admin API route'larını ekle
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Waitlist API route'larını ekle
api_router.include_router(waitlist.router, prefix="/waitlist", tags=["waitlist"]) 