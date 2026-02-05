import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseArgs, type CliArgs } from '../cli';

describe('apps/runner CLI argument parsing', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  function setArgs(...args: string[]) {
    process.argv = ['node', 'cli.ts', ...args];
  }

  describe('defaults', () => {
    it('returns default values when no arguments provided', () => {
      setArgs();
      const result = parseArgs();
      expect(result).toEqual({
        port: 3001,
        host: '0.0.0.0',
        apiUrl: 'http://localhost:3000',
        help: false,
        version: false,
      });
    });

    it('returns a CliArgs object with all expected keys', () => {
      setArgs();
      const result = parseArgs();
      expect(result).toHaveProperty('port');
      expect(result).toHaveProperty('host');
      expect(result).toHaveProperty('apiUrl');
      expect(result).toHaveProperty('help');
      expect(result).toHaveProperty('version');
    });
  });

  describe('--port / -p', () => {
    it('parses --port with a numeric value', () => {
      setArgs('--port', '8080');
      const result = parseArgs();
      expect(result.port).toBe(8080);
    });

    it('parses -p short flag with a numeric value', () => {
      setArgs('-p', '5000');
      const result = parseArgs();
      expect(result.port).toBe(5000);
    });

    it('keeps default port when --port has no following value', () => {
      setArgs('--port');
      const result = parseArgs();
      expect(result.port).toBe(3001);
    });

    it('parses port as integer (parseInt base 10)', () => {
      setArgs('--port', '3000');
      const result = parseArgs();
      expect(result.port).toBe(3000);
      expect(Number.isInteger(result.port)).toBe(true);
    });
  });

  describe('--host / -h', () => {
    it('parses --host with a string value', () => {
      setArgs('--host', '127.0.0.1');
      const result = parseArgs();
      expect(result.host).toBe('127.0.0.1');
    });

    it('parses -h short flag with a string value', () => {
      setArgs('-h', 'localhost');
      const result = parseArgs();
      expect(result.host).toBe('localhost');
    });

    it('keeps default host when --host has no following value', () => {
      setArgs('--host');
      const result = parseArgs();
      expect(result.host).toBe('0.0.0.0');
    });
  });

  describe('--api-url', () => {
    it('parses --api-url with a URL value', () => {
      setArgs('--api-url', 'http://api.example.com:3000');
      const result = parseArgs();
      expect(result.apiUrl).toBe('http://api.example.com:3000');
    });

    it('keeps default apiUrl when --api-url has no following value', () => {
      setArgs('--api-url');
      const result = parseArgs();
      expect(result.apiUrl).toBe('http://localhost:3000');
    });
  });

  describe('--help', () => {
    it('sets help to true when --help is passed', () => {
      setArgs('--help');
      const result = parseArgs();
      expect(result.help).toBe(true);
    });

    it('help is false by default', () => {
      setArgs();
      const result = parseArgs();
      expect(result.help).toBe(false);
    });
  });

  describe('--version', () => {
    it('sets version to true when --version is passed', () => {
      setArgs('--version');
      const result = parseArgs();
      expect(result.version).toBe(true);
    });

    it('version is false by default', () => {
      setArgs();
      const result = parseArgs();
      expect(result.version).toBe(false);
    });
  });

  describe('combined flags', () => {
    it('parses multiple flags together', () => {
      setArgs('--port', '9090', '--host', '192.168.1.1', '--api-url', 'http://remote:4000');
      const result = parseArgs();
      expect(result.port).toBe(9090);
      expect(result.host).toBe('192.168.1.1');
      expect(result.apiUrl).toBe('http://remote:4000');
    });

    it('parses short flags mixed with long flags', () => {
      setArgs('-p', '7777', '-h', '10.0.0.1', '--api-url', 'https://secure.api.com');
      const result = parseArgs();
      expect(result.port).toBe(7777);
      expect(result.host).toBe('10.0.0.1');
      expect(result.apiUrl).toBe('https://secure.api.com');
    });

    it('parses boolean flags alongside value flags', () => {
      setArgs('--port', '4000', '--help', '--version');
      const result = parseArgs();
      expect(result.port).toBe(4000);
      expect(result.help).toBe(true);
      expect(result.version).toBe(true);
    });

    it('handles flags in any order', () => {
      setArgs('--help', '--api-url', 'http://test.com', '-p', '2000', '--version', '-h', '::1');
      const result = parseArgs();
      expect(result.help).toBe(true);
      expect(result.apiUrl).toBe('http://test.com');
      expect(result.port).toBe(2000);
      expect(result.version).toBe(true);
      expect(result.host).toBe('::1');
    });
  });

  describe('unknown arguments', () => {
    it('ignores unrecognized flags', () => {
      setArgs('--unknown', 'value', '--port', '5555');
      const result = parseArgs();
      expect(result.port).toBe(5555);
    });

    it('returns defaults for unrecognized-only input', () => {
      setArgs('--foo', '--bar', 'baz');
      const result = parseArgs();
      expect(result.port).toBe(3001);
      expect(result.host).toBe('0.0.0.0');
      expect(result.apiUrl).toBe('http://localhost:3000');
      expect(result.help).toBe(false);
      expect(result.version).toBe(false);
    });
  });

  describe('return type', () => {
    it('port is always a number', () => {
      setArgs('--port', '3001');
      const result = parseArgs();
      expect(typeof result.port).toBe('number');
    });

    it('host is always a string', () => {
      setArgs('--host', '0.0.0.0');
      const result = parseArgs();
      expect(typeof result.host).toBe('string');
    });

    it('apiUrl is always a string', () => {
      setArgs('--api-url', 'http://localhost:3000');
      const result = parseArgs();
      expect(typeof result.apiUrl).toBe('string');
    });

    it('help is always a boolean', () => {
      setArgs('--help');
      const result = parseArgs();
      expect(typeof result.help).toBe('boolean');
    });

    it('version is always a boolean', () => {
      setArgs('--version');
      const result = parseArgs();
      expect(typeof result.version).toBe('boolean');
    });
  });
});
