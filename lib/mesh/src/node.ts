/**
 * MeshNode
 *
 * Represents a node in the peer mesh network.
 * Each node:
 * - Listens for incoming connections
 * - Connects to known peers
 * - Routes messages through the mesh
 * - Manages local agents
 */

import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';
import { MeshMessage, type MeshMessageType } from './message';
import { PeerRegistry, type PeerInfo } from './peer-registry';

export interface MeshNodeOptions {
  /** Unique node identifier */
  nodeId?: string;

  /** Host to bind to */
  host?: string;

  /** Port to listen on */
  port?: number;

  /** Initial peers to connect to */
  bootstrapPeers?: Array<{ host: string; port: number }>;

  /** Heartbeat interval in ms */
  heartbeatInterval?: number;

  /** Connection timeout in ms */
  connectionTimeout?: number;
}

export interface MeshNodeInfo {
  nodeId: string;
  host: string;
  port: number;
  agents: string[];
}

type MessageHandler = (message: MeshMessage, source: string) => void | Promise<void>;

export class MeshNode extends EventEmitter {
  readonly nodeId: string;
  private readonly host: string;
  private readonly port: number;
  private server: WebSocketServer | null = null;
  private connections: Map<string, WebSocket> = new Map();
  private readonly registry: PeerRegistry;
  private localAgents: Set<string> = new Set();
  private messageHandlers: Map<MeshMessageType, MessageHandler[]> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readonly options: Required<Omit<MeshNodeOptions, 'bootstrapPeers'>> & {
    bootstrapPeers: Array<{ host: string; port: number }>;
  };

  constructor(options: MeshNodeOptions = {}) {
    super();

    this.options = {
      nodeId: options.nodeId ?? uuid(),
      host: options.host ?? '0.0.0.0',
      port: options.port ?? 23001,
      bootstrapPeers: options.bootstrapPeers ?? [],
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      connectionTimeout: options.connectionTimeout ?? 10000,
    };

    this.nodeId = this.options.nodeId;
    this.host = this.options.host;
    this.port = this.options.port;

    this.registry = new PeerRegistry();

    // Set up default message handlers
    this.setupDefaultHandlers();
  }

  /**
   * Start the mesh node.
   */
  async start(): Promise<void> {
    // Start WebSocket server
    this.server = new WebSocketServer({ host: this.host, port: this.port });

    this.server.on('connection', (ws, req) => {
      const remoteAddr = req.socket.remoteAddress ?? 'unknown';
      console.log(`[mesh] Incoming connection from ${remoteAddr}`);
      this.handleConnection(ws, 'incoming');
    });

    this.server.on('error', (error) => {
      console.error('[mesh] Server error:', error);
      this.emit('error', error);
    });

    // Connect to bootstrap peers
    for (const peer of this.options.bootstrapPeers) {
      await this.connectToPeer(peer.host, peer.port).catch((err) => {
        console.warn(`[mesh] Failed to connect to bootstrap peer ${peer.host}:${peer.port}:`, err.message);
      });
    }

    // Start heartbeat
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeats();
      this.registry.pruneStale();
    }, this.options.heartbeatInterval);

    console.log(`[mesh] Node ${this.nodeId} listening on ${this.host}:${this.port}`);
    this.emit('started');
  }

  /**
   * Stop the mesh node.
   */
  async stop(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Close all connections
    for (const [nodeId, ws] of this.connections) {
      ws.close();
      this.connections.delete(nodeId);
    }

    // Close server
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    console.log(`[mesh] Node ${this.nodeId} stopped`);
    this.emit('stopped');
  }

  /**
   * Connect to a peer node.
   */
  async connectToPeer(host: string, port: number): Promise<void> {
    const url = `ws://${host}:${port}`;

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error(`Connection timeout to ${url}`));
      }, this.options.connectionTimeout);

      ws.on('open', () => {
        clearTimeout(timeout);
        this.handleConnection(ws, 'outgoing');

        // Send announce message
        const announce = new MeshMessage({
          type: 'announce',
          payload: {
            nodeId: this.nodeId,
            host: this.host,
            port: this.port,
            agents: Array.from(this.localAgents),
          },
          sourceNodeId: this.nodeId,
        });
        ws.send(announce.serialize());

        resolve();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Register a local agent.
   */
  registerAgent(agentId: string): void {
    this.localAgents.add(agentId);
    this.broadcastAgentUpdate();
  }

  /**
   * Unregister a local agent.
   */
  unregisterAgent(agentId: string): void {
    this.localAgents.delete(agentId);
    this.broadcastAgentUpdate();
  }

  /**
   * Send a message to a specific peer.
   */
  send(targetNodeId: string, message: MeshMessage): boolean {
    const ws = this.connections.get(targetNodeId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    ws.send(message.serialize());
    return true;
  }

  /**
   * Broadcast a message to all connected peers.
   */
  broadcast(message: MeshMessage): void {
    for (const [nodeId, ws] of this.connections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message.serialize());
      }
    }
  }

  /**
   * Register a handler for a message type.
   */
  on<T extends MeshMessageType>(
    type: T,
    handler: (message: MeshMessage<T>, source: string) => void | Promise<void>
  ): this {
    const handlers = this.messageHandlers.get(type) ?? [];
    handlers.push(handler as MessageHandler);
    this.messageHandlers.set(type, handlers);
    return this;
  }

  /**
   * Get peer registry.
   */
  getPeerRegistry(): PeerRegistry {
    return this.registry;
  }

  /**
   * Get local agents.
   */
  getLocalAgents(): string[] {
    return Array.from(this.localAgents);
  }

  /**
   * Get node info.
   */
  getInfo(): MeshNodeInfo {
    return {
      nodeId: this.nodeId,
      host: this.host,
      port: this.port,
      agents: this.getLocalAgents(),
    };
  }

  private handleConnection(ws: WebSocket, direction: 'incoming' | 'outgoing'): void {
    let peerNodeId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = MeshMessage.deserialize(data.toString());
        peerNodeId = message.sourceNodeId;

        // Track connection
        if (!this.connections.has(peerNodeId)) {
          this.connections.set(peerNodeId, ws);
        }

        // Handle message
        await this.handleMessage(message);
      } catch (error) {
        console.error('[mesh] Failed to handle message:', error);
      }
    });

    ws.on('close', () => {
      if (peerNodeId) {
        this.connections.delete(peerNodeId);
        this.registry.disconnect(peerNodeId);
        console.log(`[mesh] Peer ${peerNodeId} disconnected`);
        this.emit('peer:disconnected', peerNodeId);
      }
    });

    ws.on('error', (error) => {
      console.error('[mesh] Connection error:', error);
    });
  }

  private async handleMessage(message: MeshMessage): Promise<void> {
    // Get registered handlers
    const handlers = this.messageHandlers.get(message.type) ?? [];

    for (const handler of handlers) {
      try {
        await handler(message, message.sourceNodeId);
      } catch (error) {
        console.error(`[mesh] Handler error for ${message.type}:`, error);
      }
    }

    // Emit event for external listeners
    this.emit('message', message);
    this.emit(`message:${message.type}`, message);
  }

  private setupDefaultHandlers(): void {
    // Handle announce messages
    this.on('announce', (message) => {
      const { nodeId, host, port, agents } = message.payload;
      this.registry.register({ nodeId, host, port, agents });
      console.log(`[mesh] Peer announced: ${nodeId} with ${agents.length} agents`);
      this.emit('peer:connected', this.registry.get(nodeId));
    });

    // Handle heartbeat messages
    this.on('heartbeat', (message) => {
      this.registry.heartbeat(message.sourceNodeId);
    });

    // Handle agent list requests
    this.on('agent:list', (message) => {
      const response = new MeshMessage({
        type: 'announce',
        payload: {
          nodeId: this.nodeId,
          host: this.host,
          port: this.port,
          agents: Array.from(this.localAgents),
        },
        sourceNodeId: this.nodeId,
        targetNodeId: message.sourceNodeId,
      });
      this.send(message.sourceNodeId, response);
    });
  }

  private sendHeartbeats(): void {
    const heartbeat = new MeshMessage({
      type: 'heartbeat',
      payload: { nodeId: this.nodeId, timestamp: Date.now() },
      sourceNodeId: this.nodeId,
    });
    this.broadcast(heartbeat);
  }

  private broadcastAgentUpdate(): void {
    const announce = new MeshMessage({
      type: 'announce',
      payload: {
        nodeId: this.nodeId,
        host: this.host,
        port: this.port,
        agents: Array.from(this.localAgents),
      },
      sourceNodeId: this.nodeId,
    });
    this.broadcast(announce);
  }
}
