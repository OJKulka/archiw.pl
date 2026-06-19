import { useLang } from "../context/LanguageContext";
import { PRODUCT } from "../constants/testIds";

export const EmptyState = ({ onClear }) => {
  const { t } = useLang();
  return (
    <div
      data-testid={PRODUCT.emptyState}
      className="flex flex-col items-center justify-center py-24 px-6 text-center border-t border-b border-[#E5E0D8] gap-6"
    >
      <img
        src="https://images.unsplash.com/photo-1557777586-f6682739fcf3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxmYXNoaW9uJTIwYXJjaGl2ZSUyMGNsb3RoaW5nJTIwbW9kZWx8ZW58MHx8fHwxNzgwOTUzODcyfDA&ixlib=rb-4.1.0&q=85"
        alt="empty archive"
        className="w-40 h-40 object-cover grayscale opacity-60"
      />
      <div className="space-y-2 max-w-md">
        <h3 className="font-serif text-2xl tracking-tight text-[#1A1A1A]">{t.empty.title}</h3>
        <p className="text-sm text-[#5C5A55]">{t.empty.subtitle}</p>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          data-testid="empty-clear-btn"
          className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:text-[#C25934]"
        >
          {t.empty.cta}
        </button>
      )}
    </div>
  );
};
