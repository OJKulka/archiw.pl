import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getCheckoutStatus } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { CHECKOUT } from "../constants/testIds";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { t } = useLang();
  const { clear } = useCart();
  const [status, setStatus] = useState("processing");
  const polled = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }
    const poll = async () => {
      if (polled.current >= 8) {
        setStatus("pending");
        return;
      }
      polled.current += 1;
      try {
        const data = await getCheckoutStatus(sessionId);
        if (data.payment_status === "paid") {
          setStatus("success");
          clear();
          return;
        }
        if (data.status === "expired") {
          setStatus("failed");
          return;
        }
        setTimeout(poll, 2000);
      } catch {
        setTimeout(poll, 2500);
      }
    };
    poll();
    // eslint-disable-next-line
  }, [sessionId]);

  const label =
    status === "success"
      ? t.checkout.success
      : status === "pending"
        ? t.checkout.pending
        : status === "failed"
          ? t.checkout.failed
          : t.checkout.processing;

  return (
    <div
      data-testid={CHECKOUT.successPage}
      className="max-w-2xl mx-auto px-5 py-32 text-center space-y-8"
    >
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#5C5A55]">ARCHIW</span>
      <h1 className="font-serif text-5xl tracking-tighter">{t.checkout.thankYou}</h1>
      <p data-testid={CHECKOUT.status} className="text-[#5C5A55]">
        {label}
      </p>
      {status === "success" && <p className="text-sm">{t.checkout.orderConfirmed}</p>}
      <Link
        to="/"
        data-testid={CHECKOUT.backHome}
        className="inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4"
      >
        {t.checkout.backHome}
      </Link>
    </div>
  );
}
