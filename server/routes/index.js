import { Router } from "express";
import authRoutes from "./auth.js";
import mailRoutes from "./mail.js";
import projectRoutes from "./project.js"; 
import adminController from "../controllers/adminController.js";
import verifyUser from "../middlewares/verifyUser.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", verifyAdmin, adminController);
router.use("/project", projectRoutes);
router.use("/mail", mailRoutes);

export default router;