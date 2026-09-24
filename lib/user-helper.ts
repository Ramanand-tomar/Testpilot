import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

export const getOrCreateUser = cache(async (email: string, name?: string | null) => {
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!dbUser) {
    const inserted = await db.insert(users).values({
      email,
      name: name || null,
      credits: 1000,
      plan: 'Free',
    }).onConflictDoNothing({ target: users.email }).returning();

    dbUser = inserted[0] || (await db.query.users.findFirst({
      where: eq(users.email, email),
    }));
  }

  return dbUser;
});
