import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useAuth } from '@/features/auth/AuthContext';
import { restaurantService } from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['#4f46e5', '#8b5cf6', '#c084fc', '#f472b6', '#fb7185'];
const SATISFACTION_COLORS = ['#22c55e', '#eab308', '#ef4444'];

// Type for recent comments
interface RecentComment {
  id: number;
  name: string;
  email: string;
  average_rating: number;
  comment: string;
  created_at: string;
}

interface AnalyticsData {
  total_feedbacks: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
  satisfaction_data: Record<string, number>;
  recent_comments: RecentComment[];
}

// Varsayılan analiz verileri
const DEFAULT_ANALYTICS_DATA: AnalyticsData = {
  total_feedbacks: 0,
  average_rating: 0,
  rating_distribution: {
    "1 Yıldız": 0,
    "2 Yıldız": 0,
    "3 Yıldız": 0,
    "4 Yıldız": 0,
    "5 Yıldız": 0
  },
  satisfaction_data: {
    "Memnun (4-5)": 0,
    "Orta (3)": 0,
    "Memnun Değil (1-2)": 0
  },
  recent_comments: []
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  className?: string;
}

// Summary card component
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, description, className }) => (
  <div className={`card-glass p-6 hover-scale ${className}`}>
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-muted-foreground text-sm mt-2">{description}</p>
  </div>
);

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border p-2 rounded-md shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{`Yorum Sayısı: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Rating stars component
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <svg 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

const AnalyticsCard = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(DEFAULT_ANALYTICS_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.restaurant_id) {
      fetchAnalyticsData(user.restaurant_id);
    } else {
      // Kullanıcı bilgisi yoksa yüklemeyi durdur
      setIsLoading(false);
    }
  }, [user]);

  const fetchAnalyticsData = async (restaurantId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await restaurantService.getRestaurantAnalytics(restaurantId);
      
      // Veri kontrolü ve varsayılan değerlerle birleştirme
      const processedData = {
        ...DEFAULT_ANALYTICS_DATA,
        ...data,
        rating_distribution: {
          ...DEFAULT_ANALYTICS_DATA.rating_distribution,
          ...(data.rating_distribution || {})
        },
        satisfaction_data: {
          ...DEFAULT_ANALYTICS_DATA.satisfaction_data,
          ...(data.satisfaction_data || {})
        },
        recent_comments: data.recent_comments || []
      };
      
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Analiz verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      // Hata durumunda varsayılan verileri kullan
      setAnalyticsData(DEFAULT_ANALYTICS_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert rating distribution to chart format
  const ratingDistributionData = Object.entries(analyticsData.rating_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  // Convert satisfaction data to chart format
  const satisfactionData = Object.entries(analyticsData.satisfaction_data || {}).map(([name, value]) => ({
    name,
    value
  }));

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  // Helper function to safely calculate percentages
  const calculatePercentage = (value: number, total: number) => {
    if (!total || isNaN(total) || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Helper function to safely get values from satisfaction data
  const getSatisfactionValue = (key: string) => {
    return analyticsData.satisfaction_data?.[key] || 0;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Analiz verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 card-glass p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <p>Şu anda veriler gösterilemiyor. Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  // Check if we have recent comments
  const hasRecentComments = analyticsData.recent_comments && analyticsData.recent_comments.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Toplam Yorum Sayısı" 
          value={analyticsData.total_feedbacks || 0} 
          description="Bugüne kadar alınan yorum sayısı" 
        />
        <SummaryCard 
          title="Düşük Puanlı Yorumlar (1-3)" 
          value={getSatisfactionValue("Memnun Değil (1-2)") + getSatisfactionValue("Orta (3)")} 
          description={`Toplam yorumların %${calculatePercentage(
            getSatisfactionValue("Memnun Değil (1-2)") + getSatisfactionValue("Orta (3)"), 
            analyticsData.total_feedbacks
          )}'i`} 
          className="border-l-4 border-l-amber-500"
        />
        <SummaryCard 
          title="Yüksek Puanlı Yorumlar (4-5)" 
          value={getSatisfactionValue("Memnun (4-5)")} 
          description={`Toplam yorumların %${calculatePercentage(
            getSatisfactionValue("Memnun (4-5)"), 
            analyticsData.total_feedbacks
          )}'i`} 
          className="border-l-4 border-l-green-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card-glass p-6">
          <h2 className="text-xl font-bold mb-4">Puan Dağılımı</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Yorum Sayısı">
                  {ratingDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card-glass p-6">
          <h2 className="text-xl font-bold mb-4">Memnuniyet Oranı</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index % SATISFACTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Comments */}
      <div className="card-glass p-6">
        <h2 className="text-xl font-bold mb-4">Son 5 Yorum</h2>
        <div className="space-y-3">
          {hasRecentComments ? (
            analyticsData.recent_comments.slice(0, 5).map((comment) => (
              <div key={comment.id} className="p-4 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">{comment.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium">{comment.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <RatingStars rating={Math.round(comment.average_rating)} />
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {comment.comment && <p className="mt-3 text-sm">{comment.comment}</p>}
              </div>
            ))
          ) : (
            <div className="text-center py-4 bg-background rounded-lg border">
              <p className="text-muted-foreground">Henüz yorum bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
