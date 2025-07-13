import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import QRscanPage from "../pages/QRscanPage";
import { LoginPage } from "../pages/LoginPage";
import Tickets from "../pages/Tickets";
import ProfilePage from "../pages/Profile";
import { RequireAuth, RequireGuest } from "./Guards";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
        <Route path="/qrscan" element={<QRscanPage />} />
        <Route path="/ticket" element={<Tickets />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
