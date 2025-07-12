import { useNavigate } from "react-router-dom";
import itbLogo from "../assets/institut-teknologi-bandung.png";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1M2I3N2NmLTVmYTQtNDFkNi1iZjEwLTY0MmE5NGMwZTE5MSIsInJvbGVfaWQiOjEsImlhdCI6MTc1MjA0MzA4OCwiZXhwIjoxNzUyMzAyMjg4fQ.NeQERirTWZSYY97peShMHO9qO7Hxqwe6aG9KdHS2Fbc";

    localStorage.setItem("accessToken", mockToken); // save token

    navigate("/home");
  };

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

        {/* button sits at bottom of the viewport */}
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
