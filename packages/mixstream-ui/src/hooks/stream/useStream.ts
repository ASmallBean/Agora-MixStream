import { useContext } from 'react';
import { StreamContext } from './context';

export const useStream = () => {
  const context = useContext(StreamContext);
  return context;
};
