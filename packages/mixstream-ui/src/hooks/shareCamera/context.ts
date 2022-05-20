import { createContext } from 'react';

export type SuccessCallback = (device: MediaDeviceInfo) => void;

interface ContextTypes {
  openModal: (cb: SuccessCallback) => void;
  closeModal: () => void;
}

export const ShareCameraContext = createContext<Partial<ContextTypes>>({});
