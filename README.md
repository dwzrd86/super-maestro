# Super Maestro

> **"It's-a me, your AI agent orchestrator!"**

The unified AI agent orchestration platform with a retro gaming aesthetic. Born from combining [Maestro](https://github.com/pedramamini/Maestro) (desktop orchestrator) and [ai-maestro](https://github.com/23blocks-OS/ai-maestro) (intelligent web dashboard).

Worlds, levels, power-ups, and co-op play — natural metaphors for agent orchestration.

## Architecture

```
super-maestro/
├── apps/
│   ├── web/          # Next.js 14 dashboard (App Router) with game UI
│   └── runner/       # Bun local agent runner with tmux integration
├── lib/
│   ├── cozo/         # CozoDB integration - persistent agent memory
│   └── mesh/         # Peer mesh network - distributed orchestration
├── packages/
│   └── shared/       # Shared TypeScript types and utilities
├── supabase/         # Database migrations and configuration
└── turbo.json        # Turborepo build configuration
```

## Core Metaphor

| Gaming Concept | Platform Feature | Technical Layer |
|---|---|---|
| **Worlds** | Project workspaces | Git worktrees, isolated environments |
| **Levels** | Tasks within playbooks | Sequential/parallel task steps |
| **Power-ups** | Agent skills | Equippable skill modules |
| **Coins** | Token tracking | API usage with visual feedback |
| **Lives** | Retry budget | Configurable error retry limits |
| **Pipes** | Agent messaging | Mesh network channels |
| **Boss Battles** | Complex tasks | Multi-agent playbook finales |
| **Kart** | Agent benchmarking | Competitive coding challenges |

## Themes

4 built-in themes inspired by retro gaming worlds:

- **Classic** — Full retro pixel aesthetic with 8-bit accents
- **Modern** — Clean professional dashboard
- **Dark World** — Dark mode with neon pixel accents
- **Underground** — Terminal-focused, green-on-black

## Maestro Kart

Agent benchmarking disguised as a racing game:

| Track | Challenge Type | Duration |
|---|---|---|
| Mushroom Cup | Simple CRUD tasks | ~2 min |
| Flower Cup | API integration | ~5 min |
| Star Cup | Full-stack feature | ~15 min |
| Special Cup | Architecture challenge | ~30 min |

## Tech Stack

- **Web Dashboard**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Agent Runner**: Bun, WebSocket server, tmux integration
- **Agent Memory**: CozoDB (embedded graph-relational database per agent)
- **Distribution**: Peer mesh network (WebSocket federation)
- **Database**: Supabase (PostgreSQL) for user/team data
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- Node.js >= 18
- Bun (for runner app)
- Supabase CLI (optional, for local development)

### Installation

```bash
# Install dependencies
npm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local

# Start development servers
npm run dev
```

### Development Commands

```bash
npm run dev          # Run all apps
npm run dev:web      # Web dashboard only
npm run dev:runner   # Agent runner only
npm run build        # Build all apps
npm run type-check   # Type check
npm run lint         # Lint
```

## Desktop App (AppImage)

- Build the standalone web bundle (update env values as needed):\
  `NEXT_PUBLIC_SUPABASE_URL=http://localhost NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy NEXT_PUBLIC_RUNNER_WS_URL=ws://localhost:3001 NEXTAUTH_SECRET=devsecret NEXTAUTH_URL=http://localhost npm run build:web`
- Package the Electron shell as an AppImage: `npm run package:appimage` (output lands in `apps/desktop/dist/SuperMaestro-<version>-<arch>.AppImage`).
- Dev loop: run `npm run dev:web` for the Next.js server, then `npm run dev:desktop` to open the Electron shell against `http://localhost:3000` (override with `DEV_SERVER_URL` if needed).
- Security defaults: renderer sandbox + `contextIsolation`, Node integration disabled, single-instance lock, navigation/new windows blocked to external browsers, CSP and hardened headers applied to every response, all permissions denied by default, content protection enabled, and the bundled Next.js server bound to `127.0.0.1` only.

## Apps

### Web Dashboard (apps/web)

Next.js 14 application with retro gaming UI:
- Agent management with power-up badges
- Playbook creation as game worlds/levels
- Maestro Kart benchmarking mode
- Achievement system
- 4 switchable themes

### Agent Runner (apps/runner)

Bun-based local service:
- tmux session management
- WebSocket terminal streaming
- Playbook task execution
- Status reporting to dashboard

## Packages

### Shared (packages/shared)

Common TypeScript types and utilities:
- Agent, Session, Playbook interfaces
- Game mechanics types (PowerUp, Achievement, Track, KartRace)
- Message types for real-time communication
- Constants and configuration

## Synthesis Libraries

### @agentforge/cozo

Persistent agent memory using CozoDB:

```typescript
import { AgentDatabase, ConversationStore, CodeGraphStore } from '@agentforge/cozo';

const db = new AgentDatabase({ agentId: 'agent-123', baseDir: '~/.agentforge/agents' });
await db.open();

const conversations = new ConversationStore(db);
await conversations.addMessage({ role: 'user', content: 'Hello!', ... });
```

### @agentforge/mesh

Peer mesh network for distributed agents:

```typescript
import { MeshNode, AgentMessenger } from '@agentforge/mesh';

const node = new MeshNode({ port: 23001 });
await node.start();
node.registerAgent('agent-123');

const messenger = new AgentMessenger(node);
await messenger.send('agent-123', 'agent-456', 'Task completed!', { priority: 'high' });
```

## Branding

- **Color Palette**: Red (#E53E3E), Gold (#ECC94B), Blue (#3B82F6), Green (#48BB78)
- **Typography**: Press Start 2P (headers), Inter (body)
- **Zero IP risk**: All original assets, no franchise references

## License

AGPL-3.0
