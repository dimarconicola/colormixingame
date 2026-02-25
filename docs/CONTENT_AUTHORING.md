# Content Authoring Toolkit

This repository includes a lightweight content authoring toolkit in `@colormix/content` to speed up challenge and pack creation while keeping schema consistency.

## 1. Purpose

1. Generate valid starter templates for new challenges/packs.
2. Reduce manual schema mistakes before validation.
3. Keep content growth practical without requiring a full visual editor.

## 2. Commands

Run from repository root:

```bash
pnpm --filter @colormix/content run authoring:template -- --kind challenge --mode solve --id sunset-haze
pnpm --filter @colormix/content run authoring:template -- --kind pack --id warmup-path --challenge-ids sunset-peach,predict-coral-flare
```

Optional flags:

1. `--title "Custom Title"`
2. `--difficulty easy|medium|hard` (challenge templates only)
3. `--output path/to/file.json` (write template to file instead of stdout)

## 3. Typical Workflow

1. Generate challenge/pack template(s).
2. Adapt output into `packages/content/src/default-content.ts`.
3. Run validation:

```bash
pnpm content:validate
pnpm --filter @colormix/content test
```

4. If adding new gameplay behavior, add/update app and domain tests accordingly.

## 4. Constraints

1. Templates are scaffolds, not auto-balanced final content.
2. Validation rules (difficulty progression, mode mix, distractor spacing) remain authoritative.
3. New pack/challenge IDs must remain unique across the content set.
