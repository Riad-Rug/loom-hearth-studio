import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const allowedRoles = new Set(["admin", "editor", "viewer"]);

function readFlag(flagName) {
  const index = process.argv.indexOf(flagName);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

async function main() {
  const emailInput = readFlag("--email");
  const roleInput = readFlag("--role");

  if (!emailInput || !roleInput) {
    console.error(
      'Usage: npm run admin:promote-user -- --email "user@example.com" --role admin',
    );
    process.exitCode = 1;
    return;
  }

  const email = emailInput.trim().toLowerCase();
  const role = roleInput.trim().toLowerCase();

  if (!allowedRoles.has(role)) {
    console.error('Invalid role. Allowed roles: "admin", "editor", "viewer".');
    process.exitCode = 1;
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!existingUser) {
    console.error(`No existing user was found for ${email}.`);
    process.exitCode = 1;
    return;
  }

  const updatedUser = await prisma.user.update({
    where: {
      email,
    },
    data: {
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        status: "updated",
        user: updatedUser,
        previousRole: existingUser.role,
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
