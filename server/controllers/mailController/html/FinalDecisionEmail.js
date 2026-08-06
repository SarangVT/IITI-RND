export const createFinalDecisionEmail = (project, decision, deanComment = null) => {
  const isApproved = decision === "APPROVED";
  const color = isApproved ? "#10B981" : "#EF4444";
  const tag = isApproved ? "Approved by Dean" : "Rejected by Dean";
  const background = isApproved ? "#f0fdf4" : "#fef2f2";
  const message = isApproved
    ? "Good news! Your project has been APPROVED by the Dean (R&D)."
    : "We regret to inform you that your project has been REJECTED at the Dean (R&D) level.";

  const commentBlock = deanComment
    ? `<li style="margin-bottom: 0;"><strong>Dean Comment:</strong> <span style="color: #374151;">${deanComment}</span></li>`
    : "";

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background-color: ${color}; padding: 20px; color: white; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Final Project Decision: ${tag}</h1>
        </div>
        <div style="padding: 25px 25px 15px 25px; line-height: 1.6; color: #333;">
            <p style="margin-bottom: 20px;">Dear ${project.userEmail.split("@")[0]
    },</p>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 25px 0;">
            <h3 style="margin-top: 0; color: ${color}; font-size: 18px;">Project Details</h3>
            <ul style="list-style: none; padding: 15px 20px; margin: 0 0 20px 0; background-color: ${background}; border-radius: 8px; border-left: 5px solid ${color};">
              <li style="margin-bottom: 8px;"><strong>Title:</strong> ${project.title
    }</li>
              <li style="margin-bottom: 8px;"><strong>Final Status:</strong> <span style="font-weight: bold; color: ${color};">${project.status
    }</span></li>
              ${commentBlock}
            </ul>
            <p style="font-size: 0.9em; color: #777; text-align: center;">Thank you for using the R&D Portal.</p>
        </div>
    </div>
  `;
};