import { server } from "../../lib/client.js";

export const createDeanNotificationEmail = (project, committee, acceptToken, rejectToken) => {
  const decisionBaseUrl = server;

  const acceptLink = `${decisionBaseUrl}/api/mail/dean/decision?token=${acceptToken}`;
  const rejectLink = `${decisionBaseUrl}/api/mail/dean/decision?token=${rejectToken}`;

  return `
  <div style="font-family:'Inter',Arial,sans-serif; margin:0; padding:0; background-color:#f8fafc; color:#374151; text-align:left;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;">
      <tr>
        <td align="left" style="padding:40px 24px; text-align:left;">

          <div style="max-width:640px; width:100%; margin-left:0; text-align:left;">

            <h2 style="margin:0 0 12px 0; font-size:24px; font-weight:700; color:#0f766e; text-align:left;">
              Final Approval Required
            </h2>

            <p style="margin:0 0 26px 0; font-size:15px; font-weight:500; color:#6b7280; text-align:left;">
              This project has been approved by the Head of Department and now requires your final decision.
            </p>

            <div style="margin-bottom:26px; font-size:14.5px; line-height:1.9; color:#4b5563; text-align:left;">
              
              <div style="margin-bottom:8px;">
                <span style="font-weight:600; color:#6b7280;">Title:</span>
                <span style="font-weight:600; color:#374151; margin-left:6px;">${project.title}</span>
              </div>

              <div style="margin-bottom:8px;">
                <span style="font-weight:600; color:#6b7280;">Funding Agency:</span>
                <span style="font-weight:600; color:#374151; margin-left:6px;">${project.fundingAgency}</span>
              </div>

              <div style="margin-bottom:8px;">
                <span style="font-weight:600; color:#6b7280;">Duration:</span>
                <span style="font-weight:600; color:#374151; margin-left:6px;">${project.projectDuration}</span>
              </div>

              <div style="margin-bottom:8px;">
                <span style="font-weight:600; color:#6b7280;">Submitted By:</span>
                <span style="font-weight:600; color:#374151; margin-left:6px;">${project.userEmail}</span>
              </div>

              <div>
                <span style="font-weight:600; color:#6b7280;">HOD Email:</span>
                <span style="font-weight:600; color:#374151; margin-left:6px;">${project.hodEmail}</span>
              </div>

            </div>

            <div style="margin-bottom:28px; font-size:14.5px; line-height:1.9; color:#4b5563; text-align:left;">
              
              <div style="margin-bottom:10px; font-size:15px; font-weight:600; color:#0d9488;">
                Selection Committee
              </div>

              <div style="margin-bottom:8px;">
                <span style="font-weight:600; color:#6b7280;">Chair:</span>
                <span style="font-weight:600; color:#374151; margin-left:6px;">${committee?.chair || "N/A"}</span>
              </div>

              <div>
                <span style="font-weight:600; color:#6b7280;">Members:</span>
                <span style="margin-left:6px; color:#374151; font-weight:500;">
                  ${
                    Array.isArray(committee?.members) && committee.members.length
                      ? committee.members.join(", ")
                      : "N/A"
                  }
                </span>
              </div>

            </div>

            <div style="margin-top:22px; text-align:left;">
              
              <a href="${acceptLink}" style="display:inline-block; padding:11px 22px; font-size:14.5px; font-weight:600; color:#ffffff; background-color:#0d9488; border-radius:8px; text-decoration:none; margin-right:12px;">
                Final Approve
              </a>

              <a href="${rejectLink}" style="display:inline-block; padding:11px 22px; font-size:14.5px; font-weight:600; color:#374151; background-color:#e5e7eb; border-radius:8px; text-decoration:none;">
                Request Changes
              </a>

            </div>

            <p style="margin-top:34px; font-size:12.5px; color:#9ca3af; text-align:left;">
              This decision will be recorded as final in the system.
            </p>

          </div>

        </td>
      </tr>
    </table>

  </div>
  `;
};