import prisma from "../db/prisma.js";
import { ApprovalService } from "./approvalService.js";

export const ProjectService = {
  async getAllProjects() {
    return await prisma.project.findMany({
      include: {
        user: true,
        admin: true,
        roles: {
          include: {
            staffRecruitmentForm: { include: { approval: true } },
            recruitmentVacancy: { include: { approval: true } },
          },
        },
      },
    });
  },

  async getUserProjects(userEmail) {
    return await prisma.project.findMany({
      where: { userEmail },
      include: {
        roles: {
          include: {
            staffRecruitmentForm: { include: { approval: true } },
            recruitmentVacancy: { include: { approval: true } },
          },
        },
      },
    });
  },

  async getProjectById(projectId, userEmail = null) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        roles: {
          include: {
            staffRecruitmentForm: { include: { approval: true } },
            recruitmentVacancy: { include: { approval: true } },
          },
        },
        logs: { orderBy: { timestamp: "desc" } },
      },
    });

    if (!project) return null;
    if (userEmail && project.userEmail !== userEmail) return null;

    return project;
  },

  async createProject(adminEmail, data) {
    const { userEmail, title, fundingAgency, projectDuration, hodEmail } = data;
    return await prisma.project.create({
      data: {
        userEmail,
        title,
        fundingAgency,
        projectDuration,
        hodEmail,
        adminEmail,
      },
    });
  },

  async createProjectRole(projectId, roleName) {
    return await prisma.projectRole.create({
      data: { projectId, roleName },
    });
  },

  async saveStaffRecruitmentForm(projectRoleId, selectionCommittee) {
    let form = await prisma.staffRecruitmentForm.findUnique({
      where: { projectRoleId },
      include: { approval: true },
    });

    if (!form) {
      const workflow = await ApprovalService.createWorkflow("STAFF_RECRUITMENT");
      form = await prisma.staffRecruitmentForm.create({
        data: {
          projectRoleId,
          selectionCommittee,
          approvalId: workflow.id,
        },
        include: { approval: true },
      });
    } else {
      form = await prisma.staffRecruitmentForm.update({
        where: { id: form.id },
        data: { selectionCommittee },
        include: { approval: true },
      });
    }

    return form;
  },

  async saveRecruitmentVacancy(projectRoleId, vacancyData) {
    const { position, count, basicSalary, hraPercent, adPdfUrl } = vacancyData;

    let vacancy = await prisma.recruitmentVacancy.findUnique({
      where: { projectRoleId },
      include: { approval: true },
    });

    if (!vacancy) {
      const workflow = await ApprovalService.createWorkflow("RECRUITMENT_VACANCY");
      vacancy = await prisma.recruitmentVacancy.create({
        data: {
          projectRoleId,
          position,
          count: parseInt(count) || 1,
          basicSalary: parseFloat(basicSalary),
          hraPercent: parseFloat(hraPercent),
          adPdfUrl: adPdfUrl || null,
          approvalId: workflow.id,
        },
        include: { approval: true },
      });
    } else {
      vacancy = await prisma.recruitmentVacancy.update({
        where: { id: vacancy.id },
        data: {
          position,
          count: parseInt(count) || 1,
          basicSalary: parseFloat(basicSalary),
          hraPercent: parseFloat(hraPercent),
          adPdfUrl: adPdfUrl || vacancy.adPdfUrl,
        },
        include: { approval: true },
      });
    }

    return vacancy;
  },
};