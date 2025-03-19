import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useCountdown from '@/hooks/useCountdown';
import { useNavigate } from 'react-router-dom';
import { waitlistService } from '@/lib/api';

const Index = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const targetDate = new Date('2025-06-01T00:00:00');
  const timeLeft = useCountdown(targetDate);
  const navigate = useNavigate();

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Lütfen e-posta adresinizi girin.', {
        duration: 3000,
        position: 'top-center',
        style: {
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      await waitlistService.addToWaitlist(email.trim());
      
      // Modern minimal tarzda açılıp kapanan toast bildirimi
      toast.success('Waitlist\'e başarıyla kaydoldunuz! Size en kısa sürede dönüş yapacağız.', {
        duration: 4000,
        position: 'top-center',
        style: {
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
      });
      
      // Form alanını temizle
      setEmail('');
    } catch (error: any) {
      console.error('Waitlist kayıt hatası:', error);
      toast.error(error || 'Waitlist\'e kaydolurken bir hata oluştu. Lütfen tekrar deneyin.', {
        duration: 4000,
        position: 'top-center',
        style: {
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-500">Mutfak Yazılım</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium border-none px-6 py-2"
            >
              Giriş Yap
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Restoranınızın Dijital Dönüşümü
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto">
              Müşteri deneyimini iyileştirin, geri bildirimleri analiz edin ve işletmenizi büyütün.
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-8 my-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500">{timeLeft.days}</div>
                <div className="text-sm text-zinc-400">Gün</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500">{timeLeft.hours}</div>
                <div className="text-sm text-zinc-400">Saat</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500">{timeLeft.minutes}</div>
                <div className="text-sm text-zinc-400">Dakika</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500">{timeLeft.seconds}</div>
                <div className="text-sm text-zinc-400">Saniye</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 w-full">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 text-zinc-100 placeholder:text-zinc-500 bg-zinc-800/50"
                  />
                  <Button type="submit" disabled={isLoading} className="text-zinc-100">
                    {isLoading ? 'Kaydoluyor...' : 'Waitlist\'e Katıl'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Platformumuz kullanıma açıldığında sizi bilgilendireceğiz.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Özelliklerimiz</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Sınırsız Entegrasyon Hakkı</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 2 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Olumsuz Geri Bildirim Koruması</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 3 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Tüm Yorumları Uygulamada Yönetme</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 4 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Website Entegrasyonu</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 5 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Yapay Zeka ile Yanıtlama</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 6 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">E-posta Yorum Davetleri</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 7 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">SMS Yorum Davetleri</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 8 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">WhatsApp Yorum Davetleri</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 9 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Sosyal Medya Paylaşımı</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 10 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Detaylı Analizler</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 11 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Platform Entegrasyonu</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 12 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Özelleştirilebilir Formlar</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 13 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Çoklu Dil Desteği</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 14 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Mobil Uyumlu Tasarım</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>

            {/* 15 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Logolu QR Kodlar</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>

            {/* 16 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Her Masaya Özel QR Kod</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>
            
            {/* 17 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">QR Kod ile Kolay Erişim</h4>
                <span className="text-xs text-green-400">Aktif</span>
              </div>
            </div>
            
            {/* 18 */}
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Pazaryerine Özel QR Kod</h4>
                <span className="text-xs text-yellow-400">Yakında</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-zinc-400 text-sm">
              © 2025 Mutfak Yazılım. Tüm hakları saklıdır.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy-policy" className="text-zinc-400 hover:text-white transition">
                Gizlilik Politikası
              </a>
              <a href="/terms-of-service" className="text-zinc-400 hover:text-white transition">
                Kullanım Koşulları
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;