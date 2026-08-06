import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: (process.env.NODE_ENV="DEV" ? process.env.DEV_DATABASE_URL:process.env.REMOTE_DATABASE_URL),
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
