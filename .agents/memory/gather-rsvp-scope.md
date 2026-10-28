---
name: Gather RSVP scope
description: The user's scope for RSVP tracking and related infrastructure in Gather.
---

Keep Gather workshop browsing public and require Clerk sign-in before creating or viewing a customer's RSVPs. Persist workshops, customer records, and RSVPs in Neon. Use the direct `NEON_DATABASE_URL` secret rather than requiring the Neon MCP integration; derive ownership from the verified Clerk session, never a client-supplied user ID. Do not add payments unless requested.

**Why:** the user explicitly replaced the earlier session-local, no-database scope with cross-session persistence in Neon, and dismissed the Neon connector while asking to continue.

**How to apply:** keep workshop browsing public, protect RSVP reads and writes, and make seat availability depend on persisted reservation records.

Legacy RSVP records only existed in browser storage and a process-local fallback, not in a server-side store. **Why:** before Neon, reservation ownership was attached to Clerk in the browser. **How to apply:** import retained browser data only after the owner signs in; runtime-only records cannot be recovered after their original session is gone.

Send a server-side JSON webhook after a new RSVP or RSVP removal commits. The receiver contract is exactly `{ workshopName, rsvps, updatedAt }`, where `rsvps` is the post-change total and `updatedAt` is the event timestamp. Keep the HTTPS URL, `X-Webhook-Secret`, and any Replit External Access Token in Replit Secrets. **Why:** the receiver requires this compact aggregate payload, and Replit preview URLs are private and temporary. **How to apply:** prefer the receiver's published URL; send its access token as a Bearer header when configured, while keeping receiver-secret auth separate.
