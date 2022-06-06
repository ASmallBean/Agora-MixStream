import { remote } from 'electron';

type Handle = () => void;

const handles: { [key: string]: Handle[] } = {};

export const addCloseHandle = (event: string, handle: Handle) => {
  handles[event] = handles[event] ? handles[event] : [];
  handles[event].push(handle);
};
export const removeCloseHandle = (event: string, handle: Handle) => {
  const list = handles[event];
  if (list && list.length) {
    const index = list.findIndex((v) => v !== handle);
    handles[event] = [...list.splice(0, index), ...list.splice(index + 1)];
  }
};

export const closeHandle = () => {
  const list = Object.values(handles).flat();
  list.forEach((v) => v());
  const win = remote.getCurrentWindow();
  win.destroy();
};
