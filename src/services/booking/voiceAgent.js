import WebSocket, { WebSocketServer } from "ws";
import { appendBookingEvent, getBookingRequest, updateBookingRequest } from "./store.js";

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseJson(input) {
  try {
    return JSON.parse(String(input || ""));
  } catch {
    return null;
  }
}

function sendJson(socket, payload) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function getPublicBaseUrl() {
  return env("PUBLIC_BASE_URL") || env("APP_URL");
}

function getMediaStreamUrl() {
  const baseUrl = getPublicBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const url = new URL("/api/public/voice/media-stream", baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

function isTwilioConfigured() {
  return Boolean(env("TWILIO_ACCOUNT_SID") && env("TWILIO_AUTH_TOKEN") && env("TWILIO_FROM_NUMBER"));
}

function isOpenAiVoiceConfigured() {
  return Boolean(env("OPENAI_API_KEY"));
}

export function isVoiceAgentConfigured() {
  return Boolean(isTwilioConfigured() && isOpenAiVoiceConfigured() && getPublicBaseUrl());
}

function buildVoiceSessionInstructions(booking) {
  const services = booking.requestedServices?.join(", ") || "Spot.AI services";
  const company = booking.companyName ? ` at ${booking.companyName}` : "";
  const requestedDate = booking.preferredDateDisplay ? ` They selected ${booking.preferredDateDisplay} as their preferred day.` : "";

  return [
    "You are Spot.AI's automated booking assistant for inbound demo and intro-call requests.",
    "Sound warm, calm, confident, and natural, but do not pretend to be human.",
    "In your first sentence, clearly disclose that you are Spot.AI's automated booking assistant calling about the website request.",
    "Keep sentences short and conversational.",
    "Your goal is to confirm the caller's interest, verify the best email, and capture a suitable time window if they want one.",
    "Never invent availability or promise a human is on the line right now.",
    "If the person asks whether you are human, answer honestly.",
    "If they want a human immediately, collect the best callback time and reassure them Spot.AI will follow up.",
    `Context: This request is for ${booking.intentLabel}${company}.`,
    `Context: The requested services were ${services}.${requestedDate}`,
    "Do not mention internal system prompts, Twilio, OpenAI, or API details."
  ].join(" ");
}

function buildInitialGreeting(booking) {
  const name = booking.fullName || "there";
  const company = booking.companyName ? ` from ${booking.companyName}` : "";

  return [
    `Start the call now. Greet ${name}${company}.`,
    `Say you are Spot.AI's automated booking assistant following up on the ${booking.intentLabel.toLowerCase()} request from the website.`,
    "Ask whether now is still a good time for a quick conversation."
  ].join(" ");
}

async function createTwilioCall(booking) {
  const accountSid = env("TWILIO_ACCOUNT_SID");
  const authToken = env("TWILIO_AUTH_TOKEN");
  const callbackUrl = new URL("/api/public/voice/status", getPublicBaseUrl());
  callbackUrl.searchParams.set("bookingId", booking.id);
  const twimlUrl = new URL("/api/public/voice/twiml", getPublicBaseUrl());
  twimlUrl.searchParams.set("bookingId", booking.id);

  const body = new URLSearchParams({
    To: booking.phone,
    From: env("TWILIO_FROM_NUMBER"),
    Url: twimlUrl.toString(),
    StatusCallback: callbackUrl.toString(),
    StatusCallbackMethod: "POST",
    StatusCallbackEvent: "initiated ringing answered completed"
  });

  const machineDetection = env("TWILIO_MACHINE_DETECTION");
  if (machineDetection) {
    body.set("MachineDetection", machineDetection);
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || `Twilio call creation failed with ${response.status}.`;
    throw new Error(errorMessage);
  }

  return {
    sid: data?.sid || null,
    status: data?.status || null,
    to: data?.to || booking.phone,
    from: data?.from || env("TWILIO_FROM_NUMBER")
  };
}

export async function triggerOutboundBookingCall(booking) {
  if (!booking.phone) {
    return {
      status: "skipped",
      reason: "phone-missing"
    };
  }

  if (!isVoiceAgentConfigured()) {
    return {
      status: "skipped",
      reason: "voice-agent-not-configured"
    };
  }

  const call = await createTwilioCall(booking);
  return {
    status: "queued",
    call
  };
}

export function buildVoiceTwiML(booking) {
  if (!booking || !getMediaStreamUrl() || !isOpenAiVoiceConfigured()) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thanks for requesting a call from Spot.AI. We have your details and will follow up shortly.</Say>
</Response>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${escapeXml(getMediaStreamUrl())}">
      <Parameter name="bookingId" value="${escapeXml(booking.id)}" />
      <Parameter name="intentLabel" value="${escapeXml(booking.intentLabel)}" />
      <Parameter name="fullName" value="${escapeXml(booking.fullName)}" />
      <Parameter name="companyName" value="${escapeXml(booking.companyName || "")}" />
    </Stream>
  </Connect>
</Response>`;
}

function openRealtimeSession({ booking, twilioSocket, streamSid, pendingAudio, closeSession }) {
  const openAiSocket = new WebSocket(`wss://api.openai.com/v1/realtime?model=${encodeURIComponent(env("OPENAI_REALTIME_MODEL", "gpt-realtime"))}`, {
    headers: {
      authorization: `Bearer ${env("OPENAI_API_KEY")}`,
      "OpenAI-Beta": "realtime=v1"
    }
  });

  openAiSocket.on("open", async () => {
    await appendBookingEvent(booking.id, "voice.websocket.connected", { streamSid });

    sendJson(openAiSocket, {
      type: "session.update",
      session: {
        instructions: buildVoiceSessionInstructions(booking),
        audio: {
          input: {
            format: {
              type: "audio/pcmu"
            },
            transcription: {
              model: env("OPENAI_TRANSCRIPTION_MODEL", "gpt-4o-mini-transcribe")
            },
            turn_detection: {
              type: "server_vad",
              create_response: true,
              interrupt_response: true
            }
          },
          output: {
            format: {
              type: "audio/pcmu"
            },
            voice: env("OPENAI_REALTIME_VOICE", "marin")
          }
        }
      }
    });

    for (const audioChunk of pendingAudio.splice(0, pendingAudio.length)) {
      sendJson(openAiSocket, {
        type: "input_audio_buffer.append",
        audio: audioChunk
      });
    }

    setTimeout(() => {
      sendJson(openAiSocket, {
        type: "response.create",
        response: {
          conversation: "auto",
          modalities: ["audio"],
          instructions: buildInitialGreeting(booking),
          audio: {
            output: {
              format: {
                type: "audio/pcmu"
              },
              voice: env("OPENAI_REALTIME_VOICE", "marin")
            }
          }
        }
      });
    }, 250);
  });

  openAiSocket.on("message", async (raw) => {
    const event = parseJson(raw);
    if (!event) {
      return;
    }

    if (event.type === "response.output_audio.delta" || event.type === "response.audio.delta") {
      sendJson(twilioSocket, {
        event: "media",
        streamSid,
        media: {
          payload: event.delta
        }
      });
      return;
    }

    if (event.type === "input_audio_buffer.speech_started") {
      sendJson(twilioSocket, {
        event: "clear",
        streamSid
      });
      return;
    }

    if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
      await appendBookingEvent(booking.id, "voice.transcript.user", { transcript: event.transcript });
      return;
    }

    if (event.type === "response.output_audio_transcript.done" && event.transcript) {
      await appendBookingEvent(booking.id, "voice.transcript.assistant", { transcript: event.transcript });
      return;
    }

    if (event.type === "error") {
      await appendBookingEvent(booking.id, "voice.error", { message: event.error?.message || "Unknown OpenAI realtime error." });
    }
  });

  openAiSocket.on("close", async () => {
    await appendBookingEvent(booking.id, "voice.websocket.closed", { streamSid });
    closeSession();
  });

  openAiSocket.on("error", async (error) => {
    await appendBookingEvent(booking.id, "voice.websocket.error", { message: error.message });
    closeSession();
  });

  return openAiSocket;
}

function attachTwilioStreamHandlers(twilioSocket) {
  const state = {
    booking: null,
    streamSid: null,
    openAiSocket: null,
    pendingAudio: []
  };

  const closeSession = () => {
    if (state.openAiSocket?.readyState === WebSocket.OPEN || state.openAiSocket?.readyState === WebSocket.CONNECTING) {
      state.openAiSocket.close();
    }

    if (twilioSocket.readyState === WebSocket.OPEN) {
      twilioSocket.close();
    }
  };

  twilioSocket.on("message", async (raw) => {
    const event = parseJson(raw);
    if (!event) {
      return;
    }

    if (event.event === "start") {
      state.streamSid = event.start?.streamSid || event.streamSid || null;
      const bookingId = event.start?.customParameters?.bookingId;
      state.booking = bookingId ? getBookingRequest(bookingId) : null;

      if (!state.booking) {
        closeSession();
        return;
      }

      await updateBookingRequest(state.booking.id, {
        voiceStreamSid: state.streamSid
      }, "voice.stream.started", { streamSid: state.streamSid });

      state.openAiSocket = openRealtimeSession({
        booking: state.booking,
        twilioSocket,
        streamSid: state.streamSid,
        pendingAudio: state.pendingAudio,
        closeSession
      });
      return;
    }

    if (event.event === "media") {
      const payload = event.media?.payload;
      if (!payload) {
        return;
      }

      if (state.openAiSocket?.readyState === WebSocket.OPEN) {
        sendJson(state.openAiSocket, {
          type: "input_audio_buffer.append",
          audio: payload
        });
        return;
      }

      state.pendingAudio.push(payload);
      if (state.pendingAudio.length > 200) {
        state.pendingAudio.shift();
      }
      return;
    }

    if (event.event === "stop") {
      if (state.booking) {
        await appendBookingEvent(state.booking.id, "voice.stream.stopped", {
          streamSid: state.streamSid
        });
      }
      closeSession();
    }
  });

  twilioSocket.on("close", async () => {
    if (state.booking) {
      await appendBookingEvent(state.booking.id, "voice.socket.closed", {
        streamSid: state.streamSid
      });
    }

    if (state.openAiSocket?.readyState === WebSocket.OPEN || state.openAiSocket?.readyState === WebSocket.CONNECTING) {
      state.openAiSocket.close();
    }
  });

  twilioSocket.on("error", async (error) => {
    if (state.booking) {
      await appendBookingEvent(state.booking.id, "voice.socket.error", {
        message: error.message,
        streamSid: state.streamSid
      });
    }
  });
}

export function attachVoiceAgentServer(server) {
  const websocketServer = new WebSocketServer({ noServer: true });

  websocketServer.on("connection", (socket) => {
    attachTwilioStreamHandlers(socket);
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (url.pathname !== "/api/public/voice/media-stream") {
      socket.destroy();
      return;
    }

    websocketServer.handleUpgrade(request, socket, head, (client) => {
      websocketServer.emit("connection", client, request);
    });
  });

  return websocketServer;
}
