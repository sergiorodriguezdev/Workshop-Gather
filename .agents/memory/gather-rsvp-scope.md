---
name: Gather RSVP scope
description: The user's scope for RSVP tracking and related infrastructure in Gather.
---

Keep Gather workshop browsing public and require Clerk sign-in before creating or viewing a customer's RSVPs. Persist workshops, customer records, and RSVPs in Neon. Use the direct `NEON_DATABASE_URL` secret rather than requiring the Neon MCP integration; derive ownership from the verified Clerk session, never a client-supplied user ID. Do not add payments unless requested.

**Why:** the user explicitly replaced the earlier session-local, no-database scope with cross-session persistence in Neon, and dismissed the Neon connector while asking to continue.

**How to apply:** keep workshop browsing public, protect RSVP reads and writes, and make seat availability depend on persisted reservation records.
