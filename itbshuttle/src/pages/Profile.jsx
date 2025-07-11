import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/schedules"; // adjust path if needed

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    navigate("/home");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">
      {/* Header */}
      <div className="bg-[#5A82FC] rounded-b-[40px] pb-10 pt-16 flex flex-col items-center">
        <h1 className="text-white text-lg font-bold">Profile</h1>
        <div className="mt-6 w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#5A82FC]" />
        </div>
      </div>

      {/* Info Section */}
      <div className="px-6 mt-6 space-y-4">
        <p className="text-gray-400 text-sm">Detail Information</p>
        {loading ? (
          <div className="text-blue-500 text-sm">Loading...</div>
        ) : profile ? (
          <>
            <div className="border-b border-gray-300 pb-2">
              <p className="text-base text-gray-800">{profile.name}</p>
            </div>
            <div className="border-b border-gray-300 pb-2">
              <p className="text-base text-gray-800">{profile.email}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">No profile data available.</p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Contact Support */}
      <div className="bg-[#2F4B87] py-4 flex justify-center">
        <p className="text-white font-medium text-base">Contact Support</p>
      </div>

      {/* Logout Button */}
      <div className="bg-[#DCE6FF] rounded-t-[50px] px-6 pt-8 pb-16 flex justify-center">
        <button
          onClick={handleLogout}
          className="bg-white border border-[#5A82FC] px-12 py-3 rounded-full shadow-md text-[#5A82FC] font-semibold text-base"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
