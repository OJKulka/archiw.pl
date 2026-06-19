import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "../components/Logo";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { NAV } from "../constants/testIds";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export const Header = () => {
  const { t, lang, toggle } = useLang();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    setSearchOpen(false);
    setSearchVal("");
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F9F8F6]/85 backdrop-blur-xl border-b border-[#E5E0D8]">
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 h-20 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <button
            className="lg:hidden text-[#1A1A1A]"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="menu"
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Logo />
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          <Link
            to="/?filter=new"
            data-testid={NAV.linkNew}
            className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C25934] transition-colors"
          >
            {t.nav.new}
          </Link>
          <Link
            to="/?filter=sale"
            data-testid={NAV.linkSale}
            className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C25934] transition-colors"
          >
            {t.nav.sale}
          </Link>
          <a
            href="https://www.instagram.com/archiw.pl/"
            target="_blank"
            rel="noreferrer"
            data-testid={NAV.linkInstagram}
            className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C25934] transition-colors"
          >
            {t.nav.instagram}
          </a>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-medium text-[#C25934] transition-colors hover:text-[#1A1A1A]"
            >
              AdminPanel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {searchOpen ? (
            <form onSubmit={onSearch} className="flex items-center border-b border-[#1A1A1A]">
              <input
                autoFocus
                data-testid={NAV.searchInput}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={t.nav.search}
                className="bg-transparent text-sm w-32 sm:w-48 outline-none py-1 placeholder:text-[#8C8A85]"
              />
              <button
                type="submit"
                data-testid={NAV.searchButton}
                className="text-[#1A1A1A] pl-2"
                aria-label="search"
              >
                <Search size={16} />
              </button>
            </form>
          ) : (
            <button
              data-testid={NAV.searchButton}
              onClick={() => setSearchOpen(true)}
              className="text-[#1A1A1A] hover:text-[#C25934] transition-colors p-2"
              aria-label="search"
            >
              <Search size={18} />
            </button>
          )}

          <button
            data-testid={NAV.langSwitch}
            onClick={toggle}
            className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C25934] transition-colors px-2"
          >
            {lang === "pl" ? "EN" : "PL"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid={NAV.accountButton}
                className="text-[#1A1A1A] hover:text-[#C25934] transition-colors p-2"
                aria-label="account"
              >
                <User size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#F9F8F6] border-[#E5E0D8] rounded-none min-w-[200px]"
            >
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-[#5C5A55]">{user.email}</div>
                  <DropdownMenuSeparator className="bg-[#E5E0D8]" />
                  <DropdownMenuItem
                    data-testid={NAV.accountMenuAccount}
                    onClick={() => navigate("/account")}
                    className="rounded-none cursor-pointer text-sm uppercase tracking-[0.15em]"
                  >
                    {t.nav.myAccount}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-testid={NAV.accountMenuLogout}
                    onClick={logout}
                    className="rounded-none cursor-pointer text-sm uppercase tracking-[0.15em]"
                  >
                    {t.nav.logout}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    data-testid={NAV.accountMenuLogin}
                    onClick={() => navigate("/login")}
                    className="rounded-none cursor-pointer text-sm uppercase tracking-[0.15em]"
                  >
                    {t.nav.login}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-testid={NAV.accountMenuRegister}
                    onClick={() => navigate("/register")}
                    className="rounded-none cursor-pointer text-sm uppercase tracking-[0.15em]"
                  >
                    {t.nav.register}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/cart"
            data-testid={NAV.cartButton}
            className="relative text-[#1A1A1A] hover:text-[#C25934] transition-colors p-2"
            aria-label="cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span
                data-testid={NAV.cartBadge}
                className="absolute -top-0.5 -right-0.5 bg-[#1A1A1A] text-[#F9F8F6] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-[#E5E0D8] bg-[#F9F8F6] px-5 py-4 flex flex-col gap-3">
          <Link
            to="/?filter=new"
            onClick={() => setMobileOpen(false)}
            className="text-sm uppercase tracking-[0.2em]"
          >
            {t.nav.new}
          </Link>
          <Link
            to="/?filter=sale"
            onClick={() => setMobileOpen(false)}
            className="text-sm uppercase tracking-[0.2em]"
          >
            {t.nav.sale}
          </Link>
          <a
            href="https://instagram.com/archiw.pl/"
            target="_blank"
            rel="noreferrer"
            className="text-sm uppercase tracking-[0.2em]"
          >
            {t.nav.instagram}
          </a>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C25934] transition-colors"
            >
              AdminPanel
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};
