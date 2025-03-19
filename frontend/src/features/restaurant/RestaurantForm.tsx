import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface RestaurantFormData {
  name: string;
  subdomain: string;
  owner_email: string;
  owner_password: string;
}

interface UpdateRestaurantData {
  name?: string;
  subdomain?: string;
  owner_email?: string;
  owner_password?: string;
  is_active?: boolean;
}

const RestaurantForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    subdomain: '',
    owner_email: '',
    owner_password: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
    
    if (isEditing) {
      fetchRestaurant();
    }
  }, [user, navigate, isEditing, id]);
  
  const fetchRestaurant = async () => {
    try {
      setIsFetching(true);
      const data = await adminService.getRestaurant(Number(id));
      setFormData({
        name: data.name || '',
        subdomain: data.subdomain || '',
        owner_email: data.owner_email || '',
        owner_password: '', // Password is not returned from API
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Restoran bilgileri yüklenirken bir hata oluştu.');
      navigate('/admin/restaurants');
    } finally {
      setIsFetching(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Restoran adı gereklidir';
    }
    
    if (!formData.subdomain) {
      newErrors.subdomain = 'Subdomain gereklidir';
    }
    
    if (!formData.owner_email.trim()) {
      newErrors.owner_email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) {
      newErrors.owner_email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!isEditing && !formData.owner_password.trim()) {
      newErrors.owner_password = 'Şifre gereklidir';
    } else if (!isEditing && formData.owner_password.length < 6) {
      newErrors.owner_password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Lütfen form hatalarını düzeltin.');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrors({});

      if (isEditing && id) {
        // Update existing restaurant
        const updateData: UpdateRestaurantData = {};
        if (formData.name) updateData.name = formData.name;
        if (formData.subdomain) updateData.subdomain = formData.subdomain;
        if (formData.owner_email) updateData.owner_email = formData.owner_email;
        if (formData.owner_password) updateData.owner_password = formData.owner_password;
        
        await adminService.updateRestaurant(Number(id), updateData);
        toast.success('Restoran başarıyla güncellendi.');
        navigate('/admin/restaurants');
      } else {
        // Create new restaurant
        const createData = {
          name: formData.name,
          subdomain: formData.subdomain,
          owner_email: formData.owner_email,
          owner_password: formData.owner_password,
          is_active: true
        };

        // Masking password for console log
        const dataToPrint = { ...createData, owner_password: '*****' };
        console.log('Creating restaurant with data:', dataToPrint);

        await adminService.createRestaurant(createData);
        toast.success('Restoran başarıyla oluşturuldu');
        navigate('/admin/restaurants');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        
        // Check for specific field errors
        if (responseData.detail === 'Email already exists') {
          setErrors(prev => ({ ...prev, owner_email: 'Bu e-posta adresi zaten kullanılıyor' }));
        } else if (responseData.detail && Array.isArray(responseData.detail)) {
          const newErrors: Record<string, string> = {};
          responseData.detail.forEach((err: any) => {
            if (err.loc && err.loc.length > 1) {
              newErrors[err.loc[1]] = err.msg;
            }
          });
          setErrors(newErrors);
        }
      }
      
      toast.error('Restoran kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
        <div className="text-center py-8">Yükleniyor...</div>
      </main>
    );
  }
  
  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/admin/restaurants')}
            className="h-8 w-8"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Restoran Düzenle' : 'Yeni Restoran Ekle'}
          </h1>
        </div>
        
        <div className="card-glass p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Restoran Adı</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Restoran adını giriniz"
                  required
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="Subdomain giriniz (örn: restoran-adi)"
                  required
                  className={errors.subdomain ? 'border-red-500' : ''}
                />
                {errors.subdomain && <p className="text-xs text-red-500">{errors.subdomain}</p>}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="owner_email">Restoran Sahibi E-posta</Label>
                <Input
                  id="owner_email"
                  name="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={handleChange}
                  placeholder="Restoran sahibi e-posta adresi"
                  required
                  className={errors.owner_email ? 'border-red-500' : ''}
                />
                {errors.owner_email && <p className="text-xs text-red-500">{errors.owner_email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner_password">
                  {isEditing ? 'Yeni Şifre (Boş bırakılırsa değişmez)' : 'Şifre'}
                </Label>
                <Input
                  id="owner_password"
                  name="owner_password"
                  type="password"
                  value={formData.owner_password}
                  onChange={handleChange}
                  placeholder={isEditing ? 'Yeni şifre giriniz (opsiyonel)' : 'Şifre giriniz'}
                  required={!isEditing}
                  className={errors.owner_password ? 'border-red-500' : ''}
                />
                {errors.owner_password && <p className="text-xs text-red-500">{errors.owner_password}</p>}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RestaurantForm; 