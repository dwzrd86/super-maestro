# Production deployment

Super Maestro should ship first as a signed desktop application, not as a hosted-only web app.

## Recommendation

| Format | Production role | Why |
| --- | --- | --- |
| **AppImage** | **Primary Linux release artifact** | Best fit for a local agent orchestrator: one downloadable file, broad distro coverage, no root install, and compatible with Electron auto-update metadata. |
| **`.deb`** | **Secondary Linux artifact** | Useful for Ubuntu/Debian users who want package-manager integration, desktop entries, and managed uninstall/upgrade behavior. |
| **macOS `.dmg` + `.zip`** | macOS release artifacts | `.dmg` is the installer users expect; `.zip` is required by Electron's macOS updater metadata flow. |
| **Windows NSIS `.exe`** | Windows release artifact | Standard Electron installer with update metadata support. |
| **Flatpak** | Later, after hardening | The sandbox conflicts with the app's local-runner goals: tmux, local project folders, Git worktrees, and host CLI agent binaries need explicit portals/permissions. Publish only after a dedicated Flatpak manifest and permission review. |
| **Hosted web app** | Companion/team dashboard only | A hosted dashboard cannot replace Maestro-like local orchestration by itself because the runner needs local filesystem, terminal, tmux, Git, and authenticated CLI-agent access. |

## Why this is the right replacement shape for Maestro

RunMaestro/Maestro is positioned as a cross-platform desktop app for orchestrating local AI coding agents. Super Maestro has the same local-first requirement: the Electron shell bundles the Next.js dashboard, starts a loopback-only web server, and starts the Bun runner against `127.0.0.1` so local agent work stays on the workstation.

A hosted web app can be useful for accounts, teams, playbook sharing, analytics, and remote status, but the production replacement for Maestro should be a signed desktop build that owns the local runner lifecycle.

## Release channels

Use three channels:

1. `latest` — stable user-facing release.
2. `beta` — signed release candidates for real-world validation.
3. `nightly` — optional unsigned/internal smoke builds, not promoted on the public download page.

Each channel should publish artifacts and update metadata under a channel-specific directory, for example:

```text
https://updates.supermaestro.sh/latest/appimage/
https://updates.supermaestro.sh/latest/deb/
https://updates.supermaestro.sh/latest/mac/
https://updates.supermaestro.sh/latest/win/
https://updates.supermaestro.sh/beta/appimage/
```

Set `SUPER_MAESTRO_UPDATE_URL` and `SUPER_MAESTRO_UPDATE_CHANNEL` in CI when packaging so the generated updater config points at the right channel.

## Production build commands

Build all desktop assets first:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud \
NEXT_PUBLIC_RUNNER_WS_URL=ws://127.0.0.1:3001 \
NEXTAUTH_SECRET=<long-random-secret> \
NEXTAUTH_URL=https://app.supermaestro.sh \
npm run prep:desktop
```

Package Linux artifacts from Linux:

```bash
npm run package:linux
```

Package only the primary Linux artifact:

```bash
npm run package:appimage
```

Package only the Debian artifact:

```bash
npm run package:deb
```

Package macOS artifacts from macOS:

```bash
npm run package:mac
```

Package Windows artifacts from Windows:

```bash
npm run package:win
```

## Signing and update requirements

Do not call a build production-ready until these are true:

- Linux AppImages are GPG-signed with `APPIMAGE_SIGNING_KEY` or `APPIMAGE_SIGNING_KEY_FILE`.
- macOS builds are signed and notarized with the standard Electron Builder Apple credentials.
- Windows builds are Authenticode-signed with the Windows signing credentials.
- `SUPER_MAESTRO_UPDATE_URL` points at a real HTTPS update bucket, not the placeholder `.invalid` domain.
- Artifacts, signatures, blockmaps, and `latest*.yml` files are uploaded atomically per channel.
- CI runs `npm run lint`, `npm run type-check`, `npm run test`, and at least one platform package job before publishing.

## Flatpak readiness checklist

Do not prioritize Flatpak for the first production release. Revisit it after the desktop build is stable and these items have explicit decisions:

- Which host paths the runner can access by default.
- How tmux and agent CLIs are discovered inside or outside the sandbox.
- Whether users must grant project-directory access through portals.
- How auto-updates work: Flatpak repository updates instead of Electron generic updater.
- Whether the package can satisfy Flathub review expectations while still supporting local CLI orchestration.

## Hosted web app readiness checklist

Ship the hosted web dashboard as a companion surface only after the desktop app can connect to it safely:

- Convex deployment is production-configured with authorization checks in queries/mutations and backup/export runbooks.
- Authentication, teams, and billing boundaries are threat-modeled.
- Runner pairing uses short-lived tokens and explicit device approval.
- Hosted pages clearly explain that local execution requires the desktop app or runner.
