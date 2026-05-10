# Custom Skills Workflow Template

This instruction file is a template for building a personalized workflow from the selected skill repertoire.

## Mandatory behavior

- Always run `find-skills` when a project starts from zero.
- Also run `find-skills` on direct user request for new capabilities.
- Before searching, list workspace folders and detect active assistant targets (`.claude`, `.opencode`, etc.).
- Provide at least 5 skill recommendations per search batch.
- Confirm exactly which skills the user wants installed.
- After installation, regenerate `ac.md` and keep this file aligned with selected skills.

## Install and normalization policy

1. Install into user-confirmed assistant target(s).
2. If installer creates `.agents` or another temporary location, move skills into the intended target assistant folder.
3. Remove temporary folders after successful migration.

## Selected skills (fill after discovery)

| Skill | Purpose | Included in phase |
|---|---|---|
| {{SKILL_1}} | {{PURPOSE_1}} | {{PHASE_1}} |
| {{SKILL_2}} | {{PURPOSE_2}} | {{PHASE_2}} |
| {{SKILL_3}} | {{PURPOSE_3}} | {{PHASE_3}} |
| {{SKILL_4}} | {{PURPOSE_4}} | {{PHASE_4}} |
| {{SKILL_5}} | {{PURPOSE_5}} | {{PHASE_5}} |

## Personalized workflow outline

### Phase 0
- Bootstrap (`acfm-spec-workflow`, `acfm-memory`, `find-skills`)

### Phase 1
- Discovery and planning with selected analysis skills

### Phase 2
- Spec/design/tasks creation

### Phase 3
- Implementation and quality gates

### Phase 4
- Verification, documentation, archive

## Synchronization requirement

When skills change, update all relevant workflow files:
- `ac.md`
- `ac-lite.md` (if present)
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `copilot-instructions.md`

