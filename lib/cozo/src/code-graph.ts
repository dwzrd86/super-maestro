/**
 * CodeGraphStore
 *
 * Manages the code graph for understanding codebase structure:
 * - AST-level nodes (files, functions, classes, variables)
 * - Relationships (imports, calls, extends, implements)
 * - Multi-language support via ts-morph
 */

import type { AgentDatabase } from './database';
import { v4 as uuid } from 'uuid';

export type CodeNodeKind =
  | 'file'
  | 'function'
  | 'class'
  | 'interface'
  | 'type'
  | 'variable'
  | 'method'
  | 'property'
  | 'import'
  | 'export';

export type CodeRelationType =
  | 'imports'
  | 'exports'
  | 'calls'
  | 'extends'
  | 'implements'
  | 'contains'
  | 'references'
  | 'depends_on';

export interface CodeNode {
  id: string;
  path: string;
  name: string;
  kind: CodeNodeKind;
  language: string;
  startLine: number;
  endLine: number;
  contentHash: string;
  metadata: Record<string, unknown>;
}

export interface CodeRelation {
  sourceId: string;
  targetId: string;
  relation: CodeRelationType;
  metadata: Record<string, unknown>;
}

export class CodeGraphStore {
  constructor(private readonly db: AgentDatabase) {}

  /**
   * Add or update a code node.
   */
  async upsertNode(node: Omit<CodeNode, 'id'> & { id?: string }): Promise<CodeNode> {
    const id = node.id ?? uuid();

    await this.db.mutate(`
      ?[id, path, name, kind, language, start_line, end_line, content_hash, metadata] <- [[
        $id, $path, $name, $kind, $language, $start_line, $end_line, $content_hash, $metadata
      ]]
      :put code_nodes {
        id =>
        path,
        name,
        kind,
        language,
        start_line,
        end_line,
        content_hash,
        metadata
      }
    `, {
      id,
      path: node.path,
      name: node.name,
      kind: node.kind,
      language: node.language,
      start_line: node.startLine,
      end_line: node.endLine,
      content_hash: node.contentHash,
      metadata: JSON.stringify(node.metadata),
    });

    return { id, ...node };
  }

  /**
   * Add a relation between nodes.
   */
  async addRelation(relation: CodeRelation): Promise<void> {
    await this.db.mutate(`
      ?[source_id, target_id, relation, metadata] <- [[
        $source_id, $target_id, $relation, $metadata
      ]]
      :put code_edges { source_id, target_id, relation => metadata }
    `, {
      source_id: relation.sourceId,
      target_id: relation.targetId,
      relation: relation.relation,
      metadata: JSON.stringify(relation.metadata),
    });
  }

  /**
   * Get a node by ID.
   */
  async getNode(id: string): Promise<CodeNode | null> {
    const results = await this.db.query<{
      id: string;
      path: string;
      name: string;
      kind: string;
      language: string;
      start_line: number;
      end_line: number;
      content_hash: string;
      metadata: string;
    }>(`
      ?[id, path, name, kind, language, start_line, end_line, content_hash, metadata] :=
        *code_nodes{ id: $id, path, name, kind, language, start_line, end_line, content_hash, metadata }
    `, { id });

    if (results.length === 0) return null;

    const row = results[0];
    return {
      id: row.id,
      path: row.path,
      name: row.name,
      kind: row.kind as CodeNodeKind,
      language: row.language,
      startLine: row.start_line,
      endLine: row.end_line,
      contentHash: row.content_hash,
      metadata: JSON.parse(row.metadata),
    };
  }

  /**
   * Find nodes by path pattern.
   */
  async findNodesByPath(pathPattern: string): Promise<CodeNode[]> {
    const results = await this.db.query<{
      id: string;
      path: string;
      name: string;
      kind: string;
      language: string;
      start_line: number;
      end_line: number;
      content_hash: string;
      metadata: string;
    }>(`
      ?[id, path, name, kind, language, start_line, end_line, content_hash, metadata] :=
        *code_nodes{ id, path, name, kind, language, start_line, end_line, content_hash, metadata },
        starts_with(path, $pattern)
      :order path
    `, { pattern: pathPattern });

    return results.map((row) => ({
      id: row.id,
      path: row.path,
      name: row.name,
      kind: row.kind as CodeNodeKind,
      language: row.language,
      startLine: row.start_line,
      endLine: row.end_line,
      contentHash: row.content_hash,
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Find nodes by kind.
   */
  async findNodesByKind(kind: CodeNodeKind, limit = 100): Promise<CodeNode[]> {
    const results = await this.db.query<{
      id: string;
      path: string;
      name: string;
      kind: string;
      language: string;
      start_line: number;
      end_line: number;
      content_hash: string;
      metadata: string;
    }>(`
      ?[id, path, name, kind, language, start_line, end_line, content_hash, metadata] :=
        *code_nodes{ id, path, name, kind: $kind, language, start_line, end_line, content_hash, metadata }
      :order name
      :limit ${limit}
    `, { kind });

    return results.map((row) => ({
      id: row.id,
      path: row.path,
      name: row.name,
      kind: row.kind as CodeNodeKind,
      language: row.language,
      startLine: row.start_line,
      endLine: row.end_line,
      contentHash: row.content_hash,
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Get outgoing relations from a node.
   */
  async getOutgoingRelations(nodeId: string): Promise<Array<CodeRelation & { target: CodeNode }>> {
    const results = await this.db.query<{
      source_id: string;
      target_id: string;
      relation: string;
      edge_metadata: string;
      id: string;
      path: string;
      name: string;
      kind: string;
      language: string;
      start_line: number;
      end_line: number;
      content_hash: string;
      node_metadata: string;
    }>(`
      ?[source_id, target_id, relation, edge_metadata, id, path, name, kind, language, start_line, end_line, content_hash, node_metadata] :=
        *code_edges{ source_id: $node_id, target_id, relation, metadata: edge_metadata },
        *code_nodes{ id: target_id, path, name, kind, language, start_line, end_line, content_hash, metadata: node_metadata }
    `, { node_id: nodeId });

    return results.map((row) => ({
      sourceId: row.source_id,
      targetId: row.target_id,
      relation: row.relation as CodeRelationType,
      metadata: JSON.parse(row.edge_metadata),
      target: {
        id: row.id,
        path: row.path,
        name: row.name,
        kind: row.kind as CodeNodeKind,
        language: row.language,
        startLine: row.start_line,
        endLine: row.end_line,
        contentHash: row.content_hash,
        metadata: JSON.parse(row.node_metadata),
      },
    }));
  }

  /**
   * Get incoming relations to a node.
   */
  async getIncomingRelations(nodeId: string): Promise<Array<CodeRelation & { source: CodeNode }>> {
    const results = await this.db.query<{
      source_id: string;
      target_id: string;
      relation: string;
      edge_metadata: string;
      id: string;
      path: string;
      name: string;
      kind: string;
      language: string;
      start_line: number;
      end_line: number;
      content_hash: string;
      node_metadata: string;
    }>(`
      ?[source_id, target_id, relation, edge_metadata, id, path, name, kind, language, start_line, end_line, content_hash, node_metadata] :=
        *code_edges{ source_id, target_id: $node_id, relation, metadata: edge_metadata },
        *code_nodes{ id: source_id, path, name, kind, language, start_line, end_line, content_hash, metadata: node_metadata }
    `, { node_id: nodeId });

    return results.map((row) => ({
      sourceId: row.source_id,
      targetId: row.target_id,
      relation: row.relation as CodeRelationType,
      metadata: JSON.parse(row.edge_metadata),
      source: {
        id: row.id,
        path: row.path,
        name: row.name,
        kind: row.kind as CodeNodeKind,
        language: row.language,
        startLine: row.start_line,
        endLine: row.end_line,
        contentHash: row.content_hash,
        metadata: JSON.parse(row.node_metadata),
      },
    }));
  }

  /**
   * Delete all nodes for a file path (for re-indexing).
   */
  async deleteNodesByPath(path: string): Promise<void> {
    // Get node IDs first
    const nodes = await this.db.query<{ id: string }>(`
      ?[id] := *code_nodes{ id, path: $path }
    `, { path });

    const nodeIds = nodes.map((n) => n.id);

    if (nodeIds.length === 0) return;

    // Delete edges
    await this.db.mutate(`
      ?[source_id, target_id, relation] :=
        *code_edges{ source_id, target_id, relation },
        source_id in $node_ids or target_id in $node_ids
      :delete code_edges { source_id, target_id, relation }
    `, { node_ids: nodeIds });

    // Delete nodes
    await this.db.mutate(`
      ?[id] := *code_nodes{ id, path: $path }
      :delete code_nodes { id }
    `, { path });
  }

  /**
   * Get statistics about the code graph.
   */
  async getStats(): Promise<{
    totalNodes: number;
    totalEdges: number;
    nodesByKind: Record<string, number>;
    edgesByType: Record<string, number>;
  }> {
    const nodeStats = await this.db.query<{ kind: string; count: number }>(`
      ?[kind, count(id)] := *code_nodes{ id, kind }
    `);

    const edgeStats = await this.db.query<{ relation: string; count: number }>(`
      ?[relation, count(source_id)] := *code_edges{ source_id, relation }
    `);

    const nodesByKind: Record<string, number> = {};
    let totalNodes = 0;
    for (const { kind, count } of nodeStats) {
      nodesByKind[kind] = count;
      totalNodes += count;
    }

    const edgesByType: Record<string, number> = {};
    let totalEdges = 0;
    for (const { relation, count } of edgeStats) {
      edgesByType[relation] = count;
      totalEdges += count;
    }

    return { totalNodes, totalEdges, nodesByKind, edgesByType };
  }
}
