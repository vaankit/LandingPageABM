import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bookingsDir = path.resolve(__dirname, "../../../drafts/bookings");
const bookings = new Map();

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function shouldPersistToDisk() {
  return process.env.BOOKING_LOG_ENABLED !== "false";
}

function createHistoryEntry(type, detail = {}) {
  return {
    type,
    detail,
    createdAt: new Date().toISOString()
  };
}

async function persistBooking(record) {
  if (!shouldPersistToDisk()) {
    return;
  }

  await fs.mkdir(bookingsDir, { recursive: true });
  const filePath = path.join(bookingsDir, `${record.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(record, null, 2), "utf8");
}

function pruneExpiredBookings() {
  const maxAgeMs = Number(process.env.BOOKING_RETENTION_MS || 1000 * 60 * 60 * 24 * 14);
  const cutoff = Date.now() - maxAgeMs;

  for (const [id, booking] of bookings.entries()) {
    const createdAt = Date.parse(booking.createdAt || "");
    if (Number.isFinite(createdAt) && createdAt < cutoff) {
      bookings.delete(id);
    }
  }
}

export async function saveBookingRequest(record) {
  pruneExpiredBookings();
  const booking = {
    ...clone(record),
    history: [...(record.history || [])]
  };

  bookings.set(booking.id, booking);
  await persistBooking(booking);
  return clone(booking);
}

export function getBookingRequest(id) {
  return clone(bookings.get(id));
}

export async function appendBookingEvent(id, type, detail = {}) {
  const current = bookings.get(id);
  if (!current) {
    return null;
  }

  const updated = {
    ...current,
    history: [...(current.history || []), createHistoryEntry(type, detail)],
    updatedAt: new Date().toISOString()
  };

  bookings.set(id, updated);
  await persistBooking(updated);
  return clone(updated);
}

export async function updateBookingRequest(id, patch = {}, eventType, eventDetail = {}) {
  const current = bookings.get(id);
  if (!current) {
    return null;
  }

  const history = [...(current.history || [])];
  if (eventType) {
    history.push(createHistoryEntry(eventType, eventDetail));
  }

  const updated = {
    ...current,
    ...clone(patch),
    history,
    updatedAt: new Date().toISOString()
  };

  bookings.set(id, updated);
  await persistBooking(updated);
  return clone(updated);
}
