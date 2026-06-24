import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { UserRole } from "../src/generated/prisma/enums";
import { hashPassword } from "../src/lib/password";
import { getPgConnectionString } from "../src/lib/database-url";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const pool = new Pool({
  connectionString: getPgConnectionString(),
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const name = process.env.ADMIN_NAME ?? "Administrador";
  const email = (process.env.ADMIN_EMAIL ?? "admin@cobrapp.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "CambiaEstaClave123!";

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.ADMIN,
      status: "ACTIVE",
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      status: "ACTIVE",
    },
    select: {
      email: true,
      role: true,
      status: true,
    },
  });

  console.log(`Admin listo: ${admin.email} (${admin.role}, ${admin.status})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
