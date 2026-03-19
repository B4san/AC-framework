**Fundamental Principle**: *"Quality with focused context. Load only what is necessary, when it is necessary."*

---

## Purpose

`ac-lite` keeps OpenSpec rigor while reducing context load by:

1. Loading only mandatory core workflow skills by default.
2. Activating mobile/platform specialist skills only when objective gates trigger.
3. Enforcing hard implementation and closure checkpoints.

---

## Default Skill Set (Always Load)

1. `acfm-spec-workflow`
2. `acfm-memory`
3. `openspec-new-change` OR `openspec-ff-change`
4. `openspec-continue-change`
5. `openspec-apply-change`
6. `openspec-verify-change`
7. `openspec-archive-change`
8. `mobile-design`

---

## Persistent Memory Protocol (Always Active)

At session start:
1. Recall project memory before planning or implementation.
2. Search for task-specific patterns (architecture, bugfixes, conventions).
3. Treat recalled memory as active unless repo state or user instructions override.

Save reusable context after major decisions, fixes, and closures.

Fallback CLI examples:
```bash
acfm memory recall
acfm memory search "offline sync"
acfm memory stats
```

---

## Conditional Skill Gates

### Platform/Stack Gate
Load based on selected implementation stack:
- `flutter-expert` [IF Flutter]
- `ios-developer` [IF native iOS]
- `react-native-architecture` [IF React Native architecture/native modules]
- `react-native-design` [IF React Native UI/navigation/animation]
- `react-state-management` [IF global/complex state]

### Platform UI Gate
- `mobile-ios-design` [IF iOS UI changes]
- `mobile-android-design` [IF Android UI changes]

### Clarity/Scale Gate
- `spec-clarification` [IF requirements ambiguous]
- `spec-analysis` [IF cross-artifact consistency needs verification]
- `microtask-decomposition` [IF tasks remain too complex]
- `project-index` / `context-synthesizer` [IF repo/session scale requires]

### Research Gate
- `research-retrieval` [IF external docs are needed]

### Debug Gate
- `systematic-debugging` [IF blocked by bugs/regressions]

### Delivery Gate
- `documentation`, `sync-index`, `changelog-generator` [during closure]

---

## Mandatory Quality Gates

### Gate A: Ready to Implement
Before `openspec-apply-change`, all must be true:
- Change is initialized and valid (`acfm spec status --change <name> --json`)
- `tasks.md` exists with actionable checkboxes
- Platform and stack are explicit
- Required conditional skills were executed
- Session-start memory recall completed

### Gate B: Ready to Close
Before `openspec-archive-change`, all must be true:
- `openspec-verify-change` completed
- Critical issues resolved (or explicitly accepted with warning)
- Task list reflects final state
- Reusable context saved to memory
- `documentation` / `sync-index` / changelog steps executed as required

---

## Lite Workflow

### New Mobile Change
1. `acfm-spec-workflow` status/init checks.
2. Session-start memory recall (`acfm-memory`).
3. Start change (`openspec-new-change` or `openspec-ff-change`).
4. Build artifacts (`openspec-continue-change`).
5. Trigger and run only needed conditional skills.
6. Pass Gate A.
7. Implement (`openspec-apply-change`).
8. Verify (`openspec-verify-change`).
9. Pass Gate B.
10. Archive/sync and generate closure docs.

### Existing Mobile Change
1. Confirm initialization and target change.
2. Run memory recall.
3. Refresh artifacts.
4. Run only triggered conditional skills.
5. Pass Gate A.
6. Implement and debug as needed.
7. Verify.
8. Pass Gate B.
9. Archive/sync.

---

## Operational Rules

1. Do not load non-triggered skills "just in case".
2. Do not implement before platform/stack is explicit.
3. If risk increases, load matching skill immediately.
4. Keep outputs concise and auditable (which gates passed/failed and why).
5. Save reusable memory at significant milestones.
