import React, { useState, useEffect } from 'react';
// Sidebar bileşenini kaldırıyorum çünkü AppLayout içinde zaten var
// import { Sidebar } from '@/layouts/sidebar';
import CommentTable from '@/features/feedback/CommentTable';
import { Toaster, toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthContext';
import { restaurantService } from '@/lib/api';

// Varsayılan dashboard verileri
const DEFAULT_DASHBOARD_DATA = {
  total_feedbacks: 0,
  average_rating: 0,
  latest_feedback_date: null,
  recent_comments: []
};

const Comments = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await restaurantService.getDashboard();
        
        // Veri kontrolü ve varsayılan değerlerle birleştirme
        const processedData = {
          ...DEFAULT_DASHBOARD_DATA,
          ...data
        };
        
        setDashboardData(processedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Yorum verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        toast.error('Yorum verileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.restaurant_id) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Yükleme durumu
  const renderLoading = () => (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="ml-4">Yorumlar yükleniyor...</p>
    </div>
  );

  // Hata durumu
  const renderError = () => (
    <div className="text-center py-8 card-glass p-6">
      <p className="text-red-500 mb-4">{error}</p>
      <p>Şu anda yorumlar gösterilemiyor. Lütfen daha sonra tekrar deneyin.</p>
    </div>
  );

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Gelen Yorumlar</h1>
        </div>

        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            {/* Yorumlar Tablosu */}
            <CommentTable />
          </>
        )}
      </div>
    </main>
  );
};

export default Comments;
