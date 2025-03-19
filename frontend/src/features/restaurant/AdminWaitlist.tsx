import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Sidebar bileşenini kaldırıyorum çünkü AppLayout içinde zaten var
// import { Sidebar } from '@/layouts/sidebar';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { waitlistService } from '@/lib/api';

interface WaitlistEntry {
  id: number;
  email: string;
  created_at: string;
}

const AdminWaitlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchWaitlist();
  }, [user, navigate]);

  const fetchWaitlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await waitlistService.getWaitlist();
      
      // Gelen veriyi kontrol et
      if (!Array.isArray(data)) {
        console.error('Beklenmeyen veri formatı:', data);
        setWaitlist([]);
        throw new Error('Beklenmeyen veri formatı');
      }

      setWaitlist(data);
      
      // Başarılı veri yükleme bildirimi
      toast.success('Waitlist kayıtları başarıyla yüklendi.', {
        duration: 3000,
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
    } catch (error: any) {
      console.error('Waitlist verisi alınamadı:', error);
      setError(typeof error === 'string' ? error : error.message || 'Waitlist verisi alınamadı');
      
      // Hata bildirimini görünür hale getir
      toast.error(typeof error === 'string' ? error : error.message || 'Waitlist verisi alınamadı', {
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

  const handleRefresh = () => {
    fetchWaitlist();
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Waitlist Kayıtları</h1>
          <Button onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Yükleniyor...' : 'Yenile'}
          </Button>
        </div>
        
        <div className="card-glass p-6">
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : waitlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz waitlist kaydı bulunmuyor.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlist.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{formatDate(entry.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminWaitlist; 