import { Link } from "react-router-dom";
import { NAV } from "../constants/testIds";
import { useLang } from "../context/LanguageContext";

export const Logo = ({ inverted = false }) => {
  const { t } = useLang();
  return (
    <Link
      to="/"
      data-testid={NAV.logo}
      className={`flex flex-col leading-none select-none ${inverted ? "text-[#F9F8F6]" : "text-[#1A1A1A]"}`}
    >
      <span className="font-serif text-2xl font-bold tracking-tighter">ARCHIW</span>
      <span
        className={`text-[10px] uppercase tracking-[0.3em] mt-0.5 ${inverted ? "text-[#E5E0D8]" : "text-[#5C5A55]"}`}
      >
        {t.footer.tagline}
      </span>
    </Link>
  );
};