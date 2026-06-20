import { Construction } from "lucide-react";

import { useLang } from "../../context/LanguageContext";

export default function AdminPlaceholder({ type }) {
  const { t } = useLang();

  const title =
    type === "orders" ? t.admin.orders : t.admin.users;

  const description =
    type === "orders"
      ? t.admin.ordersPlaceholder
      : t.admin.usersPlaceholder;

  return (
    <section>
      <div className="border-b border-[#E5E0D8] pb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#77736C]">
          {t.admin.panel}
        </p>
        <h1 className="mt-2 text-3xl font-medium text-[#1A1A1A]">
          {title}
        </h1>
      </div>

      <div className="mt-6 border border-[#D8D2C8] bg-white p-10 text-center">
        <Construction
          className="mx-auto text-[#8C8A85]"
          size={34}
        />
        <p className="mt-4 text-base font-medium text-[#1A1A1A]">
          {t.admin.sectionInProgress}
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5C5A55]">
          {description}
        </p>
      </div>
    </section>
  );
}
