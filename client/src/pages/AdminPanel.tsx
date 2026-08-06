import { useEffect, useState } from "react";
import { FiPlus, FiBriefcase, FiUser, FiLogOut, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import CreateProjectModal from "../components/Project/CreateProject";

export default function AdminPanel() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/project/all-projects");
      if (res.data?.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const handleLogout = async () => {
    // Assuming you have a logout endpoint, or just clear cookies locally
    // await api.post("/api/auth/admin/logout");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FiBriefcase size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">R&D Admin Portal</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition font-medium"
        >
          Logout <FiLogOut />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">System Projects</h2>
            <p className="text-gray-500 mt-1">Manage and assign research projects across the institute.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* NEW BUTTON: Manage Department Heads */}
            <button
              onClick={() => navigate("/admin/departments")}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 shadow-sm transition"
            >
              <FiUsers size={20} className="text-blue-600" /> Manage Dept Heads
            </button>

            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition"
              >
                <FiPlus size={20} /> Assign New Project
              </button>
            )}
          </div>
        </div>

        {/* Create Form Container */}
        {showCreateForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CreateProjectModal 
            open={showCreateForm}
            onClose={() => setShowCreateForm(false)} 
            onSuccess={async () => {
              setShowCreateForm(false);
              await fetchAllProjects();
            }} 
          />
          </div>
        )}

        {/* Projects Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 font-medium">Loading system projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <FiBriefcase size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Projects Found</h3>
              <p className="text-gray-500">Get started by assigning a new project to a PI.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Project Title</th>
                    <th className="px-6 py-4 font-semibold">Principal Investigator</th>
                    <th className="px-6 py-4 font-semibold">Funding Agency</th>
                    <th className="px-6 py-4 font-semibold text-center">Active Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{proj.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {proj.id.split('-')[0]}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full">
                            <FiUser size={14} />
                          </div>
                          <span className="font-medium text-gray-700">{proj.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                          {proj.fundingAgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          {proj.roles?.length || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}