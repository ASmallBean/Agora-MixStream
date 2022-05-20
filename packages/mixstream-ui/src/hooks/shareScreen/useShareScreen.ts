import { useContext } from 'react';
import { ShareScreenContext } from './context';

export const useShareScreen = () => {
  const share = useContext(ShareScreenContext);
  return share;
};
