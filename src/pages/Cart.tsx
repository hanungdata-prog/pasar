import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/lib/cart";
import { useUserStore } from "@/stores/userStore";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useUserStore();

  const handleCheckout = () => {
    const message = items
      .map((i) => `• ${i.product.name} x${i.quantity} - ${i.product.price}`)
      .join("\n");
    const total = `Rp ${totalPrice().toLocaleString("id-ID")}`;
    const whatsapp = (items[0]?.product.whatsapp || "6281234567890").replace(/^\+62/, "62");
    const text = `Halo, saya ${user?.name || "pembeli"} ingin memesan:\n\n${message}\n\nTotal: ${total}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    clearCart();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" /> Keranjang Belanja
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 text-foreground/50">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Keranjang kosong</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90"
            >
              Belanja sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 sm:gap-6 bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-popover-foreground line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-popover-foreground/60 mt-1">{item.product.price}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center rounded-full bg-accent/50 border border-border">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-3 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors ml-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50 space-y-6 mt-8">
              <div className="flex justify-between items-center text-foreground">
                <span className="font-semibold text-lg">Total Pembayaran</span>
                <span className="font-bold text-2xl text-primary">
                  Rp {totalPrice().toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:shadow-lg transition-all"
              >
                Checkout via WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
