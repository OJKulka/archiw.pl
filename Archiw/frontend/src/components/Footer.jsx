import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { Logo } from "../components/Logo";

export const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="bg-[#1A1A1A] text-[#F9F8F6] mt-32">
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <Logo inverted />
          <p className="text-sm text-[#A8A59E] max-w-xs leading-relaxed">
            {t.home.heroSubtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A8A59E] mb-2">Info</span>
          <Link
            to="/terms"
            data-testid="footer-terms"
            className="text-sm hover:text-[#C25934] transition-colors"
          >
            {t.footer.terms}
          </Link>
          <Link
            to="/returns"
            data-testid="footer-returns"
            className="text-sm hover:text-[#C25934] transition-colors"
          >
            {t.footer.returns}
          </Link>
          <Link
            to="/privacy"
            data-testid="footer-privacy"
            className="text-sm hover:text-[#C25934] transition-colors"
          >
            {t.footer.privacy}
          </Link>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A8A59E] mb-2">Press</span>
          <span className="text-sm">{t.footer.copy}</span>
        </div>
      </div>
    </footer>
  );
};
