import axios from 'axios';

// API için temel URL'i güncelliyorum
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mutfak-backend.railway.app'  // Railway'deki backend URL'i
  : 'http://localhost:8000';  // Docker container içinde port 8000'de çalışıyor

// Create axios instance with minimal configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false, // CORS için false yapıyoruz
  timeout: 15000, // 15 saniye
  // Yeniden deneme sayısı - yönlendirmeleri takip etmek için önemli
  maxRedirects: 5
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await api.post('/api/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        token: response.data.access_token,
        data: response.data
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  },
  adminLogin: async (email: string, password: string) => {
    try {
      // Önce /admin/login endpoint'ini deneyelim
      const response = await api.post('/api/admin/login', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      // Eğer başarısız olursa, /token endpoint'ini deneyelim
      console.log('Admin login başarısız oldu, /token endpoint\'ini deniyorum...');
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
  
        const tokenResponse = await api.post('/api/token', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        return { 
          success: true, 
          token: tokenResponse.data.access_token,
          data: tokenResponse.data
        };
      } catch (tokenError) {
        console.error('Token login error:', tokenError);
        return { success: false, error: tokenError };
      }
    }
  },
  restaurantLogin: async (email: string, password: string) => {
    // API listesine göre /restaurant/login endpoint'ini kullanıyoruz
    const response = await api.post('/api/restaurant/login', { 
      email, 
      password 
    });
    
    return response.data;
  },
  getUserInfo: async (role: 'admin' | 'restaurant') => {
    const endpoint = role === 'admin' ? '/api/admin/me' : '/api/restaurant/me';
    const response = await api.get(endpoint);
    return response.data;
  }
};

// Admin services
export const adminService = {
  getRestaurants: async () => {
    try {
      console.log('Fetching restaurants from:', `${API_BASE_URL}/api/admin/restaurants`);
      const response = await api.get('/api/admin/restaurants');
      console.log('Restaurants response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getRestaurants:', error);
      throw error;
    }
  },
  getRestaurant: async (id: number) => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Geçersiz restoran ID\'si');
      }
      console.log('Fetching restaurant:', id);
      const response = await api.get(`/api/admin/restaurants/${id}`);
      console.log('Restaurant response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurant ${id}:`, error);
      throw error;
    }
  },
  createRestaurant: async (data: any) => {
    try {
      // Veri doğrulama
      if (!data.name || !data.owner_email || !data.owner_password || !data.subdomain) {
        throw new Error('Tüm alanlar zorunludur');
      }

      // Backend'in beklediği veri yapısı
      const requestData = {
        name: data.name.trim(),
        subdomain: data.subdomain.trim().toLowerCase(),
        owner_email: data.owner_email.trim().toLowerCase(),
        owner_password: data.owner_password,
        is_active: true
      };

      console.log('API isteği gönderiliyor:', {
        url: `${API_BASE_URL}/api/admin/restaurants`,
        data: {
          ...requestData,
          owner_password: '***'
        }
      });

      const response = await api.post('/api/admin/restaurants', requestData);
      
      console.log('API yanıtı:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      console.error('Restoran oluşturma hatası:', error);
      console.error('Hata detayları:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          throw new Error(detail);
        } else if (Array.isArray(detail)) {
          throw new Error(detail.map((err: any) => err.msg || err.message).join(', '));
        }
      }
      throw error;
    }
  },
  updateRestaurant: async (id: number, data: any) => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Geçersiz restoran ID\'si');
      }
      console.log('Updating restaurant:', id, 'with data:', data);
      const response = await api.patch(`/api/admin/restaurants/${id}`, data);
      console.log('Update restaurant response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating restaurant ${id}:`, error);
      throw error;
    }
  },
  deleteRestaurant: async (id: number) => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Geçersiz restoran ID\'si');
      }
      console.log('Deleting restaurant:', id);
      const response = await api.delete(`/api/admin/restaurants/${id}`);
      console.log('Delete restaurant response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting restaurant ${id}:`, error);
      throw error;
    }
  },
  // QR Kod Yönetimi
  createQRCode: async (data: { restaurant_id: number, size?: number }) => {
    const response = await api.post('/api/admin/qrcode', data);
    return response.data;
  },
  getQRCodes: async () => {
    const response = await api.get('/api/admin/qrcode');
    return response.data;
  },
  // E-posta Bildirim Yönetimi
  createEmailAlert: async (data: { email: string, restaurant_id?: number, notify_on_low_rating?: boolean, notify_on_new_feedback?: boolean }) => {
    const response = await api.post('/api/admin/email-alerts', data);
    return response.data;
  },
  getEmailAlerts: async () => {
    const response = await api.get('/api/admin/email-alerts');
    return response.data;
  }
};

// Restaurant services
export const restaurantService = {
  getDashboard: async () => {
    try {
      console.log('Fetching dashboard data from:', `${API_BASE_URL}/api/restaurant/dashboard`);
      
      const response = await api.get('/api/restaurant/dashboard');
      
      console.log('Dashboard response status:', response.status);
      console.log('Dashboard response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response from server');
      
      throw error; // Hatayı fırlat, fake veri döndürme
    }
  },
  updateSettings: async (data: any) => {
    const response = await api.patch('/api/restaurant/settings', data);
    return response.data;
  },
  getPlatforms: async () => {
    const response = await api.get('/api/restaurant/platforms');
    return response.data;
  },
  createPlatform: async (data: any) => {
    const response = await api.post('/api/restaurant/platforms', data);
    return response.data;
  },
  updatePlatform: async (platformId: number, data: any) => {
    const response = await api.patch(`/api/restaurant/platforms/${platformId}`, data);
    return response.data;
  },
  deletePlatform: async (platformId: number) => {
    const response = await api.delete(`/api/restaurant/platforms/${platformId}`);
    return response.data;
  },
  generateQRCode: async (restaurantId: number) => {
    try {
      const response = await api.post('/api/restaurant/qrcode', { restaurant_id: restaurantId });
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },
  getFeedbacks: async () => {
    try {
      console.log('Fetching feedbacks...');
      
      // Feedbacks ve complaints isteklerini Promise.all ile paralel olarak çalıştıralım
      const [feedbacksResponse, complaintsResponse] = await Promise.allSettled([
        api.get('/api/restaurant/feedbacks'),
        api.get('/api/restaurant/complaints')
      ]);
      
      // Her bir yanıtı kontrol edelim ve hata durumunda boş dizi kullanalım
      const feedbacks = feedbacksResponse.status === 'fulfilled' ? feedbacksResponse.value.data : [];
      const complaints = complaintsResponse.status === 'fulfilled' ? complaintsResponse.value.data : [];
      
      console.log('Feedbacks response:', feedbacks);
      console.log('Complaints response:', complaints);
      
      // Her iki veri setini birleştir ve is_complaint alanını ekle
      const allFeedbacks = [
        ...(Array.isArray(feedbacks) ? feedbacks.map(feedback => ({ ...feedback, is_complaint: false })) : []),
        ...(Array.isArray(complaints) ? complaints.map(complaint => ({ ...complaint, is_complaint: true })) : [])
      ];
      
      // Tarihe göre sırala (en yeniden en eskiye)
      allFeedbacks.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      return allFeedbacks;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
  },
  getRestaurantAnalytics: async (restaurantId: number) => {
    try {
      console.log('Fetching analytics for restaurant ID:', restaurantId);
      
      // Timeout ekleyerek uzun süren istekleri önleyelim
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
      
      const response = await api.get(`/api/restaurant/dashboard`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Analytics response:', response.data);
      
      return response.data || {
        total_feedbacks: 0,
        average_rating: 0,
        latest_feedback_date: null,
        rating_distribution: {},
        satisfaction_data: {},
        recent_comments: []
      };
    } catch (error) {
      console.error('Error fetching restaurant analytics:', error);
      return {
        total_feedbacks: 0,
        average_rating: 0,
        latest_feedback_date: null,
        rating_distribution: {},
        satisfaction_data: {},
        recent_comments: []
      };
    }
  },
  createFeedback: async (restaurantId: number, data: any) => {
    try {
      const response = await api.post(`/api/restaurants/${restaurantId}/feedbacks`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },
  deleteFeedback: async (feedbackId: number) => {
    try {
      console.log('Deleting feedback with ID:', feedbackId);
      const response = await api.delete(`/api/restaurant/feedbacks/${feedbackId}`);
      console.log('Delete feedback response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },
  deleteComplaint: async (complaintId: number) => {
    try {
      console.log('Deleting complaint with ID:', complaintId);
      const response = await api.delete(`/api/restaurant/complaints/${complaintId}`);
      console.log('Delete complaint response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  },
  getRestaurantPlatforms: async (restaurantId: number) => {
    try {
      console.log(`Fetching platforms for restaurant ID: ${restaurantId}`);
      const response = await api.get(`/api/customer/${restaurantId}/platforms`);
      console.log('Platforms response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching platforms for restaurant ID ${restaurantId}:`, error);
      // Hata durumunda varsayılan platformları döndür
      return [
        {
          id: 1,
          name: 'Google',
          url: 'https://www.google.com/maps/search/?api=1&query=restaurant'
        },
        {
          id: 2,
          name: 'Tripadvisor',
          url: 'https://www.tripadvisor.com/'
        }
      ];
    }
  },
  trackStarClick: async (restaurantId: number, starValue: number) => {
    try {
      const response = await api.post(`/api/restaurant/${restaurantId}/star-click?star_value=${starValue}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking star click:', error);
      throw error;
    }
  },
  getStarClickStats: async (restaurantId: number) => {
    try {
      console.log(`Fetching star click stats from: ${API_BASE_URL}/api/restaurant/${restaurantId}/star-clicks`);
      
      const response = await api.get(`/api/restaurant/${restaurantId}/star-clicks`);
      
      console.log('Star click stats response status:', response.status);
      console.log('Star click stats response data:', JSON.stringify(response.data, null, 2));
      
      // API'den gelen veriyi Dashboard bileşenindeki yapıya dönüştür
      const apiData = response.data;
      
      // API'den gelen veri yapısını detaylı incele
      console.log('API veri yapısı:');
      console.log('total_clicks:', apiData.total_clicks);
      console.log('star_distribution:', apiData.star_distribution);
      console.log('percentages:', apiData.percentages);
      
      return apiData;
    } catch (error) {
      console.error('Error getting star click stats:', error);
      console.error('Error details:', error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response from server');
      
      throw error; // Hatayı fırlat
    }
  },
};

// Customer services
export const customerService = {
  createFeedback: async (data: any) => {
    const response = await api.post('/api/customer/feedbacks', data);
    return response.data;
  },
  getFeedbackStats: async () => {
    const response = await api.get('/api/customer/feedbacks/stats');
    return response.data;
  },
  createComplaint: async (data: any) => {
    try {
      console.log('Sending complaint data to API:', data);
      const response = await api.post('/api/customer/complaints', data);
      console.log('Complaint response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  },
  getRestaurantFeedbacks: async (restaurantId: number) => {
    const response = await api.get(`/api/customer/${restaurantId}/feedbacks`);
    return response.data;
  },
  getRestaurantAnalytics: async (restaurantId: number) => {
    const response = await api.get(`/api/customer/${restaurantId}/analytics`);
    return response.data;
  },
  getRestaurantPlatforms: async (restaurantId: number) => {
    const response = await api.get(`/api/customer/${restaurantId}/platforms`);
    return response.data;
  },
  getRestaurantDetails: async (restaurantId: number) => {
    try {
      console.log(`Fetching restaurant details for ID ${restaurantId} from API`);
      const response = await api.get(`/api/restaurant/details/${restaurantId}`);
      console.log('Restaurant details response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurant details for ID ${restaurantId}:`, error);
      return null;
    }
  },
  getRestaurantBySubdomain: async (subdomain: string) => {
    try {
      const response = await api.get(`/api/restaurants/subdomain/${subdomain}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurant by subdomain ${subdomain}:`, error);
      return null;
    }
  },
};

// Waitlist servisi
export const waitlistService = {
  addToWaitlist: async (email: string) => {
    try {
      // API'nin tam URL'ini kullanarak ve redirectleri takip ederek
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/api/waitlist`,
        data: { email },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        maxRedirects: 5,
        withCredentials: false
      });
      return response.data;
    } catch (error: any) {
      console.error('Waitlist kayıt hatası:', error);
      if (error.response?.data?.detail) {
        throw error.response.data.detail;
      }
      throw 'Waitlist\'e kaydolurken bir hata oluştu';
    }
  },

  getWaitlist: async () => {
    try {
      // API'nin tam URL'ini kullanarak ve redirectleri takip ederek
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/api/waitlist`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        maxRedirects: 5,
        withCredentials: false
      });
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (token) {
        response.config.headers.Authorization = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Waitlist verisi alınamadı:', error);
      if (error.response?.data?.detail) {
        throw error.response.data.detail;
      }
      throw 'Waitlist verisi alınamadı';
    }
  }
};

export default api; 