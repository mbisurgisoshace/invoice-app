import * as Sentry from "@sentry/nextjs";
import { MailtrapClient } from "mailtrap";

export const emailClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN!,
});

// Awaited so serverless functions don't exit before the request completes.
// Failures are logged instead of thrown so they don't block the calling action.
export async function sendEmail(mail: Parameters<MailtrapClient["send"]>[0]) {
  try {
    await emailClient.send(mail);
  } catch (err) {
    console.error("Failed to send email", err);
    Sentry.captureException(err);
  }
}
