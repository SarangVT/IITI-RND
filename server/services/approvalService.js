import prisma from "../db/prisma.js";
import crypto from "crypto";
import { server } from "../lib/client.js";

import { dispatchEmail } from "./mailService.js";
import { generateLetterId, generateVacancyPdfBase64 } from "./pdfService.js";

import { createHodApprovalEmailHtml } from "../controllers/mailController/html/hodTemplates.js";
import { createDeanNotificationEmailHtml } from "../controllers/mailController/html/deanTemplates.js";
import { createSubmitterUpdateEmail } from "../controllers/mailController/html/SubmitterUpdateEmail.js";

export const ApprovalService = {
  async createWorkflow(stepType) {
    return await prisma.approvalWorkflow.create({
      data: { stepType, status: "PENDING" },
    });
  },

  async getContext(approvalId) {
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { id: approvalId },
      include: {
        staffForm: { include: { projectRole: { include: { project: true } } } },
        vacancyForm: { 
          include: { 
            projectRole: { 
              include: { 
                project: true,
                staffRecruitmentForm: true
              } 
            } 
          } 
        },
      },
    });

    if (!workflow) return null;

    const form = workflow.staffForm || workflow.vacancyForm;
    return {
      workflow,
      form,
      role: form?.projectRole,
      project: form?.projectRole?.project,
      isStaff: !!workflow.staffForm,
    };
  },

  async createToken(approvalId, action) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.decisionToken.create({
      data: { token, projId: approvalId, action },
    });
    return token;
  },

  async startHodReview(approvalId) {
    const context = await this.getContext(approvalId);
    if (!context || !context.project?.hodEmail) throw new Error("Invalid context");

    const acceptToken = await this.createToken(approvalId, "ACCEPT");
    const rejectToken = await this.createToken(approvalId, "REJECT");
    const acceptLink = `${server}/api/mail/hod/decision?token=${acceptToken}`;
    const rejectLink = `${server}/api/mail/hod/decision?token=${rejectToken}`;
    const committee = context.isStaff ? context.form.selectionCommittee : context.role.staffRecruitmentForm?.selectionCommittee || {};
    try {
      await dispatchEmail(
        context.project.hodEmail,
        `Approval Required [${context.workflow.stepType}]: ${context.project.title}`,
        createHodApprovalEmailHtml(context.project, committee, acceptLink, rejectLink, context.form, context.workflow.stepType)
      );
    } catch (err) {
      throw new Error("Failed to send email to HOD. Submission aborted.");
    }

    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { status: "PENDING_HOD", submittedAt: new Date() },
    });

    await prisma.projectLog.create({
      data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: "SUBMITTED_HOD", comment: `Submitted for HOD review.` },
    });
    return { success: true };
  },

  async processHodDecision(approvalId, action, comment = null) {
    const context = await this.getContext(approvalId);
    if (context.workflow.status !== "PENDING_HOD") {
      throw new Error("DECISION_ALREADY_MADE");
    }
    await prisma.decisionToken.deleteMany({ where: { projId: approvalId } });
    if (action === "REJECT") {
      await prisma.approvalWorkflow.update({
        where: { id: approvalId },
        data: { status: "REJECTED_HOD", hodRemark: comment, hodActedAt: new Date() },
      });
      await dispatchEmail(context.project.userEmail, `Changes Requested: ${context.project.title}`, createSubmitterUpdateEmail(context.project, "REJECTED", comment));
      return { success: true, status: "REJECTED_HOD" };
    }

    if (action === "ACCEPT") {
      await prisma.approvalWorkflow.update({
        where: { id: approvalId },
        data: { status: "PENDING_DEAN", hodActedAt: new Date() },
      });
      const acceptToken = await this.createToken(approvalId, "ACCEPT");
      const rejectToken = await this.createToken(approvalId, "REJECT");
      const acceptLink = `${server}/api/mail/dean/decision?token=${acceptToken}`;
      const rejectLink = `${server}/api/mail/dean/decision?token=${rejectToken}`;
      const committee = context.isStaff ? context.form.selectionCommittee : context.role.staffRecruitmentForm?.selectionCommittee || {};

      await dispatchEmail(
        process.env.DEAN_EMAIL,
        `Final Approval Required: ${context.project.title}`,
        createDeanNotificationEmailHtml(context.project, committee, acceptLink, rejectLink, context.form, context.workflow.stepType)
      );
      return { success: true, status: "PENDING_DEAN" };
    }
  },

  async processDeanDecision(approvalId, action, comment = null) {
    const context = await this.getContext(approvalId);
    if (context.workflow.status !== "PENDING_DEAN") {
      throw new Error("DECISION_ALREADY_MADE"); 
    }
    await prisma.decisionToken.deleteMany({ where: { projId: approvalId } });
    let status = action === "ACCEPT" ? "APPROVED" : "REJECTED_DEAN";
    let remarkField = action === "REJECT" ? { deanRemark: comment } : {};
    
    // --- NEW LOGIC: ID & PDF GENERATION ---
    let letterId = null;
    let issuedTime = null;
    let pdfAttachment = null;

    if (action === "ACCEPT" && context.workflow.stepType === "RECRUITMENT_VACANCY") {
      letterId = generateLetterId();
      issuedTime = new Date();
      
      // Generate the PDF string in memory
      const base64Pdf = await generateVacancyPdfBase64(context, letterId);
      
      pdfAttachment = {
        name: `Approval_Letter_${letterId}.pdf`,
        base64: base64Pdf,
        mimeType: "application/pdf"
      };
    }

    // Update DB (includes the new letter ID fields)
    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { 
        status, 
        deanActedAt: new Date(), 
        ...remarkField,
        issuedLetterId: letterId,
        letterIssuedAt: issuedTime
      },
    });

    await prisma.projectLog.create({
      data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: status, comment: comment || "Dean granted final approval." },
    });

    await dispatchEmail(
      context.project.userEmail,
      `Project Step ${action === "ACCEPT" ? "Approved" : "Rejected"}: ${context.project.title}`,
      createSubmitterUpdateEmail(context.project, status, comment),
      pdfAttachment // <--- ATTACHES TO EMAIL
    );

    return { success: true, status };
  },

  async restartWorkflow(approvalId) {
    const context = await this.getContext(approvalId);
    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { status: "PENDING", hodRemark: null, deanRemark: null },
    });
    await prisma.decisionToken.deleteMany({ where: { projId: approvalId } });
    return { success: true };
  }
};