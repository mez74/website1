import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

/**
 * Sends an email to a specific recipient using the Manus Forge API.
 * This is different from notifyOwner - it sends to the specified email address,
 * not to the project owner.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, body } = payload;

  if (!to || !subject || !body) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email recipient, subject, and body are required.",
    });
  }

  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service URL is not configured.",
    });
  }

  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service API key is not configured.",
    });
  }

  const endpoint = new URL(
    "webdevtoken.v1.WebDevService/SendNotificationToEmail",
    ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
  ).toString();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        email: to,
        title: subject,
        content: body,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email to ${to} (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}
