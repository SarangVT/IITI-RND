import { Router } from "express";
import { MailController } from "../controllers/mailController/mailController.js";
const router = Router();

// HOD Routes
router.get("/hod/decision", MailController.renderHodDecisionPage);
router.post("/hod/accept", MailController.processHodAccept);
router.post("/hod/reject", MailController.processHodReject);

// Dean Routes
router.get("/dean/decision", MailController.renderDeanDecisionPage);
router.post("/dean/accept", MailController.processDeanAccept);
router.post("/dean/reject", MailController.processDeanReject);

export default router;