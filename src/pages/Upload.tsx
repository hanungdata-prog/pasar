import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, ZoomIn, ZoomOut, X, Image as ImageIcon, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import { productAPI } from "@/services/api";
import { useUserStore } from "@/stores/userStore";
import { toast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_IMAGES = 5;

const Upload = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewScale, setPreviewScale] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Debug: Log user data on mount
  useEffect(() => {
    console.log("=== UPLOAD PAGE DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("user.whatsapp:", user?.whatsapp);
    const stored = localStorage.getItem('user-storage');
    console.log("localStorage user-storage:", stored ? JSON.parse(stored) : "null");
  }, [user, isAuthenticated]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const remainingSlots = MAX_IMAGES - images.length;

      Array.from(files).slice(0, remainingSlots).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push(reader.result as string);
          if (newImages.length === Math.min(files.length, remainingSlots)) {
            setImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast({ title: "Error", description: "Nama dan deskripsi wajib diisi", variant: "destructive" });
      return;
    }

    if (!isAuthenticated) {
      toast({ title: "Error", description: "Silakan login terlebih dahulu", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!mainCategory || !subcategory) {
      toast({ title: "Error", description: "Pilih kategori dan subkategori", variant: "destructive" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Error", description: "Minimal 1 gambar harus diupload", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = parseInt(price.replace(/[^0-9]/g, "")) || 0;
      console.log("Creating product with whatsapp:", user?.whatsapp);
      await productAPI.create({
        name,
        description,
        category: subcategory,
        mainCategory,
        images,
        image: images[0],
        price: priceNum,
        whatsapp: user?.whatsapp,
      });
      toast({ title: "Berhasil!", description: "Produk berhasil diupload" });
      navigate("/");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Error", description: err.message || "Gagal mengupload produk", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find(cat => cat.id === mainCategory);
  const currentSubcategories = selectedCategory?.subcategories || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-8 py-6 flex gap-8 flex-col lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="bg-popover rounded-2xl p-6 flex-1 max-w-xl shadow-lg space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Gambar Produk (Max {MAX_IMAGES})</label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <UploadIcon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary/80">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {images.length} / {MAX_IMAGES} gambar diupload
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Produk</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama produk"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Select value={mainCategory} onValueChange={(value) => { setMainCategory(value); setSubcategory(""); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Selection */}
          {mainCategory && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subkategori</label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Subkategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{selectedCategory?.name}</SelectLabel>
                    {currentSubcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Harga</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi Lengkap</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan deskripsi lengkap produk Anda..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Mengupload..." : "Upload Produk"}
          </button>
        </form>

        {(name || images.length > 0) && (
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm text-foreground/60">Preview</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.25))}
                  className="w-7 h-7 rounded-full bg-accent/50 flex items-center justify-center text-accent-foreground hover:bg-accent transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-foreground/50 w-10 text-center">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewScale(Math.min(2, previewScale + 0.25))}
                  className="w-7 h-7 rounded-full bg-accent/50 flex items-center justify-center text-accent-foreground hover:bg-accent transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div
              className="rounded-2xl overflow-hidden shadow-xl origin-top-left transition-transform duration-200"
              style={{ width: `${256 * previewScale}px` }}
            >
              <div className="aspect-square bg-popover overflow-hidden">
                {images[0] ? (
                  <img src={images[0]} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-popover-foreground/20">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="bg-card p-3">
                <p className="text-xs text-card-foreground line-clamp-2">{name || "Nama Produk"}</p>
                <div className="w-3/4 h-px bg-foreground/20 my-1.5" />
                <p className="text-[10px] text-muted-foreground">Show Details</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Upload;
