import { FC, PropsWithChildren, useState } from 'react';
import { defaultTitleBar, GlobalContext } from './context';

export interface TitleBar {
  title: string;
  visible: boolean;
}

export const GlobalProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [titleBar, setTitleBar] = useState<TitleBar>(defaultTitleBar);

  return (
    <GlobalContext.Provider value={{ loading, setLoading, titleBar, setTitleBar }}>{children}</GlobalContext.Provider>
  );
};
