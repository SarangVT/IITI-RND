import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: (process.env.NODE_ENV === "DEV" 
      ? process.env.DEV_DATABASE_URL 
      : process.env.REMOTE_DATABASE_URL) as string,
  },
});