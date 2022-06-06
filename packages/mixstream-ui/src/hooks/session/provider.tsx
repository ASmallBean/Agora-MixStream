import { FC, PropsWithChildren } from 'react';
import { useAsync } from 'react-use';
import { getSession } from '../../services/api';
import { defaultSession, SessionContext } from './context';

export interface SessionProviderProps {
  sessionId: string;
}

export const SessionProvider: FC<PropsWithChildren<SessionProviderProps>> = ({ children, sessionId }) => {
  const { value } = useAsync(() => getSession(sessionId));
  return <SessionContext.Provider value={value?.data || defaultSession}>{children}</SessionContext.Provider>;
};
