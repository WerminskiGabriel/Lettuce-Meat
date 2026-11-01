# Frontend Lettuce-Meat

## Stack

- Vite, React, TypeScript
- react-router-dom, fetch
- CSS (design_system_specification.md)
- Redux, TanStack Query, MUI, calendar libs, axios (later / skip)

## React packages

- vite
- react
- react-dom
- react-router-dom
- typescript

## Functionalities

### MVP

- Create meeting form (title, date range, day hours, slot size, timezone, quorum_min, deadline_time)
- Meeting page via share link /m/:id
- Guest nickname + edit token (localStorage, header X-Edit-Token)
- Interactive availability grid (click / drag)
- Save / replace / clear availability slots
- preferred / canDo on slots
- Aggregated heatmap (color by overlap / count)
- Hover / focus: who is free in a cell (participant ids)
- Return / restore mine when token present
- Delete mine (participant + slots)
- Copy share link
- Empty grid, 404, save error states

### Later

- Create Groups (quick invites UI)
- Register / login / logout (session cookie)
- My meetings list (created / joined)
- Claim guest vote onto account
- Close meeting + store / show chosen final slot
- Read-only grid when closed
- Choosing locations
- Google account login
- WebSockets (live updates)
- Email / calendar / QR invite export
- Soft refresh / poll so others' votes appear

### Not logged users

- Enter via code or link / QR
- What the user sees per admin settings

### Users

- Past quorums

### Admin Panel

- Analysis of user entries
- Groups managing

## Layout

```text
client/
  src/
    api/client.ts
    types.ts
    pages/HomePage.tsx
    pages/MeetingPage.tsx
    components/AvailabilityGrid.tsx
  index.html
```

Vite proxies /api -> Flask.

## Routes

| Path | Notes |
|------|--------|
| / | Create meeting form |
| /m/:id | Grid + heatmap + save / clear / delete mine |

Later: /login, /register, my meetings, admin panel, organizer close on /m/:id

## Grid & sync

- Rows/cols from meeting metadata (date range, day hours, slot size) — not hardcoded
- Empty cells UI only (not in DB)
- Drag -> local state; Save -> one PUT (not every pointermove)
- Heatmap from GET cells {on_date, start_minute, count, participant_ids}
- Others see updates on next GET (poll / refresh); WebSockets later
- Best time = highest count on heatmap (server aggregates)
