import React, { useState, useEffect } from "react";
import WorkflowStatusBanner from "../Workflow/WorkflowStatusBanner";
import RecruitmentVacancyForm from "./RecruitmentVacancyForm";
import StaffRecruitmentForm from "./StaffRecruitment";
import RoleTabBar from "./RoleTabBar";

interface RoleWorkspaceProps {
  role: any;
  refreshProjectData: () => void;
}

export default function RoleWorkspace({ role, refreshProjectData }: RoleWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("step1");

  // Extract Forms and Approvals
  const step1Form = role.staffRecruitmentForm;
  const step1Approval = step1Form?.approval || null;

  const step2Form = role.recruitmentVacancy;
  const step2Approval = step2Form?.approval || null;

  // Track the actual Dean approval status
  const isStep1Approved = step1Approval?.status === "APPROVED";
  const isStep2Approved = step2Approval?.status === "APPROVED";

  // --- SMART NAVIGATION LOGIC ---
  useEffect(() => {
    // If Step 1 just became approved, auto-advance them to Step 2
    if (isStep1Approved && !isStep2Approved) {
      setActiveTab("step2");
    }
    // Security: Force user back to step 1 if Step 1 gets restarted/rejected while they are somehow on step 2
    if (!isStep1Approved && activeTab === "step2") {
      setActiveTab("step1");
    }
    // We intentionally only depend on the approval statuses, so users can still manually click back to review Step 1
  }, [isStep1Approved, isStep2Approved]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6 animate-in fade-in duration-300">
      
      {/* Workspace Header */}
      <div className="bg-white border-b flex justify-between items-center px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Managing Role: <span className="text-blue-600">{role.roleName}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Complete the steps in order to recruit for this position.</p>
        </div>
      </div>

      {/* Modular Tab Bar */}
      <RoleTabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isStep1Approved={isStep1Approved} 
        isStep2Approved={isStep2Approved}
      />

      {/* Workspace Content */}
      <div className="p-6 bg-gray-50/30">
        
        {activeTab === "step1" && (
          <WorkflowStatusBanner 
            approval={step1Approval} 
            onUpdate={refreshProjectData}
          >
            <StaffRecruitmentForm
              key={`staff-form-${role.id}`} 
              roleId={role.id} 
              initialData={step1Form?.selectionCommittee} 
              onSaveSuccess={refreshProjectData} 
            />
          </WorkflowStatusBanner>
        )}

        {/* Firm rendering lock: Only render Step 2 if Step 1 is approved */}
        {activeTab === "step2" && isStep1Approved && (
          <WorkflowStatusBanner 
            approval={step2Approval} 
            onUpdate={refreshProjectData}
          >
            <RecruitmentVacancyForm 
              key={`vacancy-form-${role.id}`}
              roleId={role.id} 
              initialData={step2Form} 
              onSaveSuccess={refreshProjectData} 
            />
          </WorkflowStatusBanner>
        )}

      </div>
    </div>
  );
}