import { useEffect, useState } from "react";
import { fetchFilters } from "../lib/api";
import { useLang } from "../context/LanguageContext";

const GENDER_OPTIONS = [
  { value: "all", translationKey: "genderAll" },
  { value: "male", translationKey: "genderMen" },
  { value: "female", translationKey: "genderWomen" },
  { value: "unisex", translationKey: "genderUnisex" },
];

const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];

const sortSizes = (sizes = []) =>
  [...sizes].sort((a, b) => {
    const normalizedA = String(a).trim().toUpperCase();
    const normalizedB = String(b).trim().toUpperCase();

    const indexA = SIZE_ORDER.indexOf(normalizedA);
    const indexB = SIZE_ORDER.indexOf(normalizedB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return normalizedA.localeCompare(normalizedB, "pl");
  });

const formatPrice = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
};

const toggleArrayValue = (values, value) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

export function Sidebar({ filters, onChange }) {
  const { t } = useLang();
  const [options, setOptions] = useState({
    categories: [],
    sizes: [],
    price_min: 0,
    price_max: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [priceDraft, setPriceDraft] = useState({ min: "", max: "" });
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await fetchFilters();
      if (!active) return;

      const min = Number(data.price_min ?? 0);
      const max = Number(data.price_max ?? min);

      setOptions({
        categories: data.categories || [],
        sizes: sortSizes(data.sizes || []),
        price_min: min,
        price_max: max,
      });
      setPriceDraft({
        min: formatPrice(min),
        max: formatPrice(max),
      });
      setLoaded(true);

      if (!filters.price) {
        onChange((current) => ({
          ...current,
          price: [min, max],
        }));
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const range = filters.price || [options.price_min, options.price_max];
    setPriceDraft({
      min: formatPrice(range[0]),
      max: formatPrice(range[1]),
    });
  }, [filters.price, loaded, options.price_min, options.price_max]);

  const applyPriceRange = () => {
    const parsedMin = Number(String(priceDraft.min).replace(",", "."));
    const parsedMax = Number(String(priceDraft.max).replace(",", "."));

    const nextMin = Number.isFinite(parsedMin)
      ? Math.max(options.price_min, Math.min(parsedMin, options.price_max))
      : options.price_min;

    const nextMax = Number.isFinite(parsedMax)
      ? Math.max(options.price_min, Math.min(parsedMax, options.price_max))
      : options.price_max;

    if (nextMin > nextMax) {
      setPriceError(t.filter.priceRangeError);
      return;
    }

    setPriceError("");
    setPriceDraft({
      min: formatPrice(nextMin),
      max: formatPrice(nextMax),
    });
    onChange((current) => ({
      ...current,
      price: [nextMin, nextMax],
    }));
  };

  const updateFilter = (key, value) => {
    onChange((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearAll = () => {
    setPriceError("");
    setPriceDraft({
      min: formatPrice(options.price_min),
      max: formatPrice(options.price_max),
    });
    onChange({
      gender: "all",
      categories: [],
      sizes: [],
      price: [options.price_min, options.price_max],
    });
  };

  return (
    <aside className="flex flex-col gap-5 sm:gap-[26px]">
      <section className="border-b border-[#E5E0D8] pb-3 sm:pb-4">
        <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#1A1A1A]">
          {t.filter.price}
        </h3>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="w-full min-w-0">
            <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#5C5A55]">
              {t.filter.from}
            </span>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={priceDraft.min}
                disabled={!loaded}
                onChange={(event) => {
                  setPriceError("");
                  setPriceDraft((current) => ({
                    ...current,
                    min: event.target.value,
                  }));
                }}
                onBlur={applyPriceRange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                aria-label={t.filter.minAria}
                className="h-9 w-full min-w-0 border border-[#D8D2C8] bg-[#F9F8F6] px-2 pr-6 text-xs text-[#1A1A1A] outline-none transition-colors focus:border-[#1A1A1A] disabled:opacity-50"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#8C8A85]">
                {t.filter.currency}
              </span>
            </div>
          </label>

          <label className="w-full min-w-0">
            <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#5C5A55]">
              {t.filter.to}
            </span>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={priceDraft.max}
                disabled={!loaded}
                onChange={(event) => {
                  setPriceError("");
                  setPriceDraft((current) => ({
                    ...current,
                    max: event.target.value,
                  }));
                }}
                onBlur={applyPriceRange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                aria-label={t.filter.maxAria}
                className="h-9 w-full min-w-0 border border-[#D8D2C8] bg-[#F9F8F6] px-2 pr-6 text-xs text-[#1A1A1A] outline-none transition-colors focus:border-[#1A1A1A] disabled:opacity-50"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#8C8A85]">
                {t.filter.currency}
              </span>
            </div>
          </label>
        </div>

        {priceError && (
          <p className="mt-3 text-[10px] leading-relaxed text-red-700" role="alert">
            {priceError}
          </p>
        )}
      </section>

      <section className="border-b border-[#E5E0D8] pb-3 sm:pb-4">
        <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#1A1A1A]">
          {t.filter.categories}
        </h3>
        <div className="space-y-3">
          {options.categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#5C5A55]"
            >
              <input
                type="checkbox"
                checked={filters.categories?.includes(category) || false}
                onChange={() =>
                  updateFilter(
                    "categories",
                    toggleArrayValue(filters.categories || [], category)
                  )
                }
                className="h-3.5 w-3.5 accent-[#1A1A1A]"
              />
              <span className="capitalize">{category}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="border-b border-[#E5E0D8] pb-3 sm:pb-4">
        <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#1A1A1A]">
          {t.filter.size}
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {options.sizes.map((size) => {
            const selected = filters.sizes?.includes(size) || false;
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  updateFilter("sizes", toggleArrayValue(filters.sizes || [], size))
                }
                className={`min-w-9 border px-2.5 py-2 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  selected
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F8F6]"
                    : "border-[#D8D2C8] text-[#5C5A55] hover:border-[#1A1A1A]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-b border-[#E5E0D8] pb-3 sm:pb-4">
        <h3 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#1A1A1A]">
          {t.filter.gender}
        </h3>
        <div className="space-y-3">
          {GENDER_OPTIONS.map((gender) => (
            <label
              key={gender.value}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#5C5A55]"
            >
              <input
                type="radio"
                name="product-gender"
                checked={(filters.gender || "all") === gender.value}
                onChange={() => updateFilter("gender", gender.value)}
                className="h-3.5 w-3.5 accent-[#1A1A1A]"
              />
              <span>{t.filter[gender.translationKey]}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="pt-1 sm:pt-2">
        <button
          type="button"
          onClick={clearAll}
          className="text-[10px] uppercase tracking-[0.18em] text-[#5C5A55] underline underline-offset-4 hover:text-[#1A1A1A]"
        >
          {t.filter.clear}
        </button>
      </div>
    </aside>
  );
}
