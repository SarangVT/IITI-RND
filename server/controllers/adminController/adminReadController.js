import prisma from "../../db/prisma.js";

export const AdminReadController = {
  // Suggest HOD emails based on search query
  async suggestDepartmentAuthority(req, res) {
    try {
      const { role, q } = req.query;

      if (!role || role !== "HOD") {
        return res.status(400).json({ success: false, message: "role must be HOD" });
      }

      const whereClause = q ? { hod_email: { contains: q, mode: "insensitive" } } : {};

      const results = await prisma.departmentAuthority.findMany({
        where: whereClause,
        select: { hod_email: true },
        orderBy: { hod_email: "asc" },
      });

      res.json({ success: true, emails: [...new Set(results.map(r => r.hod_email))] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get all Department Authorities
  async getAllDepartmentAuthorities(req, res) {
    try {
      const departments = await prisma.departmentAuthority.findMany({
        orderBy: { dept_name: "asc" },
      });
      res.json({ success: true, departments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};