import { Session } from 'mixstream-shared';
import { createContext } from 'react';
export const defaultSession = {
  id: '',
  channel: '',
  expiredAt: new Date(),
  createdAt: new Date(),
};
export const SessionContext = createContext<Session>(defaultSession);
