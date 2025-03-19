import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthContext';
import { restaurantService, adminService } from '@/lib/api';
import { LogOut, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // E-posta bildirim ayarları
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyOnLowRating, setNotifyOnLowRating] = useState(true);
  const [notifyOnNewFeedback, setNotifyOnNewFeedback] = useState(true);
  const [isLoadingEmailSettings, setIsLoadingEmailSettings] = useState(false);
  
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchEmailAlerts();
    }
  }, [user]);
  
  const fetchEmailAlerts = async () => {
    try {
      setIsLoadingEmailSettings(true);
      const alerts = await adminService.getEmailAlerts();
      if (alerts && alerts.length > 0) {
        const alert = alerts[0];
        setNotifyEmail(alert.email);
        setNotifyOnLowRating(alert.notify_on_low_rating);
        setNotifyOnNewFeedback(alert.notify_on_new_feedback);
      }
    } catch (error) {
      console.error('Error fetching email alerts:', error);
      toast.error('E-posta bildirim ayarları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingEmailSettings(false);
    }
  };

  const handleSaveEmailAlerts = async () => {
    // Validate email
    if (!notifyEmail || !notifyEmail.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    
    try {
      setIsLoadingEmailSettings(true);
      await adminService.createEmailAlert({
        email: notifyEmail,
        notify_on_low_rating: notifyOnLowRating,
        notify_on_new_feedback: notifyOnNewFeedback
      });
      
      toast.success('E-posta bildirim ayarları başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating email alerts:', error);
      toast.error('E-posta bildirim ayarları güncellenirken bir hata oluştu.');
    } finally {
      setIsLoadingEmailSettings(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <Button 
            variant="destructive" 
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Çıkış Yap
          </Button>
        </div>

        <div className="card-glass p-6">
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Hesap</TabsTrigger>
              <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Hesap Bilgileri</h2>
                <Separator className="mb-4" />
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      E-posta Adresi
                    </label>
                    <Input 
                      id="email" 
                      value={email} 
                      disabled={true}
                    />
                    <p className="text-sm text-muted-foreground">
                      E-posta adresinizi değiştirmek için lütfen sistem yöneticisiyle iletişime geçin.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Rol
                    </label>
                    <Input 
                      id="role" 
                      value={user?.role === 'admin' ? 'Yönetici' : 'Restoran Sahibi'} 
                      disabled 
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-yellow-800">Şifre Değiştirme Geçici Olarak Devre Dışı</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Şifre değiştirme özelliği şu anda bakım nedeniyle geçici olarak devre dışı bırakılmıştır. 
                      Şifrenizi sıfırlamanız gerekiyorsa, lütfen sistem yöneticisiyle iletişime geçin.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Bildirim Ayarları</h2>
                <Separator className="mb-4" />
                
                <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-md mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-blue-800">Amazon SES Entegrasyonu</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Bildirim ayarları şu anda Amazon SES ile entegrasyon sürecindedir. Bu süreç tamamlanana kadar bildirim ayarları geçici olarak devre dışı bırakılmıştır.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-posta Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Yeni yorumlar hakkında e-posta bildirimleri alın</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notifyOnNewFeedback}
                      onCheckedChange={setNotifyOnNewFeedback}
                      disabled={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Düşük Puan Uyarıları</p>
                      <p className="text-sm text-muted-foreground">3 yıldız ve altı puanlar için anında bildirim alın</p>
                    </div>
                    <Switch 
                      id="low-rating-alerts" 
                      checked={notifyOnLowRating}
                      onCheckedChange={setNotifyOnLowRating}
                      disabled={true}
                    />
                  </div>
                  
                  {user?.role === 'admin' && (
                    <div className="space-y-2 mt-4">
                      <label htmlFor="notify-email" className="text-sm font-medium">
                        Bildirim E-posta Adresi
                      </label>
                      <Input 
                        id="notify-email" 
                        type="email"
                        value={notifyEmail} 
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="Bildirim e-posta adresi"
                        disabled={true}
                      />
                      <p className="text-sm text-muted-foreground">
                        Bu e-posta adresi Amazon SES ile doğrulanmış olmalıdır. Doğrulanmamış e-posta adreslerine bildirim gönderilemez.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveEmailAlerts}
                  disabled={true}
                >
                  Kaydet
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Settings;
