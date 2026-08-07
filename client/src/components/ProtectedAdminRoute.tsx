import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { apiLink } from "../lib/api"

const ProtectedAdminRoute = ({ children, role }: { children: React.ReactElement, role?: string }) => {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState<any>(null)

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch(`${apiLink}/api/auth/admin/verify`, {
          credentials: "include"
        })
        const data = await res.json()
        
        if (data.success) {
          setIsAdmin(true)
          setAdminData(data.admin)
        }
      } catch (e) {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    verifyAdmin()
  }, [])
  if (loading) return <div className="text-center mt-20 text-gray-600">Checking admin access...</div>
  if (!isAdmin) return <Navigate to="/login" replace />
  if (role && adminData?.role !== role) return <Navigate to="/admin/panel" replace />
  return children
}
export default ProtectedAdminRoute