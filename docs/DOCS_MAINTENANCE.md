# Documentation Maintenance

This project treats documentation as a first-class artifact.

## 1. Source of Truth

1. `README.md` is the entry point.
2. `docs/PRODUCT_SPEC.md` owns product behavior.
3. `docs/ARCHITECTURE.md` owns technical decisions.
4. `docs/DELIVERY_PLAN.md` owns milestone strategy.
5. `docs/BACKLOG.md` owns near-term execution priorities.

## 2. Update Triggers

Update docs when any of the following changes:

1. Scope or feature behavior.
2. Architecture or package boundaries.
3. Quality thresholds.
4. Delivery plan or milestone priorities.
5. Backlog order/status.

## 3. Pull Request Expectations

For any material change, PR should include:

1. Code change (if applicable).
2. Doc change linked to same decision.
3. Backlog status update.

## 4. Minimal Change Checklist

Before merge, confirm:

1. `README.md` still accurately represents project status.
2. Affected detailed doc section is updated.
3. Backlog entry moved/edited if priority changed.
4. Date/reference for completed major items is recorded.

## 5. Documentation Tone and Format

1. Prefer concise, explicit language.
2. Keep numbered lists for requirements and constraints.
3. Avoid aspirational statements without execution details.
4. Mark assumptions explicitly.

## 6. Versioning Guidance

1. Keep docs in Git with normal code review.
2. Use ADR log for non-trivial decisions.
3. Do not keep undocumented decisions in chat only.

