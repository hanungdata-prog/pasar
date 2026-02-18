import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon } from "lucide-react";
import Header from "@/components/Header";
import { addProduct } from "@/lib/store";
import { categories } from "@/lib/products";

const Upload = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[1]);
  const [whatsapp, setWhatsapp] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    addProduct({
      name,
      description,
      category,
      image: imagePreview || "/placeholder.svg",
      price: price || "Harga belum ditentukan",
      whatsapp: whatsapp || "6281234567890",
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-8 py-6 flex gap-8 flex-col lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="bg-popover rounded-2xl p-6 flex-1 max-w-xl shadow-lg space-y-4"
        >
          <div className="flex justify-center">
            <label className="relative w-48 h-44 bg-accent rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center border-2 border-dashed border-accent-foreground/20 hover:border-primary transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UploadIcon className="w-12 h-12 text-accent-foreground/40" />
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Produk"
            className="w-full px-4 py-3 rounded-xl bg-input text-popover-foreground placeholder:text-popover-foreground/40 outline-none"
          />
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Harga Produk"
            className="w-full px-4 py-3 rounded-xl bg-input text-popover-foreground placeholder:text-popover-foreground/40 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-input text-popover-foreground outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Nomor WhatsApp (contoh: 6281234567890)"
            className="w-full px-4 py-3 rounded-xl bg-input text-popover-foreground placeholder:text-popover-foreground/40 outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi Produk"
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-input text-popover-foreground placeholder:text-popover-foreground/40 outline-none resize-none"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Upload Produk
          </button>
        </form>

        {(name || imagePreview) && (
          <div className="flex-shrink-0">
            <p className="text-sm text-foreground/60 mb-2">Preview</p>
            <div className="w-64 rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-square bg-popover overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-popover-foreground/20">
                    No Image
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
