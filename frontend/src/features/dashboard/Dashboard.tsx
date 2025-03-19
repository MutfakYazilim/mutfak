import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/features/auth/AuthContext';
import { restaurantService } from '@/lib/api';
import { toast } from 'sonner';

// Platform seçenekleri
const platformOptions = [
  { value: 'Google', label: 'Google', url: 'https://www.google.com/maps/place/' },
  { value: 'App Store', label: 'App Store', url: 'https://apps.apple.com/app/' },
  { value: 'Google Play', label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=' },
  { value: 'Tripadvisor', label: 'Tripadvisor', url: 'https://www.tripadvisor.com/Restaurant_Review-' }
];

// Feedback URL'si için temel URL
const FEEDBACK_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://mutfak-frontend.railway.app/user-feedback'  // Railway'deki frontend URL'i
  : `${window.location.origin}/user-feedback`;

const Dashboard = () => {
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState(180);
  const [links, setLinks] = useState([]);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [dashboardData, setDashboardData] = useState({
    total_feedbacks: 0,
    average_rating: 0,
    latest_feedback_date: null,
    rating_distribution: {},
    satisfaction_data: {},
    detailed_stats: {
      food: {},
      service: {},
      atmosphere: {}
    },
    rating_percentages: {
      food: {},
      service: {},
      atmosphere: {}
    },
    recent_comments: []
  });
  const [starClickStats, setStarClickStats] = useState({
    total_clicks: 0,
    stats: {},
    percentages: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Dashboard useEffect çalıştı, kullanıcı bilgisi:', user);
    if (user?.restaurant_id) {
      console.log('Restaurant ID bulundu:', user.restaurant_id);
      // Local ortam için feedback URL'si oluştur
      const feedbackUrl = `${FEEDBACK_BASE_URL}?restaurant=${user.restaurant_id}`;
      setQrValue(feedbackUrl);
      fetchDashboardData();
      fetchPlatformLinks();
      fetchStarClickStats();
    } else {
      console.warn('Restaurant ID bulunamadı! Kullanıcı bilgisi:', user);
      toast.error('Restaurant bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Dashboard verilerini çekmeye başlıyorum...');
      const data = await restaurantService.getDashboard();
      console.log('Dashboard verileri başarıyla çekildi:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard verileri çekilirken hata oluştu:', error);
      toast.error('Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlatformLinks = async () => {
    try {
      console.log('Platform linklerini çekmeye başlıyorum...');
      const data = await restaurantService.getPlatforms();
      console.log('Platform linkleri başarıyla çekildi:', data);
      setLinks(data);
    } catch (error) {
      console.error('Platform linkleri çekilirken hata oluştu:', error);
      toast.error('Platform linkleri yüklenirken bir hata oluştu.');
    }
  };

  const fetchStarClickStats = async () => {
    try {
      if (!user?.restaurant_id) {
        console.log('Restaurant ID bulunamadı, yıldız istatistikleri çekilemiyor.');
        return;
      }
      console.log(`Restaurant ID ${user.restaurant_id} için yıldız istatistiklerini çekmeye başlıyorum...`);
      console.log(`API endpoint: /restaurants/${user.restaurant_id}/star-clicks`);
      
      const data = await restaurantService.getStarClickStats(user.restaurant_id);
      console.log('Yıldız istatistikleri başarıyla çekildi:', JSON.stringify(data, null, 2));
      
      // API'den gelen verileri doğru şekilde işle
      const processedData = {
        total_clicks: Number(data.total_clicks || 0),
        stats: {},
        percentages: {}
      };
      
      // Tüm stats değerleri 0 ise ve percentages değerleri varsa, stats değerlerini hesapla
      const allStatsZero = !data.stats || Object.values(data.stats).every(value => Number(value) === 0);
      const hasPercentages = data.percentages && Object.values(data.percentages).some(value => Number(value) > 0);
      
      console.log('Tüm stats değerleri 0 mu?', allStatsZero);
      console.log('Percentages değerleri var mı?', hasPercentages);
      
      if (allStatsZero && hasPercentages && data.total_clicks > 0) {
        console.log('Stats değerleri 0, percentages değerlerinden hesaplanıyor...');
        
        // stats ve percentages verilerini işle
        for (let i = 1; i <= 5; i++) {
          // Percentages değerlerinden stats değerlerini hesapla
          if (data.percentages && (i in data.percentages)) {
            const percentage = Number(data.percentages[i] || 0);
            // Yüzdeyi kullanarak tıklama sayısını hesapla
            const calculatedClicks = Math.round((percentage / 100) * data.total_clicks);
            processedData.stats[i] = calculatedClicks;
            processedData.percentages[i] = percentage;
            
            console.log(`stats[${i}] = ${calculatedClicks} (hesaplanan)`);
            console.log(`percentages[${i}] = ${percentage}`);
          } else {
            processedData.stats[i] = 0;
            processedData.percentages[i] = 0;
            
            console.log(`stats[${i}] = 0 (varsayılan)`);
            console.log(`percentages[${i}] = 0 (varsayılan)`);
          }
        }
      } else {
        // Normal işleme devam et
        for (let i = 1; i <= 5; i++) {
          // stats verilerini işle
          if (data.stats && (i in data.stats)) {
            processedData.stats[i] = Number(data.stats[i] || 0);
            console.log(`stats[${i}] = ${processedData.stats[i]}`);
          } else {
            processedData.stats[i] = 0;
            console.log(`stats[${i}] = 0 (varsayılan)`);
          }
          
          // percentages verilerini işle
          if (data.percentages && (i in data.percentages)) {
            processedData.percentages[i] = Number(data.percentages[i] || 0);
            console.log(`percentages[${i}] = ${processedData.percentages[i]}`);
          } else {
            processedData.percentages[i] = 0;
            console.log(`percentages[${i}] = 0 (varsayılan)`);
          }
        }
      }
      
      console.log('İşlenmiş yıldız istatistikleri:', JSON.stringify(processedData, null, 2));
      
      // Olumlu ve iyileştirme gereken tıklama sayılarını hesapla
      const positiveClicks = Number(processedData.stats[4] || 0) + Number(processedData.stats[5] || 0);
      const improvementClicks = Number(processedData.stats[1] || 0) + Number(processedData.stats[2] || 0) + Number(processedData.stats[3] || 0);
      
      console.log('Olumlu geri bildirim (4-5 yıldız):', positiveClicks);
      console.log('İyileştirme gereken (1-3 yıldız):', improvementClicks);
      
      setStarClickStats(processedData);
    } catch (error) {
      console.error('Yıldız istatistikleri çekilirken hata oluştu:', error);
      console.error('Hata detayları:', error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'Sunucudan yanıt alınamadı');
      
      // Hata durumunda varsayılan veri kullan
      setStarClickStats({
        total_clicks: 0,
        stats: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        percentages: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      });
    }
  };

  const addLink = async () => {
    if (!newLinkName || !newLinkUrl || !user?.restaurant_id) {
      toast.error('Lütfen platform seçiniz.');
      return;
    }

    try {
      setIsAddingLink(true);
      const newLink = await restaurantService.createPlatform({
        name: newLinkName,
        url: newLinkUrl,
        restaurant_id: user.restaurant_id
      });
      
      setLinks([...links, newLink]);
      setNewLinkName('');
      setNewLinkUrl('');
      toast.success('Platform linki başarıyla eklendi.');
    } catch (error) {
      toast.error('Platform linki eklenirken bir hata oluştu.');
    } finally {
      setIsAddingLink(false);
    }
  };

  const removeLink = async (id) => {
    try {
      await restaurantService.deletePlatform(id);
      setLinks(links.filter(link => link.id !== id));
      toast.success('Platform linki başarıyla silindi.');
    } catch (error) {
      toast.error('Platform linki silinirken bir hata oluştu.');
    }
  };

  const generateQRCode = async () => {
    if (!user?.restaurant_id) return;
    
    try {
      setIsGeneratingQR(true);
      // Local ortam için feedback URL'si oluştur
      const feedbackUrl = `${FEEDBACK_BASE_URL}?restaurant=${user.restaurant_id}`;
      setQrValue(feedbackUrl);
      await restaurantService.generateQRCode(user.restaurant_id);
      toast.success('QR kod başarıyla oluşturuldu.');
    } catch (error) {
      toast.error('QR kod oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handlePlatformChange = (value: string) => {
    const platform = platformOptions.find(p => p.value === value);
    if (platform) {
      setNewLinkName(platform.value);
      setNewLinkUrl(platform.url);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 w-full animate-fade-in">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
            <p className="text-muted-foreground">Hoş geldiniz, {user?.email || 'Admin'}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-glass p-6 hover-scale">
            <h3 className="text-xl font-medium mb-2">Toplam Yorum</h3>
            <p className="text-4xl font-bold">{dashboardData.total_feedbacks}</p>
            <p className="text-muted-foreground text-sm mt-2">Son 30 gün: +{dashboardData.recent_comments?.length || 0}</p>
          </div>

          <div className="card-glass p-6 hover-scale">
            <h3 className="text-xl font-medium mb-2">Ortalama Puan</h3>
            <p className="text-4xl font-bold">{dashboardData.average_rating ? dashboardData.average_rating.toFixed(1) : '0.0'}</p>
            <p className="text-muted-foreground text-sm mt-2">5 üzerinden</p>
          </div>

          <div className="card-glass p-6 hover-scale">
            <h3 className="text-xl font-medium mb-2">Son Yorum</h3>
            <p className="text-4xl font-bold">{dashboardData.latest_feedback_date ? new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dashboardData.latest_feedback_date)) : 'Henüz yorum yok'}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {dashboardData.latest_feedback_date ? `${Math.ceil(Math.abs(new Date().getTime() - new Date(dashboardData.latest_feedback_date).getTime()) / (1000 * 60 * 60 * 24))} gün önce` : ''}
            </p>
          </div>
        </div>

        {/* Star Click Statistics */}
        <div className="card-glass p-6">
          <h2 className="text-2xl font-bold mb-4">Yıldız Tıklama İstatistikleri</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Toplam Tıklanma: {starClickStats.total_clicks}
            </p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const starCount = Number(starClickStats.stats[star] || 0);
                const starPercent = Number(starClickStats.percentages[star] || 0);
                
                return (
                  <div key={`star-click-${star}`} className="flex items-center gap-2">
                    <span className="w-16">{star} Yıldız:</span>
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${starPercent}%`
                        }}
                      />
                    </div>
                    <span className="w-24 text-right text-sm">
                      {starCount} tıklama
                      ({starPercent.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">Olumlu Geri Bildirim</h3>
                <p className="text-2xl font-bold text-green-600">
                  {(Number(starClickStats.stats[4] || 0) + Number(starClickStats.stats[5] || 0))} tıklama
                </p>
                <p className="text-sm text-green-700">4-5 Yıldız</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="font-medium text-red-800">İyileştirme Gereken</h3>
                <p className="text-2xl font-bold text-red-600">
                  {(Number(starClickStats.stats[1] || 0) + Number(starClickStats.stats[2] || 0) + Number(starClickStats.stats[3] || 0))} tıklama
                </p>
                <p className="text-sm text-red-700">1-3 Yıldız</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Platform Links */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold mb-4">Platform Linkleri</h2>
            <div className="space-y-4">
              {links.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Henüz platform linki eklenmemiş.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-2 bg-card rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="font-medium">{link.name}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                            {link.url}
                          </a>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeLink(link.id)}>
                        <span className="sr-only">Sil</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Select onValueChange={handlePlatformChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Platform seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="URL"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addLink} disabled={isAddingLink || !newLinkName}>
                  Ekle
                </Button>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold mb-4">QR Kod</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div ref={qrCodeRef} className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG value={qrValue} size={qrSize} />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Bu QR kodu müşterilerinizin geri bildirim formuna ulaşması için kullanabilirsiniz.
                </p>
                <p className="mt-2 text-center text-sm font-medium">
                  Yönlendirilen Adres: {qrValue}
                </p>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="qr-size">QR Kod Boyutu</Label>
                  <Input
                    id="qr-size"
                    type="number"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    min={100}
                    max={500}
                    step={10}
                  />
                </div>
                <Button onClick={generateQRCode} disabled={isGeneratingQR} className="w-full">
                  QR Kod Oluştur
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="w-full">
                  QR Kodu Yazdır
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
