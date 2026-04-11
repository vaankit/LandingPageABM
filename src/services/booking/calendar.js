import { randomUUID } from "crypto";
import { DateTime, Interval } from "luxon";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

let cachedAccessToken = null;
let cachedExpiry = 0;

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

function toInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCalendarId() {
  return env("GOOGLE_CALENDAR_ID", "primary");
}

function getOwnerTimeZone(fallback = "UTC") {
  return env("BOOKING_OWNER_TIMEZONE", fallback);
}

function getDurationMinutes() {
  return toInteger(process.env.BOOKING_DURATION_MINUTES, 30);
}

function getBusinessHours() {
  return {
    startHour: toInteger(process.env.BOOKING_BUSINESS_START_HOUR, 9),
    endHour: toInteger(process.env.BOOKING_BUSINESS_END_HOUR, 17),
    lookaheadDays: toInteger(process.env.BOOKING_LOOKAHEAD_DAYS, 14),
    slotIntervalMinutes: toInteger(process.env.BOOKING_SLOT_INTERVAL_MINUTES, 30)
  };
}

function toUtcIso(value) {
  if (!value) {
    return null;
  }

  const dateTime = DateTime.fromISO(value, { setZone: true });
  if (!dateTime.isValid) {
    return null;
  }

  return dateTime.toUTC().toISO();
}

function describeBooking(booking) {
  const lines = [
    `Spot.AI booking request`,
    `Intent: ${booking.intentLabel}`,
    `Name: ${booking.fullName}`,
    `Email: ${booking.workEmail}`
  ];

  if (booking.phone) {
    lines.push(`Phone: ${booking.phone}`);
  }

  if (booking.companyName) {
    lines.push(`Company: ${booking.companyName}`);
  }

  if (booking.requestedServices?.length) {
    lines.push(`Requested services: ${booking.requestedServices.join(", ")}`);
  }

  if (booking.sourcePageTitle) {
    lines.push(`Source page: ${booking.sourcePageTitle}`);
  }

  if (booking.sourcePageUrl) {
    lines.push(`Source URL: ${booking.sourcePageUrl}`);
  }

  if (booking.notes) {
    lines.push(`Notes: ${booking.notes}`);
  }

  lines.push(`Booking ID: ${booking.id}`);
  return lines.join("\n");
}

async function getGoogleAccessToken() {
  if (cachedAccessToken && Date.now() < cachedExpiry - 60_000) {
    return cachedAccessToken;
  }

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      client_secret: env("GOOGLE_CLIENT_SECRET"),
      refresh_token: env("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token"
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Unable to refresh Google access token.");
  }

  cachedAccessToken = payload.access_token;
  cachedExpiry = Date.now() + Number(payload.expires_in || 3600) * 1000;
  return cachedAccessToken;
}

async function calendarFetch(path, options = {}) {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error?.message || payload?.error_description || `Google Calendar request failed with ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}

export function isCalendarConfigured() {
  return Boolean(
    env("GOOGLE_CLIENT_ID")
    && env("GOOGLE_CLIENT_SECRET")
    && env("GOOGLE_REFRESH_TOKEN")
    && env("GOOGLE_CALENDAR_ID")
  );
}

export async function checkSlotAvailability({ startIso, endIso, timeZone }) {
  if (!isCalendarConfigured()) {
    return {
      configured: false,
      available: false,
      busy: []
    };
  }

  const payload = await calendarFetch("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: toUtcIso(startIso),
      timeMax: toUtcIso(endIso),
      timeZone: timeZone || getOwnerTimeZone(),
      items: [{ id: getCalendarId() }]
    })
  });

  const busy = payload?.calendars?.[getCalendarId()]?.busy || [];
  return {
    configured: true,
    available: busy.length === 0,
    busy
  };
}

export async function suggestAlternativeSlots({
  requestedStartIso,
  timeZone,
  durationMinutes = getDurationMinutes(),
  limit = 3
}) {
  if (!isCalendarConfigured()) {
    return [];
  }

  const ownerZone = getOwnerTimeZone(timeZone || "UTC");
  const requestStart = DateTime.fromISO(requestedStartIso, { setZone: true }).toUTC();
  const searchStart = requestStart < DateTime.utc() ? DateTime.utc() : requestStart;
  const { startHour, endHour, lookaheadDays, slotIntervalMinutes } = getBusinessHours();
  const rangeStart = searchStart.setZone(ownerZone).startOf("day");
  const rangeEnd = rangeStart.plus({ days: lookaheadDays }).endOf("day");

  const payload = await calendarFetch("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: rangeStart.toUTC().toISO(),
      timeMax: rangeEnd.toUTC().toISO(),
      timeZone: ownerZone,
      items: [{ id: getCalendarId() }]
    })
  });

  const busyIntervals = (payload?.calendars?.[getCalendarId()]?.busy || [])
    .map((slot) => Interval.fromDateTimes(DateTime.fromISO(slot.start, { setZone: true }), DateTime.fromISO(slot.end, { setZone: true })));
  const suggestions = [];

  for (let day = rangeStart.startOf("day"); day <= rangeEnd && suggestions.length < limit; day = day.plus({ days: 1 })) {
    if (day.weekday > 5) {
      continue;
    }

    const dayStart = day.set({ hour: startHour, minute: 0, second: 0, millisecond: 0 });
    const dayEnd = day.set({ hour: endHour, minute: 0, second: 0, millisecond: 0 });

    for (let slot = dayStart; slot.plus({ minutes: durationMinutes }) <= dayEnd && suggestions.length < limit; slot = slot.plus({ minutes: slotIntervalMinutes })) {
      if (slot.toUTC() < searchStart.plus({ minutes: 15 })) {
        continue;
      }

      const candidate = Interval.fromDateTimes(slot.toUTC(), slot.plus({ minutes: durationMinutes }).toUTC());
      const overlaps = busyIntervals.some((busy) => busy.overlaps(candidate));
      if (overlaps) {
        continue;
      }

      suggestions.push({
        startIso: candidate.start.toISO(),
        endIso: candidate.end.toISO(),
        label: slot.setZone(timeZone || ownerZone).toFormat("ccc d LLL, h:mm a ZZZZ")
      });
    }
  }

  return suggestions;
}

export async function reserveCalendarSlot(booking) {
  if (!isCalendarConfigured()) {
    return {
      status: "skipped",
      reason: "calendar-not-configured"
    };
  }

  const start = DateTime.fromISO(booking.preferredDateTimeIso, { setZone: true }).toUTC();
  if (!start.isValid) {
    throw new Error("Preferred date and time are invalid.");
  }

  const end = start.plus({ minutes: booking.durationMinutes || getDurationMinutes() });
  const availability = await checkSlotAvailability({
    startIso: start.toISO(),
    endIso: end.toISO(),
    timeZone: booking.timeZone || getOwnerTimeZone()
  });

  if (!availability.available) {
    return {
      status: "busy",
      suggestions: await suggestAlternativeSlots({
        requestedStartIso: start.toISO(),
        timeZone: booking.timeZone || getOwnerTimeZone(),
        durationMinutes: booking.durationMinutes || getDurationMinutes()
      })
    };
  }

  const attendees = [
    booking.workEmail ? { email: booking.workEmail, displayName: booking.fullName } : null,
    env("BOOKING_OWNER_EMAIL") && env("BOOKING_OWNER_EMAIL") !== booking.workEmail ? { email: env("BOOKING_OWNER_EMAIL") } : null
  ].filter(Boolean);

  const event = {
    summary: `${booking.intentLabel}: ${booking.fullName}${booking.companyName ? ` • ${booking.companyName}` : ""}`,
    description: describeBooking(booking),
    start: {
      dateTime: start.toISO(),
      timeZone: booking.timeZone || getOwnerTimeZone()
    },
    end: {
      dateTime: end.toISO(),
      timeZone: booking.timeZone || getOwnerTimeZone()
    },
    attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 10 }
      ]
    },
    extendedProperties: {
      private: {
        bookingId: booking.id,
        bookingIntent: booking.intent,
        bookingSource: "spot-ai-landing-page-lab"
      }
    }
  };

  const query = new URLSearchParams({
    sendUpdates: "all"
  });

  if (env("BOOKING_CREATE_MEET_LINK") === "true") {
    event.conferenceData = {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" }
      }
    };
    query.set("conferenceDataVersion", "1");
  }

  const response = await calendarFetch(`/calendars/${encodeURIComponent(getCalendarId())}/events?${query.toString()}`, {
    method: "POST",
    body: JSON.stringify(event)
  });

  return {
    status: "confirmed",
    event: {
      id: response.id,
      htmlLink: response.htmlLink,
      hangoutLink: response.hangoutLink || null,
      status: response.status,
      startIso: response.start?.dateTime || start.toISO(),
      endIso: response.end?.dateTime || end.toISO()
    }
  };
}
