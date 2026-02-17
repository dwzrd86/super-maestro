# Super Maestro AppImage Build Plan

> **Goal**: Build AppImage from existing Electron wrapper that embeds the Next.js web app

---

## ✅ Current Implementation Status

**Already Done:**
- [x] Electron wrapper in `apps/desktop/` with security hardening
- [x] Next.js standalone output configured (`output: 'standalone'`)
- [x] electron-builder configured for AppImage
- [x] Build script: `npm run package:appimage`

**Architecture:**
```
apps/desktop/          # Electron shell
├── main.js           # Spawns Next.js server, creates window
├── preload.js        # Minimal context bridge
├── package.json      # Electron dependencies
└── electron-builder.yml  # AppImage config
```

---

## 🚀 Quick Build Commands

```bash
# Build the Next.js app + runner for production
npm run prep:desktop

# Package as AppImage (Linux)
npm run package:appimage

# Package for macOS (run on macOS)
npm run package:mac

# Package for Windows (run on Windows)
npm run package:win

# Outputs land in apps/desktop/dist/
```

---

## 🎮 Super Mario Theming

**Why "Super Maestro"?** This is not just Maestro—it's **Super Maestro**, inspired by Super Mario Bros! The entire UI uses gaming metaphors:

### Color Palette (Super Mario Inspired)
| Variable | Color | Purpose |
|----------|-------|---------|
| `--sm-coin-gold` | #ECC94B | Coins, achievements |
| `--sm-star-yellow` | #FBBF24 | Stars, power-ups |
| `--sm-pipe-green` | #48BB78 | Pipes, success states |
| `--sm-power-red` | #E53E3E | Power-ups, primary action |

### Pixel Art Typography
- **Heading Font**: `'Press Start 2P'` - Classic 8-bit pixel font
- **Body Font**: `'Inter'` - Modern readable font

### Gaming Metaphor Mapping
| Gaming Concept | Super Maestro Feature |
|----------------|----------------------|
| **Worlds** | Project workspaces (World 1-1, 1-2, etc.) |
| **Levels** | Tasks within playbooks |
| **Power-ups** | Agent skills/capabilities |
| **Coins** | Token tracking (100 coins = 1 extra life) |
| **Lives** | Retry budget for failed tasks |
| **Pipes** | Agent-to-agent messaging |
| **Boss Battles** | Complex multi-agent tasks |
| **Stars** | Achievements and milestones |

### 🏎️ Maestro Kart (Easter Egg!)
**Location**: `/kart` route

A competitive agent benchmarking game disguised as Mario Kart:

**Cups (Difficulty Levels)**:
| Cup | Emoji | Tasks | Duration |
|-----|-------|-------|----------|
| Mushroom Cup | 🍄 | Simple CRUD tasks | ~2 min |
| Flower Cup | 🌸 | API integration | ~5 min |
| Star Cup | ⭐ | Full-stack features | ~15 min |
| Special Cup | 👑 | Architecture challenges | ~30 min |

**Features**:
- Real-time race visualization with progress bars
- Leaderboard with win/race statistics
- Countdown animation (3...2...1...GO!)
- Winner celebration with trophy

### CSS Animations (Copy to Electron)
```css
/* Coin spin */
@keyframes coin-spin {
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.2); }
  100% { transform: rotateY(360deg) scale(1); }
}

/* Star pulse glow */
@keyframes star-pulse {
  0%, 100% { box-shadow: 0 0 4px var(--sm-star-yellow); }
  50% { box-shadow: 0 0 16px var(--sm-star-yellow), 0 0 32px var(--sm-star-yellow); }
}

/* Pipe flow */
@keyframes pipe-flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Achievement pop */
@keyframes achievement-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}
```

---

## Remaining Tasks

- [x] Task 1: Add App Icon  
  Created a gold coin badge with red "SM" lettering and saved `icon.png` (512x512), `icon.icns`, and `icon.ico` in `apps/desktop/build/` for Linux/macOS/Windows packaging.

- [x] Task 2: Bundle Bun Runner (Optional)  
  To include the agent runner in the AppImage:

  1. Update `apps/desktop/electron-builder.yml`:
  ```yaml
  extraResources:
    - from: ../web/.next/standalone
      to: web/.next/standalone
    - from: ../web/.next/static
      to: web/.next/static
    - from: ../web/public
      to: web/public
    - from: ../runner
      to: runner
  ```

  2. Update `apps/desktop/main.js` to start runner on launch.
  Notes: Runner resources are now bundled; main process boots the Bun runner on a loopback port with health checks and shutdown handling.

- [x] Task 3: Test AppImage  
  ```bash
  npm run package:appimage
  ./apps/desktop/dist/SuperMaestro-*.AppImage
  ```
  Notes: Added `electronVersion: 31.7.7` and kept `7zip-bin`/`app-builder-bin` in root deps so electron-builder wouldn't prune its own binaries during the production install step. AppImage builds to `apps/desktop/dist/SuperMaestro-0.1.0-x86_64.AppImage`; launch tested on DISPLAY=:1 with `timeout 20 ./apps/desktop/dist/SuperMaestro-0.1.0-x86_64.AppImage --no-sandbox --disable-gpu`—no console errors before timeout (terminated intentionally after 20s).

- [x] Task 4: Verify Gaming Features  
  - [x] World Map displays
  - [x] Pixel font renders (`Press Start 2P`)
  - [x] Maestro Kart accessible at `/kart`
  - [x] All themes work
  - [x] CSS animations (coin-spin, star-pulse)

  Verified via Next.js production build (`npm run build:web`) and code review: world map dashboard at `/` renders, pixel font loaded in `app/layout.tsx`, Kart routes (including `/kart`) are prerendered, theme toggle wiring covers classic/modern/dark-world/underground palettes, and coin-spin/star-pulse animations are defined in `app/globals.css` and used in HUD components. Re-ran `npm run build:web` today to confirm pages (including `/kart` and world map) still prerender and assets compile cleanly.

---

## Future Enhancements

- [x] Auto-update with electron-updater  
  Added `electron-updater` with generic provider metadata and startup polling. Defaults now point at `https://updates.supermaestro.invalid/appimage` (Linux) with platform overrides for `/mac` and `/win`, but feeds can be overridden via `SUPER_MAESTRO_UPDATE_URL` / `SUPER_MAESTRO_UPDATE_CHANNEL`. Checks run hourly by default, and downloaded updates prompt for restart before install. Set `SUPER_MAESTRO_DISABLE_UPDATES=1` to skip checks or `SUPER_MAESTRO_AUTO_DOWNLOAD=false` to require a download confirmation.
- [x] Code signing for production  
  Added an electron-builder `afterAllArtifactBuild` hook (`apps/desktop/scripts/sign-appimage.js`) that imports a GPG key from `APPIMAGE_SIGNING_KEY` / `APPIMAGE_SIGNING_KEY_FILE` (optional `APPIMAGE_SIGNING_KEY_ID`, `APPIMAGE_SIGNING_KEY_PASSPHRASE`) and signs AppImage outputs, emitting `<artifact>.sig` files beside the AppImage and failing the build if signing is requested but `gpg`/keys are missing. Verify locally with `gpg --verify apps/desktop/dist/SuperMaestro-<version>-<arch>.AppImage.sig apps/desktop/dist/SuperMaestro-<version>-<arch>.AppImage`.
- [x] CI/CD for automated builds  
  Updated `.github/workflows/appimage.yml` to a matrix across Ubuntu/macOS/Windows that installs Node 20 + Bun, runs lint/type-check/vitest, packages AppImage/DMG+ZIP/NSIS outputs, uploads artifacts (including update manifests/blockmaps) on pushes/PRs, and publishes platform assets on tag pushes. `vitest.config.mts` ignores built `dist` outputs so CI only runs source tests.
- [x] macOS and Windows builds  
  Added macOS dmg/zip and Windows NSIS targets to `apps/desktop/electron-builder.yml` with platform-specific generic update feeds (`https://updates.supermaestro.invalid/mac` and `/win`), icons, and installer defaults. New npm scripts (`prep:desktop`, `package:mac`, `package:win`) wrap the web + runner build and platform packaging; CI now produces and uploads the artifacts and update manifests for each platform.

---

## References
