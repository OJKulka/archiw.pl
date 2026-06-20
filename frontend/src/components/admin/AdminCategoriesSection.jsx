import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Tags } from "lucide-react";

import {
  createAdminCategory,
  fetchAdminCategories,
  getApiError,
} from "../../lib/api";
import { useLang } from "../../context/LanguageContext";

const inputClass =
  "w-full border border-[#D8D2C8] bg-[#FDFCFB] px-3 py-3 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#A09D97] focus:border-[#1A1A1A] focus:bg-white";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminCategoriesSection() {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminCategories();
      setCategories(data.categories || []);
    } catch (requestError) {
      setError(
        getApiError(requestError, t.admin.error.categoriesLoad),
      );
    } finally {
      setLoading(false);
    }
  }, [t.admin.error.categoriesLoad]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createAdminCategory(cleanName);
      setName("");
      setMessage(t.admin.success.categoryCreated);
      await loadCategories();
    } catch (requestError) {
      setError(
        getApiError(requestError, t.admin.error.categoryCreate),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#77736C]">
            {t.admin.title}
          </p>
          <h1 className="mt-2 text-3xl font-medium text-[#1A1A1A]">
            {t.admin.sidebar.categories}
          </h1>
          <p className="mt-2 text-sm text-[#5C5A55]">
            {t.admin.categories.count.replace(
              "{count}",
              String(categories.length),
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadCategories}
          disabled={loading}
          className={`${buttonClass} border-[#D8D2C8] bg-white text-[#1A1A1A] hover:bg-[#F2F0EC]`}
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          {t.admin.actions.refresh}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
        <form
          onSubmit={onSubmit}
          className="border border-[#D8D2C8] bg-white p-5"
        >
          <div className="border-b border-[#E5E0D8] pb-4">
            <h2 className="text-xl font-medium text-[#1A1A1A]">
              {t.admin.categories.addTitle}
            </h2>
            <p className="mt-1 text-sm text-[#77736C]">
              {t.admin.categories.addTitleHelp}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                {t.admin.form.fields.categoryName}
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                placeholder={t.admin.form.fields.categoryNamePlaceholder}
                required
              />
            </label>

          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className={`${buttonClass} mt-5 w-full border-[#C25934] bg-[#C25934] text-white hover:bg-[#A94A2B]`}
          >
            <Plus size={16} />
            {saving ? t.admin.actions.saving : t.admin.actions.add}
          </button>
        </form>

        <div className="border border-[#D8D2C8] bg-white">
          <div className="border-b border-[#E5E0D8] px-5 py-4">
            <h2 className="text-xl font-medium text-[#1A1A1A]">
              {t.admin.categories.listTitle}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-[#5C5A55]">
              {t.admin.categories.loading}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <Tags className="mx-auto text-[#8C8A85]" size={28} />
              <p className="mt-3 text-sm text-[#5C5A55]">
                {t.admin.categories.empty}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E0D8]">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#1A1A1A]">
                      {category.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#77736C]">
                      /{category.slug}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-[#8C8A85]">
                    #{category.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
