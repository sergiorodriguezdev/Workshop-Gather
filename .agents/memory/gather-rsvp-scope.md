---
name: Gather RSVP scope
description: The user's scope for RSVP tracking and related infrastructure in Gather.
---

Keep Gather workshop browsing public and require Clerk sign-in before RSVP. Store only workshop IDs in browser local storage, keyed by Clerk customer ID. Do not add a database, payments, or external integrations unless requested.

**Why:** the user requested account-specific RSVPs and sign-out while retaining the earlier no-database scope.

**How to apply:** each customer’s list is isolated on the current browser/device; do not imply cross-device sync or server persistence.
