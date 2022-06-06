import { createContext, Dispatch, SetStateAction } from 'react';
import { TitleBar } from './provider';

export const defaultTitleBar = { title: 'Demo v0.0.1', visible: true };

interface ContextTypes {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  titleBar: TitleBar;
  setTitleBar: Dispatch<SetStateAction<TitleBar>>;
}

export const GlobalContext = createContext<ContextTypes>({
  loading: false,
  setLoading: () => {},
  titleBar: defaultTitleBar,
  setTitleBar: () => {},
});
