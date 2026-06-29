# Contact-form pipeline — `thetempleoftwo.com`

A Cloudflare Worker that receives the site's contact form, screens it
(Cloudflare Turnstile + a honeypot), and forwards the message as email via
**Resend** to `info@thetempleoftwo.com`.

```
visitor → form (the site)
   POST /api/contact
      ▼
 Cloudflare Worker  ── this folder
   • honeypot drop
   • field validation + length caps
   • Turnstile verify (fail-closed once configured)
   • optional per-IP rate limit (KV)
      ▼
 Resend API  →  email to info@thetempleoftwo.com
```

The page already posts to `/api/contact`. Until this Worker is deployed and
bound to that path, the form button works visually but submissions won't send —
finishing the steps below turns it on.

---

## One-time setup

### 1. Resend (email delivery)

1. Create an account at <https://resend.com>.
2. **Add & verify the domain** `thetempleoftwo.com` (Resend → Domains → Add).
   It shows a few DNS records (SPF/DKIM/`MX` for `send`). Because the domain is
   on Cloudflare, add them in **Cloudflare → DNS** (set them **DNS-only / grey
   cloud**). Wait for Resend to mark the domain **Verified**.
3. Create an **API key** (Resend → API Keys). Copy it once — you can't see it again.

> The Worker sends `from` `contact@thetempleoftwo.com`. That mailbox doesn't have
> to exist — it only needs to be on the verified domain. Replies go to the
> visitor's address (`reply_to`), so hitting "Reply" in your inbox answers them.

### 2. Cloudflare Turnstile (spam check) — required for sending

The Worker **fails closed**: it will not send unless an anti-abuse control is
configured — either Turnstile (this step) or the KV rate limiter (step 4). Pick
at least one. Turnstile is the recommended one.

1. Cloudflare dashboard → **Turnstile** → **Add widget**.
   Hostname: `thetempleoftwo.com`. Widget mode: **Managed**.
2. Copy the **Site Key** (public) and **Secret Key** (private).
3. **Put the Site Key in the page first.** Edit `index.html`, find the contact
   form, and replace `data-sitekey="YOUR_TURNSTILE_SITE_KEY"` with your real site
   key, then commit + push. The widget only renders once a real key is present.

> ⚠️ **Order matters.** Set the site key in the page (step 3 above) **before** you
> put `TURNSTILE_SECRET` on the Worker (next section). The secret makes the
> challenge mandatory — if the page still has the placeholder when the secret is
> live, no widget renders, no token is sent, and **every** submission is rejected.

### 3. Deploy the Worker

```bash
cd contact-worker
npx wrangler login            # once, opens a browser
npx wrangler secret put RESEND_API_KEY      # paste the Resend key
npx wrangler secret put TURNSTILE_SECRET    # paste the Turnstile secret key — AFTER the site key is live (see ⚠️ above)
npx wrangler deploy
```

`wrangler.toml` already binds the route `thetempleoftwo.com/api/contact`. If the
deploy can't attach the route, confirm the zone is on this Cloudflare account,
then re-run `npx wrangler deploy`.

### 4. (Optional) Rate limiting

```bash
npx wrangler kv namespace create RL
```

Paste the printed `id` into the commented `[[kv_namespaces]]` block in
`wrangler.toml`, uncomment it, and redeploy. Caps each IP to 5 messages / 10 min.

---

## Test it

- **Live:** open the site, fill the form, submit. You should see "Message sent"
  and an email in the `info@` inbox within a few seconds.
- **Logs:** `npx wrangler tail` while you submit.
- **Local dev with Turnstile test keys** (always-pass, never use in production):
  site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

## Behaviour & security notes

- **Fail-closed by default:** with neither Turnstile nor the KV limiter configured,
  the Worker refuses to send (`503`) rather than acting as an open email amplifier.
  Configure at least one anti-abuse control to turn sending on.
- **Fail-closed Turnstile:** enforced only when `TURNSTILE_SECRET` is set. Set it
  and the challenge becomes mandatory; a missing/invalid token → `403`.
- **Origin check:** a request carrying an `Origin` that isn't `thetempleoftwo.com` /
  `www.thetempleoftwo.com` is rejected (`403`), blocking cross-site auto-submits.
- **Honeypot:** a hidden `company` field. If filled, the Worker returns success
  and sends nothing (bots aren't told they were caught).
- **Body cap enforced during the read:** the 32 KB limit is counted off the stream,
  so a chunked or header-less request can't slip past it. Fields are then capped at
  name/email ≤ 200, topic ≤ 120, message ≤ 5000 chars.
- **Injection:** all visitor text is HTML-escaped before it enters the email body;
  control characters are stripped; `reply_to` is validated as an email.
- **CORS** is locked to `thetempleoftwo.com` / `www.thetempleoftwo.com`.
- **Secrets** never live in code — only in `wrangler secret`. The Worker never
  logs the API key or message contents.

## Files

| File | What it is |
|---|---|
| `src/worker.js` | the Worker (validation, Turnstile, Resend) |
| `wrangler.toml` | name, route binding, vars, optional KV |
| `package.json` | `npm run deploy` / `dev` / `tail` shortcuts |
