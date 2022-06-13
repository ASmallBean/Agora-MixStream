export * from './event';
export * from './gracefulClose';
export * from './os';
export * from './request';

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const appPath = () => {
  return isDev ? 'http://localhost:3000' : 'build/index.html';
};

/**
 * 禁用开发者工具
 */
export const disableDevTools = () => {
  window.onkeydown = (event) => {
    if (event.key === 'F12') {
      event.preventDefault();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && (event.code === 'KeyI' || event.key === 'i')) {
      event.preventDefault();
      return;
    }
  };
};
