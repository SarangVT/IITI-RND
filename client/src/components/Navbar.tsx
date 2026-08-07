import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiLink } from "../lib/api"
import iitiLogo from "../public/iiti-logo.png" // Adjust path if necessary

const Navbar = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${apiLink}/api/auth/verify`, {
          credentials: "include",
        })

        if (!res.ok) {
          navigate("/")
          return
        }

        const data = await res.json()
        setUser(data.user || data.admin)
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
  try {
    await fetch(`${apiLink}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    navigate("/");
  }
};

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-10 py-3 flex justify-between items-center">
      <div 
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <img 
          src={iitiLogo} 
          alt="IIT Indore" 
          className="h-9 w-9 object-contain bg-white rounded-full p-0.5 border border-gray-200 group-hover:border-blue-300 transition"
        />
        <h1 className="text-xl font-bold text-blue-800 group-hover:text-blue-900 transition">
          R&D Portal
        </h1>
      </div>

      {/* Right side: Profile Badge & Logout */}
      <div className="flex items-center gap-5">
        {user && (
          <div className="flex items-center gap-3 bg-gray-50 px-3.5 py-1 rounded-full shadow-sm hover:shadow transition">
            <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-semibold text-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-800 text-md">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
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
  )
}

export default Navbar