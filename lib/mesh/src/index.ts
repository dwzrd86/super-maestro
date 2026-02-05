/**
 * @agentforge/mesh
 *
 * Peer mesh network for distributed agent orchestration.
 * Enables:
 * - Decentralized node discovery
 * - Agent-to-agent messaging across machines
 * - Distributed task execution
 * - Agent export/import between nodes
 */

export { MeshNode, type MeshNodeOptions, type MeshNodeInfo } from './node';
export { MeshMessage, type MeshMessageType, type MeshMessagePayload } from './message';
export { PeerRegistry, type PeerInfo, type PeerStatus } from './peer-registry';
export { AgentMessenger, type AgentMessage, type MessagePriority } from './agent-messenger';
