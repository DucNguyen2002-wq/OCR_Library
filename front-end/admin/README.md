# Library Admin Front-end (React)

React admin dashboard for the library app. Built with Vite + React, React Router, Axios, and Chart.js. It connects to the existing Node.js API at `/api`.

## Quick start

```powershell
# In PowerShell, from the front-end folder
cd front-end
npm install
npm run dev
```

- Dev server: http://localhost:5173
- Configure API base URL via `.env` or `.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the production build locally

## Structure
- `src/pages` – Screens (Dashboard, Users, Books, OCR, Profile, Login)
- `src/components` – Layout and reusable components
- `src/api` – Axios client and API wrappers
- `src/styles` – Global and page styles

## Auth
- Token stored in `localStorage` as `token`, user data as `currentUser`
- Requests include `Authorization: Bearer <token>` header automatically
- Protected routes redirect to `/login` when unauthenticated

## Notes
This UI is intentionally lightweight and can be expanded with a full design system later (e.g., MUI/Ant Design) if desired.