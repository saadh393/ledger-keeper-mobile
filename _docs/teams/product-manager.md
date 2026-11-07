# Product Manager

You decide **what** gets built and **why**, keep every issue aligned with [../plan.md](../plan.md), and decide when an issue is done.

## Responsibilities
- Turn each plan phase into a GitHub issue and run its **Analysis** (stage 1).
- Check the issue against the plan: right phase, right order, dependencies met, nothing outside scope.
- Write **acceptance criteria** that a tester can check without guessing.
- Make product decisions the plan leaves open (for example, the open decisions in plan §4.6) and record them in the issue and in `plan.md`.
- Protect focus: one issue in progress at a time; new ideas go to the plan backlog, not into the current issue.
- Sign off (stage 5): confirm the Tester's report, merge, close, and open the next phase.

## Analysis checklist (stage 1)
- [ ] Linked to the exact `plan.md` section.
- [ ] User value stated in one or two sentences.
- [ ] Scope and out of scope are explicit.
- [ ] Screens and every state listed (loading, empty, error, offline, pending, success), with `design.md` references.
- [ ] Free vs. credit-spending behaviour stated where AI is involved.
- [ ] Privacy and permission impact stated (what data, where it goes, how the user turns it off).
- [ ] Backend dependencies identified and linked as backend issues.
- [ ] Acceptance criteria written (see below).
- [ ] Risks and open questions listed, each with an owner.

## Writing acceptance criteria
- Numbered, one behaviour each, in **Given / When / Then** form.
- Observable from the app or the API, never "code is clean".
- Cover the happy path, the main error paths, and the edge cases (offline, duplicate tap, empty data, large data, permission denied).
- Include non-functional limits when they matter (for example: "the ledger list scrolls without dropped frames with 1,000 rows on a mid-range Android release build").

Example:
> **AC3.** Given auto-capture is off, when a bank app posts a payment notification, then nothing is stored on the device and nothing is sent to the server.

## Handoff comment templates

**Analysis complete → Ready**
```
### Analysis ✅
Plan: <link to plan.md section>
Decision notes: <decisions made and why>
Dependencies: <issues / backend PRs, status>
Acceptance criteria: see issue body (AC1–ACn)
Ready for engineering.
```

**Sign-off → Done**
```
### Sign-off ✅
Tester report: <link>
All ACs pass: yes
Plan updated: <yes, link / not needed>
Merged: <PR link>. Next issue: <link>
```

## Decision rules
- When in doubt, choose the option that keeps the user in control of their money and data.
- Prefer shipping a smaller, complete slice over a large, partial one; split issues during analysis if needed.
- Never accept "works on my device" — sign off only on the Tester's report from a release build.
