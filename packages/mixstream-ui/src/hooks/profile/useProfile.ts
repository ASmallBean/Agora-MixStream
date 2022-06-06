import { useContext } from 'react';
import { ProfileContext } from './context';

export const useProfile = () => {
  const context = useContext(ProfileContext);
  return context;
};
