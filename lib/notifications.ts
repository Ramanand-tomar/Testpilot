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
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Testpilot Alerts <alerts@testpilot.dev>';
      await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject,
        text: textBody,
      });
    } catch (e) {
      console.error('Failed to send email:', e);
    }
  }

  // Slack (Verify URL domain is hooks.slack.com for security)
  if (settings.slackWebhookUrl && typeof settings.slackWebhookUrl === 'string') {
    const url = settings.slackWebhookUrl.trim();
    if (url.startsWith('https://hooks.slack.com/')) {
      try {
        await fetch(url, {
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
}
