import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useCountdown from '@/hooks/useCountdown';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const targetDate = new Date('2025-06-01T00:00:00');
  const timeLeft = useCountdown(targetDate);
  const navigate = useNavigate();

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // API çağrısı eklenecek
      toast.success('Waitlist\'e başarıyla eklendi!');
      setEmail('');
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-500">Mutfak Yazılım</h1>
            <div className="hidden md:flex space-x-6">
              <a href="#cozumler" className="text-zinc-400 hover:text-white transition">Çözümler</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/login')} className="text-white hover:text-white border-zinc-700 hover:bg-zinc-800">
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
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-400"
              />
              <Button onClick={handleWaitlistSubmit} disabled={isLoading} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                {isLoading ? 'Ekleniyor...' : 'Waitlist\'e Katıl'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Çözümler Section */}
      <section id="cozumler" className="py-20 bg-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Çözümlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-800/50 p-6 rounded-lg space-y-4 border border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Müşteri Geri Bildirimi</h3>
              <p className="text-zinc-400">QR kod ile anında müşteri geri bildirimi toplayın ve analiz edin.</p>
            </div>
            <div className="bg-zinc-800/50 p-6 rounded-lg space-y-4 border border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Detaylı Analizler</h3>
              <p className="text-zinc-400">Yemek, servis ve atmosfer değerlendirmelerini detaylı raporlarla inceleyin.</p>
            </div>
            <div className="bg-zinc-800/50 p-6 rounded-lg space-y-4 border border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Platform Entegrasyonu</h3>
              <p className="text-zinc-400">Google, TripAdvisor ve diğer platformlarla entegre çalışın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-zinc-400 text-sm">
              © 2024 Mutfak Yazılım. Tüm hakları saklıdır.
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

export default Landing; 