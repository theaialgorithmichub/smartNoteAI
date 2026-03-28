import type { AgentAction, FeedbackType } from '@/lib/models/feedback-report';

export function buildCursorAgentPrompt(params: {
  action: AgentAction;
  type: FeedbackType;
  description: string;
  submitterName: string;
  submitterEmail: string;
  repoUrl: string;
  branch: string;
  reportId: string;
}): string {
  const headline =
    params.action === 'fix'
      ? 'Bug fix'
      : params.action === 'implement'
        ? 'Feature implementation'
        : 'Product improvement';
  return [
    `# ${headline} — SmartNote AI`,
    ``,
    `## Ticket`,
    `- ID: ${params.reportId}`,
    `- Type: ${params.type}`,
    `- Reporter: ${params.submitterName} <${params.submitterEmail}>`,
    ``,
    `## Repository`,
    `- URL: ${params.repoUrl}`,
    `- Branch: ${params.branch}`,
    ``,
    `## Description`,
    params.description.trim(),
    ``,
    `## Agent instructions`,
    `1. Check out or base work on branch \`${params.branch}\` in the repo above.`,
    `2. ${headline.toLowerCase()} according to the description; follow existing code style and patterns.`,
    `3. Add or update tests when it is a bug fix or risky change.`,
    `4. Summarize commits and risks for humans.`,
  ].join('\n');
}

export type CursorWebhookResult =
  | { ok: true; status: number; detail: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped?: false; status?: number; detail: string };

/**
 * Posts a JSON payload to CURSOR_WEBHOOK_URL if set (your Cursor Cloud Agent, Zapier, or internal bridge).
 * Optional CURSOR_WEBHOOK_SECRET sent as Authorization: Bearer …
 */
export async function postCursorAgentWebhook(payload: Record<string, unknown>): Promise<CursorWebhookResult> {
  const url = process.env.CURSOR_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, skipped: true, reason: 'CURSOR_WEBHOOK_URL is not set — prompt was saved on the ticket only.' };
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const secret = process.env.CURSOR_WEBHOOK_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 25_000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
    const text = await res.text();
    const detail = text.length > 3000 ? `${text.slice(0, 3000)}…` : text;
    if (!res.ok) {
      return { ok: false, status: res.status, detail };
    }
    return { ok: true, status: res.status, detail: detail || 'OK' };
  } catch (e) {
    return {
      ok: false,
      detail: e instanceof Error ? e.message : 'Webhook request failed',
    };
  } finally {
    clearTimeout(timer);
  }
}
