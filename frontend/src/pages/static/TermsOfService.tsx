import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const TermsOfService = () => {
  // Sayfa yüklendiğinde dark mode'u etkinleştir
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Sayfa kapandığında dark mode'u kaldır
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-[#0f172a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 dark:bg-[#0f172a]/80 backdrop-blur-sm border-b dark:border-gray-800">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold dark:text-white text-blue-500">Mutfak Yazılım</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="dark:text-gray-300 dark:hover:text-white">
              Ana Sayfa
            </Button>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Kullanım Koşulları</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">1. Kabul Edilen Şartlar</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Bu web sitesini veya hizmetlerimizi kullanarak, bu kullanım koşullarını kabul etmiş olursunuz. 
                Bu koşulları kabul etmiyorsanız, lütfen sitemizi ve hizmetlerimizi kullanmayınız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">2. Hizmet Kullanımı</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-3">
                Hizmetlerimizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground dark:text-gray-400 space-y-2">
                <li>Yasalara ve düzenlemelere uygun davranmak</li>
                <li>Başkalarının haklarına saygı göstermek</li>
                <li>Doğru ve güncel bilgiler sağlamak</li>
                <li>Hesap güvenliğinizi korumak</li>
                <li>Hizmetleri kötüye kullanmamak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">3. Hesap Oluşturma</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Bazı hizmetlerimizi kullanmak için hesap oluşturmanız gerekebilir. Hesap bilgilerinizin 
                gizliliğini korumak ve güncel tutmak sizin sorumluluğunuzdadır. Hesabınızla ilgili herhangi 
                bir yetkisiz kullanım durumunda bizi derhal bilgilendirmelisiniz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">4. Fikri Mülkiyet</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Web sitemiz ve hizmetlerimizle ilgili tüm fikri mülkiyet hakları bize aittir. Yazılı iznimiz 
                olmadan içeriklerimizi kopyalayamaz, değiştiremez veya dağıtamazsınız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">5. Sorumluluk Reddi</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Hizmetlerimizi "olduğu gibi" sunuyoruz. Yasaların izin verdiği ölçüde, hizmetlerimizin 
                kesintisiz veya hatasız olacağına dair herhangi bir garanti vermiyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">6. Değişiklikler</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Bu kullanım koşullarını zaman zaman güncelleyebiliriz. Değişiklikler web sitemizde 
                yayınlandığı tarihte yürürlüğe girer. Hizmetlerimizi kullanmaya devam ederek, güncellenmiş 
                koşulları kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">7. İletişim</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Bu kullanım koşullarıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz: 
                <span className="font-medium ml-1">contact@mutfakyazilim.com</span>
              </p>
            </section>
          </div>

          <div className="mt-12">
            <p className="text-sm text-muted-foreground dark:text-gray-400">Son güncelleme: 1 Temmuz 2024</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground dark:text-gray-400 text-sm">
              © 2024 Mutfak Yazılım. Tüm hakları saklıdır.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy-policy" className="text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition">
                Gizlilik Politikası
              </a>
              <a href="/terms-of-service" className="text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition">
                Kullanım Koşulları
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService; 