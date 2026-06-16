import { db } from './db';
import { testCases } from './db/schema';
import { inArray } from 'drizzle-orm';

async function resetStuckTests() {
  console.log("Resetting stuck tests...");
  await db.update(testCases)
    .set({ status: 'fail' })
    .where(inArray(testCases.status, ['pending', 'running']));
  console.log("Done.");
  process.exit(0);
}

resetStuckTests();
