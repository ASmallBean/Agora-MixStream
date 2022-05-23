import { createContext } from 'react';
import { Resolution, VideoDeviceInfo } from '../../engine';

export type ShareCameraCallback = (device: VideoDeviceInfo, resolution: Resolution) => void;

interface ContextTypes {
  openModal: (cb: ShareCameraCallback) => void;
  closeModal: () => void;
}

export const ShareCameraContext = createContext<Partial<ContextTypes>>({});
