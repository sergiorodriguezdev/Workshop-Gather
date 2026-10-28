import { logger } from "./logger";

type RsvpCountWebhookPayload = {
  workshopName: string;
  rsvps: number;
  updatedAt: string;
};

export async function sendRsvpCountWebhook(
  payload: RsvpCountWebhookPayload,
): Promise<void> {
  const webhookUrl = process.env.GATHER_RSVP_WEBHOOK_URL;
  const webhookSecret = process.env.GATHER_RSVP_WEBHOOK_SECRET;
  const externalAccessToken = process.env.GATHER_RSVP_WEBHOOK_ACCESS_TOKEN;
  if (!webhookUrl) return;
  if (!webhookSecret) {
    logger.warn("Gather RSVP webhook secret is missing; notification was skipped");
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    logger.warn("Gather RSVP webhook URL is invalid; notification was skipped");
    return;
  }
  if (parsedUrl.protocol !== "https:") {
    logger.warn("Gather RSVP webhook URL must use HTTPS");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(parsedUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Webhook-Secret": webhookSecret,
        ...(externalAccessToken
          ? { authorization: `Bearer ${externalAccessToken}` }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      logger.warn(
        { status: response.status, workshopName: payload.workshopName },
        "Gather RSVP webhook returned a non-success status",
      );
    }
  } catch {
    logger.warn(
      { workshopName: payload.workshopName },
      "Gather RSVP webhook delivery failed",
    );
  } finally {
    clearTimeout(timeout);
  }
}
