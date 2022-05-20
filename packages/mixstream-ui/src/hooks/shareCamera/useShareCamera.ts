import { useContext } from 'react';
import { ShareCameraContext } from './context';

export const useShareCamera = () => {
  const share = useContext(ShareCameraContext);
  return share;
};
