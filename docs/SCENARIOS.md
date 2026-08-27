# Written Scenario Answers

## (a) Evolving an existing monolith

I'd start with monitoring, error tracking, and a map of real usage — which endpoints and flows are actually hot — before touching anything, since "thousands of daily users" means any change is high risk. Once fixes and features are prioritised against that picture, I'd de-risk with a strangler-fig approach over a rewrite: each replaced piece ships as a custom web component built in a modern framework, consumable anywhere in the monolith without the monolith needing any awareness of the new stack. Over time, as routes accumulate migrated components, the new framework can start serving those routes natively as its own mini-apps (sharing components and services) instead of through web-component wrappers. Once every route has migrated, the old shell can be retired — a full rewrite of a live production system is rarely worth the risk it introduces on its own.

Rebuild vs extend is a per-piece call, not a blanket one: extend whatever still works and just needs the new capability bolted on; only migrate or rebuild the pieces actively blocking you — untested, tightly coupled, or structurally in the way.

## (b) Ways of working

My preference would be to treat this as a sequencing question, not a choice between the designer and the stakeholder. Ship the rough version now (possibly to a limited audience, e.g. beta customers) if it's safe to, since real usage provides useful feedback and shows which bits might actually be worth two weeks of polish. Polishing before validating risks polishing the wrong things.

The one thing I would avoid compromising on regardless of timeline is anything expensive or embarrassing to get wrong later, including data integrity, trust & safety, security. I'd put that framing to both people directly, rather than picking a side: ship a "minimum lovable" version now, and treat the polish pass as a fast-follow once real usage shows what's actually worth it.
