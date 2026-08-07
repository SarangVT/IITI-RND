import { Router } from "express";
import { AdminReadController } from "../controllers/adminController/adminReadController.js";
import { AdminWriteController } from "../controllers/adminController/adminWriteController.js";

const router = Router();

router.get("/department-authority/suggest", AdminReadController.suggestDepartmentAuthority);
router.get("/department-authority/all", AdminReadController.getAllDepartmentAuthorities);

router.post("/department-authority/create", AdminWriteController.createDepartmentAuthority);
router.put("/department-authority/edit/:dept_name", AdminWriteController.editDepartmentAuthority);
router.delete("/department-authority/delete/:dept_name", AdminWriteController.deleteDepartmentAuthority);

router.post("/workflows/:approvalId/force-stage", AdminWriteController.forceWorkflowStage);
router.put("/projects/:projectId", AdminWriteController.updateProject);
router.delete("/projects/:projectId", AdminWriteController.deleteProject);

export default router;