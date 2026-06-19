import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { createCheckout } from "../lib/api";
import { toast } from "sonner";
import { CART } from "../constants/testIds";

export default function CartPage() {
  const { items, remove, updateQty, total } = useCart();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const checkoutItems = items.map((i) => ({
        product_id: i.product_id || i.id,
        quantity: Number(i.quantity || 1),
      }));

      const res = await createCheckout(checkoutItems, window.location.origin);

      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("No checkout url");
      }
    } catch (e) {
        console.error("Checkout error:", e);

        const detail = e?.response?.data?.detail;

        let message = e?.message || "Checkout failed";

        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((err) => err.msg).join(", ");
        }
      
        toast.error(message);
        setLoading(false);
      }
    };

  if (!items.length)
    return (
      <div
        data-testid={CART.emptyState}
        className="max-w-[1600px] mx-auto px-5 lg:px-10 py-32 text-center space-y-6"
      >
        <h1 className="font-serif text-5xl tracking-tighter">{t.cart.title}</h1>
        <p className="text-[#5C5A55]">{t.cart.empty}</p>
        <Link
          to="/"
          className="inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );

  return (
    <div data-testid={CART.page} className="max-w-[1600px] mx-auto px-5 lg:px-10 py-12 lg:py-20">
      <h1 className="font-serif text-5xl tracking-tighter mb-12">{t.cart.title}</h1>
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 divide-y divide-[#E5E0D8] border-t border-b border-[#E5E0D8]">
          {items.map((i) => (
            <div
              key={i.product_id}
              data-testid={CART.itemRow}
              className="py-6 flex gap-5 items-center"
            >
              <div className="w-24 h-32 bg-[#EFECE5] flex-shrink-0 overflow-hidden">
                {i.image && (
                  <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                {i.designer && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#5C5A55]">
                    {i.designer}
                  </span>
                )}
                <h3 className="text-sm">{i.name}</h3>
                <span className="text-sm">{(i.price * i.quantity).toFixed(2)} PLN</span>
              </div>
              <input
                type="number"
                min="1"
                value={i.quantity}
                onChange={(e) => updateQty(i.product_id, parseInt(e.target.value || "1", 10))}
                data-testid={CART.qtyInput}
                className="w-14 border border-[#E5E0D8] text-center py-2 text-sm bg-transparent"
              />
              <button
                data-testid={CART.removeBtn}
                onClick={() => remove(i.product_id)}
                aria-label="remove"
                className="text-[#5C5A55] hover:text-[#C25934] p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 space-y-6 h-fit lg:sticky lg:top-24 border border-[#E5E0D8] p-8">
          <div className="flex justify-between text-sm">
            <span className="uppercase tracking-[0.15em] text-[#5C5A55]">{t.cart.subtotal}</span>
            <span>{total.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between border-t border-[#E5E0D8] pt-6">
            <span className="uppercase tracking-[0.15em] text-sm font-medium">{t.cart.total}</span>
            <span data-testid={CART.total} className="font-serif text-2xl">
              {total.toFixed(2)} PLN
            </span>
          </div>
          <button
            data-testid={CART.checkoutBtn}
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#333] transition-colors py-4 text-xs uppercase tracking-[0.25em] disabled:opacity-50"
          >
            {loading ? "..." : t.cart.checkout}
          </button>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A85] text-center">
            Card · BLIK
          </p>
        </div>
      </div>
    </div>
  );
}
