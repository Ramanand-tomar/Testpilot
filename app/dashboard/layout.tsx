import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users, repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import { ToastProvider } from '@/components/dashboard/toast-provider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect('/sign-in');

  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) {
    const [newUser] = await db.insert(users).values({
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
      email: email,
      credits: 1000,
    }).returning();
    dbUser = newUser;
  }

  const repoCount = await db.query.repositories.findMany({
    where: eq(repositories.userId, dbUser.id)
  }).then(r => r.length);

  const serializedUser = {
    name: dbUser.name || 'User',
    email: dbUser.email,
    plan: dbUser.plan,
    credits: dbUser.credits,
    githubConnected: !!dbUser.githubToken,
    repoCount
  };

  return (
    <ToastProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
        <Sidebar user={serializedUser} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar user={serializedUser} />
          <main className="flex-1 overflow-y-auto p-8 bg-[#09090b]">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
