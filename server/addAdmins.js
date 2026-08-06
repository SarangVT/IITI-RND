import 'dotenv/config';
import prisma from "./db/prisma.js";
//node --env-file=server/.env server/addAdmins.js
async function main() {
  const targetEmail = 'cse240001065@iiti.ac.in';
  const targetName = 'System Admin'; // You can change the name if needed

  console.log(`Starting to add ${targetEmail} as Admin and SuperAdmin...`);

  // 1. Add as Admin
  const admin = await prisma.admin.upsert({
    where: { email: targetEmail },
    update: {}, // If exists, do nothing
    create: {
      email: targetEmail,
      name: targetName,
    },
  });
  console.log(`✅ Admin verified/created: ${admin.email}`);

  // 2. Add as SuperAdmin
  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: targetEmail },
    update: {}, // If exists, do nothing
    create: {
      email: targetEmail,
      name: targetName,
    },
  });
  console.log(`✅ SuperAdmin verified/created: ${superAdmin.email}`);
  
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error adding admins:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });