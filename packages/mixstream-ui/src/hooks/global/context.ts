import { createContext, Dispatch, SetStateAction } from 'react';
import { TitleBar } from './provider';

interface ContextTypes {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  titleBar: TitleBar;
  setTitleBar: Dispatch<SetStateAction<TitleBar>>;
}

export const GlobalContext = createContext<ContextTypes>({
  loading: false,
  setLoading: () => {},
  titleBar: { title: '', visible: true },
  setTitleBar: () => {},
});
