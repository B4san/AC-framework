# AC Custom Workflow Template

This is a template guide for building a project-specific workflow after running `find-skills`.

## How to use this template

1. Detect assistant folders at workspace root (`ls -la`).
2. Run skill discovery batches (minimum 5 recommendations per batch).
3. Confirm selected skills with the user.
4. Install selected skills to target assistant folders.
5. Normalize install paths if a temporary folder (for example `.agents`) is created.
6. Replace placeholders in this file with the final skill set and workflow.

## Assistant targets detected

- {{ASSISTANT_FOLDERS}}

## Selected skill repertoire

| Skill | Why selected | Workflow phase |
|---|---|---|
| {{SKILL_1}} | {{RATIONALE_1}} | {{PHASE_1}} |
| {{SKILL_2}} | {{RATIONALE_2}} | {{PHASE_2}} |
| {{SKILL_3}} | {{RATIONALE_3}} | {{PHASE_3}} |
| {{SKILL_4}} | {{RATIONALE_4}} | {{PHASE_4}} |
| {{SKILL_5}} | {{RATIONALE_5}} | {{PHASE_5}} |

Add rows as needed.

## Workflow skeleton

### Phase 0: Bootstrap

- Run `acfm-spec-workflow` checks.
- Run memory recall (`acfm-memory`).
- Run `find-skills` for initial repertoire (mandatory on project start).

### Phase 1: Discovery and planning

- `openspec-explore`
- `brainstorming`
- `spec-clarification`
- Optional domain skills selected by the user

### Phase 2: Design and tasking

- `openspec-new-change` or `openspec-ff-change`
- `openspec-continue-change`
- `spec-analysis`
- `requirement-checklist`

### Phase 3: Implementation

- `test-generator`
- `openspec-apply-change`
- `code-review`
- Security/performance skills as selected

### Phase 4: Verification and closure

- `openspec-verify-change`
- `vibe-security`
- `documentation`
- `sync-index`
- `openspec-archive-change`

## Installation commands log

```bash
# discovery
npx skills find {{QUERY}}

# install examples
npx skills add {{PACKAGE_OR_REPO}} --skill {{SKILL_NAME}}

# optional explicit example
npx skills add https://github.com/vercel-labs/skills --skill find-skills
```

## Path normalization log

Document any relocation from temporary folders to real assistant targets:

- Source: `{{TEMP_SKILL_PATH}}`
- Destination: `{{TARGET_AGENT_SKILL_PATH}}`
- Cleanup: `{{REMOVED_TEMP_FOLDERS}}`

## Required outputs checklist

- [ ] At least 5 recommendations were produced for each search batch.
- [ ] User confirmed which skills to install.
- [ ] Skills installed in intended assistant folder(s).
- [ ] Temporary install folders cleaned.
- [ ] `ac.md` updated with final selected skills.

