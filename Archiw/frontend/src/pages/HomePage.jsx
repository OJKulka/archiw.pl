import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { ProductCard } from "../components/ProductCard";
import { EmptyState } from "../components/EmptyState";
import { fetchProducts } from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { PRODUCT } from "../constants/testIds";

const Hero = () => {
  const { t } = useLang();

  return (
    <section className="relative max-w-[1600px] mx-auto px-5 lg:px-10 pt-12 lg:pt-20 pb-16">
      <div className="grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#5C5A55]">
            {t.home.heroEyebrow}
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] text-[#1A1A1A]">
            {t.home.heroTitle}
          </h1>
          <p className="text-base text-[#5C5A55] max-w-md leading-relaxed">
            {t.home.heroSubtitle}
          </p>
          <a
            href="#products"
            data-testid="hero-shop-now"
            className="inline-block bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#333] transition-colors px-8 py-3 text-xs tracking-[0.2em] uppercase"
          >
            {t.home.shopNow}
          </a>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const { t } = useLang();

  const [filters, setFilters] = useState({
    gender: "all",
    categories: [],
    sizes: [],
    price: null,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  const urlFilter = searchParams.get("filter");
  const q = searchParams.get("q");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      const params = { sort };

      if (filters.gender && filters.gender !== "all") {
        params.gender = filters.gender;
      }

      if (filters.categories?.length === 1) {
        params.category = filters.categories[0];
      }

      if (filters.sizes?.length === 1) {
        params.size = filters.sizes[0];
      }

      if (filters.price) {
        params.price_min = filters.price[0];
        params.price_max = filters.price[1];
      }

      if (urlFilter === "new") params.is_new = true;
      if (urlFilter === "sale") params.on_sale = true;
      if (q) params.q = q;

      const response = await fetchProducts(params);
      if (!active) return;

      let list = response.products || [];

      if (filters.categories?.length > 1) {
        list = list.filter((product) =>
          filters.categories.some((category) =>
            product.categories?.includes(category)
          )
        );
      }

      if (filters.sizes?.length > 1) {
        list = list.filter((product) => filters.sizes.includes(product.size));
      }

      setProducts(list);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [filters, urlFilter, q, sort]);

  const clearFilters = () => {
    setFilters({
      gender: "all",
      categories: [],
      sizes: [],
      price: null,
    });
  };

  const productCountLabel =
    products.length === 1 ? t.home.productCountOne : t.home.productCountMany;

  const heading = useMemo(() => {
    if (urlFilter === "new") return t.home.newArrivals;
    if (urlFilter === "sale") return t.home.onSale;
    if (q) return `"${q}"`;
    return t.home.allProducts;
  }, [urlFilter, q, t]);

  return (
    <>
      <Hero />

      <section id="products" className="max-w-[1600px] mx-auto px-5 lg:px-10 pb-20">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit">
            <Sidebar filters={filters} onChange={setFilters} />
          </div>

          <div className="lg:col-span-9 space-y-8">
            <div className="flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
                {heading}
              </h2>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-xs text-[#5C5A55] uppercase tracking-[0.2em]">
                  {products.length} {productCountLabel}
                </span>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="products-sort"
                    className="text-[10px] uppercase tracking-[0.16em] text-[#5C5A55]"
                  >
                    {t.sort.label || "Sortowanie"}
                  </label>

                  <select
                    id="products-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="border border-[#D8D2C8] bg-[#F9F8F6] px-3 py-2 text-xs uppercase tracking-[0.12em] text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  >
                    <option className="bg-[#F9F8F6] text-[#1A1A1A]" value="newest">
                      {t.sort.newest || "Najnowsze"}
                    </option>
                    <option className="bg-[#F9F8F6] text-[#1A1A1A]" value="price_asc">
                      {t.sort.priceAscending || t.sort.priceAsc || "Cena: od najniższej"}
                    </option>
                    <option className="bg-[#F9F8F6] text-[#1A1A1A]" value="price_desc">
                      {t.sort.priceDescending || t.sort.priceDesc || "Cena: od najwyższej"}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="bg-[#EFECE5] aspect-[3/4] animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <div
                data-testid={PRODUCT.grid}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
