import { useContext } from 'react';
import { GlobalContext } from './context';

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  return context;
};
