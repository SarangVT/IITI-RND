import prisma from "../db/prisma.js";

export const AdminService = {
  async forceWorkflowStage(approvalId, targetStatus, adminComment = null) {
    // 1. Verify the workflow exists
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { id: approvalId },
      include: {
        staffForm: { include: { projectRole: { include: { project: true } } } },
        vacancyForm: { include: { projectRole: { include: { project: true } } } },
      }
    });

    if (!workflow) throw new Error("Workflow not found");
    const form = workflow.staffForm || workflow.vacancyForm;
    const project = form?.projectRole?.project;

    // 2. Clear out any legacy tokens so old email links become inactive
    await prisma.decisionToken.deleteMany({
      where: { projId: approvalId }
    });

    // 3. Update the workflow state
    const updatedWorkflow = await prisma.approvalWorkflow.update({
      where: { id: approvalId },
      data: {
        status: targetStatus,
        // Reset remarks if moving backwards, or handle dates if pushing forwards
        ...(targetStatus === "PENDING" && { hodRemark: null, deanRemark: null }),
        ...(targetStatus === "PENDING_HOD" && { submittedAt: new Date() }),
        ...(targetStatus === "PENDING_DEAN" && { hodActedAt: new Date() }),
        ...(targetStatus === "APPROVED" && { deanActedAt: new Date() }),
      }
    });

    // 4. Log the administrative override action
    if (project) {
      await prisma.projectLog.create({
        data: {
          projectId: project.id,
          projectRoleId: form?.projectRoleId,
          approvalWorkflowId: approvalId,
          action: `ADMIN_FORCE_${targetStatus}`,
          comment: adminComment || `Admin manually changed stage to ${targetStatus}.`
        }
      });
    }

    return updatedWorkflow;
  },

  /**
   * Full Edit control over the core metadata of a project
   */
  async updateProjectMetadata(projectId, updateData) {
    return await prisma.project.update({
      where: { id: projectId },
      data: {
        title: updateData.title,
        fundingAgency: updateData.fundingAgency,
        projectDuration: updateData.projectDuration,
        hodEmail: updateData.hodEmail,
        userEmail: updateData.userEmail,
        adminEmail: updateData.adminEmail
      }
    });
  },

  async deleteProjectComplete(projectId) {
    // will clean up roles, forms, vacancies, and workflow states cleanly.
    return await prisma.project.delete({
      where: { id: projectId }
    });
  }
};