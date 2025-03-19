import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/features/core/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { customerService } from '@/lib/api';

interface Restaurant {
  id: number;
  name: string;
  subdomain: string;
}

const ThankYou = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  
  useEffect(() => {
    // Extract restaurant ID from URL query parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('restaurant');
    
    if (id && id !== 'null') {
      const restaurantIdNum = parseInt(id, 10);
      
      // Fetch restaurant details
      const fetchRestaurantDetails = async () => {
        try {
          setLoading(true);
          const data = await customerService.getRestaurantDetails(restaurantIdNum);
          setRestaurant(data);
        } catch (error) {
          console.error('Error fetching restaurant details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRestaurantDetails();
    } else {
      setLoading(false);
    }

    // Redirect to home after 10 seconds
    const timer = setTimeout(() => {
      // Ana sayfaya yönlendir
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  const getThankYouMessage = () => {
    if (language === 'tr') {
      return restaurant
        ? `${restaurant.name} değerlendirmeniz için teşekkür ederiz!`
        : 'Değerlendirmeniz için teşekkür ederiz!';
    } else if (language === 'en') {
      return restaurant 
        ? `Thank you for your feedback about ${restaurant.name}!`
        : 'Thank you for your feedback!';
    } else {
      return restaurant
        ? `شكرًا لك على تقييمك لـ ${restaurant.name}!`
        : 'شكرًا لك على تقييمك!';
    }
  };

  const getSubMessage = () => {
    if (language === 'tr') {
      return 'Geri bildiriminiz başarıyla kaydedildi. Anasayfaya yönlendiriliyorsunuz...';
    } else if (language === 'en') {
      return 'Your feedback has been successfully saved. You are being redirected to the home page...';
    } else {
      return 'تم حفظ ملاحظاتك بنجاح. يتم إعادة توجيهك إلى الصفحة الرئيسية...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="flex flex-col items-center space-y-6 card-glass p-8">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Restaurant Logo */}
          {!loading && restaurant && (
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mb-2">
              <img 
                src="/lovable-uploads/google.svg" 
                alt={restaurant.name} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/lovable-uploads/google-logo.png";
                }}
              />
            </div>
          )}
          
          <h1 className="text-xl md:text-2xl font-semibold text-center">
            {getThankYouMessage()}
          </h1>
          
          <p className="text-center text-muted-foreground">
            {getSubMessage()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 