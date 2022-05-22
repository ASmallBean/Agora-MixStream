import { BrowserWindow, remote } from 'electron';

const WIDTH = 1200;
const HEIGHT = 675;
const ASPECT_RATIO = 1.78;

class WhiteboardBrowserWindow {
  private static instance: WhiteboardBrowserWindow;

  static singleton() {
    if (!this.instance) {
      this.instance = new WhiteboardBrowserWindow();
    }
    return this.instance;
  }

  browserWindow: BrowserWindow | null = null;

  public async open(url: string) {
    if (this.browserWindow) {
      return this.browserWindow;
    }

    this.browserWindow = new remote.BrowserWindow({
      width: WIDTH,
      height: HEIGHT,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
      parent: remote.getCurrentWindow(),
      transparent: true,
      frame: false,
      enableLargerThanScreen: true,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#000000',
    });

    this.browserWindow.setAspectRatio(ASPECT_RATIO);

    this.browserWindow.once('ready-to-show', () => {
      this.browserWindow?.show();
    });

    this.browserWindow.on('closed', () => {
      this.destroyWhiteboardWindow();
    });

    this.browserWindow.loadURL(url);

    return this.browserWindow;
  }

  public destroyWhiteboardWindow() {
    this.browserWindow = null;
  }
}

export default WhiteboardBrowserWindow;
