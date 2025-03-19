import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthContext';

// API için temel URL'i güncelliyorum
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mutfak-backend.railway.app'  // Railway'deki backend URL'i
  : 'http://localhost:8000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          navigate('/admin/restaurants');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    
    setIsLoading(true);
    console.log('Giriş işlemi başlatılıyor...');

    // Admin e-posta kontrolü
    const isAdmin = email.trim().toLowerCase() === 'admin@mutfakyazilim.com';
    
    console.log(`Kullanıcı tipi: ${isAdmin ? 'Admin' : 'Restaurant'}`);

    // Kullanıcı tipine göre uygun login fonksiyonunu çağır
    if (isAdmin) {
      await tryAdminLogin();
    } else {
      await tryRestaurantLogin();
    }
  };

  const tryAdminLogin = async () => {
    try {
      // Admin için /admin/login endpoint'i
      const endpoint = '/api/admin/login';
      console.log(`Seçilen endpoint: ${endpoint}`);
      
      // JSON formatında gönderiyoruz
      const requestBody = JSON.stringify({
        email: email,
        password: password
      });
      
      console.log('Gönderilen veri:', {
        email: email,
        password: '******'
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody
      });

      console.log(`Yanıt durumu: ${response.status}`);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Yanıt detayları:', responseData);
      } catch (error) {
        console.error('JSON parse hatası:', error);
        responseData = { detail: 'Sunucu yanıtı işlenemedi' };
      }

      if (response.ok && (responseData.access_token || responseData.token)) {
        const token = responseData.access_token || responseData.token;
        handleSuccessfulLogin(token, 'admin', responseData);
        return true;
      }
      
      // Eğer admin login başarısız olursa, /token endpoint'ini deneyelim
      console.log('Admin login başarısız oldu, /token endpoint\'ini deniyorum...');
      return await tryTokenLogin('admin');
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      toast.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      setIsLoading(false);
      return false;
    }
  };

  const tryRestaurantLogin = async () => {
    try {
      // Restaurant için /restaurant/login endpoint'ini kullanıyoruz (API listesine göre)
      const endpoint = '/api/restaurant/login';
      console.log(`Seçilen endpoint: ${endpoint}`);
      
      // JSON formatında gönderiyoruz
      const requestBody = JSON.stringify({
        email: email,
        password: password
      });
      
      console.log('Gönderilen veri:', {
        email: email,
        password: '******'
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody
      });

      console.log(`Yanıt durumu: ${response.status}`);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Yanıt detayları:', responseData);
      } catch (error) {
        console.error('JSON parse hatası:', error);
        responseData = { detail: 'Sunucu yanıtı işlenemedi' };
      }

      if (response.ok && (responseData.access_token || responseData.token)) {
        const token = responseData.access_token || responseData.token;
        handleSuccessfulLogin(token, 'restaurant', responseData);
        return true;
      }
      
      // Hata mesajlarını işle
      handleLoginError(response.status, responseData);
      return false;
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      toast.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      setIsLoading(false);
      return false;
    }
  };

  // Ortak token login fonksiyonu
  const tryTokenLogin = async (role: 'admin' | 'restaurant') => {
    try {
      const endpoint = '/api/token';
      console.log(`Seçilen endpoint: ${endpoint}`);
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      // Debug amaçlı gönderilecek veriyi logla (şifre hariç)
      console.log('Gönderilen veri:', {
        email: email,
        password: "******"
      });
      
      // API isteği gönder
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log(`Yanıt durumu: ${response.status}`);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Yanıt detayları:', responseData);
      } catch (error) {
        console.error('JSON parse hatası:', error);
        responseData = { detail: 'Sunucu yanıtı işlenemedi' };
      }

      if (response.ok && (responseData.access_token || responseData.token)) {
        const token = responseData.access_token || responseData.token;
        
        // Token alındıktan sonra kullanıcı bilgilerini almak için ek bir istek yapalım
        try {
          console.log(`${role === 'admin' ? 'Admin' : 'Restaurant'} bilgilerini alıyorum...`);
          const userEndpoint = role === 'admin' ? '/api/admin/me' : '/api/restaurant/me';
          const userResponse = await fetch(`${API_BASE_URL}${userEndpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(`${role === 'admin' ? 'Admin' : 'Restaurant'} bilgileri:`, userData);
            
            // Hem token hem de kullanıcı bilgilerini içeren bir yanıt oluşturalım
            const combinedData = {
              ...responseData,
              ...userData,
              restaurant_id: role === 'restaurant' ? (userData.id || userData.restaurant_id) : undefined
            };
            
            handleSuccessfulLogin(token, role, combinedData);
          } else {
            // Eğer kullanıcı bilgilerini alamazsak, sadece token ile devam edelim
            handleSuccessfulLogin(token, role, responseData);
          }
        } catch (error) {
          console.error(`${role === 'admin' ? 'Admin' : 'Restaurant'} bilgileri alınırken hata oluştu:`, error);
          // Hata durumunda sadece token ile devam edelim
          handleSuccessfulLogin(token, role, responseData);
        }
        
        return true;
      }
      
      // Hata mesajlarını işle
      handleLoginError(response.status, responseData);
      return false;
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      toast.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      setIsLoading(false);
      return false;
    }
  };

  const handleSuccessfulLogin = (token: string, role: string, responseData: any) => {
    // Token'ı kaydet
    localStorage.setItem('token', token);
    
    // Kullanıcı bilgilerini kaydet
    const userInfo: any = {
      email: email,
      role: role
    };

    // Eğer yanıtta restaurant_id varsa, onu da kaydet
    if (role === 'restaurant') {
      // API yanıtından restaurant_id'yi al
      if (responseData && responseData.restaurant_id) {
        userInfo.restaurant_id = responseData.restaurant_id;
      } else if (responseData && responseData.id) {
        userInfo.restaurant_id = responseData.id;
      } else {
        // Varsayılan olarak 1 kullanabiliriz
        userInfo.restaurant_id = 1;
        console.warn('Restaurant ID bulunamadı, varsayılan değer kullanılıyor:', userInfo.restaurant_id);
      }
      console.log('Restaurant ID kaydedildi:', userInfo.restaurant_id);
    }
    
    localStorage.setItem('user', JSON.stringify(userInfo));
    console.log('Kaydedilen kullanıcı bilgisi:', userInfo);
    
    toast.success(`${role === 'admin' ? 'Admin' : 'Restaurant'} olarak giriş başarılı!`);
    
    // Sayfayı yenile - bu AuthContext'in useEffect'ini tetikleyecek
    window.location.href = role === 'admin' ? '/admin/restaurants' : '/dashboard';
  };

  const handleLoginError = (status: number, responseData: any) => {
    let errorMessage = 'Giriş başarısız';
    if (status === 401) {
      errorMessage = 'E-posta veya şifre hatalı';
    } else if (status === 422) {
      errorMessage = 'Geçersiz giriş bilgileri. Lütfen tüm alanları doğru formatta doldurun.';
      if (responseData.detail) {
        if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map((err: any) => err.msg || err.message).join(', ');
        } else {
          errorMessage = responseData.detail;
        }
      }
    } else if (status === 404) {
      errorMessage = 'Giriş servisi bulunamadı. Lütfen sistem yöneticinizle iletişime geçin.';
    } else if (status === 405) {
      errorMessage = 'Bu işlem için yetkiniz yok.';
    } else if (responseData.detail) {
      errorMessage = responseData.detail;
    }
    
    toast.error(errorMessage);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/7e091370-903c-471f-ab91-fe019f038545.png" 
            alt="Mutfak Yazılım Logo" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold">Mutfak Yazılım</h2>
          <p className="mt-2 text-muted-foreground">Giriş yaparak devam edin</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="text-sm">Beni Hatırla</Label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Giriş yaparak{' '}
            <a href="/terms-of-service" className="text-primary hover:underline">
              Kullanım Koşullarını
            </a>
            {' '}ve{' '}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Gizlilik Politikasını
            </a>
            {' '}kabul etmiş olursunuz.
          </p>
          <p className="mt-2">
            Bu platform, Mutfak Yazılım tarafından geliştirilmiş olup, tüm hakları saklıdır.
            Platform üzerindeki veriler, KVKK ve GDPR standartlarına uygun olarak işlenmektedir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 