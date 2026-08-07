// deanHtmlTemplates.js

export function createDeanNotificationEmailHtml(project, committee, acceptLink, rejectLink, form = null, stepType = null) {
  const committeeMembers = Array.isArray(committee?.members) && committee.members.length 
    ? committee.members.join(", ") 
    : "N/A";

  let vacancyDetailsHtml = "";
  if (stepType === "RECRUITMENT_VACANCY" && form) {
    const ctc = form.basicSalary + (form.basicSalary * (form.hraPercent / 100));
    vacancyDetailsHtml = `
      <div style="margin-bottom:28px; font-size:14.5px; line-height:1.9; color:#4b5563;">
        <div style="margin-bottom:10px; font-size:15px; font-weight:600; color:#0d9488;">Vacancy & Financial Details</div>
        <div style="margin-bottom:8px;"><span style="font-weight:600; color:#6b7280;">Position:</span> <span style="font-weight:600; color:#374151; margin-left:6px;">${form.position}</span></div>
        <div style="margin-bottom:8px;"><span style="font-weight:600; color:#6b7280;">Number of Vacancies:</span> <span style="font-weight:600; color:#374151; margin-left:6px;">${form.count}</span></div>
        <div style="margin-bottom:8px;"><span style="font-weight:600; color:#6b7280;">Basic Salary:</span> <span style="font-weight:600; color:#374151; margin-left:6px;">₹${form.basicSalary.toLocaleString()}</span></div>
        <div style="margin-bottom:8px;"><span style="font-weight:600; color:#6b7280;">HRA:</span> <span style="font-weight:600; color:#374151; margin-left:6px;">${form.hraPercent}%</span></div>
        <div style="margin-bottom:8px;"><span style="font-weight:600; color:#6b7280;">Total CTC/Month:</span> <span style="font-weight:600; color:#374151; margin-left:6px;">₹${ctc.toLocaleString()}</span></div>
        ${form.adPdfUrl ? `<div><span style="font-weight:600; color:#6b7280;">Advertisement:</span> <a href="${form.adPdfUrl}" target="_blank" style="font-weight:600; color:#2563eb; text-decoration:none; margin-left:6px;">View PDF Link</a></div>` : ''}
      </div>
    `;
  }

  return `
    <div style="font-family:Inter,Arial,sans-serif;margin:0;padding:0;background-color:#f8fafc;color:#374151;text-align:left;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
        <tr>
          <td align="left" style="padding:40px 24px;">
            <div style="max-width:640px;margin:0 auto;text-align:left;">
              <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#0f766e;">Final Approval Required</h2>
              <p style="margin:0 0 26px 0;font-size:15px;font-weight:500;color:#6b7280;">
                This ${stepType.replace('_', ' ')} has been approved by the Head of Department and now requires your final decision.
              </p>

              <div style="margin-bottom:26px;font-size:14.5px;line-height:1.9;color:#4b5563;">
                <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Title:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span></div>
                <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Funding Agency:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.fundingAgency}</span></div>
                <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Duration:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.projectDuration}</span></div>
                <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Submitted By:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.userEmail}</span></div>
                <div><span style="font-weight:600;color:#6b7280;">HOD Email:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.hodEmail}</span></div>
              </div>

              ${vacancyDetailsHtml}

              <div style="margin-bottom:28px;font-size:14.5px;line-height:1.9;color:#4b5563;">
                <div style="margin-bottom:10px;font-size:15px;font-weight:600;color:#0d9488;">Selection Committee</div>
                <div style="margin-bottom:8px;"><span style="font-weight:600;color:#6b7280;">Chair:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${committee?.chair || "N/A"}</span></div>
                <div><span style="font-weight:600;color:#6b7280;">Members:</span><span style="margin-left:6px;color:#374151;font-weight:500;">${committeeMembers}</span></div>
              </div>

              <div style="margin-top:22px;">
                <a href="${acceptLink}" style="display:inline-block;padding:11px 22px;font-size:14.5px;font-weight:600;color:#ffffff;background-color:#0d9488;border-radius:8px;text-decoration:none;margin-right:12px;">Final Approve</a>
                <a href="${rejectLink}" style="display:inline-block;padding:11px 22px;font-size:14.5px;font-weight:600;color:#374151;background-color:#e5e7eb;border-radius:8px;text-decoration:none;">Request Changes</a>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function createDeanErrorPageHtml(title, message) {
  return `
    <html>
      <body style="margin:0;background:#f8fafc;font-family:Inter,Arial;">
        <div style="max-width:640px;margin:80px auto;padding:40px 24px;">
          <h2 style="color:#dc2626;">${title}</h2>
          <p style="color:#6b7280;">${message}</p>
        </div>
      </body>
    </html>
  `;
}

export function createDeanConfirmAcceptHtml(project, token) {
  return `
    <html>
      <body style="margin:0;background:#f8fafc;font-family:Inter,Arial;color:#374151;">
        <div style="max-width:640px;margin:80px auto;padding:40px 24px;">
          <h2 style="font-size:24px;font-weight:700;color:#0f766e;">Confirm Final Approval</h2>
          <p style="color:#6b7280;">You are about to finalize this project step.</p>
          <div style="margin-top:20px;"><span style="font-weight:600;color:#6b7280;">Project:</span><span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span></div>
          <form method="POST" action="/api/mail/dean/accept">
            <input type="hidden" name="token" value="${token}" />
            <button style="margin-top:20px;padding:12px 24px;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;">Confirm Final Approval</button>
          </form>
        </div>
      </body>
    </html>
  `;
}

export function createDeanRejectFormHtml(project, token) {
  return `
    <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#374151;">
        <div style="max-width:640px;margin:0 auto;padding:40px 24px;">
          <h2 style="margin:0 0 10px 0;font-size:24px;font-weight:700;color:#0f766e;">Request Changes</h2>
          <p style="margin:0 0 24px 0;font-size:15px;color:#6b7280;">Provide feedback for the following project before it can proceed.</p>
          <div style="margin-bottom:24px;font-size:14.5px;line-height:1.8;">
            <span style="font-weight:600;color:#6b7280;">Project:</span>
            <span style="font-weight:600;color:#374151;margin-left:6px;">${project.title}</span>
          </div>
          <form method="POST" action="/api/mail/dean/reject">
            <input type="hidden" name="token" value="${token}" />
            <textarea name="comment" required placeholder="Describe the required changes clearly..." style="width:100%;height:140px;padding:14px;border-radius:10px;border:1px solid #d1d5db;font-size:14.5px;resize:none;outline:none;color:#374151;margin-bottom:18px;"></textarea>
            <button type="submit" style="display:inline-block;padding:12px 24px;font-size:14.5px;font-weight:600;color:#ffffff;background-color:#0d9488;border:none;border-radius:8px;cursor:pointer;">
              Submit Changes
            </button>
          </form>
          <p style="margin-top:30px;font-size:12.5px;color:#9ca3af;">Your feedback will be shared with the submitter for revision.</p>
        </div>
      </body>
    </html>
  `;
}

export function createDeanSuccessPageHtml(title, message) {
  return `
    <html>
      <body style="margin:0;background:#f8fafc;font-family:Inter,Arial;">
        <div style="max-width:640px;margin:80px auto;padding:40px 24px;text-align:center;">
          <h2 style="color:#0f766e;margin-bottom:12px;">${title}</h2>
          <p style="color:#6b7280;font-size:15px;">${message}</p>
        </div>
      </body>
    </html>
  `;
}

export function createDeanConfirmAcceptTailwind(token) {
  return `
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
  `;
}

export function createDeanRejectFormTailwind(token) {
  return `
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
  `;
}