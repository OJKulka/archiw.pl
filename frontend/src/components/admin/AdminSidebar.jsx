import {
  List,
  PackagePlus,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";

import { useLang } from "../../context/LanguageContext";

const itemClass =
  "flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left text-sm transition-colors";

export default function AdminSidebar({ activeSection, onChange }) {
  const { t } = useLang();

  const items = [
    {
      id: "products",
      label: t.admin.sidebar.products,
      icon: List,
    },
    {
      id: "add-product",
      label: t.admin.sidebar.addProduct,
      icon: PackagePlus,
    },
    {
      id: "categories",
      label: t.admin.sidebar.categories,
      icon: Tags,
    },
    {
      id: "orders",
      label: t.admin.sidebar.orders,
      icon: ShoppingBag,
    },
    {
      id: "users",
      label: t.admin.sidebar.users,
      icon: Users,
    },
  ];

  return (
    <aside className="sticky top-3 w-full self-start overflow-hidden border border-[#D8D2C8] bg-white sm:top-6">
      <div className="border-b border-[#E5E0D8] px-4 py-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#77736C]">
          ARCHIW
        </p>

        <h2 className="mt-1 truncate text-base font-medium text-[#1A1A1A]">
          {t.admin.title}
        </h2>
      </div>

      <nav
        className="block"
        aria-label={t.admin.sidebar.navigation}
      >
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`${itemClass} ${
                active
                  ? "border-[#C25934] bg-[#FFF8F4] text-[#C25934]"
                  : "border-transparent text-[#4F4C47] hover:bg-[#F7F5F1] hover:text-[#1A1A1A]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={17} className="shrink-0" />

              <span className="min-w-0 truncate">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
