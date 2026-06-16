import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendRunNotifications({
  userEmail,
  settings,
  repoName,
  passed,
  failed,
  shareUrl,
  triggeredBy
}: {
  userEmail: string;
  settings: any;
  repoName: string;
  passed: number;
  failed: number;
  shareUrl: string;
  triggeredBy: string;
}) {
  if (!settings) return;

  const total = passed + failed;
  const hasFailures = failed > 0;
  
  if (settings.notifyOn === 'failures_only' && !hasFailures) return;
  if (settings.notifyOn === 'scheduled_only' && triggeredBy !== 'scheduled') return;

  const subject = `[${hasFailures ? 'FAIL' : 'PASS'}] Test Run: ${repoName}`;
  const textBody = `Test run completed for ${repoName}.
Passed: ${passed}
Failed: ${failed}
Total: ${total}

View full report here: ${shareUrl}
`;

  // Email
  if (settings.emailEnabled && resend && userEmail) {
    try {
      await resend.emails.send({
        from: 'Ai Testing Agent <onboarding@resend.dev>',
        to: userEmail,
        subject,
        text: textBody,
      });
    } catch (e) {
      console.error('Failed to send email:', e);
    }
  }

  // Slack
  if (settings.slackWebhookUrl) {
    try {
      await fetch(settings.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*${subject}*\n${textBody}`
        })
      });
    } catch (e) {
      console.error('Failed to send Slack message:', e);
    }
  }
}
