import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { processGoogleSession } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");
    if (!sessionId) {
      navigate("/login");
      return;
    }
    processGoogleSession(sessionId)
      .then(() => {
        window.history.replaceState({}, document.title, "/");
        navigate("/", { replace: true });
      })
      .catch(() => navigate("/login"));
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[#5C5A55]">...</p>
    </div>
  );
}
