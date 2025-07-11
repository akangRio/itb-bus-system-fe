import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1M2I3N2NmLTVmYTQtNDFkNi1iZjEwLTY0MmE5NGMwZTE5MSIsInJvbGVfaWQiOjEsImlhdCI6MTc1MjA0MzA4OCwiZXhwIjoxNzUyMzAyMjg4fQ.NeQERirTWZSYY97peShMHO9qO7Hxqwe6aG9KdHS2Fbc";

    localStorage.setItem("accessToken", mockToken); // save token

    navigate("/home");
  };

  return (
    <div className="flex-1 flex justify-center items-center relative">
      <div>LOGO</div>
      <div
        onClick={handleLogin}
        className="absolute bottom-12 w-[80%] text-center text-white bg-[#5A82FC] px-2 rounded-full py-4 cursor-pointer"
      >
        Sign in SSO
      </div>
    </div>
  );
}
