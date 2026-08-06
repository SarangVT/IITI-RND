import React, { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const CreateProjectModal = ({ open, onClose, onSuccess }: Props) => {
  const [title, setTitle] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [hodEmail, setHodEmail] = useState("");
  const [fundingAgency, setFundingAgency] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [allHods, setAllHods] = useState<string[]>([]);
  const [showHodDropdown, setShowHodDropdown] = useState(false);

  const hodRef = useRef<HTMLDivElement>(null);

  // Fetch HOD emails for the autocomplete dropdown
  useEffect(() => {
    if (!open) return;

    const fetchAll = async () => {
      try {
        const res = await api.get(`/api/admin/department-authority/suggest?role=HOD`);
        if (res.data?.success) setAllHods(res.data.emails);
      } catch (err) {
        console.error("Failed to fetch HOD list", err);
      }
    };

    fetchAll();
  }, [open]);

  // Handle clicking outside the HOD dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hodRef.current && !hodRef.current.contains(e.target as Node)) {
        setShowHodDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (!title || !userEmail || !hodEmail || !fundingAgency || !projectDuration) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Send to our updated modular backend (Notice: no 'status' is sent anymore!)
      const res = await api.post(`/api/project/add`, {
        title,
        userEmail,
        hodEmail,
        fundingAgency,
        projectDuration,
      });

      if (res.data?.success) {
        // Reset state
        setTitle("");
        setUserEmail("");
        setHodEmail("");
        setFundingAgency("");
        setProjectDuration("");
        
        onClose();
        await onSuccess(); // Triggers a refresh in the AdminPanel
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error creating project");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-xl mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Assign New Project
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Project Title</label>
              <input
                placeholder="Enter full project title"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">PI Email (Assignee)</label>
              <input
                type="email"
                placeholder="professor@institute.edu"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
              />
            </div>

            <div className="relative" ref={hodRef}>
              <label className="block text-sm font-medium text-slate-600 mb-1">HOD Email</label>
              <input
                type="email"
                placeholder="hod@institute.edu"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={hodEmail}
                onChange={e => setHodEmail(e.target.value)}
                onFocus={() => setShowHodDropdown(true)}
              />

              {showHodDropdown && allHods.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {allHods.map(email => (
                    <div
                      key={email}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => {
                        setHodEmail(email);
                        setShowHodDropdown(false);
                      }}
                    >
                      {email}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Funding Agency</label>
                <input
                  placeholder="e.g. DST, SERB"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={fundingAgency}
                  onChange={e => setFundingAgency(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Duration</label>
                <input
                  placeholder="e.g. 3 Years"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={projectDuration}
                  onChange={e => setProjectDuration(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 bg-slate-50 flex justify-end gap-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 font-medium transition"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? "Creating..." : "Create & Assign Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;