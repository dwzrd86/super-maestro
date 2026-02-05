/**
 * CLI argument parsing for the runner.
 */

export interface CliArgs {
  port: number;
  host: string;
  apiUrl: string;
  help: boolean;
  version: boolean;
}

export function parseArgs(): CliArgs {
  const args: CliArgs = {
    port: 3001,
    host: '0.0.0.0',
    apiUrl: 'http://localhost:3000',
    help: false,
    version: false,
  };

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    switch (arg) {
      case '-p':
      case '--port':
        if (nextArg) {
          args.port = parseInt(nextArg, 10);
          i++;
        }
        break;

      case '-h':
      case '--host':
        if (nextArg) {
          args.host = nextArg;
          i++;
        }
        break;

      case '--api-url':
        if (nextArg) {
          args.apiUrl = nextArg;
          i++;
        }
        break;

      case '--help':
        args.help = true;
        break;

      case '--version':
        args.version = true;
        break;
    }
  }

  return args;
}
