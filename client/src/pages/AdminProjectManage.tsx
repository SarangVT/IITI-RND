import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFastForward, FiBriefcase, FiUsers, FiFileText } from "react-icons/fi";
import { api } from "../lib/api";
import ForceStageModal from "../components/Admin/ForceStageModal";

export default function AdminProjectManage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [stageOverride, setStageOverride] = useState<{ approvalId: string, currentStatus: string, title: string } | null>(null);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/project/all-projects");
      if (res.data?.success) {
        const found = res.data.projects.find((p: any) => p.id === projectId);
        setProject(found);
      }
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId]);

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Workflows...</div>;
  if (!project) return <div className="p-10 text-center text-red-500 font-bold">Project not found.</div>;

  // Filter roles into their respective workflow types
  const staffRoles = project.roles?.filter((role: any) => role.staffRecruitmentForm?.approval) || [];
  const vacancyRoles = project.roles?.filter((role: any) => role.recruitmentVacancy?.approval) || [];
  const hasAnyWorkflows = staffRoles.length > 0 || vacancyRoles.length > 0;

  // Reusable card renderer to keep code clean
  const renderWorkflowCard = (role: any, type: "staff" | "vacancy") => {
    const form = type === "staff" ? role.staffRecruitmentForm : role.recruitmentVacancy;
    const workflow = form.approval;

    const isApproved = workflow.status.includes('APPROVED');
    const isRejected = workflow.status.includes('REJECTED');

    return (
      <div key={workflow.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{role.roleName}</h3>
            <p className="text-sm text-gray-500 mt-1">Workflow ID: {workflow.id.split('-')[0]}...</p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${isApproved ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
            {workflow.status}
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 flex-grow">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold text-gray-800">Form Type:</span> {type === "staff" ? 'Staff Selection' : 'Recruitment Vacancy'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Created:</span> {new Date(workflow.createdAt || workflow.submittedAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        <button 
          onClick={() => setStageOverride({ approvalId: workflow.id, currentStatus: workflow.status, title: `${project.title} - ${role.roleName}` })}
          className="w-full flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-600 hover:text-white font-semibold py-2.5 rounded-xl transition mt-auto"
        >
          <FiFastForward /> Force Stage Override
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate("/admin/panel")} className="text-gray-500 hover:text-gray-800 transition bg-gray-100 hover:bg-gray-200 p-2 rounded-lg">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500">Manage all recruitment workflows and pipeline stages</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2 border-b pb-4">
          <FiBriefcase className="text-blue-600" /> Active Roles & Workflows
        </h2>

        {!hasAnyWorkflows ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200 text-gray-500 shadow-sm">
            No roles or recruitment workflows have been initiated for this project yet.
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Vacancy Workflows Section */}
            {vacancyRoles.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FiFileText className="text-orange-500" /> Recruitment Vacancy Workflows
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vacancyRoles.map((role: any) => renderWorkflowCard(role, "vacancy"))}
                </div>
              </section>
            )}

            {/* Divider if both exist */}
            {vacancyRoles.length > 0 && staffRoles.length > 0 && (
              <hr className="border-gray-200" />
            )}

            {/* Staff Workflows Section */}
            {staffRoles.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FiUsers className="text-green-500" /> Staff Selection Workflows
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {staffRoles.map((role: any) => renderWorkflowCard(role, "staff"))}
                </div>
              </section>
            )}

          </div>
        )}

        {stageOverride && (
          <ForceStageModal 
            overrideData={stageOverride} 
            onClose={() => setStageOverride(null)} 
            onSuccess={() => { setStageOverride(null); fetchProjectData(); }} 
          />
        )}
      </main>
    </div>
  );
}