import { useNavigate } from "react-router-dom";
import itbLogo from "../assets/institut-teknologi-bandung.png";
import { useEffect } from "react";

export function LoginPage() {
  const SSO_BASE = import.meta.env.VITE_SSO_BASE_URL;
  const navigate = useNavigate();

  const handleLogin = () => {
    const callbackUrl = `${window.location.origin}`;
    const redirectUrl = `${SSO_BASE}/login/auth?callbackUrl=${encodeURIComponent(
      callbackUrl,
    )}`;

    window.location.href = redirectUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);

      params.delete("token");
      const cleanUrl = `${window.location.origin}${window.location.pathname}${
        params.toString() ? "?" + params.toString() : ""
      }`;
      window.history.replaceState({}, "", cleanUrl);

      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 font-sans relative">
        {/* logo + title */}
        <div className="flex flex-col items-center text-center space-y-4 relative">
          <img
            className="w-36 h-36" /* 144 px, adjust as you like */
            src={itbLogo}
            alt="ITB Shuttle & Bus Schedule"
          />
          <h3 className="text-xl font-light tracking-wide">
            ITB Shuttle &amp; Bus Schedule
          </h3>
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="absolute self-center bottom-12 w-4/5 max-w-md py-4 rounded-full bg-[#5A82FC] text-white text-lg font-medium shadow-md hover:bg-[#4670e5] active:scale-95 transition"
      >
        Sign in SSO
      </button>
    </>
  );
}
