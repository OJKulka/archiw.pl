import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProduct } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { toast } from "sonner";
import { PRODUCT } from "../constants/testIds";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t } = useLang();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct(id)
      .then(setProduct)
      .catch((e) => setError(e?.response?.data?.detail || "Error"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-20">
        <div className="bg-[#EFECE5] h-96 animate-pulse" />
      </div>
    );

  if (error || !product)
    return (
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-32 text-center space-y-4">
        <h2 className="font-serif text-3xl">404</h2>
        <p className="text-[#5C5A55]">Product not found</p>
        <button
          onClick={() => navigate("/")}
          className="text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          {t.cart.continueShopping}
        </button>
      </div>
    );

  const handleAdd = () => {
    add(product, 1);
    toast.success(t.product.addedToCart);
  };

  return (
    <div
      data-testid={PRODUCT.detail}
      className="max-w-[1600px] mx-auto px-5 lg:px-10 py-12 lg:py-20"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="space-y-4">
          {product.images?.length ? (
            product.images.map((src, i) => (
              <div key={i} className="aspect-[3/4] bg-[#EFECE5] overflow-hidden">
                <img src={src} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="aspect-[3/4] bg-[#EFECE5] flex items-center justify-center text-[#8C8A85] text-xs uppercase tracking-widest">
              No image
            </div>
          )}
        </div>
        <div className="lg:sticky lg:top-24 h-fit space-y-8">
          <div className="space-y-3">
            {product.designer && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#5C5A55]">
                {product.designer}
              </span>
            )}
            <h1 className="font-serif text-4xl sm:text-5xl tracking-tighter leading-none">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-xl">
                {product.price.toFixed(2)} {product.currency || "PLN"}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-[#8C8A85] line-through">
                  {product.original_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm border-t border-[#E5E0D8] pt-6">
            <div className="flex justify-between">
              <span className="text-[#5C5A55] uppercase tracking-[0.15em] text-xs">
                {t.product.category}
              </span>
              <span className="capitalize">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C5A55] uppercase tracking-[0.15em] text-xs">
                {t.product.size}
              </span>
              <span className="uppercase">{product.size}</span>
            </div>
          </div>

          {product.description && (
            <p className="text-[#5C5A55] leading-relaxed">{product.description}</p>
          )}

          <button
            data-testid={PRODUCT.addToCart}
            onClick={handleAdd}
            disabled={product.stock < 1}
            className="w-full bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#333] transition-colors py-4 text-xs uppercase tracking-[0.25em] disabled:opacity-40"
          >
            {product.stock < 1 ? t.product.outOfStock : t.product.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
