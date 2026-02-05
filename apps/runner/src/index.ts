#!/usr/bin/env bun
/**
 * AgentForge Runner - Local agent execution service
 *
 * This service runs on the local machine and:
 * - Discovers and manages tmux sessions
 * - Streams terminal output to the web dashboard via WebSocket
 * - Executes playbook tasks
 * - Reports status to the web dashboard
 */

import { WebSocketServer } from './server';
import { TmuxManager } from './tmux';
import { parseArgs } from './cli';

const VERSION = '0.1.0';

async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(`
AgentForge Runner v${VERSION}

Usage: agentforge-runner [options]

Options:
  -p, --port <port>     WebSocket server port (default: 3001)
  -h, --host <host>     WebSocket server host (default: 0.0.0.0)
  --api-url <url>       AgentForge API URL (default: http://localhost:3000)
  --help                Show this help message
  --version             Show version number
`);
    process.exit(0);
  }

  if (args.version) {
    console.log(`AgentForge Runner v${VERSION}`);
    process.exit(0);
  }

  console.log(`
  ╔═══════════════════════════════════════╗
  ║         AgentForge Runner             ║
  ║              v${VERSION}                   ║
  ╚═══════════════════════════════════════╝
  `);

  // Initialize tmux manager
  const tmuxManager = new TmuxManager();
  const sessions = await tmuxManager.listSessions();
  console.log(`[tmux] Found ${sessions.length} existing session(s)`);

  // Start WebSocket server
  const server = new WebSocketServer({
    port: args.port,
    host: args.host,
    tmuxManager,
  });

  await server.start();

  console.log(`[server] WebSocket server running at ws://${args.host}:${args.port}`);
  console.log(`[server] Ready to accept connections from AgentForge dashboard`);

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n[server] Shutting down...');
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('[error] Failed to start runner:', error);
  process.exit(1);
});
