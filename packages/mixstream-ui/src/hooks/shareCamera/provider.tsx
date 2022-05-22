import { FC, PropsWithChildren, useRef, useState } from 'react';
import CameraSelector from '../../components/CameraSelector';
import { ShareCameraCallback, ShareCameraContext } from './context';

export const ShareCameraProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const cbRef = useRef<ShareCameraCallback>(() => {});

  const openModal = (cb: ShareCameraCallback) => {
    setVisible(true);
    cbRef.current = cb;
  };

  const closeModal = () => {
    setVisible(false);
  };

  return (
    <ShareCameraContext.Provider value={{ openModal, closeModal }}>
      {children}
      <CameraSelector
        visible={visible}
        onCancel={closeModal}
        onOk={(data, resolution) => {
          closeModal();
          cbRef.current && cbRef.current(data, resolution);
        }}
      />
    </ShareCameraContext.Provider>
  );
};
