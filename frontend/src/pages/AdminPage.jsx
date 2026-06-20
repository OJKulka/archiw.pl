import { useState } from "react";

import AdminCategoriesSection from "../components/admin/AdminCategoriesSection";
import AdminPlaceholder from "../components/admin/AdminPlaceholder";
import AdminProductsSection from "../components/admin/AdminProductsSection";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("products");

  return (
    <main className="mx-auto w-full max-w-[1700px] px-2 py-4 sm:px-5 sm:py-8 lg:px-10 lg:py-12">
      <div className="flex w-full items-start gap-3 sm:gap-6 xl:gap-8">
        <div className="w-44 shrink-0 sm:w-56">
          <AdminSidebar
            activeSection={activeSection}
            onChange={setActiveSection}
          />
        </div>

        <div className="min-w-0 flex-1">
          {activeSection === "products" && (
            <AdminProductsSection initialView="list" />
          )}

          {activeSection === "add-product" && (
            <AdminProductsSection initialView="form" />
          )}

          {activeSection === "categories" && (
            <AdminCategoriesSection />
          )}

          {activeSection === "orders" && (
            <AdminPlaceholder type="orders" />
          )}

          {activeSection === "users" && (
            <AdminPlaceholder type="users" />
          )}
        </div>
      </div>
    </main>
  );
}
