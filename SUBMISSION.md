# QueueFlow — DeepSpace assessment submission notes

Paste/adapt this into the portal writeup. Deadline: **Tue Nov 24, 2026 11:59 PM ET**.

## Portal fields

| Field | Value |
| --- | --- |
| **Deployed app URL** | https://queueflow.app.space |
| **Repository** | DeepSpace cloud repo remote `space` (app `queueflow`). If the portal requires GitHub, mirror this repo to a GitHub URL and paste that. |
| **Product** | QueueFlow — real-time salon/barbershop queue |

## What I built

QueueFlow is a real-time queue for service businesses. Staff sign in, create a shop, and run a live floor board. Guests open a public link, take a ticket without an account, and watch their place update live on a private ticket page.

Core path:

1. Staff authenticate → create shop → open `/dashboard/queue`
2. Guest opens `/queue/<slug>` → join → lands on `/ticket/<token>`
3. Staff call / serve / complete; guest ticket and public snapshot update without refresh

## DeepSpace primitives used (4)

1. **Authentication** — `DeepSpaceAuthProvider`, `AuthGate`, branded `AuthOverlay`, sign-out. Privileged mutations verify JWT + membership on the worker.
2. **Records + realtime sync** — collections for businesses, team_members, tickets, secrets, events, snapshots, counters, ticket_views. Staff share the app room; each guest ticket uses a private `ticket:<token>` RecordScope.
3. **Presence** — `usePresenceRoom(\`business:${businessId}\`)` on the queue board so staff see who else is on the floor.
4. **R2 (optional fourth)** — app-scoped public logos via `useR2Files({ scope: 'app' })`.

Not used (on purpose): Yjs collaborative editing, Canvas, Messaging, AI chat, Composio, payments — they don’t improve a queue product for this scope.

## Main tradeoff

**Server-authoritative queue via Durable Object record tools + retries, not a multi-statement SQL transaction.** Ticket numbers use a counter record + `uniqueOn(businessId, queueDay, ticketNumber)` with retry on conflict. Concurrent joins stay unique, but the design honestly is not a single ACID transaction across ticket + event + snapshot writes. That matched the platform and kept the product shippable.

Other deliberate cuts: one shop per signed-in owner for the demo path; staff invite by DeepSpace user id (no email invite loop); no SMS when a guest is called.

## What the agent did vs what I verified

**Agent:** scaffold exploration, schema/RBAC, public join + ticket routes, staff actions, dashboard UI, presence, R2 logos, landing/home polish, modals, deploy commits.

**I verified / directed:** product scope (salon queue), isolation rules (no anonymous ticket list), capability-token tickets, server-only status transitions, rate-limited joins, no token logging, theming away from generic purple SaaS, deploy to `queueflow.app.space`, and the writeup tradeoffs above.

## Important path checklist

- [x] Landing `/`
- [x] Auth + staff home `/home`
- [x] Dashboard today / queue / activity / settings / team
- [x] Public join `/queue/:slug`
- [x] Private live ticket `/ticket/:token`
- [x] Presence on queue board
- [x] Logo upload (R2)
- [x] Multi-business isolation via `team_members` + `teamField`
- [x] Deployed URL responds (`/api/queue/health`)

## What I’d do next (honest unfinished edges)

- Stronger counter allocation (DO-internal single-flight) if join volume rises
- SMS / push when status → serving
- Email-based staff invites
- Multi-chair “now serving” if a shop runs parallel stations
- Mirror repo to GitHub if the portal requires that host

## Local verify commands

```sh
npx tsc --noEmit
npm run test:unit
npx deepspace deploy
```
