import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { FiArrowUpRight, FiBriefcase } from "react-icons/fi";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get(`/api/project/user-projects`);
        if (res.data?.success) setProjects(res.data.projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500 font-medium">Loading projects...</p>;
  }

  return (
    <div className="p-6 mt-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Research Projects</h2>
      <ul className="space-y-4">
        {projects.length > 0 ? (
          projects.map((proj: any) => (
            <li
              key={proj.id}
              onClick={() => navigate(`/project/${proj.id}`)}
              className="p-5 border border-gray-200 rounded-xl cursor-pointer transition flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-50 hover:border-blue-300 group"
            >
              <div>
                <p className="font-semibold text-lg text-gray-800 group-hover:text-blue-700 transition">
                  {proj.title}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Funding Agency:</span> {proj.fundingAgency}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    <FiBriefcase size={14} /> 
                    {proj.roles?.length || 0} {proj.roles?.length === 1 ? "Role" : "Roles"}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/${proj.id}`);
                }}
                className="mt-4 sm:mt-0 text-gray-400 group-hover:text-blue-600 font-medium transition flex items-center"
              >
                Manage <FiArrowUpRight className="ml-1" size={18} />
              </button>
            </li>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-600">No projects found.</p>
            <p className="text-sm text-gray-400 mt-1">When an admin assigns you a project, it will appear here.</p>
          </div>
        )}
      </ul>
    </div>
  );
}