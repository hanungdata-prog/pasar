import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ratingAPI } from '@/services/api';
import { useUserStore } from '@/stores/userStore';
import { toast } from '@/hooks/use-toast';

interface Review {
  _id: string;
  user: { _id: string; name: string };
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ProductRatingProps {
  productId: string;
  averageRating: number;
  totalRatings: number;
  onRatingChange?: () => void;
}

export function ProductRating({ productId, averageRating, totalRatings, onRatingChange }: ProductRatingProps) {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      loadReviews();
      if (user) {
        loadUserReview();
      }
    }
  }, [isOpen, productId, user]);

  const loadReviews = async () => {
    try {
      console.log("Loading reviews for product:", productId);
      const response = await ratingAPI.getByProduct(productId, { limit: 10, sort: 'newest' });
      console.log("Reviews response:", response);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const loadUserReview = async () => {
    try {
      const response = await ratingAPI.getAll({ product: productId, user: user?._id || '' });
      if (response.success && response.data.length > 0) {
        setUserReview(response.data[0]);
        setRating(response.data[0].rating);
        setComment(response.data[0].comment || '');
      }
    } catch (error) {
      console.error('Failed to load user review:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user || !productId) return;
    if (rating === 0) {
      toast({ title: 'Error', description: 'Pilih rating bintang', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await ratingAPI.create({
        userId: user._id,
        productId,
        deviceFingerprint: user.deviceFingerprint || '',
        rating,
        comment: comment || '',
      });
      
      toast({ 
        title: 'Berhasil!', 
        description: userReview ? 'Review Anda telah diupdate' : 'Terima kasih atas review Anda' 
      });
      
      setIsOpen(false);
      setRating(0);
      setComment('');
      loadReviews();
      onRatingChange?.();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: 'Error', description: err.message || 'Gagal mengirim review', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (value: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            disabled={!interactive || isLoading}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive && !isLoading ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={28}
              className={
                star <= (interactive ? (hoverRating || rating) : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-foreground/30'
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Lihat Ulasan ({totalRatings})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review & Rating Produk</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl">
              <div className="text-center">
                <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
                <div className="flex justify-center my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-transparent text-foreground/30'
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{totalRatings} ulasan</p>
              </div>
            </div>

            {/* Write Review */}
            {user && (
              <div className="space-y-3 p-4 border rounded-xl">
                <h4 className="font-semibold">
                  {userReview ? 'Update Review Anda' : 'Tulis Review Anda'}
                </h4>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Rating Anda</label>
                  {renderStars(rating, true, setRating)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Komentar (opsional)</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bagaimana pengalaman Anda dengan produk ini?"
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {comment.length}/500
                  </p>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={isLoading || rating === 0}
                >
                  {isLoading ? 'Mengirim...' : (userReview ? 'Update Review' : 'Kirim Review')}
                </Button>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Ulasan Lainnya ({reviews.length})</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{review.user?.name || 'Anonim'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-transparent text-foreground/30'
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada ulasan untuk produk ini. Jadilah yang pertama!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
