import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import { member, organization, user } from "./schema/auth";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seedPublicUserAndOrg() {
  console.log("Seeding public user and organization...");

  const now = new Date();

  // Insert public user
  await db
    .insert(user)
    .values({
      id: "public",
      name: "Public User",
      email: "public@ocrbase.local",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  console.log("Inserted public user");

  // Insert public organization
  await db
    .insert(organization)
    .values({
      id: "public",
      name: "Public",
      slug: "public",
      createdAt: now,
    })
    .onConflictDoNothing();

  console.log("Inserted public organization");

  // Insert public member
  await db
    .insert(member)
    .values({
      id: "public-member",
      organizationId: "public",
      userId: "public",
      role: "owner",
      createdAt: now,
    })
    .onConflictDoNothing();

  console.log("Inserted public member");

  console.log("Seeding complete!");
}

seedPublicUserAndOrg()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  });
