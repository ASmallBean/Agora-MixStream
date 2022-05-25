import { FC, PropsWithChildren, useRef, useState } from 'react';
import { ScreenSelector, ScreenSelectorHandler } from '../../components/ScreenSelector';
import { DisplayInfo, WindowInfo } from '../../engine';
import { useEngine } from '../engine';
import { useGlobal } from '../global/useGlobal';
import { ShareScreenContext } from './context';

export const ShareScreenProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { rtcEngine } = useEngine();
  const [screenModal, setScreenModal] = useState<boolean>(false);
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const { setLoading } = useGlobal();
  const [windows, setWindows] = useState<WindowInfo[]>([]);

  const cbRef = useRef<ScreenSelectorHandler>(() => {});

  const closeModal = () => {
    setScreenModal(false);
  };

  const openModal = async (cb: ScreenSelectorHandler) => {
    if (!rtcEngine) {
      return;
    }
    setLoading(true);
    return Promise.all([rtcEngine.getScreenDisplaysInfo(), rtcEngine.getScreenWindowsInfo()])
      .then(([displays, windows]) => {
        cbRef.current = cb;
        setDisplays(displays || []);
        setWindows(windows || []);
        setScreenModal(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ShareScreenContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ScreenSelector
        visible={screenModal}
        displays={displays}
        windows={windows}
        onCancel={closeModal}
        onOk={(type, data) => {
          closeModal();
          cbRef.current && cbRef.current(type as any, data as any);
        }}
      />
    </ShareScreenContext.Provider>
  );
};
