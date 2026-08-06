import { Router } from "express";
import { 
  getAllProjects,
  getUserProjects,
  getProjectById,
  createProject,          // <-- Make sure to import this!
  createProjectRole,
  saveStaffRecruitmentForm,
  saveRecruitmentVacancy,
  submitWorkflow,
  restartWorkflow 
} from "../controllers/projectController.js"; 
import verifyUser from "../middlewares/verifyUser.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = Router();

// ==========================================
// ADMIN ROUTES (Requires Admin Token)
// ==========================================
router.get("/all-projects", verifyAdmin, getAllProjects); 
router.post("/add", verifyAdmin, createProject); // <-- The missing 404 route!

// ==========================================
// PI / USER ROUTES (Requires User Token)
// ==========================================
router.get("/user-projects", verifyUser, getUserProjects);
router.get("/:id", verifyUser, getProjectById);

// Role & Form endpoints
router.post("/:projectId/roles", verifyUser, createProjectRole);
router.post("/roles/:roleId/staff-recruitment", verifyUser, saveStaffRecruitmentForm);
router.post("/roles/:roleId/recruitment-vacancy", verifyUser, saveRecruitmentVacancy);

// Universal Approval triggers
router.post("/workflows/:approvalId/submit", verifyUser, submitWorkflow);
router.post("/workflows/:approvalId/restart", verifyUser, restartWorkflow);

export default router;