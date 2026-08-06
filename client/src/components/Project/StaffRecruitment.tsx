import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { api } from "../../lib/api";

interface Props {
  roleId: string;
  initialData?: { chair?: string; members?: string[] };
  onSaveSuccess: () => void; // Triggered so the parent can refresh the data
}

export default function StaffRecruitmentForm({ roleId, initialData, onSaveSuccess }: Props) {
  const [chair, setChair] = useState(initialData?.chair || "");
  const [members, setMembers] = useState<string[]>(
    initialData?.members?.length ? initialData.members : [""]
  );
  const [saving, setSaving] = useState(false);

  const updateMember = (i: number, val: string) => {
    const arr = [...members];
    arr[i] = val;
    setMembers(arr);
  };

  const removeMember = (i: number) => {
    const updated = members.filter((_, idx) => idx !== i);
    setMembers(updated.length === 0 ? [""] : updated);
  };

  const handleSubmit = async () => {
    if (!chair.trim()) return alert("Chairperson is required");
    
    setSaving(true);
    try {
      const cleanMembers = members.filter((m) => m.trim() !== "");
      
      // Submit directly to HOD and fire the review email workflow
      await api.post(`/api/project/roles/${roleId}/staff-recruitment`, {
        chair,
        members: cleanMembers,
        submitImmediately: true 
      });
      
      alert("Submitted to HOD successfully!");
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit. Check HOD email validity or network connection.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setChair(initialData?.chair || "");
    setMembers(initialData?.members?.length ? initialData.members : [""]);
  }, [initialData]);

  return (
    <div className="bg-white shadow-sm border rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-blue-700">Step 1: Selection Committee</h2>
      
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Chairperson</label>
        <input
          type="text"
          value={chair}
          onChange={(e) => setChair(e.target.value)}
          placeholder="Enter Chairperson Name"
          className="w-full border border-gray-300 font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        <label className="block font-semibold text-gray-700">Committee Members</label>
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={m}
              onChange={(e) => updateMember(i, e.target.value)}
              placeholder={`Member ${i + 1}`}
              className="flex-1 border border-gray-300 font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 size={18} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setMembers([...members, ""])}
          className="flex items-center gap-1 text-blue-600 hover:underline font-medium mt-1"
        >
          <FiPlus /> Add Member
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
      >
        <FiSave /> {saving ? "Submitting..." : "Submit directly to HOD"}
      </button>
    </div>
  );
}