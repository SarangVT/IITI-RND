import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLink } from "../lib/api"; // Adjust path if necessary
import iitiLogo from "../public/iiti-logo.png"; // Adjust path if necessary

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${apiLink}/api/auth/admin/verify`, {
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        
        if (data.success && data.admin) {
          setAdmin(data.admin);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching admin:", err);
        navigate("/login");
      }
    };

    fetchAdmin();
  }, [navigate]);

  const handleLogout = async () => {
  try {
    await fetch(`${apiLink}/api/auth/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Admin logout error:", err);
  } finally {
    navigate("/login");
  }
};

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-2.5 flex justify-between items-center">
      {/* Left side: Logo and Title (Clickable redirect to /admin/panel) */}
      <div 
        onClick={() => navigate("/admin/panel")}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <img 
          src={iitiLogo} 
          alt="IIT Indore" 
          className="h-9 w-9 object-contain bg-white rounded-full p-0.5 border border-gray-200 group-hover:border-blue-300 transition"
        />
        <h1 className="text-xl font-bold text-blue-800 group-hover:text-blue-900 transition">
          R&D Admin Portal
        </h1>
      </div>

      {/* Right side: Profile Badge & Logout */}
      <div className="flex items-center gap-5">
        {admin && (
          <div className="flex items-center gap-3 bg-gray-50 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow transition">
            <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-semibold text-sm">
              {admin.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-800 text-md">{admin.name}</span>
              <span className="text-xs text-gray-500">{admin.email}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-blue-800 text-white px-4 py-1.5 text-sm rounded-full font-medium hover:bg-blue-900 transition shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;