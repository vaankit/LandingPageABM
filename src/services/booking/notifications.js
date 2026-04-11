import nodemailer from "nodemailer";

let transporterPromise = null;

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

function isTruthy(value) {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

function ownerEmail() {
  return env("BOOKING_OWNER_EMAIL");
}

function hasSmtpConfig() {
  return Boolean(
    env("SMTP_URL")
    || (env("SMTP_HOST") && env("SMTP_PORT") && env("SMTP_USER") && env("SMTP_PASS"))
  );
}

function fromEmail() {
  return env("SMTP_FROM_EMAIL") || env("SMTP_USER") || ownerEmail();
}

function fromName() {
  return env("SMTP_FROM_NAME", "Spot.AI Booking");
}

function replyToEmail(booking) {
  return booking?.workEmail || ownerEmail();
}

function renderServices(services) {
  return Array.isArray(services) && services.length ? services.join(", ") : "Not specified";
}

function buildTextBody(payload) {
  const booking = payload.booking || {};

  return [
    `New Spot.AI inquiry`,
    ``,
    `Intent: ${booking.intentLabel || booking.intent || "Booking request"}`,
    `Name: ${booking.fullName || "-"}`,
    `Email: ${booking.workEmail || "-"}`,
    `Phone: ${booking.phone || "-"}`,
    `Company: ${booking.companyName || "-"}`,
    `Preferred date: ${booking.preferredDateDisplay || booking.preferredDate || "-"}`,
    `Timezone: ${booking.timeZone || "-"}`,
    `Requested services: ${renderServices(booking.requestedServices)}`,
    `Source page: ${booking.sourcePageTitle || "-"}`,
    `Source URL: ${booking.sourcePageUrl || "-"}`,
    `Callback requested: ${booking.requestCallback ? "Yes" : "No"}`,
    ``,
    `Notes:`,
    booking.notes || "-",
    ``,
    `Booking ID: ${booking.id || "-"}`
  ].join("\n");
}

function buildHtmlBody(payload) {
  const booking = payload.booking || {};
  const rows = [
    ["Intent", booking.intentLabel || booking.intent || "Booking request"],
    ["Name", booking.fullName || "-"],
    ["Email", booking.workEmail || "-"],
    ["Phone", booking.phone || "-"],
    ["Company", booking.companyName || "-"],
    ["Preferred date", booking.preferredDateDisplay || booking.preferredDate || "-"],
    ["Timezone", booking.timeZone || "-"],
    ["Requested services", renderServices(booking.requestedServices)],
    ["Source page", booking.sourcePageTitle || "-"],
    ["Source URL", booking.sourcePageUrl || "-"],
    ["Callback requested", booking.requestCallback ? "Yes" : "No"],
    ["Booking ID", booking.id || "-"]
  ];

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">New Spot.AI inquiry</h2>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 18px;">
        <tbody>
          ${rows.map(([label, value]) => `
            <tr>
              <td style="padding: 8px 12px 8px 0; font-weight: 700; vertical-align: top; width: 180px;">${label}</td>
              <td style="padding: 8px 0; vertical-align: top;">${value}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <h3 style="margin: 0 0 8px;">Notes</h3>
      <p style="margin: 0; white-space: pre-wrap;">${booking.notes || "-"}</p>
    </div>
  `;
}

async function getTransporter() {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = Promise.resolve().then(() => {
    if (env("SMTP_URL")) {
      return nodemailer.createTransport(env("SMTP_URL"));
    }

    return nodemailer.createTransport({
      host: env("SMTP_HOST"),
      port: Number(env("SMTP_PORT", "587")),
      secure: isTruthy(env("SMTP_SECURE")),
      auth: {
        user: env("SMTP_USER"),
        pass: env("SMTP_PASS")
      }
    });
  });

  return transporterPromise;
}

async function sendOwnerEmail(payload) {
  if (!ownerEmail()) {
    return {
      status: "skipped",
      reason: "owner-email-not-configured"
    };
  }

  if (!hasSmtpConfig()) {
    return {
      status: "skipped",
      reason: "smtp-not-configured"
    };
  }

  const transporter = await getTransporter();
  const booking = payload.booking || {};
  const subject = `[Spot.AI] ${booking.intentLabel || "New inquiry"} from ${booking.fullName || "website visitor"}`;
  const info = await transporter.sendMail({
    from: `"${fromName()}" <${fromEmail()}>`,
    to: ownerEmail(),
    replyTo: replyToEmail(booking),
    subject,
    text: buildTextBody(payload),
    html: buildHtmlBody(payload)
  });

  return {
    status: "sent",
    messageId: info.messageId,
    accepted: info.accepted || []
  };
}

async function sendWebhook(payload) {
  const endpoint = env("BOOKING_NOTIFICATION_WEBHOOK_URL");
  if (!endpoint) {
    return {
      status: "skipped",
      reason: "notification-webhook-not-configured"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text ? { raw: text } : null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Notification webhook failed with ${response.status}.`);
  }

  return {
    status: "sent",
    response: data
  };
}

export function getNotificationSystemStatus() {
  return {
    ownerEmailConfigured: Boolean(ownerEmail()),
    emailNotificationsConfigured: Boolean(ownerEmail() && hasSmtpConfig()),
    notificationWebhookConfigured: Boolean(env("BOOKING_NOTIFICATION_WEBHOOK_URL"))
  };
}

export async function notifyBookingOwner(payload) {
  let email;
  try {
    email = await sendOwnerEmail(payload);
  } catch (error) {
    email = {
      status: "failed",
      error: error.message
    };
  }

  let webhook;
  try {
    webhook = await sendWebhook(payload);
  } catch (error) {
    webhook = {
      status: "failed",
      error: error.message
    };
  }

  const status = email.status === "sent" || webhook.status === "sent" ? "sent" : "skipped";

  return {
    status,
    email,
    webhook
  };
}
