import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(
  () => localStorage.getItem("language") || "pl"
);

  useEffect(() => {
    localStorage.setItem("archiw_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggle: () => setLang((p) => (p === "pl" ? "en" : "pl")),
      t: translations[lang],
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};
