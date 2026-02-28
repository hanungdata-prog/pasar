import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, ShoppingCart, ZoomIn, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Header from "@/components/Header";
import { productAPI, ratingAPI } from "@/services/api";
import { useUserStore } from "@/stores/userStore";
import { useCart } from "@/lib/cart";
import { toast } from "@/hooks/use-toast";
import { ProductRating } from "@/components/ProductRating";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [product, setProduct] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<{
    avg: number;
    count: number;
    distribution: Record<number, number>;
  }>({ avg: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Image gallery state
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Rating state
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
      loadRatingStats(id);
      if (user) {
        loadUserRating(id, user._id);
      }
    }
  }, [id, user]);

  const loadProduct = async (productId: string) => {
    try {
      const response = await productAPI.getById(productId);
      if (response.success) {
        setProduct(response.data);
        const productImages = response.data.images?.length > 0
          ? response.data.images
          : [response.data.image || "/placeholder.svg"];
        setImages(productImages);
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat produk", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRatingStats = async (productId: string) => {
    try {
      const response = await ratingAPI.getStats(productId);
      if (response.success) {
        setRatingStats({
          avg: response.data.averageRating,
          count: response.data.totalRatings,
          distribution: response.data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (error) {
      console.error("Failed to load rating stats:", error);
    }
  };

  const loadUserRating = async (productId: string, userId: string) => {
    try {
      const response = await ratingAPI.getAll({ product: productId, user: userId });
      if (response.success && response.data.length > 0) {
        setUserRating(response.data[0].rating);
      }
    } catch (error) {
      console.error("Failed to load user rating:", error);
    }
  };

  const handleRate = async (rating: number) => {
    if (!user || !id) return;

    if (rating === userRating) {
      toast({ title: "Info", description: "Anda sudah memberikan rating ini", variant: "default" });
      return;
    }

    setIsSubmittingRating(true);
    try {
      await ratingAPI.create({
        userId: user._id,
        productId: id,
        deviceFingerprint: user.deviceFingerprint || "",
        rating,
        comment: "",
      });
      setUserRating(rating);
      loadRatingStats(id);
      toast({ title: "Terima kasih!", description: "Rating Anda telah dikirim" });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Error", description: err.message || "Gagal mengirim rating", variant: "destructive" });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const openFullscreen = (index: number) => {
    setCurrentImageIndex(index);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-foreground/50">
          Memuat produk...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-foreground/50">
          Produk tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="bg-popover rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="lg:w-1/2 relative">
              <div className="aspect-square bg-popover overflow-hidden relative group">
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openFullscreen(currentImageIndex)}
                />

                {/* Fullscreen Button */}
                <button
                  onClick={() => openFullscreen(currentImageIndex)}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium shadow-lg">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-foreground/20'
                        }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-popover-foreground">
                {product.name}
              </h1>
              <p className="text-sm text-popover-foreground/70 leading-relaxed">
                {product.description}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-popover-foreground">{product.price}</p>

              {/* Rating Display */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= Math.round(ratingStats.avg || product.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-transparent text-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-popover-foreground/60">
                    {Number(ratingStats.avg || product.averageRating || 0).toFixed(1)} ({ratingStats.count || product.totalRatings || 0} ulasan)
                  </span>
                </div>

                {/* User Rating Input */}
                {user && (
                  <div className="bg-accent/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-popover-foreground/70">Beri rating produk ini:</span>
                      {userRating > 0 && (
                        <span className="text-xs text-primary font-medium">Rating Anda: {userRating}/5 ⭐</span>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => !isSubmittingRating && handleRate(star)}
                          disabled={isSubmittingRating}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`transform transition-all ${isSubmittingRating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-125'}`}
                        >
                          <Star
                            size={32}
                            className={
                              star <= (hoverRating || userRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-foreground/30"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    {isSubmittingRating && (
                      <p className="text-xs text-center text-muted-foreground">Mengirim rating...</p>
                    )}
                  </div>
                )}

                {/* Reviews Section */}
                <div className="pt-4 border-t mt-4">
                  <ProductRating
                    productId={id || ''}
                    averageRating={ratingStats.avg || product.averageRating || 0}
                    totalRatings={ratingStats.count || product.totalRatings || 0}
                    distribution={ratingStats.distribution}
                    onRatingChange={() => {
                      loadRatingStats(id || '');
                      loadProduct(id || '');
                    }}
                  />
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-4">
                <button
                  onClick={() => {
                    useCart.getState().addToCart({ ...product, image: images[0] });
                    toast({ title: "Ditambahkan ke keranjang!", description: product.name });
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-full bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={() => {
                    const waNumber = (product.whatsapp || "6281234567890").replace(/^\+62/, "62");
                    window.open(
                      `https://wa.me/${waNumber}?text=Halo, saya ${user?.name || "pembeli"} tertarik dengan produk: ${product.name}`,
                      "_blank"
                    )
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Image Viewer Modal */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-50"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-50"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Fullscreen Image */}
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
