import EventEmitter from 'eventemitter3';

export enum GlobalEvent {
  QuitChannel = 'QuitChannel',
  WhiteboardWindowClosed = 'WhiteboardWindowClosed',
  ProcessClose = 'ProcessClose',
}

export const globalEvent = new EventEmitter();
