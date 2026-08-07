import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminProjectManage from './pages/AdminProjectManage';
import AdminPanel from "./pages/AdminPanel";
import Project from "./pages/Project";
import AdminDeptHeadMails from './pages/AdminDeptHeadMails';
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="/project/:id" element={<Project/>} />
        </Route>

        <Route element={<ProtectedAdminRoute role="admin"><AdminLayout /></ProtectedAdminRoute>}>
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/project/:projectId" element={<AdminProjectManage />} />
          <Route path="/admin/dept-head-mails" element={<AdminDeptHeadMails />} />    
          <Route path="/admin/departments" element={<AdminDeptHeadMails />} />    
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;