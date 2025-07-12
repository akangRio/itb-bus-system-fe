import { useLocation, Link } from "react-router-dom";
import { Home, Ticket, User } from "lucide-react"; // ← Lucide icons
import React from "react";

const tabs = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/ticket", label: "Ticket", Icon: Ticket },
  { to: "/profile", label: "Profile", Icon: User },
];
export default function MobileLayout({ children }) {
  const location = useLocation();

  return (
    <div className="full-viewport-height w-[430px] max-w-full mx-auto bg-white flex flex-col overflow-hidden relative z-0">
      <div className="absolute -top-10 w-[430px] max-w-full h-[200px] bg-[#5A82FC] rounded-b-[200%] -z-10" />
      {children}

      {/* Tabs */}
      {location.pathname !== "/" && (
        <footer className="h-16 flex items-center justify-around bg-[#f9f9ff] border-t border-gray-200 rounded-t-3xl px-2 absolute bottom-0 w-full z-10">
          {tabs.map(({ to, label, Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to} className="flex-1 text-center py-2 px-2">
                <div className="flex flex-col items-center space-y-1">
                  <Icon
                    size={22}
                    className={isActive ? "text-blue-500" : "text-gray-400"}
                  />
                  <span
                    className={`text-xs ${
                      isActive ? "text-blue-500 font-medium" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </footer>
      )}

      <div
        className="absolute -bottom-10 w-screen h-[200px] bg-[#5A82FC]/25 rounded-t-[200%] shadow-inner -z-10"
        style={{
          boxShadow: "inset 0 30px 60px rgba(0, 0, 0, 0.02)",
        }}
      />
    </div>
  );
}
