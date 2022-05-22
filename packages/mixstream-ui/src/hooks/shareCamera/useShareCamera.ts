import { useContext } from 'react';
import { ShareCameraContext } from './context';

export const useShareCamera = () => {
  const context = useContext(ShareCameraContext);
  return context;
};
