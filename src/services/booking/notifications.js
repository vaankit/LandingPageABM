function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

export function isOwnerNotificationConfigured() {
  return Boolean(env("BOOKING_NOTIFICATION_WEBHOOK_URL"));
}

export async function notifyBookingOwner(payload) {
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
