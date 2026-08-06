import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiLink } from "../lib/api"

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
    document.cookie = "acKey=; Max-Age=0; path=/"
    navigate("/")
  }

  return (
  <nav className="bg-white shadow-sm border-b border-gray-200 px-8 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">
          R&D Portal
        </h1>

        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full shadow-sm hover:shadow transition">
              <div className="w-9 h-9 rounded-full bg-blue-800 text-white flex items-center justify-center font-semibold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-gray-800">{user.name}</span>
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-blue-800 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-900 transition shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </div>
    </nav>
  )
}

export default Navbar
