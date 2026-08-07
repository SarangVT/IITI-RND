import { ProjectService } from "../services/projectService.js";
import { ApprovalService } from "../services/approvalService.js";

export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectService.getAllProjects();
    res.json({ success: true, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const projects = await ProjectService.getUserProjects(req.user.email);
    res.json({ success: true, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { userEmail, title, fundingAgency, projectDuration, hodEmail } = req.body;
    if (!userEmail || !title || !fundingAgency || !projectDuration || !hodEmail) {
      return res.status(400).json({
        success: false,
        message: "userEmail, title, fundingAgency, projectDuration, and hodEmail are required",
      });
    }

    const newProject = await ProjectService.createProject(req.admin.email, req.body);
    return res.status(201).json({ success: true, message: "Project added", project: newProject });
  } catch (err) {
    console.error("Project creation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id, req.user.email);
    if (!project) return res.status(403).json({ message: "Unauthorized or project not found" });
    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProjectRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    if (!roleName) return res.status(400).json({ message: "roleName required" });

    const role = await ProjectService.createProjectRole(req.params.projectId, roleName);
    res.json({ success: true, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveStaffRecruitmentForm = async (req, res) => {
  try {
    const { chair, members, submitImmediately } = req.body;
    if (!chair || !Array.isArray(members)) {
      return res.status(400).json({ message: "Chair and Members array required" });
    }

    const form = await ProjectService.saveStaffRecruitmentForm(req.params.roleId, { chair, members });

    if (submitImmediately) {
      await ApprovalService.startHodReview(form.approvalId);
    }

    res.json({
      success: true,
      message: submitImmediately ? "Submitted to HOD" : "Form saved as draft",
      form,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const saveRecruitmentVacancy = async (req, res) => {
  try {
    const { position, count, basicSalary, hraPercent, adPdfUrl, submitImmediately } = req.body;
    
    if (!position || basicSalary === undefined || hraPercent === undefined) {
      return res.status(400).json({ message: "position, basicSalary, and hraPercent required" });
    }

    const vacancy = await ProjectService.saveRecruitmentVacancy(req.params.roleId, {
      position,
      count,
      basicSalary: parseFloat(basicSalary),
      hraPercent: parseFloat(hraPercent),
      adPdfUrl,
    });

    if (submitImmediately) {
      await ApprovalService.startHodReview(vacancy.approvalId);
    }

    res.json({ success: true, message: submitImmediately ? "Submitted to HOD" : "Vacancy details saved", vacancy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const submitWorkflow = async (req, res) => {
  try {
    await ApprovalService.startHodReview(req.params.approvalId);
    res.json({ success: true, message: "Successfully submitted for HOD review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const restartWorkflow = async (req, res) => {
  try {
    await ApprovalService.restartWorkflow(req.params.approvalId);
    res.json({
      success: true,
      message: "Workflow restarted successfully. You can now re-edit your submission.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};