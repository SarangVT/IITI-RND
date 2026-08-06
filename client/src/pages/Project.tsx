import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiBriefcase } from "react-icons/fi";
import { api } from "../lib/api"; // Adjust import path if needed
import RoleWorkspace from "../components/Project/RoleWorkspace";

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  
  // Role Creation State
  const [newRoleName, setNewRoleName] = useState("");
  const [addingRole, setAddingRole] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/project/${id}`);
      if (res.data?.success) {
        setProject(res.data.project);
        
        // If we don't have an active role selected, but roles exist, auto-select the first one
        if (!activeRoleId && res.data.project.roles?.length > 0) {
          setActiveRoleId(res.data.project.roles[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    
    setAddingRole(true);
    try {
      const res = await api.post(`/api/project/${id}/roles`, { roleName: newRoleName });
      if (res.data?.success) {
        setNewRoleName("");
        await fetchProject(); // Refresh project data to get the new role
        setActiveRoleId(res.data.role.id); // Auto-select the newly created role
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add role.");
    } finally {
      setAddingRole(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading project details...</div>;
  if (!project) return <div className="p-10 text-center text-red-500 font-medium">Project not found or access denied.</div>;

  const activeRole = project.roles?.find((r: any) => r.id === activeRoleId);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div><span className="font-semibold text-gray-800">Funding Agency:</span> {project.fundingAgency}</div>
            <div><span className="font-semibold text-gray-800">Duration:</span> {project.projectDuration}</div>
            <div><span className="font-semibold text-gray-800">HOD Email:</span> {project.hodEmail}</div>
          </div>
        </div>

        {/* --- Roles Layout --- */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar: Role List & Creation */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiBriefcase /> Project Roles
              </h2>
              
              <ul className="space-y-2 mb-6">
                {project.roles?.length > 0 ? (
                  project.roles.map((role: any) => (
                    <li key={role.id}>
                      <button
                        onClick={() => setActiveRoleId(role.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                          activeRoleId === role.id 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {role.roleName}
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No roles created yet.</p>
                )}
              </ul>

              {/* Add New Role Form */}
              <form onSubmit={handleAddRole} className="pt-4 border-t border-gray-200 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Add New Role</label>
                <input
                  type="text"
                  placeholder="e.g., JRF, SRF, RA"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  disabled={addingRole}
                />
                <button
                  type="submit"
                  disabled={addingRole || !newRoleName.trim()}
                  className="w-full flex justify-center items-center gap-2 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 font-semibold transition disabled:opacity-50"
                >
                  <FiPlus /> {addingRole ? "Adding..." : "Create Role"}
                </button>
              </form>
            </div>
          </div>

          {/* Main Content: Role Workspace */}
          <div className="w-full md:w-2/3">
            {activeRole ? (
              <RoleWorkspace role={activeRole} refreshProjectData={fetchProject} />
            ) : (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                  <FiBriefcase size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Role Selected</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select a role from the sidebar or create a new one to start managing staff recruitment and vacancy details.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}