/**
 * Runtime loader and minimal type surface for the optional native cozo-node package.
 *
 * The package downloads native binaries during install. Keeping it optional lets CI
 * and UI-only development continue in environments where those binaries are not
 * available, while still failing clearly when Cozo-backed memory is opened.
 */

type CozoRunSuccess = {
  ok: true;
  headers: string[];
  rows: unknown[][];
};

type CozoRunFailure = {
  ok: false;
  [key: string]: unknown;
};

export type CozoRunResult = CozoRunSuccess | CozoRunFailure;

export interface CozoDbLike {
  run(script: string, params?: Record<string, unknown>): Promise<CozoRunResult>;
  close(): void;
}

export type CozoDbConstructor = new (engine: string, path: string) => CozoDbLike;

type CozoNodeModule = {
  CozoDb?: CozoDbConstructor;
};

export function loadCozoDb(): CozoDbConstructor {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cozoNode = require('cozo-node') as CozoNodeModule;

  if (!cozoNode.CozoDb) {
    throw new Error('cozo-node did not export CozoDb');
  }

  return cozoNode.CozoDb;
}
