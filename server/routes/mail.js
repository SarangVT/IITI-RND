import { Router } from "express";
import prisma from "../db/prisma.js";
import { ApprovalService } from "../services/approvalService.js";

import { createSuccessPageHtml } from "../controllers/mailController/html/hodTemplates.js";
import { createDeanSuccessPageHtml } from "../controllers/mailController/html/deanTemplates.js";

const router = Router();

// ==================================================================
// HOD ROUTES
// ==================================================================

// 1. Intercept the click from the email (The missing GET route!)
router.get("/hod/decision", async (req, res) => {
  const { token } = req.query;

  const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
  
  if (!record) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
        <p>This decision link has already been used or no longer exists.</p>
      </div>
    `);
  }

  // If the HOD clicked "Approve"
  if (record.action === "ACCEPT") {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Confirm Approval</h2>
          <p class="text-gray-600 mb-6">Are you sure you want to approve this project step and forward it to the Dean?</p>
          <form method="POST" action="/api/mail/hod/accept">
            <input type="hidden" name="token" value="${token}" />
            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition">
              Yes, Approve Now
            </button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  // If the HOD clicked "Request Changes"
  if (record.action === "REJECT") {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Request Changes</h2>
          <p class="text-gray-600 mb-6 text-sm">Please provide a reason. This will be sent back to the submitter.</p>
          <form method="POST" action="/api/mail/hod/reject" class="space-y-4">
            <input type="hidden" name="token" value="${token}" />
            <textarea name="comment" required rows="4" class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Type your feedback here..."></textarea>
            <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition">
              Submit Feedback
            </button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

// 2. Process the HOD Form Submissions (Your existing POST routes)
router.post("/hod/accept", async (req, res) => {
  const { token } = req.body;
  
  const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
  if (!record || record.action !== "ACCEPT") return res.send("Invalid or used token");
  
  await prisma.decisionToken.update({ where: { id: record.id }, data: { used: true } });
  await ApprovalService.processHodDecision(record.projId, "ACCEPT");
  
  return res.send(createSuccessPageHtml("Approval Recorded", "Forwarded for Dean review."));
});

router.post("/hod/reject", async (req, res) => {
  const { token, comment } = req.body;
  if (!comment) return res.send("Comment required");
  
  const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
  if (!record || record.action !== "REJECT") return res.send("Invalid or used token");
  
  await prisma.decisionToken.update({ where: { id: record.id }, data: { used: true } });
  await ApprovalService.processHodDecision(record.projId, "REJECT", comment);
  
  return res.send(createSuccessPageHtml("Changes Requested", "Feedback sent to submitter."));
});


// ==================================================================
// DEAN ROUTES
// ==================================================================

// 1. Intercept the click from the email
router.get("/dean/decision", async (req, res) => {
  const { token } = req.query;

  const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
  
  if (!record) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
        <p>This decision link has already been used or no longer exists.</p>
      </div>
    `);
  }

  if (record.action === "ACCEPT") {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Confirm Final Approval</h2>
          <p class="text-gray-600 mb-6">Are you sure you want to grant final approval for this project step?</p>
          <form method="POST" action="/api/mail/dean/accept">
            <input type="hidden" name="token" value="${token}" />
            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition">
              Grant Final Approval
            </button>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  if (record.action === "REJECT") {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Request Changes (Dean)</h2>
          <p class="text-gray-600 mb-6 text-sm">Please provide a reason. This will be sent back to the submitter.</p>
          <form method="POST" action="/api/mail/dean/reject" class="space-y-4">
            <input type="hidden" name="token" value="${token}" />
            <textarea name="comment" required rows="4" class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Type your feedback here..."></textarea>
            <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition">
              Submit Feedback
            </button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

// 2. Process the Dean Form Submissions
router.post("/dean/accept", async (req, res) => {
  const { token } = req.body;
  
  const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
  if (!record || record.action !== "ACCEPT") return res.send("Invalid or used token");
  
  await prisma.decisionToken.update({ where: { id: record.id }, data: { used: true } });
  await ApprovalService.processDeanDecision(record.projId, "ACCEPT");
  
  return res.send(createDeanSuccessPageHtml("Final Approval Recorded", "The project step has been fully approved."));
});

router.post("/dean/reject", async (req, res) => {
  const { token, comment } = req.body;
  if (!comment) return res.send("Comment required");
  
  const record = await prisma.decisionToken.findUnique({ where: { token, used: false } });
  if (!record || record.action !== "REJECT") return res.send("Invalid or used token");
  
  await prisma.decisionToken.update({ where: { id: record.id }, data: { used: true } });
  await ApprovalService.processDeanDecision(record.projId, "REJECT", comment);
  
  return res.send(createDeanSuccessPageHtml("Rejected", "Your feedback has been recorded and sent to the submitter."));
});

export default router;