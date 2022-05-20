import { Session } from 'mixstream-shared';
import { createContext } from 'react';

export const SessionContext = createContext<Session | undefined>(undefined);
