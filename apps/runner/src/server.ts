/**
 * WebSocket server for terminal streaming and agent communication.
 *
 * Handles:
 * - Connection management
 * - Session subscriptions
 * - Terminal I/O streaming
 * - Heartbeat/keepalive
 */

import type { ServerWebSocket } from 'bun';
import type { TmuxManager } from './tmux';
import type { WsMessage, WsMessageType } from '@agentforge/shared';

interface WebSocketData {
  id: string;
  subscribedSessions: Set<string>;
}

interface ServerOptions {
  port: number;
  host: string;
  tmuxManager: TmuxManager;
}

export class WebSocketServer {
  private server: ReturnType<typeof Bun.serve> | null = null;
  private clients: Map<string, ServerWebSocket<WebSocketData>> = new Map();
  private options: ServerOptions;

  constructor(options: ServerOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    const { port, host, tmuxManager } = this.options;

    this.server = Bun.serve({
      port,
      hostname: host,

      fetch(req, server) {
        // Upgrade HTTP request to WebSocket
        const url = new URL(req.url);

        if (url.pathname === '/ws') {
          const upgraded = server.upgrade(req, {
            data: {
              id: crypto.randomUUID(),
              subscribedSessions: new Set<string>(),
            },
          });

          if (!upgraded) {
            return new Response('WebSocket upgrade failed', { status: 400 });
          }

          return undefined;
        }

        // Health check endpoint
        if (url.pathname === '/health') {
          return Response.json({ status: 'ok', version: '0.1.0' });
        }

        // List sessions endpoint
        if (url.pathname === '/sessions') {
          return (async () => {
            const sessions = await tmuxManager.listSessions();
            return Response.json({ sessions });
          })();
        }

        return new Response('Not Found', { status: 404 });
      },

      websocket: {
        open: (ws: ServerWebSocket<WebSocketData>) => {
          console.log(`[ws] Client connected: ${ws.data.id}`);
          this.clients.set(ws.data.id, ws);

          // Send welcome message
          this.send(ws, {
            id: crypto.randomUUID(),
            type: 'connect',
            payload: { clientId: ws.data.id },
            timestamp: new Date(),
          });
        },

        message: async (
          ws: ServerWebSocket<WebSocketData>,
          message: string | Buffer
        ) => {
          try {
            const data = JSON.parse(
              typeof message === 'string' ? message : message.toString()
            ) as WsMessage;

            await this.handleMessage(ws, data);
          } catch (error) {
            console.error('[ws] Failed to parse message:', error);
            this.send(ws, {
              id: crypto.randomUUID(),
              type: 'error',
              payload: { code: 'PARSE_ERROR', message: 'Invalid message format' },
              timestamp: new Date(),
            });
          }
        },

        close: (ws: ServerWebSocket<WebSocketData>) => {
          console.log(`[ws] Client disconnected: ${ws.data.id}`);
          this.clients.delete(ws.data.id);
        },
      },
    });

    // Start heartbeat interval
    this.startHeartbeat();
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.stop();
      this.server = null;
    }
    this.clients.clear();
  }

  private async handleMessage(
    ws: ServerWebSocket<WebSocketData>,
    message: WsMessage
  ): Promise<void> {
    const { tmuxManager } = this.options;

    switch (message.type as WsMessageType) {
      case 'ping':
        this.send(ws, {
          id: crypto.randomUUID(),
          type: 'pong',
          payload: {},
          timestamp: new Date(),
        });
        break;

      case 'session:join':
        const joinPayload = message.payload as { sessionId: string };
        ws.data.subscribedSessions.add(joinPayload.sessionId);
        console.log(`[ws] Client ${ws.data.id} joined session ${joinPayload.sessionId}`);
        break;

      case 'session:leave':
        const leavePayload = message.payload as { sessionId: string };
        ws.data.subscribedSessions.delete(leavePayload.sessionId);
        console.log(`[ws] Client ${ws.data.id} left session ${leavePayload.sessionId}`);
        break;

      case 'session:create':
        const createPayload = message.payload as { name?: string };
        const session = await tmuxManager.createSession(createPayload.name);
        this.send(ws, {
          id: crypto.randomUUID(),
          type: 'session:create',
          payload: { session },
          timestamp: new Date(),
        });
        break;

      case 'terminal:input':
        const inputPayload = message.payload as {
          sessionId: string;
          data: string;
        };
        await tmuxManager.sendInput(inputPayload.sessionId, inputPayload.data);
        break;

      case 'terminal:resize':
        const resizePayload = message.payload as {
          sessionId: string;
          cols: number;
          rows: number;
        };
        // tmux resize is handled per-client, not needed for now
        console.log(
          `[ws] Resize request for ${resizePayload.sessionId}: ${resizePayload.cols}x${resizePayload.rows}`
        );
        break;

      default:
        console.log(`[ws] Unknown message type: ${message.type}`);
    }
  }

  private send(ws: ServerWebSocket<WebSocketData>, message: WsMessage): void {
    ws.send(JSON.stringify(message));
  }

  private broadcast(sessionId: string, message: WsMessage): void {
    for (const [, client] of this.clients) {
      if (client.data.subscribedSessions.has(sessionId)) {
        this.send(client, message);
      }
    }
  }

  private startHeartbeat(): void {
    setInterval(() => {
      const now = new Date();
      for (const [, client] of this.clients) {
        this.send(client, {
          id: crypto.randomUUID(),
          type: 'ping',
          payload: {},
          timestamp: now,
        });
      }
    }, 30000); // 30 seconds
  }

  /**
   * Broadcast terminal output to subscribed clients.
   */
  broadcastTerminalOutput(sessionId: string, data: string): void {
    this.broadcast(sessionId, {
      id: crypto.randomUUID(),
      type: 'terminal:output',
      payload: { sessionId, data, timestamp: new Date() },
      timestamp: new Date(),
    });
  }
}
