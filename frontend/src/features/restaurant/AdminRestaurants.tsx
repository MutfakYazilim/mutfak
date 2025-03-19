import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { adminService } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Restaurant {
  id: number;
  name: string;
  subdomain: string;
  owner?: {
    email: string;
  };
}

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
    
    fetchRestaurants();
  }, [user, navigate]);
  
  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getRestaurants();
      
      if (!response || !Array.isArray(response)) {
        console.error('Invalid response format:', response);
        toast.error('Sunucudan geçersiz veri formatı alındı.');
        setRestaurants([]);
        return;
      }

      // Veriyi doğrula ve temizle
      const validRestaurants = response.filter(restaurant => {
        const isValid = restaurant && 
          typeof restaurant.id === 'number' && 
          typeof restaurant.name === 'string' && 
          typeof restaurant.subdomain === 'string';
        
        if (!isValid) {
          console.warn('Invalid restaurant data:', restaurant);
        }
        return isValid;
      });

      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        toast.info('Henüz restoran bulunmuyor.');
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      const errorMessage = error.response?.data?.detail || 'Restoranlar yüklenirken bir hata oluştu.';
      toast.error(errorMessage);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClick = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await adminService.deleteRestaurant(restaurantToDelete.id);
      setRestaurants(restaurants.filter(r => r.id !== restaurantToDelete.id));
      toast.success(`${restaurantToDelete.name} başarıyla silindi.`);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Restoran silinirken bir hata oluştu.');
    } finally {
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
    }
  };
  
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.owner?.email && restaurant.owner.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <>
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Restoranlar</h1>
            <Link to="/admin/restaurants/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Yeni Restoran Ekle
              </Button>
            </Link>
          </div>
          
          <div className="card-glass p-6">
            <div className="flex items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Restoran adı, subdomain veya e-posta ile ara..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Yükleniyor...</div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Arama kriterlerine uygun restoran bulunamadı.' : 'Henüz restoran eklenmemiş.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Restoran Adı</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Sahibi</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">{restaurant.id}</TableCell>
                        <TableCell>{restaurant.name}</TableCell>
                        <TableCell>{restaurant.subdomain}</TableCell>
                        <TableCell>{restaurant.owner?.email || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/restaurants/${restaurant.id}`}>
                              <Button variant="outline" size="sm">
                                <Pencil size={16} />
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteClick(restaurant)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restoranı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem <strong>{restaurantToDelete?.name}</strong> restoranını ve tüm verilerini kalıcı olarak silecektir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminRestaurants; 