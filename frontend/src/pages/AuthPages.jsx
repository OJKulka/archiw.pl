import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { toast } from "sonner";
import { AUTH } from "../constants/testIds";

const Wrapper = ({ title, children }) => (
  <div className="max-w-md mx-auto px-5 py-24 space-y-10">
    <div className="text-center space-y-2">
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#5C5A55]">ARCHIW</span>
      <h1 className="font-serif text-4xl tracking-tighter">{title}</h1>
    </div>
    {children}
  </div>
);

const GoogleBtn = ({ label }) => {
  const { loginWithGoogle } = useAuth();
  return (
    <button
      data-testid={AUTH.loginGoogle}
      onClick={loginWithGoogle}
      className="w-full border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F6] transition-colors py-3 text-xs uppercase tracking-[0.25em]"
    >
      {label}
    </button>
  );
};

const Divider = ({ label }) => (
  <div className="flex items-center gap-4">
    <div className="flex-1 h-px bg-[#E5E0D8]" />
    <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C8A85]">{label}</span>
    <div className="flex-1 h-px bg-[#E5E0D8]" />
  </div>
);

export function LoginPage() {
  const { t } = useLang();
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithPassword(email, pw);
      toast.success("OK");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper title={t.auth.loginTitle}>
      <GoogleBtn label={t.auth.withGoogle} />
      <Divider label={t.auth.or} />
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5A55]">
            {t.auth.email}
          </label>
          <input
            data-testid={AUTH.loginEmail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-[#1A1A1A] bg-transparent py-2 outline-none focus:border-[#C25934] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5A55]">
            {t.auth.password}
          </label>
          <input
            data-testid={AUTH.loginPassword}
            type="password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border-b border-[#1A1A1A] bg-transparent py-2 outline-none focus:border-[#C25934] transition-colors"
          />
        </div>
        <button
          data-testid={AUTH.loginSubmit}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#333] py-3 text-xs uppercase tracking-[0.25em] mt-4 disabled:opacity-50"
        >
          {loading ? "..." : t.auth.submit}
        </button>
      </form>
      <p className="text-sm text-center text-[#5C5A55]">
        {t.auth.noAccount}{" "}
        <Link to="/register" className="text-[#1A1A1A] underline underline-offset-4">
          {t.auth.registerTitle}
        </Link>
      </p>
    </Wrapper>
  );
}

export function RegisterPage() {
  const { t } = useLang();
  const { registerWithPassword } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithPassword(name, email, pw);
      toast.success("OK");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper title={t.auth.registerTitle}>
      <GoogleBtn label={t.auth.withGoogle} />
      <Divider label={t.auth.or} />
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5A55]">
            {t.auth.name}
          </label>
          <input
            data-testid={AUTH.registerName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b border-[#1A1A1A] bg-transparent py-2 outline-none focus:border-[#C25934] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5A55]">
            {t.auth.email}
          </label>
          <input
            data-testid={AUTH.registerEmail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-[#1A1A1A] bg-transparent py-2 outline-none focus:border-[#C25934] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5A55]">
            {t.auth.password}
          </label>
          <input
            data-testid={AUTH.registerPassword}
            type="password"
            required
            minLength={12}
            maxLength={32}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border-b border-[#1A1A1A] bg-transparent py-2 outline-none focus:border-[#C25934] transition-colors"
          />
        </div>
        <button
          data-testid={AUTH.registerSubmit}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#333] py-3 text-xs uppercase tracking-[0.25em] mt-4 disabled:opacity-50"
        >
          {loading ? "..." : t.auth.submitRegister}
        </button>
      </form>
      <p className="text-sm text-center text-[#5C5A55]">
        {t.auth.haveAccount}{" "}
        <Link to="/login" className="text-[#1A1A1A] underline underline-offset-4">
          {t.auth.loginTitle}
        </Link>
      </p>
    </Wrapper>
  );
}

export function AccountPage() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  if (!user)
    return (
      <Wrapper title={t.auth.loginTitle}>
        <p className="text-center text-sm text-[#5C5A55]">
          <Link to="/login" className="underline underline-offset-4">
            {t.auth.loginTitle}
          </Link>
        </p>
      </Wrapper>
    );
  return (
    <Wrapper title={t.nav.myAccount}>
      <div className="space-y-4 text-center">
        {user.picture && (
          <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full mx-auto" />
        )}
        <p className="font-serif text-2xl">{user.name}</p>
        <p className="text-sm text-[#5C5A55]">{user.email}</p>
        <button
          onClick={logout}
          className="text-xs uppercase tracking-[0.25em] underline underline-offset-4 hover:text-[#C25934]"
        >
          {t.nav.logout}
        </button>
      </div>
    </Wrapper>
  );
}
