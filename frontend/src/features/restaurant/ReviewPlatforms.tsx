import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/features/core/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLocation } from 'react-router-dom';
import { customerService } from '@/lib/api';
import { toast } from 'sonner';

interface Platform {
  id: number;
  name: string;
  url: string;
}

const ReviewPlatforms = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Extract restaurant ID from URL query parameters or subdomain
    const params = new URLSearchParams(location.search);
    let id = params.get('restaurant');
    const restaurantName = params.get('name');
    
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
          // This is a placeholder - you would need to implement this API endpoint
          const data = await customerService.getRestaurantBySubdomain(restaurantName);
          if (data) {
            setRestaurantId(data.id);
            fetchPlatforms(data.id);
            
            // Set document title with restaurant name
            document.title = `${data.name} - Değerlendirme Platformları`;
            
            // Update restaurant logo
            const logoElement = document.querySelector('img[alt="Restaurant Logo"]') as HTMLImageElement;
            if (logoElement && data.logo) {
              logoElement.src = data.logo;
            }
          }
        } catch (error) {
          console.error('Error fetching restaurant details by subdomain:', error);
        }
      };
      
      fetchRestaurantBySubdomain();
    } else if (id && id !== 'null') {
      const restaurantId = parseInt(id, 10);
      setRestaurantId(restaurantId);
      fetchPlatforms(restaurantId);
      
      // If restaurant name is provided, update the title
      if (restaurantName) {
        const decodedName = decodeURIComponent(restaurantName).replace(/-/g, ' ');
        document.title = `${decodedName} - Değerlendirme Platformları`;
        
        // Try to fetch restaurant details to get the logo
        const fetchRestaurantDetails = async () => {
          try {
            const data = await customerService.getRestaurantDetails(restaurantId);
            if (data && data.logo) {
              const logoElement = document.querySelector('img[alt="Restaurant Logo"]') as HTMLImageElement;
              if (logoElement) {
                logoElement.src = data.logo;
              }
            }
          } catch (error) {
            console.error('Error fetching restaurant details:', error);
          }
        };
        
        fetchRestaurantDetails();
      }
    } else {
      // Eğer restaurant ID yoksa veya "null" ise, varsayılan bir değer ata
      const defaultId = 1;
      setRestaurantId(defaultId);
      fetchPlatforms(defaultId);
      console.log('Restaurant ID not found or null, using default ID: 1');
    }
  }, [location]);
  
  const fetchPlatforms = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await customerService.getRestaurantPlatforms(id);
      setPlatforms(data);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast.error('Platform bilgileri yüklenirken bir hata oluştu.');
      // Set default platforms if API fails
      setPlatforms([
        {
          id: 1,
          name: 'Google',
          url: 'https://www.google.com/maps/search/?api=1&query=restaurant'
        },
        {
          id: 2,
          name: 'Tripadvisor',
          url: 'https://www.tripadvisor.com/Restaurant_Review'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Platform styling
  const getPlatformStyle = (name: string) => {
    const styles = {
      Google: {
        baseColor: 'bg-white border border-gray-200 text-gray-800',
        hoverColor: 'hover:bg-blue-500 hover:text-white hover:border-blue-500',
        logo: "/lovable-uploads/google.svg"
      },
      'App Store': {
        baseColor: 'bg-white border border-gray-200 text-gray-800',
        hoverColor: 'hover:bg-black hover:text-white hover:border-black',
        logo: "/lovable-uploads/apple-app-store.svg"
      },
      'Google Play': {
        baseColor: 'bg-white border border-gray-200 text-gray-800',
        hoverColor: 'hover:bg-green-600 hover:text-white hover:border-green-600',
        logo: "/lovable-uploads/logo-google-play.svg"
      },
      Tripadvisor: {
        baseColor: 'bg-white border border-gray-200 text-gray-800',
        hoverColor: 'hover:bg-green-800 hover:text-white hover:border-green-800',
        logo: "/lovable-uploads/tripadvisor-2.svg"
      },
      default: {
        baseColor: 'bg-white border border-gray-200 text-gray-800',
        hoverColor: 'hover:bg-primary hover:text-white hover:border-primary',
        logo: "/lovable-uploads/google.svg"
      }
    };
    
    const knownPlatforms = ['Google', 'App Store', 'Google Play', 'Tripadvisor'];
    const key = knownPlatforms.includes(name) ? name : 'default';
    return styles[key as keyof typeof styles];
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md mx-auto animate-fade-in py-8">
        <div className="card-glass p-6 md:p-8">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Restaurant Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/google.svg"
                alt="Restaurant Logo" 
                className="w-12 h-12 object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/lovable-uploads/google.svg";
                }}
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-8">
            {t('review.title')}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Yükleniyor...</p>
            </div>
          ) : platforms.length === 0 ? (
            <div className="text-center py-4">
              <p>Henüz platform linki eklenmemiş.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {platforms.map(platform => {
                const style = getPlatformStyle(platform.name);
                return (
                  <a 
                    key={platform.id} 
                    href={platform.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`${style.baseColor} ${style.hoverColor} py-4 px-5 rounded-lg font-medium transition-colors duration-300 text-center shadow-sm hover:shadow-md flex items-center h-16`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center mr-3">
                      <img 
                        src={style.logo} 
                        alt={`${platform.name} Logo`} 
                        className="max-w-full max-h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/lovable-uploads/google.svg";
                        }} 
                      />
                    </div>
                    <span className="flex-grow text-center font-medium">{platform.name}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPlatforms;
