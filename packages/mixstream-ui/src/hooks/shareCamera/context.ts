import { createContext } from 'react';
import { Resolution } from '../../engine';

export type ShareCameraCallback = (device: MediaDeviceInfo, resolution: Resolution) => void;

interface ContextTypes {
  openModal: (cb: ShareCameraCallback) => void;
  closeModal: () => void;
}

export const ShareCameraContext = createContext<Partial<ContextTypes>>({});
