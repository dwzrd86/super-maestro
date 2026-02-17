'use strict';

const { app, BrowserWindow, session, shell } = require('electron');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const waitOn = require('wait-on');

app.enableSandbox();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow;
let nextServerProcess;
let resolvedAppUrl;
let sessionHardened = false;

const resolveWebPath = (...segments) => {
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..', 'web');
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

const waitForUrl = async (url) =>
  waitOn({
    resources: [url],
    timeout: 30000,
    interval: 300,
    validateStatus: (status) => status >= 200 && status < 500,
  });

function stopNextServer() {
  if (nextServerProcess && !nextServerProcess.killed) {
    nextServerProcess.kill();
    nextServerProcess = null;
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
  stopNextServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((err) => console.error(err));
  }
});

process.on('exit', stopNextServer);
process.on('SIGINT', () => {
  stopNextServer();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopNextServer();
  process.exit(0);
});
