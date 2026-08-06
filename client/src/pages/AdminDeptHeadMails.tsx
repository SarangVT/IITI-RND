import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { FiSave, FiX, FiTrash2, FiEdit2, FiPlus } from "react-icons/fi";

type Dept = {
  dept_name: string;
  hod_email: string;
};

export default function AdminDeptHeadMails() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ hod_email: "" });

  const [addForm, setAddForm] = useState({ dept_name: "", hod_email: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/department-authority/all`);
      if (res.data?.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const saveEdit = async () => {
    if (!editingDept || !editForm.hod_email.trim()) return;
    try {
      await api.put(`/api/admin/department-authority/edit/${editingDept}`, editForm);
      setEditingDept(null);
      fetchDepartments();
    } catch (err) {
      alert("Failed to update HOD email");
    }
  };

  const addDepartment = async () => {
    const { dept_name, hod_email } = addForm;
    if (!dept_name.trim() || !hod_email.trim()) {
      return alert("All fields are required");
    }

    setSubmitting(true);
    try {
      await api.post(`/api/admin/department-authority/create`, addForm);
      setAddForm({ dept_name: "", hod_email: "" });
      fetchDepartments();
    } catch (err) {
      alert("Failed to add department. It might already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDepartment = async (dept: string) => {
    if (!window.confirm(`Are you sure you want to delete "${dept}"?\nThis action cannot be undone.`)) return;
    
    try {
      await api.delete(`/api/admin/department-authority/delete/${dept}`);
      fetchDepartments();
    } catch (err) {
      alert("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Department Head Directory</h1>
          <p className="text-gray-500 mt-1">Manage HOD emails for auto-suggestions during project creation.</p>
        </div>

        {/* Add New Department Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiPlus className="text-blue-600" /> Add New Department
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input
                placeholder="e.g. Computer Science"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={addForm.dept_name}
                onChange={e => setAddForm(f => ({ ...f, dept_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOD Email Address</label>
              <input
                placeholder="hod.cse@institute.edu"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={addForm.hod_email}
                onChange={e => setAddForm(f => ({ ...f, hod_email: e.target.value }))}
              />
            </div>
          </div>

          <button
            onClick={addDepartment}
            disabled={submitting}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Department"}
          </button>
        </div>

        {/* Directory List Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Existing Departments</h2>

          {loading ? (
            <div className="text-gray-500 text-center py-8">Loading directory...</div>
          ) : departments.length === 0 ? (
            <div className="text-gray-500 text-center py-8 border-2 border-dashed rounded-xl">
              No departments configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {departments.map(d => (
                <div key={d.dept_name} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-gray-50/50">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{d.dept_name}</h3>
                      
                      {editingDept !== d.dept_name && (
                        <p className="text-gray-600 font-medium mt-1">{d.hod_email}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {editingDept !== d.dept_name && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingDept(d.dept_name);
                            setEditForm({ hod_email: d.hod_email });
                          }}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <FiEdit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => deleteDepartment(d.dept_name)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit Mode Inline Form */}
                  {editingDept === d.dept_name && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update HOD Email</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={editForm.hod_email}
                          onChange={e => setEditForm({ hod_email: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                          >
                            <FiSave size={16} /> Save
                          </button>
                          <button
                            onClick={() => setEditingDept(null)}
                            className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                          >
                            <FiX size={16} /> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}