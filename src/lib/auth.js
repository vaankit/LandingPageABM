import { createClient } from "@supabase/supabase-js";

const ACCESS_COOKIE = "spot_ai_access_token";
const REFRESH_COOKIE = "spot_ai_refresh_token";

function parseCookies(header = "") {
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const index = pair.indexOf("=");
      if (index === -1) {
        return acc;
      }
      const key = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function getCookieOptions(req, maxAge) {
  const isSecure = process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
  const parts = [
    "HttpOnly",
    "Path=/",
    "SameSite=Lax"
  ];

  if (typeof maxAge === "number") {
    parts.push(`Max-Age=${maxAge}`);
  }

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function appendCookie(res, key, value, req, maxAge) {
  const serialized = `${key}=${encodeURIComponent(value)}; ${getCookieOptions(req, maxAge)}`;
  const existing = res.getHeader("Set-Cookie");

  if (!existing) {
    res.setHeader("Set-Cookie", [serialized]);
    return;
  }

  res.setHeader("Set-Cookie", Array.isArray(existing) ? [...existing, serialized] : [existing, serialized]);
}

function clearAuthCookies(req, res) {
  appendCookie(res, ACCESS_COOKIE, "", req, 0);
  appendCookie(res, REFRESH_COOKIE, "", req, 0);
}

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  };
}

function ensureSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.");
  }
}

function createSupabaseClient() {
  ensureSupabaseConfigured();

  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getRequestOrigin(req) {
  const configuredUrl = String(process.env.APP_URL || "").trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3001";
}

function buildRedirectUrl(req, path = "/login") {
  const origin = getRequestOrigin(req);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

function isSelfSignupEnabled() {
  return String(process.env.ALLOW_SELF_SIGNUP || "false").trim().toLowerCase() === "true";
}

function getTokens(req) {
  const cookies = parseCookies(req.headers.cookie || "");

  return {
    accessToken: cookies[ACCESS_COOKIE] || "",
    refreshToken: cookies[REFRESH_COOKIE] || ""
  };
}

function setSessionCookies(req, res, session) {
  if (!session?.access_token || !session?.refresh_token) {
    throw new Error("Supabase did not return a valid session.");
  }

  const accessTtl = typeof session.expires_in === "number" ? session.expires_in : 60 * 60;
  const refreshTtl = 60 * 60 * 24 * 30;

  appendCookie(res, ACCESS_COOKIE, session.access_token, req, accessTtl);
  appendCookie(res, REFRESH_COOKIE, session.refresh_token, req, refreshTtl);
}

export function getAuthCookieNames() {
  return {
    access: ACCESS_COOKIE,
    refresh: REFRESH_COOKIE
  };
}

export async function getAuthenticatedUser(req, res) {
  if (req.authUser) {
    return req.authUser;
  }

  let supabase;

  try {
    supabase = createSupabaseClient();
  } catch {
    return null;
  }

  const { accessToken, refreshToken } = getTokens(req);

  if (!accessToken) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (!error && data?.user) {
    req.authUser = data.user;
    return data.user;
  }

  if (!refreshToken) {
    if (res) {
      clearAuthCookies(req, res);
    }
    return null;
  }

  const refreshed = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (refreshed.error || !refreshed.data?.session) {
    if (res) {
      clearAuthCookies(req, res);
    }
    return null;
  }

  if (res) {
    setSessionCookies(req, res, refreshed.data.session);
  }

  req.authUser = refreshed.data.user || null;
  return req.authUser;
}

export async function isAuthenticated(req, res) {
  const user = await getAuthenticatedUser(req, res);
  return Boolean(user);
}

export async function requireAuth(req, res, next) {
  if (await isAuthenticated(req, res)) {
    next();
    return;
  }

  if (req.path.startsWith("/api/")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  res.redirect("/login");
}

export async function login(req, res) {
  try {
    const email = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session) {
      res.status(401).json({ error: error?.message || "Login failed." });
      return;
    }

    setSessionCookies(req, res, data.session);
    res.json({
      ok: true,
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Login failed." });
  }
}

export async function signup(req, res) {
  try {
    if (!isSelfSignupEnabled()) {
      res.status(403).json({ error: "Self-signup is disabled. Create users from the Supabase dashboard instead." });
      return;
    }

    const email = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    const fullName = String(req.body?.fullName || "").trim();

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildRedirectUrl(req, "/login"),
        data: {
          full_name: fullName || null
        }
      }
    });

    if (error) {
      res.status(400).json({ error: error.message || "Sign up failed." });
      return;
    }

    if (data?.session) {
      setSessionCookies(req, res, data.session);
    }

    res.json({
      ok: true,
      requiresEmailConfirmation: !data?.session,
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Sign up failed." });
  }
}

export async function resendConfirmation(req, res) {
  try {
    const email = String(req.body?.email || "").trim();

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: buildRedirectUrl(req, "/login")
      }
    });

    if (error) {
      res.status(400).json({ error: error.message || "Unable to resend confirmation email." });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to resend confirmation email." });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const email = String(req.body?.email || "").trim();

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildRedirectUrl(req, "/reset-password")
    });

    if (error) {
      res.status(400).json({ error: error.message || "Unable to send password reset email." });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to send password reset email." });
  }
}

export async function establishRecoverySession(req, res) {
  try {
    const accessToken = String(req.body?.accessToken || "").trim();
    const refreshToken = String(req.body?.refreshToken || "").trim();

    if (!accessToken || !refreshToken) {
      res.status(400).json({ error: "Recovery tokens are required." });
      return;
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error || !data?.session) {
      res.status(400).json({ error: error?.message || "Unable to establish recovery session." });
      return;
    }

    setSessionCookies(req, res, data.session);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to establish recovery session." });
  }
}

export async function updatePassword(req, res) {
  try {
    const password = String(req.body?.password || "");

    if (!password) {
      res.status(400).json({ error: "Password is required." });
      return;
    }

    const supabase = createSupabaseClient();
    const { accessToken, refreshToken } = getTokens(req);

    if (!accessToken || !refreshToken) {
      res.status(401).json({ error: "Recovery session not found." });
      return;
    }

    const sessionResult = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionResult.error || !sessionResult.data?.session) {
      clearAuthCookies(req, res);
      res.status(401).json({ error: sessionResult.error?.message || "Recovery session expired." });
      return;
    }

    const updateResult = await supabase.auth.updateUser({ password });

    if (updateResult.error) {
      res.status(400).json({ error: updateResult.error.message || "Unable to update password." });
      return;
    }

    if (updateResult.data?.session) {
      setSessionCookies(req, res, updateResult.data.session);
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to update password." });
  }
}

export async function confirmEmail(req, res) {
  try {
    const tokenHash = String(req.query?.token_hash || "").trim();
    const type = String(req.query?.type || "").trim();

    if (!tokenHash || !type) {
      res.redirect("/login");
      return;
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });

    if (error) {
      res.redirect("/login");
      return;
    }

    if (data?.session) {
      setSessionCookies(req, res, data.session);
      res.redirect(type === "recovery" ? "/reset-password" : "/");
      return;
    }

    res.redirect(type === "recovery" ? "/reset-password" : "/login");
  } catch {
    res.redirect("/login");
  }
}

export async function logout(req, res) {
  clearAuthCookies(req, res);
  res.json({ ok: true });
}
