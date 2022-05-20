import { FC, PropsWithChildren, useRef, useState } from 'react';
import CameraSelector from '../../components/CameraSelector';
import { ShareCameraContext, SuccessCallback } from './context';

export const ShareCameraProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const cbRef = useRef<SuccessCallback>(() => {});

  const openModal = (cb: SuccessCallback) => {
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
        onOk={(data) => {
          closeModal();
          cbRef.current && cbRef.current(data);
        }}
      />
    </ShareCameraContext.Provider>
  );
};
