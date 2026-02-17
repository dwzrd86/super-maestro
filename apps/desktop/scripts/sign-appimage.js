'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const KEY_VALUE_VARS = ['APPIMAGE_SIGNING_KEY', 'LINUX_SIGNING_KEY'];
const KEY_FILE_VARS = ['APPIMAGE_SIGNING_KEY_FILE', 'LINUX_SIGNING_KEY_FILE'];
const KEY_ID_VARS = ['APPIMAGE_SIGNING_KEY_ID', 'LINUX_SIGNING_KEY_ID'];
const KEY_PASSPHRASE_VARS = ['APPIMAGE_SIGNING_KEY_PASSPHRASE', 'LINUX_SIGNING_KEY_PASSPHRASE'];

const log = (message) => console.log(`[sign-appimage] ${message}`);

function firstEnvValue(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function loadSigningKey() {
  const filePath = firstEnvValue(KEY_FILE_VARS);
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Signing key file not found at ${resolvedPath}`);
    }
    return fs.readFileSync(resolvedPath, 'utf8');
  }

  const inline = firstEnvValue(KEY_VALUE_VARS);
  if (!inline) {
    return null;
  }

  if (inline.includes('BEGIN PGP PRIVATE KEY')) {
    return inline;
  }

  try {
    const decoded = Buffer.from(inline, 'base64').toString('utf8');
    if (decoded.trim()) {
      return decoded;
    }
  } catch {
    // Fallback to raw value if base64 decoding fails.
  }

  return inline;
}

function runGpg(args, env, step) {
  const result = spawnSync('gpg', args, {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw new Error(`${step} failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim();
    const stdout = result.stdout?.toString().trim();
    const details = stderr || stdout || `gpg exited with code ${result.status}`;
    throw new Error(`${step} failed: ${details}`);
  }

  return result;
}

module.exports = async function signAppImages(buildResult) {
  const appImages = (buildResult.artifactPaths || []).filter((file) => file.endsWith('.AppImage'));
  if (appImages.length === 0) {
    log('No AppImage artifacts detected; skipping signing.');
    return;
  }

  const signingKey = loadSigningKey();
  if (!signingKey) {
    log('APPIMAGE_SIGNING_KEY(_FILE) not set; AppImages will remain unsigned.');
    return;
  }

  const gpgHome = fs.mkdtempSync(path.join(os.tmpdir(), 'sm-gpg-'));
  const env = { ...process.env, GNUPGHOME: gpgHome };

  try {
    runGpg(['--version'], env, 'Detect gpg');

    const keyFile = path.join(gpgHome, 'appimage-signing-key.asc');
    fs.writeFileSync(keyFile, signingKey, { mode: 0o600 });
    runGpg(['--batch', '--yes', '--import', keyFile], env, 'Import signing key');

    const signer = firstEnvValue(KEY_ID_VARS);
    const passphrase = firstEnvValue(KEY_PASSPHRASE_VARS);
    const signedArtifacts = [];

    for (const artifactPath of appImages) {
      const signaturePath = `${artifactPath}.sig`;
      const args = ['--batch', '--yes', '--output', signaturePath, '--detach-sign'];

      if (passphrase) {
        args.push('--pinentry-mode', 'loopback', '--passphrase', passphrase);
      }

      if (signer) {
        args.push('--default-key', signer);
      }

      args.push(artifactPath);
      runGpg(args, env, `Sign ${path.basename(artifactPath)}`);
      signedArtifacts.push(signaturePath);
    }

    if (signedArtifacts.length > 0) {
      log(`Signed ${signedArtifacts.length} AppImage artifact(s); signatures saved next to the binaries.`);
    }

    return signedArtifacts;
  } finally {
    fs.rmSync(gpgHome, { recursive: true, force: true });
  }
};
