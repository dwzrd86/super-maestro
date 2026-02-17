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
# Build the Next.js app for production
npm run build:web

# Package as AppImage
npm run package:appimage

# Output: apps/desktop/dist/SuperMaestro-0.1.0-x64.AppImage
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

### Task 1: Add App Icon
Create icon files in `apps/desktop/build/`:
- `icon.png` (512x512) - Linux AppImage
- `icon.icns` - macOS (future)
- `icon.ico` - Windows (future)

### Task 2: Bundle Bun Runner (Optional)
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

### Task 3: Test AppImage
```bash
npm run package:appimage
./apps/desktop/dist/SuperMaestro-*.AppImage
```

### Task 4: Verify Gaming Features
- [ ] World Map displays
- [ ] Pixel font renders (`Press Start 2P`)
- [ ] Maestro Kart accessible at `/kart`
- [ ] All themes work
- [ ] CSS animations (coin-spin, star-pulse)

---

## Future Enhancements

- [ ] Auto-update with electron-updater
- [ ] Code signing for production
- [ ] CI/CD for automated builds
- [ ] macOS and Windows builds

---

## References
