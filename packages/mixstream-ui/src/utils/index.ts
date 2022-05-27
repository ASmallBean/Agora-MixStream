export * from './gracefulClose';
export * from './os';
export * from './request';

export const isDev = process.env.NODE_ENV === 'development';

export const appPath = () => {
  return isDev ? 'http://localhost:3000' : 'build/index.html';
};
