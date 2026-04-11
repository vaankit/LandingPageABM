# Spot.AI Landing Page Lab

Local Node.js + Express app for researching a target company, generating a personalized ABM landing page preview, and publishing a draft through a pluggable API adapter.

## What is included

- Company research from a public website
- Ollama-assisted landing page generation with deterministic fallback
- Live preview in a vanilla frontend
- Local draft export publisher
- Generic HTTP JSON publisher adapter for the new API once details are available

## Setup on macOS

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3001`.

You can also use `./start.sh` for a simple local startup flow on macOS.

## Supabase Auth

The app is wired for Supabase Auth with secure server-verified sessions.

- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env`
- Set `APP_URL` to your deployed app URL in production
- Leave `ALLOW_SELF_SIGNUP=false` if you want all users to be created from the Supabase dashboard
- Login route: `/login`
- Auth mode: email + password
- The server verifies Supabase access tokens before allowing app or API access

If email confirmation is enabled in your Supabase project, new users may need to confirm their email before they can sign in. Dashboard-created users are already the source of truth for the app, so there is no separate sync layer to maintain. Recovery and confirmation emails should use your deployed URL in Supabase Auth URL Configuration.

## Ollama

The app is configured to use a local Ollama instance by default for richer ABM copy generation.

- Default URL: `http://127.0.0.1:11434/api/generate`
- Default model: `llama3.2:latest`
- Higher-quality but slower option: `gpt-oss:20b`
- Fallback: if Ollama is unavailable or returns invalid output, the app falls back to the built-in deterministic copy generator

## Publish providers

- `local-json`: saves the generated draft to the `drafts/` folder
- `http-json`: POSTs the generated page model to `PUBLISH_API_URL` with token-based auth

## Demo booking + calling agent

The generated landing pages now include a live booking modal behind the `Book a Demo` and `Book Intro Call` buttons.

Booking flow:

- The visitor picks a preferred date from an interactive calendar
- The backend saves the preferred day and can create an owner-side reminder event in Google Calendar
- If the visitor asks for a callback, the backend can place an outbound Twilio voice call
- The call is handled by an OpenAI Realtime voice assistant that speaks naturally but identifies itself as Spot.AI's automated booking assistant
- An optional webhook can notify you in Slack, Zapier, Make, or another system

### Required environment variables

Calendar:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `BOOKING_OWNER_EMAIL`
- `BOOKING_OWNER_TIMEZONE`

Voice agent:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `OPENAI_API_KEY`
- `PUBLIC_BASE_URL`

Recommended optional variables:

- `PUBLIC_BOOKING_API_URL`
- `PUBLIC_BOOKING_ALLOWED_ORIGINS`
- `BOOKING_NOTIFICATION_WEBHOOK_URL`

### Google Calendar setup

1. Create a Google Cloud project.
2. Enable the Google Calendar API.
3. Create an OAuth client for a web or desktop app.
4. Generate a refresh token with Calendar scope for the Google account that owns the calendar.
5. Set `GOOGLE_CALENDAR_ID=primary` if you want the owner account's main calendar.

### Twilio setup

1. Buy or use a Twilio number with voice capability.
2. Set `TWILIO_FROM_NUMBER` to that number in E.164 format.
3. Set `PUBLIC_BASE_URL` to the public Render URL of this app.
4. Add your Twilio and OpenAI credentials to Render environment variables.

The app creates outbound calls itself, so you do not need to configure a TwiML app manually unless you want a custom Twilio setup later.

### Production note

Render free instances can sleep, which is not ideal for phone callbacks and Twilio webhooks. For reliable production calling, move this service to a paid Render plan before sending live traffic through the voice agent.

## Deploying on Render

This repo includes a `render.yaml` Blueprint for a Node web service.

- Service type: `web`
- Runtime: `node`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/api/health`

Render expects the app to bind to `0.0.0.0` and a provided port. This app already does both through `HOST` and `PORT`.

## Notes

- The publishing layer is intentionally isolated because the final API contract is still pending.
- Once you share the new API, the adapter in `src/services/publishers/` can be updated without changing the rest of the app.
- `start.bat` is included only for compatibility if the project is ever moved to Windows.
