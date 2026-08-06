import React, { useState } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiInfo } from "react-icons/fi";
import { api } from "../../lib/api";

interface ApprovalData {
  id: string;
  status: string;
  hodRemark?: string;
  deanRemark?: string;
}

interface WorkflowStatusBannerProps {
  approval: ApprovalData | null;
  onUpdate: () => void;
  children: React.ReactNode;
}

export default function WorkflowStatusBanner({ approval, onUpdate, children }: WorkflowStatusBannerProps) {
  const [loading, setLoading] = useState(false);

  if (!approval || approval.status === "PENDING") {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start gap-3">
          <FiInfo className="mt-1" size={20} />
          <div>
            <h3 className="font-bold">Ready to Submit</h3>
            <p className="text-sm mt-1">Fill out the details below and click "Submit to HOD" to start the approval workflow.</p>
          </div>
        </div>
        {/* Render the unlocked form */}
        {children}
      </div>
    );
  }

  const { id: approvalId, status, hodRemark, deanRemark } = approval;

  const handleRestart = async () => {
    if (!window.confirm("This will reopen the form for editing. Continue?")) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/project/workflows/${approvalId}/restart`);
      if (res.data?.success) onUpdate();
    } catch (err) {
      alert("Failed to restart workflow.");
    } finally {
      setLoading(false);
    }
  };

  let bannerConfig: any = {};

  if (status === "PENDING_HOD") {
    bannerConfig = { color: "yellow", icon: <FiClock size={22} />, title: "Awaiting HOD Approval", description: "This step has been submitted and is currently locked pending HOD review.", remark: "" };
  } else if (status === "PENDING_DEAN") {
    bannerConfig = { color: "indigo", icon: <FiClock size={22} />, title: "Awaiting Dean Approval", description: "Approved by HOD! Now locked pending final Dean review.", remark: "" };
  } else if (status === "REJECTED_HOD") {
    bannerConfig = {
      color: "red", icon: <FiXCircle size={22} />, title: "HOD Requested Changes", description: "The HOD has reviewed this step and requested changes.", remark: hodRemark || "No remark provided.",
      actionButton: <button onClick={handleRestart} disabled={loading} className="mt-3 flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"><FiRefreshCw /> {loading ? "Restarting..." : "Restart Submission"}</button>
    };
  } else if (status === "REJECTED_DEAN") {
    bannerConfig = {
      color: "orange", icon: <FiXCircle size={22} />, title: "Dean Requested Changes", description: "The Dean has reviewed this step and requested changes.", remark: deanRemark || "No remark provided.",
      actionButton: <button onClick={handleRestart} disabled={loading} className="mt-3 flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition disabled:opacity-50"><FiRefreshCw /> {loading ? "Restarting..." : "Restart Submission"}</button>
    };
  } else if (status === "APPROVED") {
    bannerConfig = { color: "green", icon: <FiCheckCircle size={22} />, title: "Step Approved", description: "This step has been fully approved by the Dean. It is locked and finalized.", remark: "" };
  }

  const colorMap: Record<string, string> = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    red: "bg-red-50 border-red-200 text-red-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    green: "bg-green-50 border-green-200 text-green-800"
  };

  const themeClass = colorMap[bannerConfig.color];

  return (
    <div className="space-y-6">
      <div className={`border p-5 rounded-xl shadow-sm ${themeClass}`}>
        <div className="flex items-start gap-3">
          <div className="mt-1">{bannerConfig.icon}</div>
          <div className="w-full">
            <h2 className="text-lg font-bold mb-1">{bannerConfig.title}</h2>
            <p className="opacity-90">{bannerConfig.description}</p>
            {bannerConfig.remark && (
              <div className="mt-3 bg-white/60 p-3 rounded-lg border border-white/40"><p className="font-semibold text-sm opacity-80 uppercase tracking-wide">Remark / Feedback:</p><p className="mt-1 font-medium">{bannerConfig.remark}</p></div>
            )}
            {bannerConfig.actionButton}
          </div>
        </div>
      </div>
      {/* Locks the form visually and functionally */}
      <div className="opacity-75 pointer-events-none grayscale-[20%]">{children}</div>
    </div>
  );
}