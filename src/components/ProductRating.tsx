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
import { Progress } from '@/components/ui/progress';

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
  distribution?: Record<number, number>;
  onRatingChange?: () => void;
}

export function ProductRating({
  productId,
  averageRating,
  totalRatings,
  distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  onRatingChange
}: ProductRatingProps) {
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
          <Button variant="outline" className="w-full py-6 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 hover:border-primary transition-all group">
            <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-base text-foreground/80">Lihat Semua Ulasan ({totalRatings})</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl">
          <DialogHeader className="p-6 border-b border-border/50 bg-card rounded-t-3xl">
            <DialogTitle className="text-xl sm:text-2xl font-bold">Ulasan & Rating Produk</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto max-h-[calc(85vh-80px)]">
            {/* Left Column: Summary & Distribution */}
            <div className="md:col-span-5 p-6 bg-accent/20 border-r border-border/50 space-y-8">
              <div className="flex flex-col items-center justify-center p-6 bg-card rounded-3xl shadow-sm border border-border/50">
                <p className="text-6xl font-black text-primary tracking-tight">{averageRating.toFixed(1)}</p>
                <div className="flex justify-center mt-3 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-transparent text-foreground/20'
                      }
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">{totalRatings} penilaian total</p>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 px-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star] || 0;
                  const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 group">
                      <span className="text-sm font-bold w-3">{star}</span>
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <Progress value={percentage} className="h-2.5 flex-1 bg-muted group-hover:bg-muted-foreground/20 transition-colors" />
                      <span className="text-xs text-muted-foreground w-8 text-right font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Write Review Mobile - Only visible on small screens to push down the review list */}
              <div className="block md:hidden">
                {user && (
                  <div className="space-y-4 p-5 bg-card border-2 border-primary/20 rounded-2xl shadow-sm">
                    <h4 className="font-bold text-foreground">
                      {userReview ? 'Update Review Anda' : 'Tulis Review Anda'}
                    </h4>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80">Rating</label>
                      {renderStars(rating, true, setRating)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80">Ulasan (opsional)</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ceritakan pengalamanmu..."
                        className="min-h-[100px] rounded-xl resize-none focus-visible:ring-primary/50"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full rounded-xl h-11 text-base font-semibold transition-all hover:scale-[1.02]"
                      disabled={isLoading || rating === 0}
                    >
                      {isLoading ? 'Mengirim...' : (userReview ? 'Update Sekarang' : 'Kirim Ulasan')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Write Review (Desktop) & Reviews List */}
            <div className="md:col-span-7 p-6 space-y-6 bg-card">
              {/* Write Review Desktop - Only visible on large screens */}
              <div className="hidden md:block">
                {user && (
                  <div className="space-y-4 p-5 bg-background border-2 border-primary/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-lg text-foreground">
                      {userReview ? 'Update Review Anda' : 'Tulis Review Anda'}
                    </h4>
                    <div className="flex justify-between items-start gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80 block">Rating</label>
                        {renderStars(rating, true, setRating)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80">Ulasan (opsional)</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ceritakan pengalamanmu mengenai produk ini..."
                        className="min-h-[90px] rounded-xl resize-none focus-visible:ring-primary/50"
                        maxLength={500}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground font-medium">{comment.length}/500 karakter</p>
                      <Button
                        onClick={handleSubmit}
                        className="rounded-xl px-8 h-10 font-semibold transition-all hover:scale-[1.02]"
                        disabled={isLoading || rating === 0}
                      >
                        {isLoading ? 'Mengirim...' : (userReview ? 'Update' : 'Kirim')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg border-b pb-2 sticky top-0 bg-card z-10">Ulasan Pembeli</h4>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="p-4 bg-background border border-border/50 rounded-2xl hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-primary text-sm uppercase">
                              {(review.user?.name || 'A').charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-sm text-foreground">{review.user?.name || 'Anonim'}</p>
                              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                                {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-transparent text-foreground/20'
                                  }
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="text-sm text-foreground/80 leading-relaxed bg-accent/20 p-3 rounded-xl mt-2">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 rounded-2xl bg-accent/30 border border-border/50 border-dashed">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-foreground/80">Belum ada ulasan</p>
                    <p className="text-sm text-muted-foreground">Jadilah yang pertama untuk menilai produk ini!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
