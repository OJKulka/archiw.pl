import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { PRODUCT } from "../constants/testIds";

export const ProductCard = ({ product }) => {
  const { t } = useLang();

  const imageSrc =
    product.images?.[0] ||
    product.image ||
    product.image_path ||
    product.product_image ||
    null;

  const finalImageSrc =
    imageSrc && !imageSrc.startsWith("http") && !imageSrc.startsWith("/")
      ? `/${imageSrc}`
      : imageSrc;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={PRODUCT.card}
      className="group cursor-pointer flex flex-col gap-3"
    >
      <div className="overflow-hidden bg-[#EFECE5] aspect-[3/4] relative">
        {finalImageSrc ? (
          <img
            src={finalImageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8C8A85] text-xs uppercase tracking-widest">
            No image
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="bg-[#4A5D4E] text-[#F9F8F6] text-[10px] uppercase tracking-[0.2em] px-2 py-1">
              {t.product.new}
            </span>
          )}
          {product.on_sale && (
            <span className="bg-[#C25934] text-[#F9F8F6] text-[10px] uppercase tracking-[0.2em] px-2 py-1">
              {t.product.sale}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {product.designer && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#5C5A55]">
            {product.designer}
          </span>
        )}
        <span className="text-sm text-[#1A1A1A]">{product.name}</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-medium text-[#1A1A1A]">
            {product.price.toFixed(2)} {product.currency || "PLN"}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-[#8C8A85] line-through">
              {product.original_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
