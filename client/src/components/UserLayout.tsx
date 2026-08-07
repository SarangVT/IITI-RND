import { Outlet } from "react-router-dom"
import Navbar from "./Navbar" // Adjust the import path if necessary

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* The Navbar stays at the top */}
      <Navbar />
      
      {/* Outlet acts as a placeholder for the child routes (Dashboard, Project, etc.) */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout