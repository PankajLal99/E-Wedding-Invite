# Wedding website — Pankaj & Muskan

React + Vite invitation site for 21–23 January 2027, Bhopal. One codebase builds three websites:

- **Groom side** — "Pankaj & Muskan", P·M monogram (`.env`) → `wedding.pankajlal.in`
- **Reception only** — same groom branding, 22 Jan Reception only (`.env.reception`) → `reception.pankajlal.in`
- **Bride side** — "Muskan & Pankaj", M·P monogram (`.env.bride`) → `wedding.muskanraj.in`

```bash
npm install
npm run dev              # groom (full) → http://localhost:5173
npm run dev:reception    # groom Reception only → http://localhost:5175
npm run dev:bride        # bride → http://localhost:5174
npm run build            # → dist/groom, dist/groom-reception, dist/bride
```

Preview the other side on any server with `?side=muskan` or `?side=pankaj`.

Events, venues, travel and FAQ live in `src/config/wedding.ts`. Name order, monogram letters and sign-offs per side live in `src/config/sides.ts`. Theme colours are in `src/index.css`; the peacock feather and lotus art are in `public/brand/`. Guest invite tokens are built in `src/utils/invite.ts`. Cloudflare DNS for the Reception hostname: `deploy/CLOUDFLARE-reception.md`.
