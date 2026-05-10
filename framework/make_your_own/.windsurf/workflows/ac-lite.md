# AC Lite Custom Workflow Template

Use this lite template after `find-skills` to keep a minimal, focused workflow.

## Lite rules

1. Detect assistant folders first (`ls -la`).
2. Run `find-skills` on project bootstrap or direct request.
3. Offer at least 5 skills per search batch.
4. Install only user-confirmed skills.
5. Ensure installed skills end in the intended assistant `skills/` folder.

## Default baseline

- `acfm-spec-workflow`
- `acfm-memory`
- `find-skills`
- `openspec-new-change` or `openspec-ff-change`
- `openspec-continue-change`
- `openspec-apply-change`
- `openspec-verify-change`
- `openspec-archive-change`

## Selected add-on skills

- {{SELECTED_SKILLS_LIST}}

## Lite execution flow

1. Bootstrap checks + memory recall.
2. Skill discovery batch (>=5 options) and user confirmation.
3. Install and normalize paths.
4. Implement with selected baseline + add-on skills.
5. Verify, document, archive.

## Checklist

- [ ] Recommendations per batch >= 5
- [ ] Install targets confirmed
- [ ] `ac.md` regenerated
- [ ] Companion instruction files synchronized

