import { FC, PropsWithChildren, useState } from 'react';
import { GlobalContext } from './context';

export interface TitleBar {
  title: string;
  visible: boolean;
}

export const GlobalProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [titleBar, setTitleBar] = useState<TitleBar>({ title: 'Demo v0.0.1', visible: false });

  return (
    <GlobalContext.Provider value={{ loading, setLoading, titleBar, setTitleBar }}>{children}</GlobalContext.Provider>
  );
};
