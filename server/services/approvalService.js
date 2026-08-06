import prisma from "../db/prisma.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { server } from "../lib/client.js";

import { createHodApprovalEmailHtml } from "../controllers/mailController/html/hodTemplates.js";
import { createDeanNotificationEmailHtml } from "../controllers/mailController/html/deanTemplates.js";
import { createSubmitterUpdateEmail } from "../controllers/mailController/html/SubmitterUpdateEmail.js";

import nodemailer from "nodemailer";

const isProd = process.env.NODE_ENV === "PROD" || process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: isProd ? 465 : 587,
  secure: isProd,
  auth: {
    user: process.env.RND_EMAIL,
    pass: process.env.RND_APP_PASSWD,
  },
  ...(isProd && { family: 4 })
});

export default transporter;

export const ApprovalService = {
  async createWorkflow(stepType) {
    return await prisma.approvalWorkflow.create({
      data: {
        stepType,
        status: "PENDING", // FIXED: Matches your Prisma Enum
      },
    });
  },

  async getContext(approvalId) {
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { id: approvalId },
      include: {
        staffForm: { include: { projectRole: { include: { project: true } } } },
        vacancyForm: { include: { projectRole: { include: { project: true } } } },
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
    if (!context || !context.project?.hodEmail) {
      throw new Error("Invalid workflow context or missing HOD email");
    }

    // 1. Create action tokens first (needed for the email)
    const acceptToken = await this.createToken(approvalId, "ACCEPT");
    const rejectToken = await this.createToken(approvalId, "REJECT");

    const acceptLink = `${server}/api/mail/hod/decision?token=${acceptToken}`;
    const rejectLink = `${server}/api/mail/hod/decision?token=${rejectToken}`;
    const committee = context.isStaff ? context.form.selectionCommittee || {} : {};

    // 2. ATTEMPT TO SEND THE EMAIL FIRST!
    try {
      await transporter.sendMail({
        from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
        to: context.project.hodEmail,
        subject: `Approval Required [${context.workflow.stepType}]: ${context.project.title}`,
        html: createHodApprovalEmailHtml(context.project, committee, acceptLink, rejectLink),
      });
    } catch (mailError) {
      console.error("Mail Dispatch Failed:", mailError);
      // Throwing this error STOPS the database from updating to PENDING_HOD
      throw new Error("Failed to send email to HOD. Submission aborted."); 
    }

    // 3. ONLY if email succeeds, update the database to PENDING_HOD
    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { status: "PENDING_HOD", submittedAt: new Date() },
    });

    await prisma.projectLog.create({
      data: {
        projectId: context.project.id,
        projectRoleId: context.role.id,
        approvalWorkflowId: approvalId,
        action: "SUBMITTED_HOD",
        comment: `Submitted ${context.workflow.stepType} for HOD review.`,
      },
    });

    return { success: true };
  },

  async processHodDecision(approvalId, action, comment = null) {
    const context = await this.getContext(approvalId);
    if (!context) throw new Error("Workflow context not found");

    if (action === "REJECT") {
      await prisma.approvalWorkflow.update({
        where: { id: approvalId },
        data: { status: "REJECTED_HOD", hodRemark: comment, hodActedAt: new Date() },
      });

      await prisma.projectLog.create({
        data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: "REJECTED_HOD", comment },
      });

      await transporter.sendMail({
        from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
        to: context.project.userEmail,
        subject: `Changes Requested by HOD: ${context.project.title}`,
        html: createSubmitterUpdateEmail(context.project, "REJECTED", comment),
      });

      return { success: true, status: "REJECTED_HOD" };
    }

    if (action === "ACCEPT") {
      await prisma.approvalWorkflow.update({
        where: { id: approvalId },
        data: { status: "PENDING_DEAN", hodActedAt: new Date() },
      });

      await prisma.projectLog.create({
        data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: "CONFIRMED_HOD", comment: "HOD Approved." },
      });

      const acceptToken = await this.createToken(approvalId, "ACCEPT");
      const rejectToken = await this.createToken(approvalId, "REJECT");
      const acceptLink = `${server}/api/mail/dean/decision?token=${acceptToken}`;
      const rejectLink = `${server}/api/mail/dean/decision?token=${rejectToken}`;

      const committee = context.isStaff ? context.form.selectionCommittee || {} : {};

      await transporter.sendMail({
        from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
        to: process.env.DEAN_EMAIL,
        subject: `Final Approval Required: ${context.project.title}`,
        html: createDeanNotificationEmailHtml(context.project, committee, acceptLink, rejectLink),
      });

      return { success: true, status: "PENDING_DEAN" };
    }
  },

  async processDeanDecision(approvalId, action, comment = null) {
    const context = await this.getContext(approvalId);
    if (!context) throw new Error("Workflow context not found");

    const status = action === "ACCEPT" ? "APPROVED" : "REJECTED_DEAN";
    const remarkField = action === "REJECT" ? { deanRemark: comment } : {};

    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { status, deanActedAt: new Date(), ...remarkField },
    });

    await prisma.projectLog.create({
      data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: status, comment: comment || "Dean granted final approval." },
    });

    await transporter.sendMail({
      from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
      to: context.project.userEmail,
      subject: `Project Step ${action === "ACCEPT" ? "Approved" : "Rejected"}: ${context.project.title}`,
      html: createSubmitterUpdateEmail(context.project, status, comment),
    });

    return { success: true, status };
  },

  async restartWorkflow(approvalId) {
    const context = await this.getContext(approvalId);
    if (!context) throw new Error("Workflow not found");

    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { status: "PENDING", hodRemark: null, deanRemark: null }, // FIXED
    });

    await prisma.decisionToken.deleteMany({ where: { projId: approvalId } });

    await prisma.projectLog.create({
      data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: "RESTARTED", comment: "PI restarted submission after rejection." },
    });

    return { success: true };
  },
};