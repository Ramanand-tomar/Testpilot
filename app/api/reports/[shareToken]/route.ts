import { db } from '@/db';
import { testRuns, testCases, repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const resolvedParams = await params;
  const { shareToken } = resolvedParams;

  if (!shareToken) return new Response('Missing token', { status: 400 });

  let run = await db.query.testRuns.findFirst({
    where: eq(testRuns.shareToken, shareToken),
    with: {
      repository: true,
      testCases: true
    }
  });

  if (!run && (shareToken === 'demo-run-1' || shareToken === 'demo')) {
    return NextResponse.json({
      id: 1,
      shareToken: shareToken,
      repoId: 1,
      status: 'completed',
      totalTests: 5,
      passed: 5,
      failed: 0,
      durationMs: 12400,
      triggeredBy: 'manual',
      createdAt: new Date().toISOString(),
      repo: {
        fullName: 'Testpilot / Production-Demo-App',
        htmlUrl: 'https://github.com/ramanand-tomar/Ai-Testing-Automation-Agent'
      },
      testCases: [
        {
          id: 101,
          title: 'User Login & Authentication Flow',
          description: 'Verify OAuth and session token creation on /sign-in',
          status: 'pass',
          wasHealed: false,
          logs: [
            'Initializing Browserbase cloud browser...',
            'Navigating to http://localhost:3000/sign-in...',
            'Filled email: testuser@example.com',
            'Clicked Submit button -> redirecting to /dashboard',
            'Assertion passed: Dashboard loaded cleanly'
          ]
        },
        {
          id: 102,
          title: 'Stripe Payment Gateway Checkout',
          description: 'Verify checkout session creation & redirection to checkout.stripe.com',
          status: 'pass',
          wasHealed: true,
          logs: [
            'Navigating to /pricing...',
            'Clicked "Upgrade to Pro"',
            'Detected DOM change: "#submit-card" -> auto-healed locator',
            'Stripe Checkout loaded successfully with price_1UJXZ536wOYoL0yszb3d47hw',
            'Assertion passed: Stripe URL generated'
          ]
        }
      ]
    });
  }

  if (!run) return new Response('Report not found', { status: 404 });

  return NextResponse.json(run);
}
