import React, { useState } from 'react';
import { FiX, FiFastForward } from 'react-icons/fi';
import { api } from '../../lib/api';

interface ForceStageModalProps {
  overrideData: { approvalId: string; currentStatus: string; title: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForceStageModal({ overrideData, onClose, onSuccess }: ForceStageModalProps) {
  const [targetStatus, setTargetStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus) return;
    setLoading(true);

    try {
      await api.post(`/api/admin/workflows/${overrideData.approvalId}/force-stage`, {
        targetStatus,
        comment: adminComment || "Admin manually overrode stage."
      });
      alert(`Workflow successfully forced to ${targetStatus}.`);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to force stage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition">
          <FiX size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-800">
          <FiFastForward className="text-indigo-600"/> Force Stage Jump
        </h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">{overrideData.title}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm mb-4">
            <span className="font-semibold text-gray-600">Current Status:</span> 
            <span className="font-bold text-gray-900 ml-2">{overrideData.currentStatus}</span>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Target Stage</label>
            <select required className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={targetStatus} onChange={e => setTargetStatus(e.target.value)}>
              <option value="">-- Choose Stage --</option>
              <option value="PENDING">PENDING (Reset to Start)</option>
              <option value="PENDING_HOD">PENDING_HOD (At HOD)</option>
              <option value="PENDING_DEAN">PENDING_DEAN (At Dean)</option>
              <option value="APPROVED">APPROVED (Finalized)</option>
              <option value="REJECTED_HOD">REJECTED_HOD</option>
              <option value="REJECTED_DEAN">REJECTED_DEAN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Comment (Optional)</label>
            <input type="text" placeholder="e.g. Bypassed due to CITC request" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={adminComment} onChange={e => setAdminComment(e.target.value)} />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
              <FiFastForward /> {loading ? "Executing..." : "Execute Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}