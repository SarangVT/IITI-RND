import "./App.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"
import AdminPanel from "./pages/AdminPanel"
import Project from "./pages/Project"
import AdminDeptHeadMails from './pages/AdminDeptHeadMails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />Home
        <Route path="/dashboard" element={
          //<ProtectedRoute>
            <Dashboard />
           // </ProtectedRoute>
          }/>
        <Route
          path="/admin/panel"
          element={
            // <ProtectedAdminRoute role="admin">
              <AdminPanel/>
            // </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/dept-head-mails"
          element={
            // <ProtectedAdminRoute role="admin">
              <AdminDeptHeadMails/>
            // </ProtectedAdminRoute>
          }
        />    
        <Route path="/admin/departments" element={<AdminDeptHeadMails />} />    
        <Route path="/project/:id" element={<Project/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
