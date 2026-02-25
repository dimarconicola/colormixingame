# iPad Packaging Runbook (Capacitor)

This track is optional and is intended to package the existing web app for iPad distribution without rewriting gameplay logic.

## 1. Scope

1. Keep gameplay and UI in the web app (`apps/web`).
2. Use a thin Capacitor shell for iOS runtime and App Store packaging.
3. Treat native-layer changes as packaging/integration work, not gameplay work.

## 2. Prerequisites

1. macOS with Xcode installed (latest stable recommended).
2. CocoaPods available (`pod --version`).
3. Apple Developer account for signing/distribution.
4. Repository dependencies installed (`pnpm install`).

## 3. First-Time Setup

From repository root:

```bash
pnpm run build:web
pnpm run cap:add:ios
pnpm run cap:sync:ios
pnpm run cap:open:ios
```

Notes:

1. `cap:add:ios` generates the `ios/` native project.
2. `cap:sync:ios` copies the latest web build (`apps/web/dist`) into the native shell.
3. `cap:open:ios` opens the Xcode workspace for signing/device testing.

## 4. Daily Packaging Flow

After web changes:

```bash
pnpm run ios:prepare
pnpm run cap:open:ios
```

`ios:prepare` rebuilds web assets and syncs them into iOS in one step.

## 5. Verification Checklist

Before shipping any iPad build:

1. Solve, Predict, Discriminate, and Collect flows complete without runtime errors.
2. Touch interactions feel responsive and targets remain comfortable on iPad.
3. Local diary persistence survives app restart.
4. Audio toggle works and respects silent preference.
5. Landscape and portrait layouts remain usable on common iPad sizes.

## 6. Signing and Distribution

1. Configure bundle identifier and signing team in Xcode.
2. Use Archive flow in Xcode to produce App Store/TestFlight artifact.
3. Keep release notes aligned with `README` and backlog status.

## 7. Constraints and Follow-Up

1. This packaging track does not introduce cloud account/sync behavior.
2. Native-specific plugins should be added only when required by product scope.
3. Any native runtime limitation discovered during QA should be logged as backlog work before release.
