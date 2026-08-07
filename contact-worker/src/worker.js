// Temple of Two — contact-form pipeline (Cloudflare Worker).
//
// Flow:  site form  ──POST──▶  this Worker  ──▶  Cloudflare Email (or Resend)  ──▶  info@thetempleoftwo.com
//
// Defences, in order: method gate → body size/field caps → honeypot → field
// validation → Cloudflare Turnstile (fail-CLOSED once a secret is set) → optional
// per-IP rate limit (KV) → HTML-escaped email via Resend.
//
// Secrets live in `wrangler secret`, never in this file:
//   RESEND_API_KEY     (only if not using the Cloudflare EMAIL binding)
//   TURNSTILE_SECRET   (optional; when present, the challenge is enforced)
// Plain vars (wrangler.toml [vars]): CONTACT_TO, CONTACT_FROM.
// Optional KV binding `RL` enables rate limiting.

const ALLOWED_ORIGINS = [
  'https://thetempleoftwo.com',
  'https://www.thetempleoftwo.com',
];

const LIMITS = { name: 200, email: 200, topic: 120, message: 5000 };
const MAX_BODY_BYTES = 32 * 1024; // hard cap on the whole request body
const RL_MAX = 5;                 // submissions per IP per window
const RL_WINDOW_SECONDS = 600;    // 10 minutes

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return respond(false, 'method_not_allowed', 405, cors, true);

    // Defense-in-depth: a present Origin must be one of ours. Blocks cross-site
    // browser auto-submits (which always carry an Origin); non-browser clients
    // that omit Origin are still caught by the anti-abuse gate below.
    if (origin && ALLOWED_ORIGINS.indexOf(origin) === -1) {
      return respond(false, 'forbidden_origin', 403, cors, true);
    }

    // Size cap enforced DURING the read — Content-Length is only a cheap fast-path;
    // a chunked / missing / zero Content-Length must not bypass the bound.
    const declared = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (declared && declared > MAX_BODY_BYTES) return respond(false, 'too_large', 413, cors, true);

    let fields, wantsJson;
    try {
      const parsed = await readBody(request, MAX_BODY_BYTES);
      fields = parsed.fields;
      wantsJson = parsed.wantsJson;
    } catch (e) {
      if (e && e.message === 'too_large') return respond(false, 'too_large', 413, cors, true);
      return respond(false, 'bad_request', 400, cors, true);
    }

    // Honeypot: real visitors leave it empty. Pretend success; send nothing.
    if (String(fields.company || '').trim() !== '') return respond(true, null, 200, cors, wantsJson);

    const name = clean(fields.name, LIMITS.name);
    const email = clean(fields.email, LIMITS.email);
    const topic = clean(fields.topic, LIMITS.topic);
    const message = clean(fields.message, LIMITS.message);

    if (!name || !email || !message || !isEmail(email)) {
      return respond(false, 'invalid_input', 422, cors, wantsJson);
    }

    // Fail closed: never run as an open, unthrottled email amplifier. At least one
    // anti-abuse control (Turnstile challenge or KV rate limit) must be configured
    // before this Worker will send anything.
    if (!env.TURNSTILE_SECRET && !env.RL) {
      return respond(false, 'not_configured', 503, cors, wantsJson);
    }

    // Turnstile — enforced only when a secret is configured (fail-closed once set,
    // so the form works the moment the Worker deploys and tightens when keys land).
    if (env.TURNSTILE_SECRET) {
      const token = String(fields['cf-turnstile-response'] || '');
      const ip = request.headers.get('CF-Connecting-IP') || '';
      const ok = await verifyTurnstile(env.TURNSTILE_SECRET, token, ip);
      if (!ok) return respond(false, 'challenge_failed', 403, cors, wantsJson);
    }

    // Optional KV fixed-window rate limit (bind a KV namespace as `RL` to enable).
    if (env.RL) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = 'rl:' + ip;
      const count = parseInt((await env.RL.get(key)) || '0', 10) + 1;
      if (count > RL_MAX) return respond(false, 'rate_limited', 429, cors, wantsJson);
      await env.RL.put(key, String(count), { expirationTtl: RL_WINDOW_SECONDS });
    }

    // A transport must exist: the Cloudflare EMAIL binding or a Resend key.
    if (!env.EMAIL && !env.RESEND_API_KEY) {
      return respond(false, 'not_configured', 500, cors, wantsJson);
    }

    const to = env.CONTACT_TO || 'info@thetempleoftwo.com';
    // Must be a domain on this Cloudflare account when sending via the binding.
    const from = env.CONTACT_FROM || 'Temple of Two <contact@templetwo.com>';
    const sent = await deliver(env, { to, from, name, email, topic, message });
    if (!sent) return respond(false, 'send_failed', 502, cors, wantsJson);

    return respond(true, null, 200, cors, wantsJson);
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function clean(v, max) {
  // Normalise newlines, strip control chars (keep \n and \t), trim, hard-cap length.
  return String(v == null ? '' : v)
    .replace(/\r\n?/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, max);
}

function isEmail(s) {
  // Bounded quantifiers → no catastrophic backtracking; also forbids whitespace.
  return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(s);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

async function readBody(request, maxBytes) {
  const bytes = await readCapped(request, maxBytes); // throws Error('too_large') past the cap
  const ct = (request.headers.get('Content-Type') || '').toLowerCase();
  if (ct.includes('application/json')) {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return { fields: data && typeof data === 'object' ? data : {}, wantsJson: true };
  }
  // Reconstruct a bounded request so the urlencoded/multipart parser runs on the
  // capped bytes (the multipart boundary lives in the preserved Content-Type).
  const bounded = new Request('https://internal/', {
    method: 'POST',
    headers: { 'Content-Type': ct || 'application/x-www-form-urlencoded' },
    body: bytes,
  });
  const form = await bounded.formData();
  const fields = {};
  for (const [k, v] of form.entries()) fields[k] = typeof v === 'string' ? v : '';
  return { fields, wantsJson: false };
}

// Read the body, aborting the moment it exceeds maxBytes — so a chunked or
// header-less request can't force an unbounded buffer into isolate memory.
async function readCapped(request, maxBytes) {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const step = await reader.read();
    if (step.done) break;
    if (step.value) {
      total += step.value.length;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch (_) {}
        throw new Error('too_large');
      }
      chunks.push(step.value);
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (let i = 0; i < chunks.length; i++) { out.set(chunks[i], offset); offset += chunks[i].length; }
  return out;
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const out = await r.json();
    return !!(out && out.success);
  } catch (_) {
    return false;
  }
}

/* ── Cloudflare-native send (no third-party account, no API key) ──
 *
 * Workers cannot open SMTP connections, so the Webador mailbox that receives
 * info@thetempleoftwo.com cannot also be the sender. This uses Email Routing's
 * `send_email` binding instead: it delivers only to addresses verified on the
 * account, which is exactly the shape of a contact form with one recipient.
 *
 * The `from` domain must be a zone on this Cloudflare account — templetwo.com,
 * not thetempleoftwo.com (that one is on Webador).
 */

/** base64 of a UTF-8 string, chunked so large bodies don't blow the stack. */
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

/** RFC 2047 encoded-word — subjects carry names and em dashes. */
function encodeHeader(s) {
  return /^[\x20-\x7E]*$/.test(s) ? s : "=?UTF-8?B?" + b64(s) + "?=";
}

/** Strip CR/LF so a crafted field cannot inject extra headers. */
function headerSafe(s) {
  return String(s).replace(/[\r\n]+/g, " ").trim();
}

function buildMime({ fromEmail, fromName, to, replyTo, subject, text, html }) {
  const boundary = "t2b_" + crypto.randomUUID().replace(/-/g, "");
  const date = new Date().toUTCString().replace(/GMT$/, "+0000");
  const domain = fromEmail.split("@")[1] || "templetwo.com";
  return [
    "From: " + encodeHeader(headerSafe(fromName)) + " <" + headerSafe(fromEmail) + ">",
    "To: " + headerSafe(to),
    "Reply-To: " + headerSafe(replyTo),
    "Subject: " + encodeHeader(headerSafe(subject)),
    "Message-ID: <" + crypto.randomUUID() + "@" + domain + ">",
    "Date: " + date,
    "MIME-Version: 1.0",
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    "",
    "--" + boundary,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(text),
    "--" + boundary,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(html),
    "--" + boundary + "--",
    "",
  ].join("\r\n");
}

async function sendViaCloudflare(env, m, subject, text, html) {
  try {
    const { EmailMessage } = await import("cloudflare:email");
    // CONTACT_FROM may be "Name <addr>" or a bare address.
    const raw = String(m.from || "");
    const angle = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    const fromName = angle ? angle[1] || "Temple of Two" : "Temple of Two";
    const fromEmail = angle ? angle[2] : raw;

    const mime = buildMime({
      fromEmail,
      fromName,
      to: m.to,
      replyTo: m.email,
      subject,
      text,
      html,
    });
    await env.EMAIL.send(new EmailMessage(fromEmail, m.to, mime));
    return true;
  } catch (e) {
    // Never log the message body or address list.
    console.log("cf_email_error " + (e && e.name ? e.name : "unknown"));
    return false;
  }
}

/** One message body, used by whichever transport is configured. */
function composeEmail(m) {
  const subject = 'Temple of Two — message from ' + m.name + (m.topic ? ' · ' + m.topic : '');
  const text =
    'From: ' + m.name + ' <' + m.email + '>\n' +
    (m.topic ? 'Topic: ' + m.topic + '\n' : '') +
    '\n' + m.message + '\n';
  const html =
    '<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#111">' +
      '<p><strong>From:</strong> ' + escapeHtml(m.name) + ' &lt;' + escapeHtml(m.email) + '&gt;</p>' +
      (m.topic ? '<p><strong>Topic:</strong> ' + escapeHtml(m.topic) + '</p>' : '') +
      '<hr style="border:none;border-top:1px solid #ddd">' +
      '<p style="white-space:pre-wrap">' + escapeHtml(m.message) + '</p>' +
    '</div>';
  return { subject: subject, text: text, html: html };
}

/**
 * Prefer the Cloudflare binding when it is bound; fall back to Resend when a
 * key is present. Either transport alone is sufficient — the caller has
 * already refused the request if neither exists.
 */
async function deliver(env, m) {
  const c = composeEmail(m);
  if (env.EMAIL) return sendViaCloudflare(env, m, c.subject, c.text, c.html);
  return sendEmail(env.RESEND_API_KEY, m, c);
}

async function sendEmail(apiKey, m, c) {
  const subject = c.subject;
  const text = c.text;
  const html = c.html;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.email, subject: subject, text: text, html: html }),
    });
    if (!r.ok) console.log('resend_error status=' + r.status); // never log the key or body
    return r.ok;
  } catch (e) {
    console.log('resend_exception');
    return false;
  }
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extra || {}),
  });
}

function respond(ok, error, status, cors, wantsJson) {
  if (wantsJson) return json(ok ? { ok: true } : { ok: false, error: error }, status, cors);
  // No-JS fallback: a small styled confirmation page.
  const inner = ok
    ? '<h1>Message sent</h1><p>Thank you — your message is on its way. ' +
      '<a href="https://thetempleoftwo.com/#contact">Back to the site →</a></p>'
    : '<h1>Something went wrong</h1><p>Please try again, or email ' +
      '<a href="mailto:info@thetempleoftwo.com">info@thetempleoftwo.com</a> directly. ' +
      '<a href="https://thetempleoftwo.com/#contact">Back →</a></p>';
  const page =
    '<!doctype html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Temple of Two</title>' +
    '<body style="font-family:system-ui,-apple-system,sans-serif;background:#0c0c11;color:#d6d3d1;' +
    'max-width:34rem;margin:18vh auto;padding:0 1.25rem;line-height:1.7">' +
    '<style>a{color:#a78bfa}h1{color:#f5f5f4;font-size:1.4rem}</style>' + inner + '</body>';
  return new Response(page, {
    status: status,
    headers: Object.assign({ 'Content-Type': 'text/html; charset=utf-8' }, cors),
  });
}
