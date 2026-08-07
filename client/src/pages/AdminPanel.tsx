import { useEffect, useState } from "react";
import { FiPlus, FiUsers, FiEdit2, FiTrash2, FiSettings, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import CreateProjectModal from "../components/Project/CreateProject";
import EditProjectModal from "../components/Admin/EditProjectModal";

export default function AdminPanel() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editProject, setEditProject] = useState<any | null>(null);
  
  const navigate = useNavigate();

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/project/all-projects");
      if (res.data?.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      // Always set loading to false regardless of closure state
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAllProjects(); 
  }, []);

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`NUCLEAR OPTION: Are you sure you want to completely delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      alert("Project permanently deleted.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete project.");
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Research Projects</h2>
          <p className="text-gray-500 mt-1">Manage and assign research projects across the institute.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate("/admin/departments")} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 shadow-sm transition">
            <FiUsers size={20} className="text-blue-600" /> Manage Dept Heads
          </button>
          {!showCreateForm && (
            <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition">
              <FiPlus size={20} /> Assign New Project
            </button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <CreateProjectModal open={showCreateForm} onClose={() => setShowCreateForm(false)} onSuccess={async () => { setShowCreateForm(false); await fetchAllProjects(); }} />
      )}
      {editProject && (
        <EditProjectModal project={editProject} onClose={() => setEditProject(null)} onSuccess={() => { setEditProject(null); fetchAllProjects(); }} />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-medium">Loading research projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-16 text-center text-gray-500">No Projects Found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold">Project Title</th>
                  <th className="px-6 py-4 font-semibold">PI & Agency</th>
                  <th className="px-6 py-4 font-semibold text-center">Roles</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{proj.title}</p>
                      <p className="text-xs text-gray-400 mt-1">ID: {proj.id?.split('-')[0]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FiUser className="text-blue-500" />
                        <span className="font-medium text-gray-800">{proj.userEmail}</span>
                      </div>
                      <p className="text-xs text-gray-500">Funding Agency: {proj.fundingAgency}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                        {proj.roles?.length || 0} Workflows
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => navigate(`/admin/project/${proj.id}`)} className="inline-flex items-center gap-1 bg-gray-100 text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition shadow-sm" title="Manage Workflows">
                        <FiSettings size={16} /> Manage
                      </button>
                      <button onClick={() => setEditProject(proj)} className="text-gray-400 hover:text-blue-600 transition p-2" title="Edit Metadata">
                        <FiEdit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteProject(proj.id, proj.title)} className="text-gray-400 hover:text-red-600 transition p-2" title="Nuclear Delete">
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}