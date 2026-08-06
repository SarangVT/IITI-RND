import prisma from "../db/prisma.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { server } from "../lib/client.js";

import { createHodApprovalEmailHtml } from "../controllers/mailController/html/hodTemplates.js";
import { createDeanNotificationEmailHtml } from "../controllers/mailController/html/deanTemplates.js";
import { createSubmitterUpdateEmail } from "../controllers/mailController/html/SubmitterUpdateEmail.js";

const isProd = process.env.NODE_ENV === "PROD";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RND_EMAIL,
    pass: process.env.RND_APP_PASSWD,
  },
});

async function dispatchEmail(to, subject, html) {
  if (isProd) {
    if (!process.env.GOOGLE_MAIL_WEBHOOK) {
      throw new Error("Missing GOOGLE_MAIL_WEBHOOK in Render environment variables");
    }
    const response = await fetch(process.env.GOOGLE_MAIL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    const result = await response.json();
    if (!result.success) throw new Error("Google Webhook Failed: " + result.error);
  } else {
    await transporter.sendMail({
      from: `"Rnd Department" <${process.env.RND_EMAIL}>`,
      to,
      subject,
      html,
    });
  }
}

export const ApprovalService = {
  async createWorkflow(stepType) {
    return await prisma.approvalWorkflow.create({
      data: {
        stepType,
        status: "PENDING",
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

    const acceptToken = await this.createToken(approvalId, "ACCEPT");
    const rejectToken = await this.createToken(approvalId, "REJECT");

    const acceptLink = `${server}/api/mail/hod/decision?token=${acceptToken}`;
    const rejectLink = `${server}/api/mail/hod/decision?token=${rejectToken}`;
    const committee = context.isStaff ? context.form.selectionCommittee || {} : {};

    try {
      await dispatchEmail(
        context.project.hodEmail,
        `Approval Required [${context.workflow.stepType}]: ${context.project.title}`,
        createHodApprovalEmailHtml(context.project, committee, acceptLink, rejectLink)
      );
    } catch (mailError) {
      console.error("Mail Dispatch Failed:", mailError);
      throw new Error("Failed to send email to HOD. Submission aborted.");
    }

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

      await dispatchEmail(
        context.project.userEmail,
        `Changes Requested by HOD: ${context.project.title}`,
        createSubmitterUpdateEmail(context.project, "REJECTED", comment)
      );

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

      await dispatchEmail(
        process.env.DEAN_EMAIL,
        `Final Approval Required: ${context.project.title}`,
        createDeanNotificationEmailHtml(context.project, committee, acceptLink, rejectLink)
      );

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

    await dispatchEmail(
      context.project.userEmail,
      `Project Step ${action === "ACCEPT" ? "Approved" : "Rejected"}: ${context.project.title}`,
      createSubmitterUpdateEmail(context.project, status, comment)
    );

    return { success: true, status };
  },

  async restartWorkflow(approvalId) {
    const context = await this.getContext(approvalId);
    if (!context) throw new Error("Workflow not found");

    await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: { status: "PENDING", hodRemark: null, deanRemark: null },
    });

    await prisma.decisionToken.deleteMany({ where: { projId: approvalId } });

    await prisma.projectLog.create({
      data: { projectId: context.project.id, projectRoleId: context.role.id, approvalWorkflowId: approvalId, action: "RESTARTED", comment: "PI restarted submission after rejection." },
    });

    return { success: true };
  },
};