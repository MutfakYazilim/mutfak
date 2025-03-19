import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Search, Star, Trash2, Plus, Phone, Mail, X, Check, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from '@/features/auth/AuthContext';
import { restaurantService } from '@/lib/api';

// Comment interface
interface Comment {
  id: number;
  name: string;
  email: string;
  phone: string;
  food_rating: number;
  service_rating: number;
  atmosphere_rating: number;
  average_rating: number;
  comment: string | null;
  created_at: string;
  is_complaint?: boolean;
}

interface CommentTableProps {
  comments?: Comment[];
}

const CommentTable: React.FC<CommentTableProps> = ({ comments: initialComments }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  
  // New comment form state
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    phone: '',
    food_rating: 0,
    service_rating: 0,
    atmosphere_rating: 0,
    comment: '',
  });

  useEffect(() => {
    if (user && user.restaurant_id) {
      fetchComments();
    }
  }, [user]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await restaurantService.getFeedbacks();
      console.log('Fetched comments:', data);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Yorumlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter comments based on search term and rating
  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      comment.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (ratingFilter === 'all') return matchesSearch;
    if (ratingFilter === 'low' && comment.average_rating <= 3) return matchesSearch;
    if (ratingFilter === 'high' && comment.average_rating >= 4) return matchesSearch;
    
    return false;
  });
  
  // Sort comments by date
  const sortedComments = [...filteredComments].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };
  
  // Delete a comment
  const handleDeleteComment = async (id: number, isComplaint: boolean) => {
    try {
      if (isComplaint) {
        await restaurantService.deleteComplaint(id);
      } else {
        await restaurantService.deleteFeedback(id);
      }
      
      // Başarılı silme işleminden sonra yorumları güncelle
      setComments(comments.filter(comment => comment.id !== id));
      toast.success("Yorum başarıyla silindi");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Yorum silinirken bir hata oluştu");
    }
  };
  
  // Add a new comment
  const handleAddComment = async () => {
    if (!user?.restaurant_id) {
      toast.error("Restoran bilgisi bulunamadı");
      return;
    }

    try {
      // Calculate average rating
      const averageRating = (newComment.food_rating + newComment.service_rating + newComment.atmosphere_rating) / 3;
      
      const feedbackData = {
        name: newComment.name,
        email: newComment.email,
        phone: newComment.phone,
        food_rating: newComment.food_rating,
        service_rating: newComment.service_rating,
        atmosphere_rating: newComment.atmosphere_rating,
        comment: newComment.comment || null,
        restaurant_id: user.restaurant_id
      };
      
      const response = await restaurantService.createFeedback(user.restaurant_id, feedbackData);
      
      // Add the new comment to the list with is_complaint set to false
      setComments([{...response, is_complaint: false}, ...comments]);
      
      // Reset form
      setNewComment({
        name: '',
        email: '',
        phone: '',
        food_rating: 0,
        service_rating: 0,
        atmosphere_rating: 0,
        comment: '',
      });
      
      toast.success("Yorum başarıyla eklendi");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Yorum eklenirken bir hata oluştu");
    }
  };
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Handle star rating click in the new comment form
  const handleRatingChange = (category: 'food_rating' | 'service_rating' | 'atmosphere_rating', rating: number) => {
    setNewComment({
      ...newComment,
      [category]: rating
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Yorumlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="İsim veya e-posta ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={ratingFilter} 
            onValueChange={setRatingFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Puan filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Puanlar</SelectItem>
              <SelectItem value="high">Yüksek Puan (4-5)</SelectItem>
              <SelectItem value="low">Düşük Puan (1-3)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={toggleSortOrder}
            className="flex items-center gap-2"
          >
            Tarih
            {sortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Yeni Yorum
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Yeni Yorum Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">İsim</label>
                    <Input 
                      value={newComment.name}
                      onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                      placeholder="Müşteri adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-posta</label>
                    <Input 
                      type="email"
                      value={newComment.email}
                      onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                      placeholder="E-posta adresi"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon</label>
                  <Input 
                    value={newComment.phone}
                    onChange={(e) => setNewComment({...newComment, phone: e.target.value})}
                    placeholder="Telefon numarası"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Yemek Puanı</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange('food_rating', rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={rating <= newComment.food_rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Servis Puanı</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange('service_rating', rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={rating <= newComment.service_rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Atmosfer Puanı</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange('atmosphere_rating', rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={rating <= newComment.atmosphere_rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Yorum</label>
                  <Textarea 
                    value={newComment.comment}
                    onChange={(e) => setNewComment({...newComment, comment: e.target.value})}
                    placeholder="Müşteri yorumu"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">İptal</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddComment}
                  disabled={
                    !newComment.name || 
                    !newComment.email || 
                    !newComment.phone || 
                    newComment.food_rating === 0 || 
                    newComment.service_rating === 0 || 
                    newComment.atmosphere_rating === 0
                  }
                >
                  Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Comments Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">
                  Müşteri
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">
                  Tarih
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">
                  Puan
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">
                  Yorum
                </th>
                <th className="px-4 py-3.5 text-right text-sm font-semibold text-foreground">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedComments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                    Henüz yorum bulunmuyor.
                  </td>
                </tr>
              ) : (
                sortedComments.map((comment) => (
                  <tr 
                    key={`${comment.id}-${comment.is_complaint ? 'complaint' : 'feedback'}`}
                    className={comment.is_complaint ? 'bg-red-50' : ''}
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-medium">{comment.name}</span>
                        <span className="text-sm text-muted-foreground flex items-center mt-1">
                          <Mail size={12} className="mr-1" /> {comment.email}
                        </span>
                        {comment.phone && (
                          <span className="text-sm text-muted-foreground flex items-center mt-1">
                            <Phone size={12} className="mr-1" /> {comment.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground align-top">
                      {formatDate(comment.created_at)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="w-24 text-xs">Yemek:</span>
                          {renderStars(comment.food_rating)}
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-xs">Servis:</span>
                          {renderStars(comment.service_rating)}
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-xs">Atmosfer:</span>
                          {renderStars(comment.atmosphere_rating)}
                        </div>
                        <div className="flex items-center pt-1">
                          <span className="w-24 text-xs font-medium">Ortalama:</span>
                          <span className="flex items-center">
                            <strong className="mr-2">{comment.average_rating.toFixed(1)}</strong>
                            {renderStars(Math.round(comment.average_rating))}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm align-top">
                      {comment.comment ? (
                        <p className="whitespace-pre-line">{comment.comment}</p>
                      ) : (
                        <span className="text-muted-foreground italic">Yorum yapılmadı</span>
                      )}
                      {comment.is_complaint && (
                        <div className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs inline-flex items-center">
                          <AlertTriangle size={12} className="mr-1" />
                          Şikayet Formu
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-right align-top">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleDeleteComment(comment.id, !!comment.is_complaint)}
                      >
                        <Trash2 size={14} />
                        Sil
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommentTable;
