import { Router } from "express";
import authRoutes from "./auth.js";
import mailRoutes from "./mail.js";
import projectRoutes from "./project.js"; 
import adminRoutes from "./admin.js"; // Your newly unified admin router
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/project", projectRoutes);
router.use("/mail", mailRoutes);
router.use("/admin", verifyAdmin, adminRoutes);

export default router;