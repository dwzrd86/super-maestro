import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SCHEMA_VERSION, initializeSchema } from '../schema';

describe('lib/cozo schema definitions', () => {
  describe('SCHEMA_VERSION', () => {
    it('is a valid semver string', () => {
      expect(SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('is version 1.0.0', () => {
      expect(SCHEMA_VERSION).toBe('1.0.0');
    });
  });

  describe('initializeSchema', () => {
    it('is a function', () => {
      expect(typeof initializeSchema).toBe('function');
    });

    it('returns a Promise', () => {
      const mockDb = {
        run: vi.fn().mockResolvedValue({ ok: true, rows: [['existing']], headers: ['name'] }),
      };
      const result = initializeSchema(mockDb as any);
      expect(result).toBeInstanceOf(Promise);
    });

    it('skips schema creation when relations already exist', async () => {
      const mockDb = {
        run: vi.fn().mockResolvedValue({ ok: true, rows: [['messages']], headers: ['name'] }),
      };

      await initializeSchema(mockDb as any);

      // Should only have been called once (the existence check)
      expect(mockDb.run).toHaveBeenCalledTimes(1);
    });

    describe('schema creation on fresh database', () => {
      let mockDb: { run: ReturnType<typeof vi.fn> };
      let runCalls: string[];

      beforeEach(async () => {
        let callCount = 0;
        mockDb = {
          run: vi.fn().mockImplementation((script: string) => {
            callCount++;
            // First call is the existence check — return empty rows
            if (callCount === 1) {
              return Promise.resolve({ ok: true, rows: [], headers: ['name'] });
            }
            // All other calls succeed
            return Promise.resolve({ ok: true, rows: [], headers: [] });
          }),
        };

        await initializeSchema(mockDb as any);

        runCalls = mockDb.run.mock.calls.map((call: unknown[]) => call[0] as string);
      });

      it('creates the messages relation', () => {
        const hasMessages = runCalls.some(
          (script) => script.includes(':create messages') && script.includes('conversation_id')
        );
        expect(hasMessages).toBe(true);
      });

      it('creates the conversations relation', () => {
        const hasConversations = runCalls.some(
          (script) => script.includes(':create conversations') && script.includes('created_at')
        );
        expect(hasConversations).toBe(true);
      });

      it('creates the memory_entries relation', () => {
        const hasMemory = runCalls.some(
          (script) => script.includes(':create memory_entries') && script.includes('embedding')
        );
        expect(hasMemory).toBe(true);
      });

      it('creates the code_nodes relation', () => {
        const hasCodeNodes = runCalls.some(
          (script) => script.includes(':create code_nodes') && script.includes('kind')
        );
        expect(hasCodeNodes).toBe(true);
      });

      it('creates the code_edges relation', () => {
        const hasCodeEdges = runCalls.some(
          (script) => script.includes(':create code_edges') && script.includes('relation')
        );
        expect(hasCodeEdges).toBe(true);
      });

      it('creates the agent_state relation', () => {
        const hasAgentState = runCalls.some(
          (script) => script.includes(':create agent_state') && script.includes('value')
        );
        expect(hasAgentState).toBe(true);
      });

      it('creates the schema_info relation', () => {
        const hasSchemaInfo = runCalls.some(
          (script) => script.includes(':create schema_info') && script.includes('value')
        );
        expect(hasSchemaInfo).toBe(true);
      });

      it('records the schema version after creation', () => {
        const versionCall = mockDb.run.mock.calls.find(
          (call: unknown[]) =>
            typeof call[0] === 'string' &&
            (call[0] as string).includes(':put schema_info') &&
            call[1] != null
        );
        expect(versionCall).toBeDefined();
        expect((versionCall as unknown[])[1]).toEqual({ version: SCHEMA_VERSION });
      });

      it('creates exactly 7 relations plus the version record', () => {
        // 1 existence check + 7 :create + 1 :put version = 9 total
        expect(mockDb.run).toHaveBeenCalledTimes(9);
      });
    });

    it('throws when a schema creation fails', async () => {
      let callCount = 0;
      const mockDb = {
        run: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ ok: true, rows: [], headers: ['name'] });
          }
          // Fail on second call (first :create)
          return Promise.resolve({ ok: false, message: 'syntax error' });
        }),
      };

      await expect(initializeSchema(mockDb as any)).rejects.toThrow('Failed to create schema');
    });

    it('messages schema includes expected columns', () => {
      // Verify by calling initializeSchema and inspecting the SQL
      let callCount = 0;
      const mockDb = {
        run: vi.fn().mockImplementation((script: string) => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ ok: true, rows: [], headers: ['name'] });
          }
          return Promise.resolve({ ok: true, rows: [], headers: [] });
        }),
      };

      return initializeSchema(mockDb as any).then(() => {
        const messagesCall = mockDb.run.mock.calls.find(
          (call: unknown[]) =>
            typeof call[0] === 'string' && (call[0] as string).includes(':create messages')
        );
        expect(messagesCall).toBeDefined();
        const script = (messagesCall as unknown[])[0] as string;
        expect(script).toContain('id: String');
        expect(script).toContain('conversation_id: String');
        expect(script).toContain('role: String');
        expect(script).toContain('content: String');
        expect(script).toContain('timestamp: Float');
        expect(script).toContain('metadata: String');
      });
    });

    it('memory_entries schema includes 384-dim embedding vector', () => {
      let callCount = 0;
      const mockDb = {
        run: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ ok: true, rows: [], headers: ['name'] });
          }
          return Promise.resolve({ ok: true, rows: [], headers: [] });
        }),
      };

      return initializeSchema(mockDb as any).then(() => {
        const memCall = mockDb.run.mock.calls.find(
          (call: unknown[]) =>
            typeof call[0] === 'string' && (call[0] as string).includes(':create memory_entries')
        );
        expect(memCall).toBeDefined();
        const script = (memCall as unknown[])[0] as string;
        expect(script).toContain('[Float; 384]');
      });
    });
  });
});
