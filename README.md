# Wedding website — Pankaj & Muskan

React + Vite invitation site for 21–23 January 2027, Bhopal. One codebase builds two websites:

- **Groom side** — "Pankaj & Muskan", P·M monogram (`.env`)
- **Bride side** — "Muskan & Pankaj", M·P monogram (`.env.bride`)

```bash
npm install
npm run dev          # groom side → http://localhost:5173
npm run dev:bride    # bride side → http://localhost:5174
npm run build        # → dist/groom and dist/bride (deploy each to its own domain)
```

Preview the other side on any server with `?side=muskan` or `?side=pankaj`.

Events, venues, travel and FAQ live in `src/config/wedding.ts`. Name order, monogram letters and sign-offs per side live in `src/config/sides.ts`. Theme colours are in `src/index.css`; the peacock feather and lotus art are in `public/brand/`. Guest invite tokens are built in `src/utils/invite.ts`.
