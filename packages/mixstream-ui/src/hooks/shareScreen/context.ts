import { createContext } from 'react';
import { ScreenSelectorHandler } from '../../components/ScreenSelector';

interface ContextTypes {
  openModal: (cb: ScreenSelectorHandler) => Promise<void>;
  closeModal: () => void;
}

export const ShareScreenContext = createContext<Partial<ContextTypes>>({});
