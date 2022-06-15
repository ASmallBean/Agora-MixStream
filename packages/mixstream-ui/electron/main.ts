import { app, BrowserWindow, Menu, screen } from 'electron';

const __DEV__ = process.env.NODE_ENV === 'development';

async function createWindow() {
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    height: process.platform === 'win32' ? 768 : height,
    width: process.platform === 'win32' ? 1024 : width,
    fullscreen: false,
    fullscreenable: false,
    title: 'MixStream',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    transparent: true,
    frame: false,
    enableLargerThanScreen: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#000000',
  });

  win.setAspectRatio(1.78);
  win.once('ready-to-show', () => {
    win?.show();
  });

  if (__DEV__) {
    win.webContents.openDevTools();
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile('build/index.html');
  }
  win.on('close', (e) => {
    e.preventDefault();
    win.webContents.send('process_close');
  });

  /*隐藏electron的菜单栏*/
  if (!__DEV__) {
    Menu.setApplicationMenu(null);
  }
  return win;
}

app.whenReady().then(() => {
  createWindow();
});

app.allowRendererProcessReuse = false;

app.on('window-all-closed', async () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
