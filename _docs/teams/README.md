# Team and Issue Workflow

Work happens **one GitHub issue at a time**, in the order of the phases in [../plan.md](../plan.md#6-phases-github-issues-in-order). Every issue moves through three roles. An issue is closed only when its acceptance criteria pass; then the next issue starts.

| Role | Owns | Guide |
| --- | --- | --- |
| Product Manager | What and why: scope, plan alignment, acceptance criteria, final sign-off | [product-manager.md](./product-manager.md) |
| Software Engineer | How: technical plan, implementation, tests, pull request | [software-engineer.md](./software-engineer.md) |
| Tester | Proof: test plan, verification against acceptance criteria, bug reports | [tester.md](./tester.md) |

---

## Issue lifecycle

```
 ┌────────────┐   ┌───────────┐   ┌──────────────┐   ┌───────────┐   ┌────────┐
 │ 1 Analysis │ → │ 2 Ready   │ → │ 3 In progress│ → │ 4 Testing │ → │ 5 Done │
 │  (PM)      │   │  (PM)     │   │  (Engineer)  │   │ (Tester)  │   │  (PM)  │
 └────────────┘   └───────────┘   └──────────────┘   └─────┬─────┘   └────────┘
                                         ▲                 │ fails
                                         └─────────────────┘
```

| Stage | GitHub label | Who | Enters when | Leaves when |
| --- | --- | --- | --- | --- |
| 1 Analysis | `status: analysis` | PM | Issue created from a plan phase | PM has written scope, out of scope, UX notes, dependencies, and acceptance criteria, and confirmed it matches the plan |
| 2 Ready | `status: ready` | PM | Analysis complete | Engineer picks it up (only if no other issue is in stages 3–4) |
| 3 In progress | `status: in-progress` | Engineer | Engineer posts a technical plan comment | Pull request is open, `pnpm check-all` passes, and every criterion has a test or a manual check note |
| 4 Testing | `status: testing` | Tester | PR ready for review | All acceptance criteria pass on a release build → stage 5. Any failure → bug comment, back to stage 3 |
| 5 Done | `status: done` | PM | Tester passes it | PM confirms it still matches the plan, merges the PR, closes the issue, and opens the next phase |

### Rules
- **One issue in progress at a time.** Stages 3–4 never hold more than one issue.
- **Acceptance criteria are the contract.** The Engineer builds to them, the Tester tests against them, and the PM closes on them. Changing them during stage 3 or 4 means sending the issue back to Analysis.
- **The plan is the source of truth.** If an issue needs scope the plan doesn't have, the PM updates `plan.md` first, in the same PR or before.
- **Backend dependencies** are separate issues in the backend repo, linked from the mobile issue. A mobile issue can't enter stage 3 until its backend dependency is merged or explicitly mocked.
- **Every handoff is a comment** on the issue using the template in each role guide, so the history explains every decision.

---

## Issue template

New issues use `.github/ISSUE_TEMPLATE/phase.md`. Its sections are filled in stage by stage:

1. **Plan link** — the section of `plan.md` this issue implements.
2. **Goal** — one or two sentences on user value.
3. **Scope** / **Out of scope**.
4. **UX** — screens and states, linking to `design.md` sections.
5. **Dependencies** — issues and backend changes.
6. **Acceptance criteria** — numbered, testable, Given / When / Then.
7. **Technical plan** — added by the Engineer in stage 3.
8. **Test report** — added by the Tester in stage 4.
9. **Sign-off** — the PM's closing note.
