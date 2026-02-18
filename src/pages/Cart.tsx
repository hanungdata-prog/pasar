import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/lib/cart";
import { getUsername } from "@/lib/store";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const username = getUsername();

  const handleCheckout = () => {
    const message = items
      .map((i) => `• ${i.product.name} x${i.quantity} - ${i.product.price}`)
      .join("\n");
    const total = `Rp ${totalPrice().toLocaleString("id-ID")}`;
    const whatsapp = items[0]?.product.whatsapp || "6281234567890";
    const text = `Halo, saya ${username || "pembeli"} ingin memesan:\n\n${message}\n\nTotal: ${total}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    clearCart();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Keranjang Belanja
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
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 bg-popover rounded-2xl p-4 shadow-md"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-popover-foreground line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-popover-foreground/60 mt-1">{item.product.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-input flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3 text-popover-foreground" />
                    </button>
                    <span className="text-sm font-medium text-popover-foreground w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-input flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-popover-foreground" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-destructive hover:opacity-70"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="bg-popover rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between text-popover-foreground">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">
                  Rp {totalPrice().toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
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
