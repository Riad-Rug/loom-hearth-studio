# Canonical Host: www (redirect lives in Vercel, not in this repo)

The canonical host for the production site is **`www.loomandhearthstudio.com`**.
`config/site.ts` encodes that decision on the application side: `productionSiteUrl`
is the www origin, and `normalizePublicSiteUrl` / `normalizePublicUrl` rewrite the
apex hostname (and any `*.vercel.app` preview host) to it, so every canonical tag,
sitemap URL, and absolute link the app emits already points at www.

## Where the apex redirect actually lives

The apex → www redirect is **not in this repository**. There is no rule for it in
`next.config.ts` (its `redirects()` block covers path-level moves only), there is no
`middleware.ts`, and there is no `vercel.json`. It is configured in the **Vercel
dashboard**, on the project's Domains settings, where `loomandhearthstudio.com` is
attached as a redirect to `www.loomandhearthstudio.com`.

This is worth writing down precisely because nothing in source reveals it: reading
the repo alone, the apex host looks unhandled.

**Do not add a `middleware.ts` (or `next.config.ts`) apex redirect to "fix" this.**
That would stack a second redirect layer on top of the platform one — two competing
rules, an extra hop, and a rule harder to reason about than the platform setting it
duplicates. The setting is changed where it is defined.

## Current state

**Resolved 2026-09-05.** The apex now answers with a permanent redirect:

```
$ curl -sI https://loomandhearthstudio.com/
HTTP/1.1 308 Permanent Redirect
location: https://www.loomandhearthstudio.com/

$ curl -sI https://loomandhearthstudio.com/shop/rugs
HTTP/1.1 308 Permanent Redirect
```

(The protocol line depends on what the client negotiates — plain `curl` reports
HTTP/1.1, browsers negotiate HTTP/2. The status code is what matters.)

### History

Until 2026-09-05 this was a **307 Temporary Redirect**, flagged by the SEO audit
(`loomandhearthstudio.com-audit/ACTION-PLAN.md`, Phase 1 item 7). A temporary
redirect tells Google to keep the apex URL on file and keep re-crawling it rather
than consolidating signals onto www, which slows link-equity consolidation and
leaves both hosts alive in the index longer than necessary. The host decision is
permanent, so the redirect should be too.

It was changed in the Vercel dashboard: Settings → Domains → `loomandhearthstudio.com`
→ enable the permanent (308) redirect. If it ever reverts, that is where to look —
and re-verify with the `curl -sI` above rather than trusting the dashboard's own
display.

Note that DNS is proxied through Cloudflare (responses carry `Server: cloudflare`),
but the redirect itself is served by Vercel — the response also carries an
`x-vercel-id` header, so it is Vercel's rule, not a Cloudflare page rule, that
answers the apex.
