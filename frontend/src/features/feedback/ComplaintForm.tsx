import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/features/core/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { customerService } from '@/lib/api';

// Country codes with flags - expanded list with Arab countries
const countryCodes = [
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  // Additional country codes
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  // Added more Arab countries
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+211', flag: '🇸🇸', name: 'South Sudan' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
  
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
];

const ComplaintForm = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  
  const [foodRating, setFoodRating] = useState<number | null>(null);
  const [serviceRating, setServiceRating] = useState<number | null>(null);
  const [atmosphereRating, setAtmosphereRating] = useState<number | null>(null);
  
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [initialRating, setInitialRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  // E-posta doğrulama fonksiyonu
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    // Extract restaurant ID and initial rating from URL query parameters or subdomain
    const params = new URLSearchParams(location.search);
    let id = params.get('restaurant');
    const rating = params.get('rating');
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
            
            // Set document title with restaurant name
            document.title = `${data.name} - Şikayet Formu`;
            
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
      setRestaurantId(parseInt(id, 10));
      
      // If restaurant name is provided, update the title
      if (restaurantName) {
        const decodedName = decodeURIComponent(restaurantName).replace(/-/g, ' ');
        document.title = `${decodedName} - Şikayet Formu`;
        
        // Try to fetch restaurant details to get the logo
        const fetchRestaurantDetails = async () => {
          try {
            const data = await customerService.getRestaurantDetails(parseInt(id, 10));
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
      // Bu değer gerçek bir restoran ID'si olmalı, test için 1 kullanıyoruz
      setRestaurantId(1);
      console.log('Restaurant ID not found or null, using default ID: 1');
    }
    
    // Yıldızları önceden işaretleme kısmını kaldırıyoruz
    if (rating) {
      const ratingValue = parseInt(rating, 10);
      setInitialRating(ratingValue);
      // Aşağıdaki satırları kaldırıyoruz
      // setFoodRating(ratingValue);
      // setServiceRating(ratingValue);
      // setAtmosphereRating(ratingValue);
    }
  }, [location]);

  const isFormComplete = Boolean(
    name && 
    phone && 
    email && 
    validateEmail(email) && 
    review && 
    consentChecked && 
    foodRating !== null && 
    serviceRating !== null && 
    atmosphereRating !== null
  );

  // E-posta değiştiğinde doğrulama yap
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError(language === 'tr' 
        ? 'Geçerli bir e-posta adresi giriniz'
        : language === 'en'
        ? 'Please enter a valid email address'
        : 'الرجاء إدخال عنوان بريد إلكتروني صالح');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Eksik alanları kontrol et
    let missingFields = [];
    if (!name) missingFields.push(language === 'tr' ? 'İsim' : language === 'en' ? 'Name' : 'الاسم');
    if (!phone) missingFields.push(language === 'tr' ? 'Telefon' : language === 'en' ? 'Phone' : 'هاتف');
    if (!email) missingFields.push(language === 'tr' ? 'E-posta' : language === 'en' ? 'Email' : 'البريد الإلكتروني');
    if (!review) missingFields.push(language === 'tr' ? 'Yorum' : language === 'en' ? 'Review' : 'مراجعة');
    if (!consentChecked) missingFields.push(language === 'tr' ? 'Onay' : language === 'en' ? 'Consent' : 'موافقة');
    if (foodRating === null) missingFields.push(language === 'tr' ? 'Yemek Puanı' : language === 'en' ? 'Food Rating' : 'تقييم الطعام');
    if (serviceRating === null) missingFields.push(language === 'tr' ? 'Servis Puanı' : language === 'en' ? 'Service Rating' : 'تقييم الخدمة');
    if (atmosphereRating === null) missingFields.push(language === 'tr' ? 'Atmosfer Puanı' : language === 'en' ? 'Atmosphere Rating' : 'تقييم الجو');
    
    // E-posta doğrulaması
    if (email && !validateEmail(email)) {
      const emailErrorMessage = language === 'tr' 
        ? "Geçerli bir e-posta adresi giriniz."
        : language === 'en'
        ? "Please enter a valid email address."
        : "الرجاء إدخال عنوان بريد إلكتروني صالح.";
      
      toast.error(emailErrorMessage);
      return;
    }
    
    // Eksik alanlar varsa hata mesajı göster
    if (missingFields.length > 0 || !restaurantId) {
      const detailedErrorMessage = language === 'tr' 
        ? `Lütfen tüm alanları doldurun. Eksik alanlar: ${missingFields.join(', ')}`
        : language === 'en'
        ? `Please fill in all fields. Missing fields: ${missingFields.join(', ')}`
        : `يرجى ملء جميع الحقون. الحقون المفقودة: ${missingFields.join(', ')}`;
      
      toast.error(detailedErrorMessage);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Restaurant ID'nin doğru olduğundan emin olalım
      if (!restaurantId || restaurantId <= 0) {
        console.error('Invalid restaurant ID:', restaurantId);
        toast.error('Geçersiz restoran ID. Lütfen tekrar deneyin.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Submitting feedback with restaurant ID:', restaurantId);
      
      // Feedback verisini oluştur
      const feedbackData = {
        name,
        email,
        phone: `${countryCode} ${phone}`,
        food_rating: foodRating,
        service_rating: serviceRating,
        atmosphere_rating: atmosphereRating,
        comment: review,
        restaurant_id: restaurantId
      };
      
      console.log('Feedback data:', feedbackData);
      
      // Feedback'i gönder
      const response = await customerService.createComplaint(feedbackData);
      console.log('Feedback response:', response);
      
      const successMessage = language === 'tr' 
        ? "Şikayetiniz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz."
        : language === 'en'
        ? "Your complaint has been successfully sent. We will contact you as soon as possible."
        : "تم إرسال شكواك بنجاح. سنتواصل معك في أقرب وقت ممكن.";
      
      toast.success(successMessage, {
        duration: 5000,
      });
      
      // Teşekkür sayfasına yönlendir
      navigate(`/thank-you?restaurant=${restaurantId}`);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      const errorMessage = language === 'tr' 
        ? "Şikayetiniz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        : language === 'en'
        ? "An error occurred while sending your complaint. Please try again later."
        : "حدث خطأ أثناء إرسال شكواك. يرجى المحاولة مرة أخرى لاحقًا.";
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-2xl mx-auto animate-fade-in py-8">
        <div className="card-glass p-6 md:p-8">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Restaurant Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/google.svg" 
                alt="Google Logo" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/lovable-uploads/google-logo.png";
                }}
              />
            </div>
          </div>
          
          <h2 className="text-lg md:text-xl font-semibold text-center mb-8">
            {t('complaint.title')}
          </h2>
          
          {/* Rating Categories - Stars aligned to right */}
          <div className="space-y-6 mb-8">
            {[
              { name: t('complaint.food'), state: foodRating, setState: setFoodRating },
              { name: t('complaint.service'), state: serviceRating, setState: setServiceRating },
              { name: t('complaint.atmosphere'), state: atmosphereRating, setState: setAtmosphereRating }
            ].map((category) => (
              <div key={category.name} className="flex justify-between items-center">
                <label className="text-sm font-medium">{category.name}</label>
                <div className="flex flex-col items-end">
                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                        onMouseEnter={() => {
                          setHoveredCategory(category.name);
                          setHoveredStar(star);
                        }}
                        onMouseLeave={() => {
                          setHoveredCategory(null);
                          setHoveredStar(null);
                        }}
                        onClick={() => category.setState(star)}
                      >
                        <Star
                          size={24}
                          fill={(hoveredCategory === category.name && hoveredStar !== null ? star <= hoveredStar : star <= (category.state || 0)) ? "#FFD700" : "none"}
                          className={(hoveredCategory === category.name && hoveredStar !== null ? star <= hoveredStar : star <= (category.state || 0)) ? "text-yellow-500" : "text-gray-400"}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Input
                  placeholder={t('complaint.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Phone */}
              <div className="flex space-x-2">
                <div className="w-1/3">
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="+90" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span>{country.flag} {country.code}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={t('complaint.phone')}
                    value={phone}
                    onChange={(e) => {
                      // Sadece sayısal değerlere izin ver
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(value);
                    }}
                    disabled={isSubmitting}
                    type="tel"
                    inputMode="numeric"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <Input
                  type="email"
                  placeholder={t('complaint.email')}
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
              
              {/* Review */}
              <div>
                <Textarea
                  placeholder={t('complaint.review')}
                  className="min-h-[120px]"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Consent */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consentChecked} 
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  disabled={isSubmitting}
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground">
                  {t('complaint.consent')}
                </label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6" 
              disabled={isSubmitting}
              variant={isFormComplete ? "default" : "outline"}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('complaint.submitting')}
                </span>
              ) : t('complaint.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
