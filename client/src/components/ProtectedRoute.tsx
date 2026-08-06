import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { apiLink } from "../lib/api"

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${apiLink}/api/auth/verify`, {
          credentials: "include"
        })
        const data = await res.json()
        if (data.success) setIsAuthenticated(true)
      } catch (e) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  if (loading) return <div className="text-center mt-20 text-gray-600">Checking authentication...</div>

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute