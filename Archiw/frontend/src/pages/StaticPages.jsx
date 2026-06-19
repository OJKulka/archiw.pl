import { useLang } from "../context/LanguageContext";

const Page = ({ title, body }) => (
  <div className="max-w-3xl mx-auto px-5 py-24 space-y-8">
    <span className="text-[10px] uppercase tracking-[0.3em] text-[#5C5A55]">ARCHIW</span>
    <h1 className="font-serif text-5xl tracking-tighter">{title}</h1>
    <div className="text-[#5C5A55] leading-relaxed space-y-4">{body}</div>
  </div>
);

export const TermsPage = () => {
  const { t, lang } = useLang();
  const body =
    lang === "pl" ? (
      <>
        <p>
          Niniejszy regulamin określa zasady korzystania ze sklepu internetowego ARCHIW. Sklep
          oferuje starannie wyselekcjonowane ubrania vintage i designerskie.
        </p>
        <p>
          Składając zamówienie, Klient akceptuje postanowienia regulaminu. Ceny podawane są w
          polskich złotych (PLN) i zawierają podatek VAT.
        </p>
      </>
    ) : (
      <>
        <p>
          These terms govern your use of ARCHIW online store. We offer carefully curated vintage and
          designer pieces.
        </p>
        <p>
          By placing an order, you accept these terms. Prices are listed in Polish złoty (PLN),
          including VAT.
        </p>
      </>
    );
  return <Page title={t.footer.terms} body={body} />;
};

export const ReturnsPage = () => {
  const { t, lang } = useLang();
  const body =
    lang === "pl" ? (
      <p>
        Klient ma prawo odstąpić od umowy w terminie 14 dni od otrzymania zamówienia, bez podania
        przyczyny. Skontaktuj się z nami przez Instagram lub e-mail.
      </p>
    ) : (
      <p>
        You have the right to withdraw from the contract within 14 days of receiving your order, no
        reason required. Reach out via Instagram or email.
      </p>
    );
  return <Page title={t.footer.returns} body={body} />;
};

export const PrivacyPage = () => {
  const { t, lang } = useLang();
  const body =
    lang === "pl" ? (
      <p>
        Twoje dane są przetwarzane wyłącznie w celu realizacji zamówień. Nie udostępniamy ich osobom
        trzecim poza dostawcami płatności (Stripe) i kurierami.
      </p>
    ) : (
      <p>
        Your data is processed solely for order fulfilment. We do not share it with third parties
        beyond our payment provider (Stripe) and shipping couriers.
      </p>
    );
  return <Page title={t.footer.privacy} body={body} />;
};
