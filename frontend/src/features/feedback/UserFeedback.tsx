import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/features/core/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { customerService, restaurantService } from '@/lib/api';

interface Restaurant {
  id: number;
  name: string;
  subdomain: string;
  logo?: string;
}

const UserFeedback = () => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // Extract restaurant ID from URL query parameters or subdomain
    const params = new URLSearchParams(location.search);
    let id = params.get('restaurant');
    
    // Check if we're using a subdomain
    const hostname = window.location.hostname;
    const isSubdomain = hostname.includes('-degerlendirme.') || hostname.includes('-feedback.');
    
    if (isSubdomain) {
      // Extract restaurant ID from subdomain
      // Format: hasanusta-degerlendirme.mutfakyazilim.com
      const subdomain = hostname.split('.')[0];
      const restaurantName = subdomain.split('-degerlendirme')[0];
      
      // Fetch restaurant by subdomain
      const fetchRestaurantBySubdomain = async () => {
        try {
          setLoading(true);
          // This is a placeholder - you would need to implement this API endpoint
          const data = await customerService.getRestaurantBySubdomain(restaurantName);
          if (data) {
            setRestaurant(data);
            setRestaurantId(data.id);
          }
        } catch (error) {
          console.error('Error fetching restaurant details by subdomain:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRestaurantBySubdomain();
    } else if (id && id !== 'null') {
      const restaurantIdNum = parseInt(id, 10);
      setRestaurantId(restaurantIdNum);
      
      // Fetch restaurant details
      const fetchRestaurantDetails = async () => {
        try {
          setLoading(true);
          console.log('Fetching restaurant details for ID:', restaurantIdNum);
          const data = await customerService.getRestaurantDetails(restaurantIdNum);
          console.log('Restaurant details:', data);
          if (data) {
            setRestaurant(data);
            // Set document title with restaurant name
            document.title = `${data.name} - Müşteri Değerlendirme`;
          } else {
            console.error('Restaurant details not found for ID:', restaurantIdNum);
          }
        } catch (error) {
          console.error('Error fetching restaurant details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRestaurantDetails();
    } else {
      // Eğer restaurant ID yoksa veya "null" ise, varsayılan bir değer ata
      setRestaurantId(1);
      console.log('Restaurant ID not found or null, using default ID: 1');
    }
  }, [location]);

  const handleStarClick = async (rating: number) => {
    if (!restaurantId) return;

    try {
      // Yıldız tıklama istatistiğini kaydet
      await restaurantService.trackStarClick(Number(restaurantId), rating);
      setSelectedStar(rating);

      // Ensure restaurantId is valid
      const validRestaurantId = restaurantId || 1;
      
      // Get restaurant name for URL if available
      const restaurantName = restaurant?.name || '';
      const restaurantSlug = restaurantName.toLowerCase().replace(/\s+/g, '-');
      
      // Redirect based on rating
      if (rating <= 3) {
        navigate(`/complaint-form?restaurant=${validRestaurantId}&rating=${rating}&name=${encodeURIComponent(restaurantSlug)}`);
      } else {
        navigate(`/review-platforms?restaurant=${validRestaurantId}&rating=${rating}&name=${encodeURIComponent(restaurantSlug)}`);
      }
    } catch (error) {
      console.error('Error tracking star click:', error);
      // İstatistik kaydedilemese bile yönlendirmeyi yap
      const validRestaurantId = restaurantId || 1;
      const restaurantName = restaurant?.name || '';
      const restaurantSlug = restaurantName.toLowerCase().replace(/\s+/g, '-');
      
      if (rating <= 3) {
        navigate(`/complaint-form?restaurant=${validRestaurantId}&rating=${rating}&name=${encodeURIComponent(restaurantSlug)}`);
      } else {
        navigate(`/review-platforms?restaurant=${validRestaurantId}&rating=${rating}&name=${encodeURIComponent(restaurantSlug)}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="flex flex-col items-center space-y-6 card-glass p-8">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Restaurant Logo */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mb-2">
            <img 
              src="/lovable-uploads/google.svg" 
              alt={restaurant?.name || "Google Logo"} 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/lovable-uploads/google-logo.png";
              }}
            />
          </div>
          
          <h1 className="text-xl md:text-2xl font-semibold text-center">
            {loading ? t('feedback.question') : 
              restaurant ? 
                `${restaurant.name} ${t('feedback.question')}` : 
                t('feedback.question')}
          </h1>

          {/* Star Rating */}
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => handleStarClick(star)}
              >
                <Star
                  size={40}
                  fill={(hoveredStar !== null ? star <= hoveredStar : star <= (selectedStar || 0)) ? "#FFD700" : "none"}
                  className={(hoveredStar !== null ? star <= hoveredStar : star <= (selectedStar || 0)) ? "text-yellow-500" : "text-gray-400"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFeedback;
