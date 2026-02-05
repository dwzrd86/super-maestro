import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock cozo-node before importing database module
vi.mock('cozo-node', () => {
  return {
    CozoDb: vi.fn().mockImplementation(function (this: any) {
      this.run = vi.fn().mockResolvedValue({ ok: true, rows: [], headers: [] });
      this.close = vi.fn();
    }),
  };
});

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    mkdirSync: vi.fn(),
  };
});

vi.mock('../schema', () => ({
  initializeSchema: vi.fn().mockResolvedValue(undefined),
}));

import { AgentDatabase } from '../database';
import { CozoDb } from 'cozo-node';
import * as fs from 'fs';
import { initializeSchema } from '../schema';

describe('lib/cozo AgentDatabase', () => {
  const defaultOptions = {
    agentId: 'test-agent-001',
    baseDir: '/tmp/agentforge-test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('stores the agent ID', () => {
      const db = new AgentDatabase(defaultOptions);
      expect(db.getAgentId()).toBe('test-agent-001');
    });

    it('constructs database path from baseDir and agentId', () => {
      const db = new AgentDatabase(defaultOptions);
      expect(db.getPath()).toBe('/tmp/agentforge-test/test-agent-001/memory.db');
    });

    it('creates agent directory by default', () => {
      new AgentDatabase(defaultOptions);
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        '/tmp/agentforge-test/test-agent-001',
        { recursive: true },
      );
    });

    it('creates agent directory when createIfMissing is true', () => {
      new AgentDatabase({ ...defaultOptions, createIfMissing: true });
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
    });

    it('skips directory creation when createIfMissing is false', () => {
      new AgentDatabase({ ...defaultOptions, createIfMissing: false });
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('open()', () => {
    it('creates a CozoDb instance with sqlite engine', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();
      expect(CozoDb).toHaveBeenCalledWith('sqlite', db.getPath());
    });

    it('calls initializeSchema on first open', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();
      expect(initializeSchema).toHaveBeenCalledTimes(1);
    });

    it('does not re-open if already open', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();
      await db.open();
      expect(CozoDb).toHaveBeenCalledTimes(1);
    });
  });

  describe('close()', () => {
    it('closes the database connection', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();
      const inner = db.getDb();
      await db.close();
      expect(inner.close).toHaveBeenCalled();
    });

    it('is safe to call when not open', async () => {
      const db = new AgentDatabase(defaultOptions);
      await expect(db.close()).resolves.not.toThrow();
    });
  });

  describe('query()', () => {
    it('throws when database is not open', async () => {
      const db = new AgentDatabase(defaultOptions);
      await expect(db.query('?[] <- [[1]]')).rejects.toThrow('Database not open');
    });

    it('executes query and returns results as objects', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();

      const inner = db.getDb();
      (inner.run as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        headers: ['name', 'value'],
        rows: [['alpha', 1], ['beta', 2]],
      });

      const result = await db.query('?[name, value] <- [["alpha", 1], ["beta", 2]]');
      expect(result).toEqual([
        { name: 'alpha', value: 1 },
        { name: 'beta', value: 2 },
      ]);
    });

    it('throws on failed query', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();

      const inner = db.getDb();
      (inner.run as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        message: 'syntax error',
      });

      await expect(db.query('bad query')).rejects.toThrow('CozoDB query failed');
    });

    it('passes params to the underlying run call', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();

      const inner = db.getDb();
      await db.query('?[x] <- [[$val]]', { val: 42 });
      expect(inner.run).toHaveBeenCalledWith('?[x] <- [[$val]]', { val: 42 });
    });
  });

  describe('mutate()', () => {
    it('throws when database is not open', async () => {
      const db = new AgentDatabase(defaultOptions);
      await expect(db.mutate(':create t {x}')).rejects.toThrow('Database not open');
    });

    it('executes mutation successfully', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();
      await expect(db.mutate(':create t {x}')).resolves.not.toThrow();
    });

    it('throws on failed mutation', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();

      const inner = db.getDb();
      (inner.run as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        message: 'relation already exists',
      });

      await expect(db.mutate(':create t {x}')).rejects.toThrow('CozoDB mutation failed');
    });
  });

  describe('getDb()', () => {
    it('throws when database is not open', () => {
      const db = new AgentDatabase(defaultOptions);
      expect(() => db.getDb()).toThrow('Database not open');
    });

    it('returns the CozoDb instance when open', async () => {
      const db = new AgentDatabase(defaultOptions);
      await db.open();
      const inner = db.getDb();
      expect(inner).toBeDefined();
      expect(inner.run).toBeDefined();
    });
  });

  describe('getAgentId()', () => {
    it('returns the configured agent ID', () => {
      const db = new AgentDatabase({ ...defaultOptions, agentId: 'custom-agent' });
      expect(db.getAgentId()).toBe('custom-agent');
    });
  });

  describe('getPath()', () => {
    it('returns the full database file path', () => {
      const db = new AgentDatabase({
        agentId: 'my-agent',
        baseDir: '/data/agents',
      });
      expect(db.getPath()).toBe('/data/agents/my-agent/memory.db');
    });
  });
});
