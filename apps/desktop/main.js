'use strict';

const { app, BrowserWindow, dialog, session, shell } = require('electron');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const waitOn = require('wait-on');
const { autoUpdater } = require('electron-updater');

app.enableSandbox();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow;
let nextServerProcess;
let runnerProcess;
let updateIntervalHandle;
let resolvedAppUrl;
let resolvedRunnerUrl;
let sessionHardened = false;

const resolveWebPath = (...segments) => {
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..', 'web');
  return path.join(base, ...segments);
};

const resolveRunnerPath = (...segments) => {
  const base = app.isPackaged ? path.join(process.resourcesPath, 'runner') : path.join(__dirname, '..', 'runner');
  return path.join(base, ...segments);
};

const findOpenPort = (start = 3923, max = 4050) =>
  new Promise((resolve, reject) => {
    let port = start;
    const server = net.createServer();

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && port < max) {
        port += 1;
        server.listen(port, '127.0.0.1');
      } else {
        server.close();
        reject(err);
      }
    });

    server.on('listening', () => {
      const { port: openPort } = server.address();
      server.close(() => resolve(openPort));
    });

    server.listen(port, '127.0.0.1');
  });

const waitForUrl = async (url, timeout = 30000) =>
  waitOn({
    resources: [url],
    timeout,
    interval: 300,
    validateStatus: (status) => status >= 200 && status < 500,
  });

const updateLogger = {
  info: (...args) => console.log('[update]', ...args),
  warn: (...args) => console.warn('[update]', ...args),
  error: (...args) => console.error('[update]', ...args),
  debug: (...args) => console.debug('[update]', ...args),
};

function shouldEnableAutoUpdates() {
  if (isDev || process.env.SUPER_MAESTRO_DISABLE_UPDATES === '1') {
    return false;
  }

  const appUpdateConfig = path.join(process.resourcesPath, 'app-update.yml');
  return Boolean(process.env.SUPER_MAESTRO_UPDATE_URL || fs.existsSync(appUpdateConfig));
}

function scheduleAutoUpdates(win) {
  if (!shouldEnableAutoUpdates()) {
    return;
  }

  const feedUrl = process.env.SUPER_MAESTRO_UPDATE_URL;
  const channel = process.env.SUPER_MAESTRO_UPDATE_CHANNEL || 'latest';
  const updateIntervalMs = Number(process.env.SUPER_MAESTRO_UPDATE_INTERVAL_MS || 60 * 60 * 1000);
  const shouldAutoDownload = process.env.SUPER_MAESTRO_AUTO_DOWNLOAD !== 'false';
  const getDialogTarget = () => (win && !win.isDestroyed() ? win : null);

  autoUpdater.logger = updateLogger;
  autoUpdater.autoDownload = shouldAutoDownload;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowPrerelease = channel !== 'latest';

  if (feedUrl) {
    try {
      autoUpdater.setFeedURL({ provider: 'generic', url: feedUrl, channel });
    } catch (error) {
      updateLogger.warn('Invalid update feed URL. Auto-update disabled.', error);
      return;
    }
  }

  autoUpdater.on('checking-for-update', () => updateLogger.info('Checking for updates...'));
  autoUpdater.on('update-available', async (info) => {
    updateLogger.info(`Update available: ${info.version}`);

    if (!shouldAutoDownload) {
      try {
        const { response } = await dialog.showMessageBox(getDialogTarget(), {
          type: 'info',
          buttons: ['Download now', 'Later'],
          defaultId: 0,
          cancelId: 1,
          title: 'Update available',
          message: `Super Maestro ${info.version} is available. Download now?`,
        });

        if (response === 0) {
          await autoUpdater.downloadUpdate();
        } else {
          updateLogger.info('Update download postponed by user.');
        }
      } catch (error) {
        updateLogger.warn('Update download could not start.', error);
      }
    }
  });
  autoUpdater.on('update-not-available', () => updateLogger.info('No updates available.'));
  autoUpdater.on('error', (error) => updateLogger.error('Auto-update error', error));
  autoUpdater.on('download-progress', (progress) => {
    const percentage = Math.round(progress.percent ?? 0);
    const speedKbps = progress.bytesPerSecond ? Math.round(progress.bytesPerSecond / 1024) : 0;
    updateLogger.info(`Downloading update: ${percentage}% (${speedKbps} kB/s)`);
  });
  autoUpdater.on('update-downloaded', async (info) => {
    const browserWindow = getDialogTarget();
    const message = `Super Maestro ${info.version} downloaded. Restart now to install?`;

    try {
      const { response } = await dialog.showMessageBox(browserWindow, {
        type: 'info',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update ready',
        message,
        detail: 'Updates are applied by the built-in updater and will restart the app.',
      });

      if (response === 0) {
        app.isQuiting = true;
        autoUpdater.quitAndInstall();
      }
    } catch (error) {
      updateLogger.warn('Failed to present update dialog.', error);
    }
  });

  const checkForUpdates = async () => {
    if (app.isQuiting) return;

    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      updateLogger.warn('Auto-update check failed', error);
    }
  };

  setTimeout(checkForUpdates, 4000);

  if (Number.isFinite(updateIntervalMs) && updateIntervalMs > 0) {
    updateIntervalHandle = setInterval(checkForUpdates, updateIntervalMs);
  }
}

function stopNextServer() {
  if (nextServerProcess && !nextServerProcess.killed) {
    nextServerProcess.kill();
    nextServerProcess = null;
  }
}

function stopRunner() {
  if (runnerProcess && !runnerProcess.killed) {
    runnerProcess.kill();
    runnerProcess = null;
    resolvedRunnerUrl = null;
  }
}

async function startProdServer() {
  if (resolvedAppUrl) return resolvedAppUrl;

  const standaloneDir = resolveWebPath('.next', 'standalone', 'apps', 'web');
  const serverPath = path.join(standaloneDir, 'server.js');

  if (!fs.existsSync(serverPath)) {
    throw new Error('Next.js build output missing. Run `npm run build --workspace @agentforge/web` before packaging.');
  }

  const port = await findOpenPort();
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_STATIC_DIR: resolveWebPath('.next', 'static'),
    NEXT_PUBLIC_DIR: resolveWebPath('public'),
  };

  nextServerProcess = spawn(process.execPath, [serverPath], {
    cwd: standaloneDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  nextServerProcess.stdout?.on('data', (data) => {
    console.log(`[next] ${data}`.toString().trim());
  });
  nextServerProcess.stderr?.on('data', (data) => {
    console.error(`[next] ${data}`.toString().trim());
  });

  nextServerProcess.on('exit', (code) => {
    nextServerProcess = null;
    if (!app.isQuiting && code && code !== 0) {
      app.quit();
    }
  });

  resolvedAppUrl = `http://127.0.0.1:${port}`;
  await waitForUrl(resolvedAppUrl);
  return resolvedAppUrl;
}

async function startRunner() {
  if (runnerProcess && !runnerProcess.killed) return resolvedRunnerUrl;

  const entryCandidates = [
    resolveRunnerPath('dist', 'index.js'),
    resolveRunnerPath('src', 'index.ts'),
  ];
  const runnerEntrypoint = entryCandidates.find((candidate) => fs.existsSync(candidate));

  if (!runnerEntrypoint) {
    console.warn('Runner entrypoint not found. Skipping runner startup.');
    return null;
  }

  const bunExecutable = process.env.BUN_BINARY || 'bun';
  const bunCheck = spawnSync(bunExecutable, ['--version'], { stdio: 'ignore' });
  if (bunCheck.error) {
    console.warn('Bun runtime not found on PATH. Runner will not be started.');
    return null;
  }

  const port = await findOpenPort(3001, 3050);
  const host = '127.0.0.1';

  try {
    runnerProcess = spawn(bunExecutable, [runnerEntrypoint, '--port', String(port), '--host', host], {
      cwd: path.dirname(runnerEntrypoint),
      env: {
        ...process.env,
        RUNNER_WS_URL: `ws://${host}:${port}`,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    console.error('Failed to start runner process', error);
    runnerProcess = null;
    return null;
  }

  runnerProcess.stdout?.on('data', (data) => {
    console.log(`[runner] ${data}`.toString().trim());
  });
  runnerProcess.stderr?.on('data', (data) => {
    console.error(`[runner] ${data}`.toString().trim());
  });

  const logExit = (code) => {
    runnerProcess = null;
    resolvedRunnerUrl = null;
    if (!app.isQuiting && code && code !== 0) {
      console.error(`[runner] exited with code ${code}`);
    }
  };

  const logError = (error) => {
    console.error('[runner] process error', error);
  };

  runnerProcess.on('exit', logExit);
  runnerProcess.on('error', logError);

  let cleanupStartupListeners;
  const startupExitPromise = new Promise((_, reject) => {
    const handleStartupExit = (code) => reject(new Error(`Runner exited during startup (${code ?? 'unknown'})`));
    const handleStartupError = (err) => reject(err);

    cleanupStartupListeners = () => {
      runnerProcess?.off?.('exit', handleStartupExit);
      runnerProcess?.off?.('error', handleStartupError);
    };

    runnerProcess.once('exit', handleStartupExit);
    runnerProcess.once('error', handleStartupError);
  });

  const readinessUrl = `http://${host}:${port}/health`;

  try {
    await Promise.race([waitForUrl(readinessUrl, 12000), startupExitPromise]);
    resolvedRunnerUrl = `ws://${host}:${port}`;
    console.log(`[runner] listening at ${resolvedRunnerUrl}`);
    return resolvedRunnerUrl;
  } catch (error) {
    console.warn('Runner failed to start', error);
    stopRunner();
    return null;
  } finally {
    cleanupStartupListeners?.();
  }
}

async function resolveAppUrl() {
  if (isDev) {
    const devUrl = process.env.DEV_SERVER_URL || 'http://localhost:3000';
    await waitForUrl(devUrl);
    return devUrl;
  }

  return startProdServer();
}

function hardenSession(win, allowedOrigin) {
  if (!sessionHardened) {
    sessionHardened = true;
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const csp = [
        "default-src 'self' data: blob: https: http: ws: wss:;",
        "script-src 'self' 'unsafe-inline';",
        "style-src 'self' 'unsafe-inline' https:;",
        "img-src 'self' data: blob: https:;",
        "font-src 'self' data: https:;",
        "connect-src 'self' data: blob: https: http: ws: wss:;",
        "frame-src 'none';",
        "object-src 'none';",
        "base-uri 'self';",
        "form-action 'self';",
      ].join(' ');

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp],
          'X-Content-Type-Options': ['nosniff'],
          'X-Frame-Options': ['DENY'],
          'Referrer-Policy': ['no-referrer'],
        },
      });
    });
  }

  win.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!navigationUrl.startsWith(allowedOrigin)) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(allowedOrigin)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

async function createMainWindow() {
  const runnerStartup = startRunner().catch((error) => {
    console.warn('Runner failed to initialize', error);
    return null;
  });
  const urlToLoad = await resolveAppUrl();

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#05070a',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  win.setContentProtection(true);
  hardenSession(win, urlToLoad);

  win.once('ready-to-show', () => win.show());
  await win.loadURL(urlToLoad);
  await runnerStartup;

  scheduleAutoUpdates(win);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow = win;
}

const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app
    .whenReady()
    .then(createMainWindow)
    .catch((err) => {
      console.error('Failed to start Super Maestro desktop', err);
      app.quit();
    });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
  if (updateIntervalHandle) {
    clearInterval(updateIntervalHandle);
    updateIntervalHandle = null;
  }
  stopRunner();
  stopNextServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((err) => console.error(err));
  }
});

process.on('exit', () => {
  stopRunner();
  stopNextServer();
});
process.on('SIGINT', () => {
  app.isQuiting = true;
  stopRunner();
  stopNextServer();
  process.exit(0);
});
process.on('SIGTERM', () => {
  app.isQuiting = true;
  stopRunner();
  stopNextServer();
  process.exit(0);
});
