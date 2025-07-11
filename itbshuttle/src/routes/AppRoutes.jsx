import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import QRscanPage from "../pages/QRscanPage";
import { LoginPage } from "../pages/LoginPage";
import Tickets from "../pages/Tickets";
import ProfilePage from "../pages/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/qrscan" element={<QRscanPage />} />
      <Route path="/ticket" element={<Tickets />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
