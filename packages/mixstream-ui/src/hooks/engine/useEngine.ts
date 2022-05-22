import { useContext } from 'react';
import { EnginesContext } from './context';

export const useEngine = () => {
  const rtc = useContext(EnginesContext);
  return rtc;
};
