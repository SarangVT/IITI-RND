import prisma from "../../db/prisma.js";
import { AdminService } from "../../services/adminService.js";

export const AdminWriteController = {
  // ================= DEPARTMENT AUTHORITY CRUD =================

  async createDepartmentAuthority(req, res) {
    try {
      const { dept_name, hod_email } = req.body;
      if (!dept_name || !hod_email) {
        return res.status(400).json({ success: false, message: "dept_name and hod_email are required" });
      }

      const existing = await prisma.departmentAuthority.findUnique({ where: { dept_name } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Department already exists" });
      }

      const authority = await prisma.departmentAuthority.create({
        data: { dept_name, hod_email },
      });
      res.status(201).json({ success: true, authority });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async editDepartmentAuthority(req, res) {
    try {
      const { dept_name } = req.params;
      const { hod_email } = req.body;
      if (!hod_email) return res.status(400).json({ success: false, message: "hod_email field required" });

      const existing = await prisma.departmentAuthority.findUnique({ where: { dept_name } });
      if (!existing) return res.status(404).json({ success: false, message: "Department not found" });

      const updated = await prisma.departmentAuthority.update({
        where: { dept_name },
        data: { hod_email: hod_email ?? existing.hod_email },
      });
      res.json({ success: true, authority: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async deleteDepartmentAuthority(req, res) {
    try {
      const { dept_name } = req.params;
      const existing = await prisma.departmentAuthority.findUnique({ where: { dept_name } });
      if (!existing) return res.status(404).json({ success: false, message: "Department not found" });

      await prisma.departmentAuthority.delete({ where: { dept_name } });
      res.json({ success: true, message: "Department deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ================= PROJECT & WORKFLOW OVERRIDES =================

  async forceWorkflowStage(req, res) {
    try {
      const { approvalId } = req.params;
      const { targetStatus, comment } = req.body;
      if (!targetStatus) return res.status(400).json({ success: false, message: "targetStatus is required" });

      const updated = await AdminService.forceWorkflowStage(approvalId, targetStatus, comment);
      res.json({ success: true, message: `Stage forced to ${targetStatus}`, workflow: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  },

  async updateProject(req, res) {
    try {
      const updatedProject = await AdminService.updateProjectMetadata(req.params.projectId, req.body);
      res.json({ success: true, message: "Project updated successfully", project: updatedProject });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Failed to update project" });
    }
  },

  async deleteProject(req, res) {
    try {
      await AdminService.deleteProjectComplete(req.params.projectId);
      res.json({ success: true, message: "Project and all records deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Failed to delete project" });
    }
  }
};