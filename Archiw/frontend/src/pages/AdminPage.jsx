import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit3,
  ImagePlus,
  PackagePlus,
  Power,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminProductImage,
  disableAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  getApiError,
  updateAdminProduct,
  uploadAdminProductImage,
} from "../lib/api";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  brand: "",
  size: "",
  gender: "unisex",
  stock: "1",
  is_active: true,
  is_new: false,
  categories: [],
  discount_enabled: false,
  discount_percent: "",
  discount_starts_at: "",
  discount_ends_at: "",
};

const inputClass =
  "w-full border border-[#D8D2C8] bg-[#FDFCFB] px-3 py-3 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#A09D97] focus:border-[#1A1A1A] focus:bg-white";
const labelClass =
  "mb-1.5 block text-sm font-medium text-[#2A2927]";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const panelClass = "border border-[#D8D2C8] bg-white";
const sectionClass = "border-t border-[#E5E0D8] pt-6";

const normalizeDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const productToForm = (product) => ({
  name: product.name || "",
  slug: product.slug || "",
  description: product.description || "",
  price: product.price ?? "",
  brand: product.brand || "",
  size: product.size || "",
  gender: product.gender || "unisex",
  stock: product.stock ?? 0,
  is_active: Boolean(product.is_active),
  is_new: Boolean(product.is_new),
  categories: (product.categories || []).map((category) => category.slug),
  discount_enabled: Boolean(product.discount),
  discount_percent: product.discount?.discount_percent ?? "",
  discount_starts_at: normalizeDateForInput(product.discount?.starts_at),
  discount_ends_at: normalizeDateForInput(product.discount?.ends_at),
});

const ProductForm = ({
  categories,
  editingProduct,
  form,
  files,
  saving,
  onChange,
  onToggleCategory,
  onFilesChange,
  onSubmit,
  onCancel,
}) => (
  <form id="admin-product-form" onSubmit={onSubmit} className={`${panelClass} p-5 lg:p-7`}>
    <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#E5E0D8] pb-5">
      <div>
        <p className="text-xs text-[#8C8A85]">
          {editingProduct ? `Produkt #${editingProduct.id}` : "Nowy produkt"}
        </p>
        <h2 className="mt-1 text-2xl font-medium text-[#1A1A1A]">
          {editingProduct ? "Edytuj produkt" : "Dodaj produkt"}
        </h2>
        <p className="mt-2 text-sm text-[#6B6862]">
          Pola oznaczone gwiazdką są wymagane.
        </p>
      </div>

      {editingProduct && (
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`${buttonClass} shrink-0 border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
        >
          <X size={16} />
          Anuluj edycję
        </button>
      )}
    </div>

    <div className="space-y-5">
      <section className={sectionClass}>
        <h3 className="mb-4 text-lg font-medium text-[#1A1A1A]">Dane produktu</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className={labelClass}>Nazwa *</span>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              maxLength={255}
              className={inputClass}
              placeholder="Np. Vintage Levi's 501"
            />
          </label>

          <label>
            <span className={labelClass}>Slug</span>
            <input
              name="slug"
              value={form.slug}
              onChange={onChange}
              maxLength={255}
              placeholder="Utworzy się automatycznie"
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>Cena w PLN *</span>
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={onChange}
              required
              className={inputClass}
              placeholder="0.00"
            />
          </label>

          <label>
            <span className={labelClass}>Marka</span>
            <input
              name="brand"
              value={form.brand}
              onChange={onChange}
              className={inputClass}
              placeholder="Np. Levi's"
            />
          </label>

          <label>
            <span className={labelClass}>Rozmiar</span>
            <input
              name="size"
              value={form.size}
              onChange={onChange}
              className={inputClass}
              placeholder="Np. M, 32/32"
            />
          </label>

          <label>
            <span className={labelClass}>Płeć</span>
            <select name="gender" value={form.gender} onChange={onChange} className={inputClass}>
              <option value="unisex">Unisex</option>
              <option value="men">Męskie</option>
              <option value="women">Damskie</option>
            </select>
          </label>

          <label>
            <span className={labelClass}>Stan magazynowy</span>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={onChange}
              className={inputClass}
            />
          </label>

          <label className="md:col-span-2">
            <span className={labelClass}>Opis</span>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={6}
              className={`${inputClass} resize-y`}
              placeholder="Stan, materiał, krój i ważne informacje o produkcie"
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="mb-4 text-lg font-medium text-[#1A1A1A]">Kategorie i widoczność</h3>

        <div>
          <p className={labelClass}>Kategorie</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.length === 0 && (
              <span className="text-sm text-[#8C8A85]">Brak kategorii w bazie.</span>
            )}
            {categories.map((category) => {
              const selected = form.categories.includes(category.slug);
              return (
                <label
                  key={category.id}
                  className={`flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm transition-colors ${
                    selected
                      ? "border-[#C25934] bg-[#FFF8F4]"
                      : "border-[#D8D2C8] bg-white hover:border-[#A9A39A]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleCategory(category.slug)}
                  />
                  <span>{category.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 border border-[#D8D2C8] bg-white p-4 text-sm">
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={onChange}
            />
            <span>
              <span className="block font-medium">Produkt aktywny</span>
              <span className="mt-0.5 block text-xs text-[#77736C]">Widoczny w sklepie</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 border border-[#D8D2C8] bg-white p-4 text-sm">
            <input name="is_new" type="checkbox" checked={form.is_new} onChange={onChange} />
            <span>
              <span className="block font-medium">Nowość</span>
              <span className="mt-0.5 block text-xs text-[#77736C]">Oznaczenie nowego produktu</span>
            </span>
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="mb-4 text-lg font-medium text-[#1A1A1A]">Promocja</h3>

        <label className="flex cursor-pointer items-center gap-3 border border-[#D8D2C8] bg-white p-4 text-sm">
          <input
            name="discount_enabled"
            type="checkbox"
            checked={form.discount_enabled}
            onChange={onChange}
          />
          Włącz promocję dla tego produktu
        </label>

        {form.discount_enabled && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label>
              <span className={labelClass}>Rabat w % *</span>
              <input
                name="discount_percent"
                type="number"
                min="0.01"
                max="99.99"
                step="0.01"
                value={form.discount_percent}
                onChange={onChange}
                required
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>Początek</span>
              <input
                name="discount_starts_at"
                type="datetime-local"
                value={form.discount_starts_at}
                onChange={onChange}
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>Koniec</span>
              <input
                name="discount_ends_at"
                type="datetime-local"
                value={form.discount_ends_at}
                onChange={onChange}
                className={inputClass}
              />
            </label>
          </div>
        )}
      </section>

      <section className={sectionClass}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-[#1A1A1A]">Zdjęcia</h3>
          <p className="mt-1 text-sm text-[#77736C]">Pierwsze zdjęcie będzie głównym zdjęciem produktu.</p>
        </div>

        <label className="block cursor-pointer border border-dashed border-[#A9A39A] bg-white p-6 text-center transition-colors hover:border-[#1A1A1A]">
          <ImagePlus className="mx-auto mb-2" size={26} />
          <span className="block text-sm font-medium">Wybierz zdjęcia produktu</span>
          <span className="mt-1 block text-xs text-[#8C8A85]">JPG, PNG lub WEBP, maksymalnie 10 MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onFilesChange}
            className="mt-4 block w-full text-sm"
          />
          {files.length > 0 && (
            <div className="mt-4 border-t border-[#E5E0D8] pt-4 text-left">
              <p className="text-xs uppercase tracking-[0.14em] text-[#5C5A55]">
                Wybrane pliki: {files.length}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[#77736C]">
                {files.map((file) => (
                  <li key={`${file.name}-${file.lastModified}`} className="truncate">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </label>
      </section>
    </div>

    <div className="mt-7 flex justify-end border-t border-[#E5E0D8] pt-5">
      <button
        type="submit"
        disabled={saving}
        className={`${buttonClass} min-w-44 border-[#C25934] bg-[#C25934] text-white hover:bg-[#A94A2B]`}
      >
        {editingProduct ? <Save size={16} /> : <PackagePlus size={16} />}
        {saving ? "Zapisywanie..." : editingProduct ? "Zapisz zmiany" : "Dodaj produkt"}
      </button>
    </div>
  </form>
);

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (requestError) {
      setError(getApiError(requestError, "Nie udało się pobrać panelu administratora"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products],
  );

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onToggleCategory = (slug) => {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(slug)
        ? current.categories.filter((item) => item !== slug)
        : [...current.categories, slug],
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFiles([]);
    setEditingProduct(null);
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFiles([]);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim() || null,
    description: form.description.trim() || null,
    price: Number(form.price),
    brand: form.brand.trim() || null,
    size: form.size.trim() || null,
    gender: form.gender || null,
    stock: Number(form.stock || 0),
    is_active: form.is_active,
    is_new: form.is_new,
    categories: form.categories,
    discount: form.discount_enabled
      ? {
          discount_percent: Number(form.discount_percent),
          is_active: true,
          starts_at: form.discount_starts_at || null,
          ends_at: form.discount_ends_at || null,
        }
      : null,
  });

  const uploadSelectedFiles = async (productId, currentImageCount = 0) => {
    for (let index = 0; index < files.length; index += 1) {
      await uploadAdminProductImage(productId, files[index], currentImageCount + index);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = buildPayload();

      if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0) {
        throw new Error("Podaj prawidłową nazwę i cenę produktu");
      }

      if (
        payload.discount &&
        (!payload.discount.discount_percent || payload.discount.discount_percent >= 100)
      ) {
        throw new Error("Rabat musi być większy od 0 i mniejszy od 100%");
      }

      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateAdminProduct(editingProduct.id, payload);
        await uploadSelectedFiles(editingProduct.id, editingProduct.images?.length || 0);
        setMessage("Produkt został zaktualizowany.");
      } else {
        savedProduct = await createAdminProduct(payload);
        await uploadSelectedFiles(savedProduct.id, 0);
        setMessage("Produkt został dodany.");
      }

      resetForm();
      await loadData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(getApiError(requestError, "Nie udało się zapisać produktu"));
    } finally {
      setSaving(false);
    }
  };

  const onDisable = async (product) => {
    const confirmed = window.confirm(`Wyłączyć produkt „${product.name}”?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await disableAdminProduct(product.id);
      setMessage("Produkt został wyłączony.");
      await loadData();
    } catch (requestError) {
      setError(getApiError(requestError, "Nie udało się wyłączyć produktu"));
    }
  };

  const onDeleteImage = async (productId, imagePath) => {
    const confirmed = window.confirm("Usunąć to zdjęcie?");
    if (!confirmed) return;

    try {
      await deleteAdminProductImage(productId, imagePath);
      setMessage("Zdjęcie zostało usunięte.");
      await loadData();
    } catch (requestError) {
      setError(getApiError(requestError, "Nie udało się usunąć zdjęcia"));
    }
  };

  const onCreateCategory = async (event) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;

    setCreatingCategory(true);
    setError("");

    try {
      await createAdminCategory(name);
      setCategoryName("");
      const data = await fetchAdminCategories();
      setCategories(data.categories || []);
      setMessage("Kategoria została dodana.");
    } catch (requestError) {
      setError(getApiError(requestError, "Nie udało się dodać kategorii"));
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <h1 className="mt-2 text-3xl font-medium text-[#1A1A1A] lg:text-4xl">
            Panel Administratora
          </h1>
          <p className="mt-2 text-sm text-[#5C5A55]">
            Produkty: {products.length} · aktywne: {activeCount}
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className={`${buttonClass} border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Odśwież
        </button>
      </div>

      {error && (
        <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-5 border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(440px,0.95fr)_minmax(0,1.35fr)]">
        <div className="space-y-5">
          <ProductForm
            categories={categories}
            editingProduct={editingProduct}
            form={form}
            files={files}
            saving={saving}
            onChange={onChange}
            onToggleCategory={onToggleCategory}
            onFilesChange={(event) => setFiles(Array.from(event.target.files || []))}
            onSubmit={onSubmit}
            onCancel={resetForm}
          />

          <form onSubmit={onCreateCategory} className={`${panelClass} p-5`}>
            <div className="border-b border-[#E5E0D8] pb-4">
              <h2 className="text-lg font-medium text-[#1A1A1A]">Dodaj kategorię</h2>
              <p className="mt-1 text-xs text-[#77736C]">Nowa kategoria pojawi się w formularzu produktu.</p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Nazwa kategorii"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={creatingCategory || !categoryName.trim()}
                className={`${buttonClass} shrink-0 border-[#C25934] bg-[#C25934] text-white hover:bg-[#A94A2B]`}
              >
                Dodaj
              </button>
            </div>
          </form>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between border-b border-[#E5E0D8] pb-4">
            <div>
              <h2 className="text-2xl font-medium text-[#1A1A1A]">Produkty</h2>
              <p className="mt-1 text-xs text-[#77736C]">Kliknij „Edytuj”, aby wczytać dane do formularza.</p>
            </div>
          </div>

          {loading ? (
            <div className={`${panelClass} p-10 text-center text-sm text-[#5C5A55]`}>
              Pobieranie produktów...
            </div>
          ) : products.length === 0 ? (
            <div className={`${panelClass} p-10 text-center text-sm text-[#5C5A55]`}>
              Nie ma jeszcze żadnych produktów.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const firstImage = product.images?.[0]?.image_path;
                return (
                  <article
                    key={product.id}
                    className={`${panelClass} p-4 sm:p-5 ${
                      product.is_active ? "" : "bg-[#F5F3EF]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="aspect-[4/5] w-20 shrink-0 overflow-hidden border border-[#E5E0D8] bg-[#F2F0EC] sm:w-24">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[#8C8A85]">
                            Brak zdjęcia
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs uppercase tracking-[0.14em] text-[#8C8A85]">
                              #{product.id} · {product.slug}
                            </p>
                            <h3 className="mt-1 text-lg font-medium text-[#1A1A1A]">
                              {product.name}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-[#5C5A55]">
                              {product.brand || "Bez marki"} · {product.size || "Brak rozmiaru"} · stan: {product.stock}
                            </p>
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <p className="font-medium text-[#1A1A1A]">
                              {Number(product.price).toFixed(2)} zł
                            </p>
                            <span
                              className={`mt-2 inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                                product.is_active
                                  ? "border-green-700 text-green-700"
                                  : "border-red-700 text-red-700"
                              }`}
                            >
                              {product.is_active ? "Aktywny" : "Wyłączony"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(product.categories || []).map((category) => (
                            <span
                              key={category.id}
                              className="border border-[#D8D2C8] bg-[#F9F8F6] px-2 py-1 text-xs text-[#5C5A55]"
                            >
                              {category.name}
                            </span>
                          ))}
                          {product.is_new && (
                            <span className="border border-[#C25934] px-2 py-1 text-xs text-[#C25934]">
                              Nowość
                            </span>
                          )}
                          {product.discount && (
                            <span className="border border-[#C25934] bg-[#FFF8F4] px-2 py-1 text-xs text-[#C25934]">
                              -{product.discount.discount_percent}%
                            </span>
                          )}
                        </div>

                        {product.images?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E5E0D8] pt-4">
                            {product.images.map((image) => (
                              <div
                                key={image.image_path}
                                className="group relative aspect-[4/5] w-10 overflow-hidden border border-[#E5E0D8] bg-[#F2F0EC]"
                              >
                                <img
                                  src={image.image_path}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => onDeleteImage(product.id, image.image_path)}
                                  className="absolute inset-0 hidden items-center justify-center bg-black/65 text-white group-hover:flex"
                                  aria-label="Usuń zdjęcie"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E5E0D8] pt-4">
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            className={`${buttonClass} border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
                          >
                            <Edit3 size={15} />
                            Edytuj
                          </button>
                          {product.is_active && (
                            <button
                              type="button"
                              onClick={() => onDisable(product)}
                              className={`${buttonClass} border-red-700 bg-white text-red-700 hover:bg-red-50`}
                            >
                              <Power size={15} />
                              Wyłącz
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
