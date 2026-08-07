import prisma from "../../db/prisma.js";
import { ApprovalService } from "../../services/approvalService.js";

import {
  createSuccessPageHtml,
  createErrorPageHtml,
  createHodConfirmAcceptTailwind,
  createHodRejectFormTailwind
} from "./html/hodTemplates.js";

import {
  createDeanSuccessPageHtml,
  createDeanErrorPageHtml,
  createDeanConfirmAcceptTailwind,
  createDeanRejectFormTailwind
} from "./html/deanTemplates.js";

const invalidTokenHtml = `
  <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
    <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
    <p>This decision link has already been used, or a decision was already made.</p>
  </div>
`;

export const MailController = {
  // ================= HOD LOGIC =================
  async renderHodDecisionPage(req, res) {
    const { token } = req.query;
    const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
    
    if (!record) return res.send(invalidTokenHtml);
    if (record.action === "ACCEPT") return res.send(createHodConfirmAcceptTailwind(token));
    if (record.action === "REJECT") return res.send(createHodRejectFormTailwind(token));
  },

  async processHodAccept(req, res) {
    const { token } = req.body;
    const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
    if (!record || record.action !== "ACCEPT") return res.send(invalidTokenHtml);
    
    try {
      // (ApprovalService now deletes the token and updates the DB status internally)
      await ApprovalService.processHodDecision(record.projId, "ACCEPT");
      return res.send(createSuccessPageHtml("Approval Recorded", "Forwarded for Dean review."));
    } catch (error) {
      if (error.message === "DECISION_ALREADY_MADE") {
        return res.send(createErrorPageHtml("Link Expired", "A decision has already been recorded for this project."));
      }
      return res.send(createErrorPageHtml("Error", "Something went wrong processing your request."));
    }
  },

  async processHodReject(req, res) {
    const { token, comment } = req.body;
    if (!comment) return res.send(createErrorPageHtml("Error", "Comment required"));
    
    const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
    if (!record || record.action !== "REJECT") return res.send(invalidTokenHtml);
    
    try {
      await ApprovalService.processHodDecision(record.projId, "REJECT", comment);
      return res.send(createSuccessPageHtml("Changes Requested", "Feedback sent to submitter."));
    } catch (error) {
      if (error.message === "DECISION_ALREADY_MADE") {
        return res.send(createErrorPageHtml("Link Expired", "A decision has already been recorded for this project."));
      }
      return res.send(createErrorPageHtml("Error", "Something went wrong."));
    }
  },

  // ================= DEAN LOGIC =================
  async renderDeanDecisionPage(req, res) {
    const { token } = req.query;
    const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
    
    if (!record) return res.send(invalidTokenHtml);
    if (record.action === "ACCEPT") return res.send(createDeanConfirmAcceptTailwind(token));
    if (record.action === "REJECT") return res.send(createDeanRejectFormTailwind(token));
  },

  async processDeanAccept(req, res) {
    const { token } = req.body;
    const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
    if (!record || record.action !== "ACCEPT") return res.send(invalidTokenHtml);
    
    try {
      await ApprovalService.processDeanDecision(record.projId, "ACCEPT");
      return res.send(createDeanSuccessPageHtml("Final Approval Recorded", "The project step has been fully approved."));
    } catch (error) {
      if (error.message === "DECISION_ALREADY_MADE") {
        return res.send(createDeanErrorPageHtml("Link Expired", "A decision has already been recorded for this project."));
      }
      return res.send(createDeanErrorPageHtml("Error", "Something went wrong."));
    }
  },

  async processDeanReject(req, res) {
    const { token, comment } = req.body;
    if (!comment) return res.send(createDeanErrorPageHtml("Error", "Comment required"));
    
    const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
    if (!record || record.action !== "REJECT") return res.send(invalidTokenHtml);
    
    try {
      await ApprovalService.processDeanDecision(record.projId, "REJECT", comment);
      return res.send(createDeanSuccessPageHtml("Rejected", "Your feedback has been recorded and sent to the submitter."));
    } catch (error) {
      if (error.message === "DECISION_ALREADY_MADE") {
        return res.send(createDeanErrorPageHtml("Link Expired", "A decision has already been recorded for this project."));
      }
      return res.send(createDeanErrorPageHtml("Error", "Something went wrong."));
    }
  }
};