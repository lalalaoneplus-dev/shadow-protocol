// Shadow Protocol — Electron main process
// Registers a custom "game://" standard scheme so ES modules load with a real
// origin (file:// blocks module imports via CORS). Handles local save I/O.
const { app, BrowserWindow, protocol, net, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const APP_ROOT = __dirname;
const SAVE_DIR = path.join(app.getPath('userData'), 'saves');

function ensureSaveDir() {
  try { fs.mkdirSync(SAVE_DIR, { recursive: true }); } catch (_) {}
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'game',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true }
  }
]);

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 576,
    backgroundColor: '#05070a',
    show: false,
    title: 'Shadow Protocol',
    webPreferences: {
      preload: path.join(APP_ROOT, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL('game://app/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Keep external links out of the game window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  ensureSaveDir();

  // Serve app files over the game:// scheme.
  protocol.handle('game', (request) => {
    const url = new URL(request.url);
    // game://app/<path>  -> APP_ROOT/<path>
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    const target = path.normalize(path.join(APP_ROOT, rel));
    if (!target.startsWith(APP_ROOT)) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(target).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- Save system IPC (local disk, fully offline) ----
ipcMain.handle('save:write', (_e, slot, data) => {
  ensureSaveDir();
  const file = path.join(SAVE_DIR, `slot-${slot}.json`);
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  return { ok: true, file };
});

ipcMain.handle('save:read', (_e, slot) => {
  const file = path.join(SAVE_DIR, `slot-${slot}.json`);
  if (!fs.existsSync(file)) return { ok: false };
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

ipcMain.handle('save:list', () => {
  ensureSaveDir();
  const out = {};
  for (const slot of ['auto', '1', '2', '3']) {
    const file = path.join(SAVE_DIR, `slot-${slot}.json`);
    if (fs.existsSync(file)) {
      try {
        const d = JSON.parse(fs.readFileSync(file, 'utf8'));
        out[slot] = { level: d.level, difficulty: d.difficulty, ts: d.ts };
      } catch (_) {}
    }
  }
  return out;
});

ipcMain.handle('app:quit', () => { app.quit(); });
ipcMain.handle('app:fullscreen', () => {
  if (!mainWindow) return false;
  const fs2 = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(fs2);
  return fs2;
});
