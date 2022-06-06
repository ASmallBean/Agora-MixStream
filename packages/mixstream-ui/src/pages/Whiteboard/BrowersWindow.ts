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

  public async create() {
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

    return this.browserWindow;
  }

  public destroyWindow() {
    this.browserWindow && this.browserWindow.destroy();
    this.browserWindow = null;
  }
}

export default WhiteboardBrowserWindow;
