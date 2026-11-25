# Cloudflare — `reception.pankajlal.in`

`pankajlal.in` is on Cloudflare. Traffic reaches EC2 via the **`aio-django`** Cloudflare Tunnel
(`5683a810-06ed-4927-94e5-2ba610338c42.cfargotunnel.com`), same as `wedding.pankajlal.in`.

Local Zero Trust setup (`~/.cloudflared` + SSH host `aio-django`) is only for **admin SSH**.
Do **not** put the Reception invite behind Access login.

## Origin (already done)

- Container `wedding-reception` serves `dist/groom-reception`
- Traefik + nginx know `Host: reception.pankajlal.in`
- Verified on box: HTTP 200 with Reception-only meta

## Go live (tunnel + DNS)

In **Zero Trust → Networks → Tunnels → aio-django → Public Hostname**, add:

| Field | Value |
| --- | --- |
| Subdomain | `reception` |
| Domain | `pankajlal.in` |
| Type | HTTPS |
| URL | `https://localhost:443` |
| TLS | No TLS Verify (same as wedding) |

That creates the proxied CNAME:

- `reception.pankajlal.in` → `5683a810-06ed-4927-94e5-2ba610338c42.cfargotunnel.com`

Or via Cloudflare API (same account as Patrolling MCP):

- Account: `b9c2f870bc120b8d070e5cf4444bbdf7`
- Zone `pankajlal.in`: `fb3c567b988e1eaf517f5b6b405e3187`
- Tunnel: `5683a810-06ed-4927-94e5-2ba610338c42`

1. Append ingress rule for `reception.pankajlal.in` → `https://localhost:443` (`noTLSVerify: true`) before the catch-all.
2. Create DNS CNAME `reception` proxied to the tunnel hostname above.

## Access / Zero Trust

- Keep **public** (no Access app on `reception.pankajlal.in`).
- Admin SSH stays on `ssh.intratechnosolutions.com` via `aio-django` only.

## Share links

| Crowd | URL |
| --- | --- |
| Full celebrations | `https://wedding.pankajlal.in` |
| Reception only (22 Jan, 9:00 PM) | `https://reception.pankajlal.in` |

Optional: `https://reception.pankajlal.in?i=…` for personal names.
