# AgentForge

> **Unified AI Agent Orchestrator** — Desktop-native with persistent intelligence and distributed execution.

A synthesis of [pedramamini/Maestro](https://github.com/pedramamini/Maestro) and [23blocks-OS/ai-maestro](https://github.com/23blocks-OS/ai-maestro), combining the best of both worlds: keyboard-first desktop UX with persistent CozoDB memory, peer mesh distribution, and intelligent agent orchestration.

## Architecture

```
agentforge/
├── apps/
│   ├── web/          # Next.js 14 dashboard (App Router)
│   └── runner/       # Bun local agent runner with tmux integration
├── lib/
│   ├── cozo/         # CozoDB integration - persistent agent memory
│   └── mesh/         # Peer mesh network - distributed orchestration
├── packages/
│   └── shared/       # Shared TypeScript types and utilities
├── supabase/         # Database migrations and configuration
└── turbo.json        # Turborepo build configuration
```

## Synthesis Features

| Layer | Source | Feature |
|-------|--------|---------|
| **Intelligence** | ai-maestro | CozoDB memory, Code Graph, semantic search |
| **Distribution** | ai-maestro | Peer mesh network, portable agents |
| **Automation** | Maestro | Playbooks, Auto Run, 24-hour sessions |
| **Communication** | Both | Agent-to-agent messaging, Group Chat |

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
# Run all apps in development mode
npm run dev

# Run only the web dashboard
npm run dev:web

# Run only the agent runner
npm run dev:runner

# Build all apps
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Apps

### Web Dashboard (apps/web)

Next.js 14 application providing:
- Agent management and monitoring
- Playbook creation and execution
- Real-time session viewing
- Team and settings management

### Agent Runner (apps/runner)

Bun-based local service that:
- Discovers and manages tmux sessions
- Streams terminal output via WebSocket
- Executes playbook tasks
- Reports status to the web dashboard

## Packages

### Shared (packages/shared)

Common TypeScript types and utilities:
- Agent, AgentSession interfaces
- Playbook, PlaybookTask interfaces
- Message types for real-time communication
- User and Team models

## Database

The Supabase schema includes:
- Users and teams
- Agents and sessions
- Playbooks and tasks
- Messages and audit logs

See `supabase/migrations/` for the complete schema.

## Synthesis Libraries

### @agentforge/cozo

Persistent agent memory using CozoDB:

```typescript
import { AgentDatabase, ConversationStore, CodeGraphStore } from '@agentforge/cozo';

// Each agent gets its own database
const db = new AgentDatabase({ agentId: 'agent-123', baseDir: '~/.agentforge/agents' });
await db.open();

// Store conversations
const conversations = new ConversationStore(db);
await conversations.addMessage({ role: 'user', content: 'Hello!', ... });

// Build code understanding
const codeGraph = new CodeGraphStore(db);
await codeGraph.upsertNode({ path: 'src/index.ts', kind: 'file', ... });
```

### @agentforge/mesh

Peer mesh network for distributed agents:

```typescript
import { MeshNode, AgentMessenger } from '@agentforge/mesh';

// Start a mesh node
const node = new MeshNode({ port: 23001 });
await node.start();

// Register local agents
node.registerAgent('agent-123');

// Send agent-to-agent messages
const messenger = new AgentMessenger(node);
await messenger.send('agent-123', 'agent-456', 'Task completed!', { priority: 'high' });
```

## License

AGPL-3.0
