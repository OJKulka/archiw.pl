import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  Edit3,
  ImagePlus,
  PackagePlus,
  Power,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

import {
  createAdminProduct,
  deleteAdminProductImage,
  disableAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  getApiError,
  updateAdminProduct,
  uploadAdminProductImage,
} from "../../lib/api";
import { useLang } from "../../context/LanguageContext";

const EMPTY_FORM = {
  name: "",
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

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );

  return local.toISOString().slice(0, 16);
};

const productToForm = (product) => ({
  name: product.name || "",
  description: product.description || "",
  price: product.price ?? "",
  brand: product.brand || "",
  size: product.size || "",
  gender: product.gender || "unisex",
  stock: product.stock ?? 0,
  is_active: Boolean(product.is_active),
  is_new: Boolean(product.is_new),
  categories: (product.categories || []).map(
    (category) => category.slug,
  ),
  discount_enabled: Boolean(product.discount),
  discount_percent:
    product.discount?.discount_percent ?? "",
  discount_starts_at: normalizeDateForInput(
    product.discount?.starts_at,
  ),
  discount_ends_at: normalizeDateForInput(
    product.discount?.ends_at,
  ),
});

function ProductForm({
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
  t,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`${panelClass} p-5 sm:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#77736C]">
            {editingProduct
              ? t.admin.form.productNumber.replace(
                  "{id}",
                  String(editingProduct.id),
                )
              : t.admin.form.newProduct}
          </p>

          <h2 className="mt-2 text-2xl font-medium text-[#1A1A1A]">
            {editingProduct
              ? t.admin.form.editProduct
              : t.admin.actions.addProduct}
          </h2>

          <p className="mt-2 text-sm text-[#77736C]">
            {t.admin.form.requiredFields}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className={`${buttonClass} border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
        >
          <ArrowLeft size={16} />
          {t.admin.actions.backToProducts}
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <h3 className="mb-4 text-lg font-medium text-[#1A1A1A]">
            {t.admin.form.sections.productData}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>
                {t.admin.form.fields.name} *
              </span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className={inputClass}
                required
              />
            </label>

            <label>
              <span className={labelClass}>
                {t.admin.form.fields.price} *
              </span>
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={onChange}
                className={inputClass}
                required
              />
            </label>

            <label>
              <span className={labelClass}>
                {t.admin.form.fields.brand}
              </span>
              <input
                name="brand"
                value={form.brand}
                onChange={onChange}
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>
                {t.admin.form.fields.size}
              </span>
              <select
                name="size"
                value={form.size}
                onChange={onChange}
                className={inputClass}
              >
                <option value="">
                  {t.admin.products.noSize}
                </option>
                {["XS", "S", "M", "L", "XL"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>
                {t.admin.form.fields.gender}
              </span>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className={inputClass}
              >
                <option value="unisex">
                  {t.filter.genderUnisex}
                </option>
                <option value="male">
                  {t.filter.genderMen}
                </option>
                <option value="female">
                  {t.filter.genderWomen}
                </option>
              </select>
            </label>

            <label>
              <span className={labelClass}>
                {t.admin.form.fields.stock}
              </span>
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
              <span className={labelClass}>
                {t.admin.form.fields.description}
              </span>
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={onChange}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="mb-4 text-lg font-medium text-[#1A1A1A]">
            {t.admin.form.sections.categoriesVisibility}
          </h3>

          <div>
            <p className={labelClass}>
              {t.admin.form.fields.categories}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {categories.length === 0 && (
                <span className="text-sm text-[#8C8A85]">
                  {t.admin.categories.empty}
                </span>
              )}

              {categories.map((category) => {
                const selected = form.categories.includes(
                  category.slug,
                );

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
                      onChange={() =>
                        onToggleCategory(category.slug)
                      }
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
                <span className="block font-medium">
                  {t.admin.form.visibility.activeTitle}
                </span>
                <span className="mt-0.5 block text-xs text-[#77736C]">
                  {t.admin.form.visibility.activeDescription}
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 border border-[#D8D2C8] bg-white p-4 text-sm">
              <input
                name="is_new"
                type="checkbox"
                checked={form.is_new}
                onChange={onChange}
              />
              <span>
                <span className="block font-medium">
                  {t.product.new}
                </span>
                <span className="mt-0.5 block text-xs text-[#77736C]">
                  {t.admin.form.visibility.newDescription}
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className="mb-4 text-lg font-medium text-[#1A1A1A]">
            {t.admin.form.sections.discount}
          </h3>

          <label className="flex cursor-pointer items-center gap-3 border border-[#D8D2C8] bg-white p-4 text-sm">
            <input
              name="discount_enabled"
              type="checkbox"
              checked={form.discount_enabled}
              onChange={onChange}
            />
            {t.admin.form.discount.enable}
          </label>

          {form.discount_enabled && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label>
                <span className={labelClass}>
                  {t.admin.form.fields.discountPercent} *
                </span>
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
                <span className={labelClass}>
                  {t.admin.form.fields.discountStart}
                </span>
                <input
                  name="discount_starts_at"
                  type="datetime-local"
                  value={form.discount_starts_at}
                  onChange={onChange}
                  className={inputClass}
                />
              </label>

              <label>
                <span className={labelClass}>
                  {t.admin.form.fields.discountEnd}
                </span>
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
            <h3 className="text-lg font-medium text-[#1A1A1A]">
              {t.admin.form.sections.images}
            </h3>
            <p className="mt-1 text-sm text-[#77736C]">
              {t.admin.form.images.description}
            </p>
          </div>

          <label className="block cursor-pointer border border-dashed border-[#A9A39A] bg-white p-6 text-center transition-colors hover:border-[#1A1A1A]">
            <ImagePlus className="mx-auto mb-2" size={26} />
            <span className="block text-sm font-medium">
              {t.admin.form.images.choose}
            </span>
            <span className="mt-1 block text-xs text-[#8C8A85]">
              {t.admin.form.images.supportedFormats}
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesChange}
              className="mt-4 block w-full text-sm"
            />

            {files.length > 0 && (
              <div className="mt-4 border-t border-[#E5E0D8] pt-4 text-left">
                <p className="text-xs uppercase tracking-[0.14em] text-[#5C5A55]">
                  {t.admin.form.images.selectedFiles.replace(
                    "{count}",
                    String(files.length),
                  )}
                </p>

                <ul className="mt-2 space-y-1 text-xs text-[#77736C]">
                  {files.map((file) => (
                    <li
                      key={`${file.name}-${file.lastModified}`}
                      className="truncate"
                    >
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
          {editingProduct ? (
            <Save size={16} />
          ) : (
            <PackagePlus size={16} />
          )}

          {saving
            ? t.admin.actions.saving
            : editingProduct
              ? t.admin.actions.saveChanges
              : t.admin.actions.addProduct}
        </button>
      </div>
    </form>
  );
}

export default function AdminProductsSection({
  initialView = "list",
}) {
  const { t } = useLang();
  const [view, setView] = useState(initialView);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsData, categoriesData] =
        await Promise.all([
          fetchAdminProducts(),
          fetchAdminCategories(),
        ]);

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          t.admin.error.panelLoad,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [t.admin.error.panelLoad]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setView(initialView);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFiles([]);
  }, [initialView]);

  const activeCount = useMemo(
    () =>
      products.filter((product) => product.is_active).length,
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
        ? current.categories.filter(
            (item) => item !== slug,
          )
        : [...current.categories, slug],
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFiles([]);
    setEditingProduct(null);
    setView("list");
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFiles([]);
    setEditingProduct(null);
    setError("");
    setMessage("");
    setView("form");
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFiles([]);
    setError("");
    setMessage("");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => ({
    name: form.name.trim(),
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
          discount_percent: Number(
            form.discount_percent,
          ),
          is_active: true,
          starts_at:
            form.discount_starts_at || null,
          ends_at:
            form.discount_ends_at || null,
        }
      : null,
  });

  const uploadSelectedFiles = async (
    productId,
    currentImageCount = 0,
  ) => {
    for (
      let index = 0;
      index < files.length;
      index += 1
    ) {
      await uploadAdminProductImage(
        productId,
        files[index],
        currentImageCount + index,
      );
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = buildPayload();

      if (
        !payload.name ||
        !Number.isFinite(payload.price) ||
        payload.price <= 0
      ) {
        throw new Error(
          t.admin.error.invalidProduct,
        );
      }

      if (
        payload.discount &&
        (!payload.discount.discount_percent ||
          payload.discount.discount_percent >= 100)
      ) {
        throw new Error(
          t.admin.error.invalidDiscount,
        );
      }

      let savedProduct;

      if (editingProduct) {
        savedProduct = await updateAdminProduct(
          editingProduct.id,
          payload,
        );

        await uploadSelectedFiles(
          editingProduct.id,
          editingProduct.images?.length || 0,
        );

        setMessage(t.admin.success.productUpdated);
      } else {
        savedProduct = await createAdminProduct(payload);
        await uploadSelectedFiles(savedProduct.id, 0);
        setMessage(t.admin.success.productCreated);
      }

      setForm(EMPTY_FORM);
      setFiles([]);
      setEditingProduct(null);
      await loadData();
      setView("list");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          t.admin.error.productSave,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDisable = async (product) => {
    const confirmed = window.confirm(
      t.admin.confirm.disableProduct.replace(
        "{name}",
        product.name,
      ),
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await disableAdminProduct(product.id);
      setMessage(t.admin.success.productDisabled);
      await loadData();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          t.admin.error.productDisable,
        ),
      );
    }
  };

  const onDeleteImage = async (
    productId,
    imagePath,
  ) => {
    const confirmed = window.confirm(
      t.admin.confirm.deleteImage,
    );

    if (!confirmed) return;

    try {
      await deleteAdminProductImage(
        productId,
        imagePath,
      );
      setMessage(t.admin.success.imageDeleted);
      await loadData();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          t.admin.error.imageDelete,
        ),
      );
    }
  };

  return (
    <section>
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

      {view === "form" ? (
        <ProductForm
          categories={categories}
          editingProduct={editingProduct}
          form={form}
          files={files}
          saving={saving}
          onChange={onChange}
          onToggleCategory={onToggleCategory}
          onFilesChange={(event) =>
            setFiles(
              Array.from(event.target.files || []),
            )
          }
          onSubmit={onSubmit}
          onCancel={resetForm}
          t={t}
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E0D8] pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#77736C]">
                {t.admin.title}
              </p>

              <h1 className="mt-2 text-3xl font-medium text-[#1A1A1A]">
                {t.admin.products.title}
              </h1>

              <p className="mt-2 text-sm text-[#5C5A55]">
                {t.admin.stats.summary
                  .replace(
                    "{all}",
                    String(products.length),
                  )
                  .replace(
                    "{active}",
                    String(activeCount),
                  )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className={`${buttonClass} border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
              >
                <RefreshCw
                  size={16}
                  className={
                    loading ? "animate-spin" : ""
                  }
                />
                {t.admin.actions.refresh}
              </button>

              <button
                type="button"
                onClick={openCreate}
                className={`${buttonClass} border-[#C25934] bg-[#C25934] text-white hover:bg-[#A94A2B]`}
              >
                <PackagePlus size={16} />
                {t.admin.actions.addProduct}
              </button>
            </div>
          </div>

          {loading ? (
            <div
              className={`${panelClass} p-10 text-center text-sm text-[#5C5A55]`}
            >
              {t.admin.products.loading}
            </div>
          ) : products.length === 0 ? (
            <div
              className={`${panelClass} p-10 text-center text-sm text-[#5C5A55]`}
            >
              {t.admin.products.empty}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const firstImage =
                  product.images?.[0]?.image_path;

                return (
                  <article
                    key={product.id}
                    className={`${panelClass} p-4 sm:p-5 ${
                      product.is_active
                        ? ""
                        : "bg-[#F5F3EF]"
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
                            {t.admin.products.noImage}
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
                              {product.brand ||
                                t.admin.products.noBrand}
                              {" · "}
                              {product.size ||
                                t.admin.products.noSize}
                              {" · "}
                              {t.admin.products.stock}:{" "}
                              {product.stock}
                            </p>
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <p className="font-medium text-[#1A1A1A]">
                              {Number(
                                product.price,
                              ).toFixed(2)}{" "}
                              zł
                            </p>

                            <span
                              className={`mt-2 inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                                product.is_active
                                  ? "border-green-700 text-green-700"
                                  : "border-red-700 text-red-700"
                              }`}
                            >
                              {product.is_active
                                ? t.admin.products.active
                                : t.admin.products.disabled}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(product.categories || []).map(
                            (category) => (
                              <span
                                key={category.id}
                                className="border border-[#D8D2C8] bg-[#F9F8F6] px-2 py-1 text-xs text-[#5C5A55]"
                              >
                                {category.name}
                              </span>
                            ),
                          )}

                          {product.is_new && (
                            <span className="border border-[#C25934] px-2 py-1 text-xs text-[#C25934]">
                              {t.product.new}
                            </span>
                          )}

                          {product.discount && (
                            <span className="border border-[#C25934] bg-[#FFF8F4] px-2 py-1 text-xs text-[#C25934]">
                              -
                              {
                                product.discount
                                  .discount_percent
                              }
                              %
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
                                  onClick={() =>
                                    onDeleteImage(
                                      product.id,
                                      image.image_path,
                                    )
                                  }
                                  className="absolute inset-0 hidden items-center justify-center bg-black/65 text-white group-hover:flex"
                                  aria-label={
                                    t.admin.actions.deleteImage
                                  }
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
                            onClick={() =>
                              startEditing(product)
                            }
                            className={`${buttonClass} border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
                          >
                            <Edit3 size={15} />
                            {t.admin.actions.edit}
                          </button>

                          {product.is_active && (
                            <button
                              type="button"
                              onClick={() =>
                                onDisable(product)
                              }
                              className={`${buttonClass} border-red-700 bg-white text-red-700 hover:bg-red-50`}
                            >
                              <Power size={15} />
                              {t.admin.actions.disable}
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
        </>
      )}
    </section>
  );
}
