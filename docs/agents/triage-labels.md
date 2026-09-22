# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Type labels

Every issue carries exactly one type label.

| Label    | Meaning                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------- |
| `spec`   | Describes what to build and why (problem, scope, acceptance criteria). Produced by `/to-spec`.   |
| `ticket` | One implementable slice of work, usually linked to a parent spec (`Part of #<spec>`). Produced by `/to-tickets`. |

## Priority labels (MoSCoW)

Every issue that is not `wontfix` carries exactly one priority label.

| Label           | Meaning                                                  |
| --------------- | -------------------------------------------------------- |
| `must-have`     | Required: the release or fix is not done without it      |
| `should-have`   | Important, but a workaround exists; do after must-haves  |
| `could-have`    | Nice to have; only if time allows                        |
| `wont-have-now` | Explicitly out of scope for now; revisit later           |

`wont-have-now` means "not now", while `wontfix` means "never".

## Size labels (T-shirt)

Every `ticket` carries exactly one size label. A `spec` does not: its size is the sum of its tickets.

| Label     | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| `size:xs` | Trivial: typo, config value, one-line fix (< 30 min)                   |
| `size:s`  | Small, one file, obvious approach (< 2 h)                              |
| `size:m`  | A few files, some decisions, needs tests (half a day to 1 day)         |
| `size:l`  | Crosses several areas or has unknowns (2 to 3 days)                    |
| `size:xl` | Too big to ship as one ticket: split it with `/to-tickets` before work |

When triaging, set a type and a priority (plus a size for a `ticket`) alongside the triage-state label. An `xl` ticket is never `ready-for-agent`.
