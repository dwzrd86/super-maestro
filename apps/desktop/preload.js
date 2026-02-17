'use strict';

const { contextBridge } = require('electron');

// Expose a minimal surface to the renderer. Keep this intentionally tiny to reduce attack surface.
contextBridge.exposeInMainWorld('superMaestro', {
  version: process.env.npm_package_version || 'dev',
  platform: process.platform,
});
