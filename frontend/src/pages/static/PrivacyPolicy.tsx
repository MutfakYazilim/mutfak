import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Gizlilik Politikası</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">1. Giriş</h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Mutfak Yazılım olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizin korunmasına önem veriyoruz. 
                Bu Gizlilik Politikası, hizmetlerimizi kullanırken toplanan, işlenen ve saklanan kişisel verilerinizle 
                ilgili uygulamalarımızı açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">2. Toplanan Bilgiler</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-3">
                Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground dark:text-gray-400 space-y-2">
                <li>Ad, soyad, e-posta adresi ve telefon numarası gibi iletişim bilgileri</li>
                <li>Restoran adı, adresi ve diğer işletme bilgileri</li>
                <li>Müşteri geri bildirimleri ve değerlendirmeleri</li>
                <li>Hizmetlerimizi kullanırken oluşturulan analiz ve raporlar</li>
                <li>Çerezler ve benzer teknolojiler aracılığıyla toplanan kullanım verileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Bilgilerin Kullanımı</h2>
              <p className="text-muted-foreground mb-3">
                Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Hizmetlerimizi sağlamak, yönetmek ve geliştirmek</li>
                <li>Müşteri desteği ve teknik destek sağlamak</li>
                <li>Kullanıcı deneyimini kişiselleştirmek</li>
                <li>Analiz ve istatistikler oluşturmak</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Bilgilerin Paylaşımı</h2>
              <p className="text-muted-foreground">
                Kişisel verilerinizi, açık rızanız olmadan üçüncü taraflarla paylaşmayız. Ancak, hizmet sağlayıcılarımız, 
                iş ortaklarımız ve yasal gereklilikleri yerine getirmek için gerekli olan durumlarda bilgilerinizi 
                paylaşabiliriz. Bu tür durumlarda, bilgilerinizin gizliliğini korumak için gerekli önlemleri alırız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Veri Güvenliği</h2>
              <p className="text-muted-foreground">
                Kişisel verilerinizin güvenliğini sağlamak için uygun teknik ve organizasyonel önlemler alıyoruz. 
                Verilerinizi yetkisiz erişime, değiştirilmeye, ifşa edilmeye veya imha edilmeye karşı korumak için 
                çeşitli güvenlik teknolojileri ve prosedürleri kullanıyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Haklarınız</h2>
              <p className="text-muted-foreground mb-3">
                Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Kişisel verilerinize erişim talep etme</li>
                <li>Kişisel verilerinizin düzeltilmesini veya silinmesini talep etme</li>
                <li>Kişisel verilerinizin işlenmesine itiraz etme</li>
                <li>Veri taşınabilirliği talep etme</li>
                <li>Daha önce verdiğiniz izni geri çekme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Çerezler</h2>
              <p className="text-muted-foreground">
                Web sitemizde ve hizmetlerimizde çerezler ve benzer teknolojiler kullanıyoruz. Çerezler, web sitemizi 
                kullanırken deneyiminizi geliştirmek, hizmetlerimizi özelleştirmek ve kullanım istatistiklerini toplamak 
                için kullanılan küçük metin dosyalarıdır. Tarayıcı ayarlarınızı değiştirerek çerezleri devre dışı 
                bırakabilirsiniz, ancak bu, web sitemizin ve hizmetlerimizin bazı özelliklerinin düzgün çalışmamasına 
                neden olabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Değişiklikler</h2>
              <p className="text-muted-foreground">
                Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Politikada yapılan önemli değişiklikler hakkında 
                sizi bilgilendireceğiz. Hizmetlerimizi kullanmaya devam ederek, güncellenmiş Gizlilik Politikası'nı kabul 
                etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. İletişim</h2>
              <p className="text-muted-foreground">
                Bu Gizlilik Politikası veya kişisel verilerinizin işlenmesiyle ilgili sorularınız veya endişeleriniz varsa, 
                lütfen bizimle iletişime geçin: <span className="font-medium">contact@mutfakyazilim.com</span>
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

export default PrivacyPolicy; 