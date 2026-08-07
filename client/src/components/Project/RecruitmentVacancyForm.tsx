import React, { useEffect, useState } from 'react';
import { FiSave, FiLink } from "react-icons/fi";
import { api } from '../../lib/api';

interface Props {
  roleId: string;
  initialData?: any;
  onSaveSuccess: () => void;
}

export default function RecruitmentVacancyForm({ roleId, initialData, onSaveSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: initialData?.position || '',
    count: initialData?.count?.toString() || '1',
    basicSalary: initialData?.basicSalary?.toString() || '',
    hra: initialData?.hraPercent?.toString() || '',
    adPdfUrl: initialData?.adPdfUrl || '',
  });

  useEffect(() => {
    setFormData({
      position: initialData?.position || '',
      count: initialData?.count?.toString() || '1',
      basicSalary: initialData?.basicSalary?.toString() || '',
      hra: initialData?.hraPercent?.toString() || '',
      adPdfUrl: initialData?.adPdfUrl || '',
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/api/project/roles/${roleId}/recruitment-vacancy`, {
        position: formData.position,
        count: parseInt(formData.count) || 1,
        basicSalary: parseFloat(formData.basicSalary),
        hraPercent: parseFloat(formData.hra),
        adPdfUrl: formData.adPdfUrl,
        submitImmediately: true
      });
      alert("Submitted to HOD successfully!");
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit. Check network or HOD email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-blue-700 mb-6">Step 2: Vacancy Details & Advertisement</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Position / Designation</label>
            <input
              type="text"
              name="position"
              placeholder="e.g. JRF, SRF, Project Associate"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Vacancies</label>
            <input
              type="number"
              name="count"
              min="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.count}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Basic Salary (Monthly)</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                name="basicSalary"
                placeholder="0"
                className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.basicSalary}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">HRA (%)</label>
            <div className="relative">
              <input
                type="number"
                name="hra"
                placeholder="e.g. 16 or 24"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.hra}
                onChange={handleChange}
                required
              />
              <span className="absolute right-4 top-2.5 text-gray-500 font-medium">%</span>
            </div>
          </div>
        </div>

        {formData.basicSalary && formData.hra && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Estimated Monthly CTC (Per Person):</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{(parseFloat(formData.basicSalary) + (parseFloat(formData.basicSalary) * parseFloat(formData.hra) / 100)).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Advertisement Document Link</label>
          <p className="text-xs text-gray-500 mb-2">Provide a public link (e.g., Google Drive, Dropbox) to the detailed recruitment advertisement PDF.</p>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400"><FiLink size={18} /></span>
            <input
              type="url"
              name="adPdfUrl"
              placeholder="https://drive.google.com/..."
              className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.adPdfUrl}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-md transition disabled:opacity-50"
          >
            <FiSave size={18} /> {loading ? "Submitting..." : "Submit directly to HOD"}
          </button>
        </div>
      </form>
    </div>
  );
}